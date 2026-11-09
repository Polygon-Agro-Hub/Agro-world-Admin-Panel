import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  SalesDashboardData,
  SalesDashboardTotals,
  SalesDashService,
} from '../../../services/sales-dash/sales-dash.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

interface BuyerCard {
  label: string;
  key: keyof SalesDashboardTotals;
  bgClass: string;
}

interface SummaryCard {
  label: string;
  value: number | null;
  type: 'currency' | 'orders' | 'purchases';
  icon: string;
}

@Component({
  selector: 'app-sales-dash-db',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './sales-dash-db.component.html',
  host: { class: 'block min-h-full' },
})
export class SalesDashDbComponent implements OnInit {
  data: SalesDashboardData | null = null;
  summaryCards: SummaryCard[] = [];
  loading = false;

  readonly buyerCards: BuyerCard[] = [
    { label: 'Total Buyers', key: 'totalBuyers', bgClass: 'bg-[#0d9488]' },
    { label: 'New Buyers', key: 'newBuyers', bgClass: 'bg-[#ff9138]' },
    { label: 'Existing Buyers', key: 'existingBuyers', bgClass: 'bg-[#387ff5]' },
    { label: 'Retail Buyers', key: 'retailBuyers', bgClass: 'bg-[#b90087]' },
    { label: 'Wholesale Buyers', key: 'wholesaleBuyers', bgClass: 'bg-[#008e98]' },
    { label: 'Wholesale Requests', key: 'wholesaleRequests', bgClass: 'bg-[#b78e00]' },
  ];

  // Built once (placeholders first), rebuilt only when data arrives
  // summaryCards: SummaryCard[] = this.buildSummaryCards();

  constructor(
    private dashboardService: SalesDashService,
    private destroyRef: DestroyRef,
  ) { }

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.dashboardService.getDashboard()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.status && response.data && Array.isArray(response.data.packages)) {
            this.data = response.data;
            this.summaryCards = this.buildSummaryCards();
          } else {
            console.error('Sales dashboard: unexpected response', response);
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Sales dashboard: request failed', err);
          this.loading = false;
        },
      });
  }

  trackByKey = (_: number, card: BuyerCard) => card.key;
  trackByLabel = (_: number, card: SummaryCard) => card.label;

  valueFor(key: keyof SalesDashboardTotals): number | null {
    const value = this.data?.[key];
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }

  formatValue(card: SummaryCard): string {
    const value = card.value;
    if (value === null) return '\u2014';
    const formatted = value.toLocaleString('en-US', card.type === 'currency'
      ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      : { maximumFractionDigits: 0 });
    if (card.type === 'currency') return `Rs. ${formatted}`;
    if (card.type === 'purchases') return `${formatted} Purchases`;
    return formatted;
  }

  private buildSummaryCards(): SummaryCard[] {
    return [
      { label: 'Total Value of New Buyers', value: this.valueFor('newBuyersValue'), type: 'currency', icon: 'fa-solid fa-money-bill-1-wave' },
      { label: 'Total Value of Existing Buyers', value: this.valueFor('existingBuyersValue'), type: 'currency', icon: 'fa-solid fa-money-bill-1-wave' },
      { label: 'Total Orders Placed', value: this.valueFor('totalOrdersPlaced'), type: 'orders', icon: 'fa-solid fa-box' },
      ...(this.data?.packages ?? []).map((pkg): SummaryCard => ({
        label: pkg.name,
        value: pkg.purchases,
        type: 'purchases',
        icon: 'fa-solid fa-bag-shopping',
      })),
    ];
  }
}