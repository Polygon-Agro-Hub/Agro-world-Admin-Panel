import { Component } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

type PriceListType = 'retail' | 'wholesale';

interface ValidationError {
  rows: number[];
  message: string;
}

interface ParsedRow {
  rowNo: number;
  productId: any;
  actual: any;
  sale: any;
  competitor: any;
  display?: any;
  packageBased?: any;
}

const NOT_FOUND_MESSAGE = 'Invalid Product IDs found.';

const NO_DISCOUNT_MISMATCH_MESSAGE =
  'Mismatching Actual and Sale Prices.\nPlease note : For No Discount display type the Actual Price and the Sale Price must have equal values.';

const COL = {
  display: 'Display',
  productId: 'Product ID',
  actual: 'Actual Price (Rs.)',
  sale: 'Sale Price (Rs.)',
  competitor: 'Competitor Price (Rs.)',
  packageBased: 'Package Based Price (Rs.)',
};

@Component({
  selector: 'app-upload-products-list-prices',
  standalone: true,
  imports: [LoadingSpinnerComponent, NgIf, NgFor, NgClass],
  templateUrl: './upload-products-list-prices.component.html',
  styleUrl: './upload-products-list-prices.component.css'
})
export class UploadProductsListPricesComponent {

  type: PriceListType = 'retail';
  isLoading = false;
  isDragging = false;
  selectedFile: File | null = null;

