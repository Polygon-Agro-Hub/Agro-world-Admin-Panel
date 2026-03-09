import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { FinanceService } from '../../../services/finance/finance.service';
import { HttpClient } from '@angular/common/http';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';

interface FarmerPayment {
  id: number;
  invNo: string;
  farmerName: string;
  NICnumber: string;
  phoneNumber: string;
  totalPayment: number;
  bankName: string;
  branchName: string;
  accNumber: string;
  createdAt: string;
}

interface BankOption {
  label: string;
  value: string;
}

interface Bank {
  ID: number;
  name: string;
}

@Component({
  selector: 'app-farmer-payments',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    CalendarModule,
    LoadingSpinnerComponent,
    FormsModule,
  ],
  templateUrl: './farmer-payments.component.html',
  styleUrl: './farmer-payments.component.css',
})
export class FarmerPaymentsComponent implements OnInit {
  isLoading = false;
  isDownloading = false;
  hasData: boolean = true;
  farmerPayments: FarmerPayment[] = [];
  filteredPayments: FarmerPayment[] = [];

  selectedBank: string = '';
  selectedDate: Date | null = new Date();
  searchTerm: string = '';

  bankOptions: BankOption[] = [];
  banks: Bank[] = [];

  constructor(
    private router: Router,
    private financeService: FinanceService,
    private http: HttpClient,
    public tokenService: TokenService,
    public permissionService: PermissionService,
  ) {}

  ngOnInit(): void {
    this.selectedDate = new Date();

    this.loadBanks();
    this.loadFarmerPayments();
  }

  loadBanks(): void {
    this.http.get<Bank[]>('assets/json/banks.json').subscribe({
      next: (data) => {
        this.banks = data.sort((a, b) => a.name.localeCompare(b.name));
        this.bankOptions = this.banks.map((bank) => ({
          label: bank.name,
          value: bank.name,
        }));
      },
      error: (error) => {
        console.error('Error loading banks:', error);
        this.populateBankOptionsFromData();
      },
    });
  }

