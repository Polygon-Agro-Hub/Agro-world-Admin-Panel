import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { ProcumentsService } from '../../../../services/procuments/procuments.service'; // adjust path/name as needed

interface ShortageItem {
  id: number;
   shortageId: number;
   assignedQty: number;
  itemName: string;
  imageUrl: string;
  shortageQty: number;
  unit: string;
  marketPricePerKg: number;
  isAssigned: boolean;
  assignedCentre?: string;
  ceilingPercentage?: number;
  firstAssignedBy?: string;
  finalizedBy?: string;
  createdAt: string;
}

@Component({
  selector: 'app-procurement-shortage-history',
  standalone: true,
  imports: [CommonModule, CalendarModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './procurement-shortage-history.component.html',
  styleUrl: './procurement-shortage-history.component.css',
})
export class ProcurementShortageHistoryComponent implements OnInit {
  isLoading = false;
  hasData: boolean = true;

  shortageItems: ShortageItem[] = [];
  notAssignedItems: ShortageItem[] = [];
  assignedItems: ShortageItem[] = [];

  selectedDate: Date | null = new Date();

  // Fallback images for known items — update the paths to match your assets folder
  private readonly itemImageMap: { [key: string]: string } = {
    garlic: 'assets/items/garlic.png',
    turmeric: 'assets/items/turmeric.png',
    watermelon: 'assets/items/watermelon.png',
    'yellow lemon premium': 'assets/items/yellow-lemon.png',
  };

  constructor(
    private router: Router,
    private procurementService: ProcumentsService,
  ) {}

  ngOnInit(): void {
    this.selectedDate = new Date();
    this.loadShortageHistory();
  }

  loadShortageHistory(): void {
    this.isLoading = true;

    const dateParam = this.selectedDate
      ? this.formatDateForApi(this.selectedDate)
      : undefined;

    this.procurementService.getAllShortageAssignedDetails(dateParam).subscribe({
      next: (response: any[]) => {
        this.shortageItems = (response || []).map((row) => this.mapRowToShortageItem(row));
        this.splitByAssignment();
        this.hasData = this.shortageItems.length > 0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading shortage history:', err);
        this.shortageItems = [];
        this.notAssignedItems = [];
        this.assignedItems = [];
        this.hasData = false;
        this.isLoading = false;
      },
    });
  }

  /**
   * Maps a raw DAO row (one row per shortage, or per shortage+assignment
   * combination) into the ShortageItem shape the template expects.
   */
  private mapRowToShortageItem(row: any): ShortageItem {
    const isAssigned = row.id != null; // sa.id is null when a shortage has no assignment row

    const centreParts = [row.regCode, row.centerName].filter(Boolean);

    return {
    id: isAssigned ? row.id : row.shortageId,
    shortageId: row.shortageId,
    assignedQty: Number(row.assignedQty) || 0,
    itemName: row.displayName || '',
    imageUrl: row.image || this.getItemImage(row.displayName),
    shortageQty: Number(row.shortageQty) || 0, // backend already returns the REMAINING qty
    unit: row.unit || 'kg',
    marketPricePerKg: row.buyPrice,
    isAssigned,
    assignedCentre: isAssigned ? centreParts.join(' ') : undefined,
    ceilingPercentage: isAssigned ? row.ceilling : undefined,
    firstAssignedBy: isAssigned ? row.assignedByName : undefined,
    finalizedBy: isAssigned ? row.finalizedByName : undefined,
    createdAt: row.shortageCreatedAt,
  };
  }

  private splitByAssignment(): void {
  // Assigned table: unchanged — every real assignment record still shows here.
  this.assignedItems = this.shortageItems.filter((item) => item.isAssigned);

  // Not-assigned table: one entry per shortage that STILL has qty left
  // to assign, even if it already has partial assignment(s). A shortage
  // with multiple assignments produces multiple rows in shortageItems,
  // so dedupe by shortageId.
  const seen = new Set<number>();
  this.notAssignedItems = [];

  for (const item of this.shortageItems) {
    if (item.shortageQty <= 0) continue; // fully covered — nothing outstanding
    if (seen.has(item.shortageId)) continue;
    seen.add(item.shortageId);

    this.notAssignedItems.push({
      ...item,
      id: item.shortageId,
      isAssigned: false,
      assignedCentre: undefined,
      ceilingPercentage: undefined,
      firstAssignedBy: undefined,
      finalizedBy: undefined,
    });
  }
}

  onDateChange(event: any): void {
    this.selectedDate = event;
    this.loadShortageHistory();
  }

  clearDate(): void {
    this.selectedDate = null;
    this.loadShortageHistory();
  }

  getItemImage(itemName: string): string {
    const key = (itemName || '').trim().toLowerCase();
    return this.itemImageMap[key] || 'assets/images/items/default-item.png';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-LK', {
      minimumFractionDigits: 2,
    }).format(amount || 0);
  }

  getTotalRecords(): string {
    return this.shortageItems.length.toString().padStart(2, '0');
  }

  getNotAssignedCount(): string {
    return this.notAssignedItems.length.toString().padStart(2, '0');
  }

  getAssignedCount(): string {
    return this.assignedItems.length.toString().padStart(2, '0');
  }

  private formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  back(): void {
    this.router.navigate(['/procurement']);
  }
}