  errors: ValidationError[] = [];
  showErrorPopup = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private marketService: MarketPlaceService,
  ) {
    const dataType = this.route.snapshot.data['type'];
    this.type = dataType ?? (this.router.url.includes('wholesale') ? 'wholesale' : 'retail');
  }

  get isRetail(): boolean { return this.type === 'retail'; }

  get config() {
    return {
      label: this.isRetail ? 'Retail' : 'Wholesale',
      priceColumns: this.isRetail
        ? [COL.actual, COL.sale, COL.competitor, COL.packageBased]
        : [COL.actual, COL.sale, COL.competitor],
    };
  }

  get fileSizeMB(): string {
    return this.selectedFile ? (this.selectedFile.size / (1024 * 1024)).toFixed(2) : '0';
  }

  back(): void {
    this.router.navigate(['market/action']);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.setFile(input.files[0]);
    input.value = '';
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.isDragging = true;
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragging = false;
    if (e.dataTransfer?.files?.length) this.setFile(e.dataTransfer.files[0]);
  }

  private setFile(file: File): void {
    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      Swal.fire({ icon: 'error', title: 'Invalid file', text: 'Please upload an Excel file (.xlsx or .xls).' });
      return;
    }
    this.selectedFile = file;
  }

  removeFile(): void {
    this.selectedFile = null;
  }

  downloadTemplate(): void {
    this.isLoading = true;
    this.marketService.getPriceList(this.type).subscribe({
      next: (res) => {
        this.isLoading = false;
        const headers = ['No', 'Product ID', 'Display Name', 'Validity', 'Display', COL.actual, COL.sale, COL.competitor];
        if (this.isRetail) headers.push(COL.packageBased);

        const body = (res.items as any[]).map((it, i) => {
          const row: (string | number | null)[] = [
            i + 1, it.id, it.displayName, it.validity, it.display,
            it.actualPrice, it.salePrice, it.competitorPrice,
          ];
          if (this.isRetail) row.push(it.packageBasedPrice);
          return row;
        });

        const ws = XLSX.utils.aoa_to_sheet([headers, ...body]);
        ws['!cols'] = headers.map((h, i) => ({ wch: i === 2 ? 30 : Math.max(h.length + 2, 14) }));

        const firstPriceCol = 5;
        for (let r = 1; r <= body.length; r++) {
          for (let c = firstPriceCol; c < headers.length; c++) {
            const cell = ws[XLSX.utils.encode_cell({ r, c })];
            if (cell && typeof cell.v === 'number') cell.z = '0.00';
          }
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Prices');

        const d = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const stamp = `${d.getFullYear()}_${pad(d.getMonth() + 1)}_${pad(d.getDate())}`;
        XLSX.writeFile(wb, `${this.config.label}_Product_Prices_${stamp}.xlsx`);
      },
      error: () => {
        this.isLoading = false;
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to download the price sheet.' });
      },
    });
  }

  async validateAndUpload(): Promise<void> {
    if (!this.selectedFile) return;
    this.isLoading = true;
    let uploadData: ParsedRow[] | null = null;

    try {
      const buffer = await this.selectedFile.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      if (rows.length < 2) {
        Swal.fire({ icon: 'error', title: 'Empty file', text: 'No data rows found in the Excel file.' });
        return;
      }

      const headers = rows[0].map(h => String(h).trim().toLowerCase());
      const idx: Record<string, number> = {};
      const required = [COL.productId, COL.display, ...this.config.priceColumns];
      const missing = required.filter(c => (idx[c] = headers.indexOf(c.toLowerCase())) === -1);
      if (missing.length) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid template',
          html: `Missing columns:<br><b>${missing.join('<br>')}</b><br>Please use the downloaded template.`,
        });
        return;
      }

      const data = this.parseRows(rows, idx);
      this.errors = this.collectErrors(data);

      if (this.errors.length) {
        await this.addNotFoundError(data);
        this.showErrorPopup = true;
        return;
      }

      uploadData = data;
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not read the Excel file.' });
    } finally {
      this.isLoading = false;
    }

    if (uploadData) this.uploadToBackend(uploadData);
  }

  private parseRows(rows: any[][], idx: Record<string, number>): ParsedRow[] {
    const data: ParsedRow[] = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (r.every(c => String(c).trim() === '')) continue;
      data.push({
        rowNo: i + 1, // Excel row number
        productId: r[idx[COL.productId]],
        actual: r[idx[COL.actual]],
        sale: r[idx[COL.sale]],
        competitor: r[idx[COL.competitor]],
        display: r[idx[COL.display]],
        packageBased: idx[COL.packageBased] !== undefined ? r[idx[COL.packageBased]] : undefined,
      });
    }
    return data;
  }

  private invalidIds(data: ParsedRow[]): number[] {
    return data
      .filter(d => {
        const n = Number(d.productId);
        return String(d.productId).trim() === '' || !Number.isInteger(n) || n <= 0;
      })
      .map(d => d.rowNo);
  }

  private duplicateIds(data: ParsedRow[]): number[][] {
    const map = new Map<number, number[]>();
    data.forEach(d => {
      const n = Number(d.productId);
      if (String(d.productId).trim() === '' || !Number.isInteger(n) || n <= 0) return;
      map.set(n, [...(map.get(n) ?? []), d.rowNo]);
    });
    const groups: number[][] = [];
    map.forEach(list => { if (list.length > 1) groups.push([...list].sort((a, b) => a - b)); });
    return groups.sort((a, b) => a[0] - b[0]);
  }

  private invalidSalePrice(data: ParsedRow[]): number[] {
    return data.filter(d => this.toPrice(d.sale) === null).map(d => d.rowNo);
  }

  private invalidActualPrice(data: ParsedRow[]): number[] {
    return data.filter(d => this.toPrice(d.actual) === null).map(d => d.rowNo);
  }

  private invalidCompetitorPrice(data: ParsedRow[]): number[] {
    return data
      .filter(d => {
        const competitor = this.toPrice(d.competitor);
        if (competitor === null) return true;

        const sale = this.toPrice(d.sale);
        if (sale === null) return false;

        const actual = this.toPrice(d.actual);
        if (actual !== null && sale > actual + 0.005) return false;

        return competitor <= sale;
      })
      .map(d => d.rowNo);
  }

  private invalidPackageBasedPrice(data: ParsedRow[]): number[] {
    return data.filter(d => this.toPrice(d.packageBased) === null).map(d => d.rowNo);
  }

  private mismatchedNoDiscountPrices(data: ParsedRow[]): number[] {
    return data
      .filter(d => {
        if (String(d.display ?? '').trim().toLowerCase() !== 'no discount') return false;
        const actual = this.toPrice(d.actual);
        const sale = this.toPrice(d.sale);
        if (actual === null || sale === null) return false;
        return Math.abs(actual - sale) >= 0.005;
      })
      .map(d => d.rowNo);
  }

  private collectErrors(data: ParsedRow[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const add = (rows: number[], message: string) => {
      if (rows.length) errors.push({ rows, message });
    };

    add(this.invalidIds(data), 'Invalid Product IDs found.');
    this.duplicateIds(data).forEach(rows => add(rows, 'Duplicate Product IDs found.'));
    add(this.invalidSalePrice(data), 'Invalid Sale Price. Please enter a valid Sale Price greater than 0.');
    add(this.invalidActualPrice(data), 'Invalid Actual Price. Please enter a valid Actual Price greater than 0.');
    add(this.mismatchedNoDiscountPrices(data), NO_DISCOUNT_MISMATCH_MESSAGE);
    add(this.invalidCompetitorPrice(data), 'Invalid Competitor Price. Please enter a valid Competitor Price greater than the Sale Price.');
    add(this.invalidSalePrice(data), 'Invalid Sale Price. Please enter a valid Sale Price greater than 0.');
    add(this.saleExceedsActual(data), 'Invalid Sale Price. Sale Price cannot be greater than the Actual Price.');
    add(this.invalidActualPrice(data), 'Invalid Actual Price. Please enter a valid Actual Price greater than 0.');

    if (this.isRetail) {
      add(this.invalidPackageBasedPrice(data), 'Invalid Package Based Price. Please enter a valid Package Based Price greater than 0.');
    }

    return errors;
  }

  private toPrice(v: any): number | null {
    if (v === '' || v === null || v === undefined) return null;
    const n = typeof v === 'number' ? v : Number(String(v).replace(/,/g, '').trim());
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  private saleExceedsActual(data: ParsedRow[]): number[] {
    return data
      .filter(d => {
        if (String(d.display ?? '').trim().toLowerCase() === 'no discount') return false;
        const sale = this.toPrice(d.sale);
        const actual = this.toPrice(d.actual);
        if (sale === null || actual === null) return false;
        return sale > actual + 0.005;
      })
      .map(d => d.rowNo);
  }

  private async addNotFoundError(data: ParsedRow[]): Promise<void> {
    const items = data
      .filter(d => {
        const n = Number(d.productId);
        return String(d.productId).trim() !== '' && Number.isInteger(n) && n > 0;
      })
      .map(d => ({ rowNo: d.rowNo, productId: Number(d.productId) }));

    if (!items.length) return;

    try {
      const res = await firstValueFrom(this.marketService.checkPriceListIds(this.type, items));
      if (res?.notFoundRows?.length) {
        const err: ValidationError = { rows: res.notFoundRows, message: NOT_FOUND_MESSAGE };
        const pos = this.errors.filter(e =>
          e.message.startsWith('Invalid Product IDs') || e.message.startsWith('Duplicate Product IDs')).length;
        this.errors.splice(pos, 0, err);
      }
    } catch {

    }
  }

  private uploadToBackend(data: ParsedRow[]): void {
    const items = data.map(d => ({
      rowNo: d.rowNo,
      productId: Number(d.productId),
      display: String(d.display ?? '').trim(),
      actualPrice: this.toPrice(d.actual),
      salePrice: this.toPrice(d.sale),
      competitorPrice: this.toPrice(d.competitor),
      ...(this.isRetail && { packageBasedPrice: this.toPrice(d.packageBased) }),
    }));

    this.isLoading = true;
    this.marketService.uploadPriceList(this.type, items).subscribe({
      next: (res) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: res.updated ? 'Prices updated' : 'No changes',
          text: `${res.updated} updated, ${res.unchanged} unchanged.`,
        }).then(() => this.back());
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 400 && Array.isArray(err.error?.errors)) {
          this.errors = err.error.errors;
          this.showErrorPopup = true;
        } else {
          Swal.fire({ icon: 'error', title: 'Upload failed', text: err.error?.error ?? 'Something went wrong.' });
        }
      },
    });
  }

  formatRows(rows: number[]): string {
    return rows.map(r => `Row ${r}`).join(' , ');
  }

  closeErrorPopup(): void {
    this.showErrorPopup = false;
  }

  downloadErrorReport(): void {
    const data: (string | number)[][] = [
      ['No', 'Row IDs', 'Error Description'],
      ...this.errors.map((e, i) => [i + 1, e.rows.join(','), e.message]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{ wch: 6 }, { wch: 20 }, { wch: 100 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Error Report');
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const stamp = `${d.getFullYear()}_${pad(d.getMonth() + 1)}_${pad(d.getDate())}`;
    XLSX.writeFile(wb, `${this.config.label}_Product_Price_Upload_Error_Log_${stamp}.xlsx`);
  }
}