  loadFarmerPayments(): void {
    this.isLoading = true;

    const dateParam = this.selectedDate
      ? this.formatDateForApi(this.selectedDate)
      : '';

    this.financeService
      .getAllFarmerPayments(dateParam, this.selectedBank)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.status && response.data) {
            this.farmerPayments = response.data;
            this.filteredPayments = [...this.farmerPayments];
            this.hasData = this.filteredPayments.length > 0;

            if (this.bankOptions.length === 0) {
              this.populateBankOptionsFromData();
            }
          } else {
            this.hasData = false;
            this.farmerPayments = [];
            this.filteredPayments = [];
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error loading farmer payments:', error);
          this.hasData = false;
          this.farmerPayments = [];
          this.filteredPayments = [];
        },
      });
  }

  populateBankOptionsFromData(): void {
    const uniqueBanks = [
      ...new Set(
        this.farmerPayments
          .filter((payment) => payment.bankName)
          .map((payment) => payment.bankName),
      ),
    ];

    this.bankOptions = uniqueBanks
      .map((bank) => ({
        label: bank,
        value: bank,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  onBankChange(event: any): void {
    this.selectedBank = event.value;
    this.applyFilters();
  }

  onDateChange(event: any): void {
    this.selectedDate = event;
    this.loadFarmerPayments();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  clearDate(): void {
    this.selectedDate = null;
    this.loadFarmerPayments();
  }

  applyFilters(): void {
    let filtered = [...this.farmerPayments];

    if (this.selectedBank) {
      filtered = filtered.filter(
        (payment) => payment.bankName === this.selectedBank,
      );
    }

    if (this.selectedDate) {
      const selectedDateStr = this.formatDateForFilter(this.selectedDate);

      filtered = filtered.filter((payment) => {
        const paymentDate = new Date(payment.createdAt);
        const paymentDateStr = this.formatDateForFilter(paymentDate);

        return paymentDateStr === selectedDateStr;
      });
    }

    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (payment) =>
          payment.farmerName.toLowerCase().includes(searchLower) ||
          payment.NICnumber.toLowerCase().includes(searchLower) ||
          payment.phoneNumber.includes(searchLower),
      );
    }

    this.filteredPayments = filtered;
    this.hasData = filtered.length > 0;
  }

  private formatDateForFilter(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  refreshData(): void {
    this.selectedBank = '';
    this.selectedDate = new Date();
    this.searchTerm = '';
    this.loadFarmerPayments();
  }

  private formatDateForApi(date: Date): string {
    return this.formatDateForFilter(date);
  }

  downloadData(): void {
    if (this.filteredPayments.length === 0) {
      console.warn('No data to download');
      alert('No data available to download');
      return;
    }

    this.isDownloading = true;

    setTimeout(() => {
      try {
        const excelData = this.prepareExcelData();

        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

        const colWidths = [
          { wch: 25 },
          { wch: 15 },
          { wch: 15 },
          { wch: 15 },
          { wch: 12 },
          { wch: 20 },
          { wch: 20 },
          { wch: 20 },
          { wch: 25 },
        ];
        ws['!cols'] = colWidths;

        if (ws['!ref']) {
          const range = XLSX.utils.decode_range(ws['!ref']);
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
            if (ws[cellAddress]) {
              ws[cellAddress].s = {
                font: { bold: true },
                alignment: { horizontal: 'center' },
                fill: {
                  fgColor: { rgb: 'D3D3D3' },
                  patternType: 'solid',
                },
                border: {
                  top: { style: 'thin' },
                  left: { style: 'thin' },
                  bottom: { style: 'thin' },
                  right: { style: 'thin' },
                },
              };
            }
          }
        }

        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Farmer Payments');

        const fileName = this.generateFileName();

        XLSX.writeFile(wb, fileName);
      } catch (error) {
        console.error('Error downloading Excel file:', error);
        alert('Error downloading Excel file. Please try again.');
      } finally {
        this.isDownloading = false;
      }
    }, 100);
  }

  private generateFileName(): string {
    let fileName = 'Farmer Payments';

    if (this.selectedBank) {
      const safeBankName = this.selectedBank
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, ' ');
      fileName += ` - ${safeBankName}`;
    }

    if (this.selectedDate) {
      const dateStr = this.formatDateForDisplay(this.selectedDate);
      fileName += ` - ${dateStr}`;
    } else {
      const currentDate = new Date();
      const dateStr = this.formatDateForDisplay(currentDate);
      fileName += ` - ${dateStr}`;
    }

    fileName += '.xlsx';

    return fileName;
  }

  private formatDateForDisplay(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private prepareExcelData(): any[] {
    return this.filteredPayments.map((payment) => ({
      'Full Name': payment.farmerName || 'N/A',
      NIC: payment.NICnumber || 'N/A',
      'Phone number': payment.phoneNumber || 'N/A',
      'Amount (Rs.)': payment.totalPayment || 0,
      Date: this.formatDate(payment.createdAt),
      'Account Number': payment.accNumber || 'N/A',
      'Bank Name': payment.bankName || 'N/A',
      'Branch Name': payment.branchName || 'N/A',
      'Payment Reference': payment.invNo || 'N/A',
    }));
  }

  private getCurrentTimestamp(): string {
    const now = new Date();
    return now
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\..+/, '')
      .replace('T', '_');
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return 'N/A';
    }

    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();

    return `${day} ${month}, ${year}`;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-LK', {
      minimumFractionDigits: 2,
    }).format(amount);
  }

  getTotalAmount(): number {
    return this.filteredPayments.reduce(
      (sum, payment) => sum + (payment.totalPayment || 0),
      0,
    );
  }

  getTotalRecords(): number {
    return this.filteredPayments.length;
  }

  back(): void {
    this.router.navigate(['finance/action/govicare-finance']);
  }

  trimSearchInput(): void {
    if (this.searchTerm) {
      this.searchTerm = this.searchTerm.trim();
      this.applyFilters();
    }
  }

  preventLeadingSpace(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    if (event.key === ' ' && input.selectionStart === 0) {
      event.preventDefault();
    }
  }
}
