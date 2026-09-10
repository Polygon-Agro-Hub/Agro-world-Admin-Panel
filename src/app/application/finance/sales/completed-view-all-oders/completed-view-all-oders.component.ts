import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CalendarModule } from 'primeng/calendar';
import { NgxPaginationModule } from 'ngx-pagination';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { FinanceService } from '../../../../services/finance/finance.service'; // adjust path/name as needed

interface CompletedOrder {
  invoiceNo: string;
  customerName: string;
  contactNo: string;
  orderType: string;
  amount: number;
  cashPaid: number;
  cardPaid: number;
  creditPaid: number;
  orderedAt: string;
  completedAt: string;
  platform: string;
  buyerType: string;
}

@Component({
  selector: 'app-completed-view-all-oders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarModule,
    NgxPaginationModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './completed-view-all-oders.component.html',
  styleUrl: './completed-view-all-oders.component.css',
})
export class CompletedViewAllOdersComponent {
  isLoading = false;
  isDownloading = false;

  fromDate: Date | null = null;
  toDate: Date | null = null;

  // Max selectable "From" date = yesterday (blocks today & future)
  maxFromDate: Date;

  // Min selectable "To" date = day after "From" date (blocks same/earlier)
  minToDate: Date | null = null;

  search = '';

  page = 1;
  itemsPerPage = 10;
  totalItems = 0;

  isFromDateSelected = false;
  hasData = false;

  purchaseReport: CompletedOrder[] = [];

  constructor(
    private router: Router,
    private financeService: FinanceService,
  ) {
    // "From" can never be today or later — cap it at yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);
    this.maxFromDate = yesterday;
  }

  back(): void {
    this.router.navigate(['/finance/action/finance-sales/sales']);
  }

  onFromDateChange(): void {
    this.isFromDateSelected = !!this.fromDate;

    if (this.fromDate) {
      // "To" must be at least one day after "From" (blocks same/earlier date)
      const nextDay = new Date(this.fromDate);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(0, 0, 0, 0);
      this.minToDate = nextDay;

      // If a previously selected "To" date is no longer valid, clear it
      if (this.toDate && this.toDate <= this.fromDate) {
        this.toDate = null;
      }
    } else {
      this.minToDate = null;
      this.toDate = null;
    }
  }

  onFromDateClear(): void {
    this.fromDate = null;
    this.toDate = null;
    this.minToDate = null;
    this.isFromDateSelected = false;
    this.hasData = false;
    this.purchaseReport = [];
  }

  onToDateClear(): void {
    this.toDate = null;
  }

  // Converts a Date -> 'YYYY-MM-DD' for the backend (matches DATE(o.createdAt) comparison)
  private formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private mapOrderType(orderType: string): string {
    const map: Record<string, string> = {
      Delivery: 'Home Delivery',
      Pickup: 'In Store Pickup',
    };
    return map[orderType] || orderType || 'N/A';
  }

  private mapPlatform(platform: string): string {
    const map: Record<string, string> = {
      Marketplace: 'Polygon',
      Dash: 'SalesDash',
    };
    return map[platform] || platform || 'N/A';
  }

  private splitPayment(
    paymentMethod: string,
    cashPaid: number,
    creditPaid: number,
  ): { cashPaid: number; cardPaid: number; creditPaid: number } {
    const money = Number(cashPaid) || 0;
    const credit = Number(creditPaid) || 0;

    let cash = 0;
    let card = 0;

    if (paymentMethod === 'Card') {
      card = money;
    } else {
      cash = money;
    }

    return { cashPaid: cash, cardPaid: card, creditPaid: credit };
  }

  private mapResponseItem(item: any): CompletedOrder {
    const { cashPaid, cardPaid, creditPaid } = this.splitPayment(
      item.paymentMethod,
      item.cashPaid,
      item.creditPaid,
    );

    return {
      invoiceNo: item.invoiceNo,
      customerName: item.customerName,
      contactNo: `${item.phonecode1 || ''}${item.phone1 || ''}`,
      orderType: this.mapOrderType(item.orderType),
      amount: Number(item.amount) || 0,
      cashPaid,
      cardPaid,
      creditPaid,
      orderedAt: this.formatDateTime(item.orderedAt),
      completedAt: this.formatDateTime(item.completedAt),
      platform: this.mapPlatform(item.platform),
      buyerType: item.buyerType || 'N/A',
    };
  }

  fetchAllCollectionReport(): void {
    if (!this.fromDate) return;

    this.isLoading = true;

    const startDate = this.formatDateForApi(this.fromDate);
    const endDate = this.toDate ? this.formatDateForApi(this.toDate) : '';

    this.financeService
      .getAllCompletedOrders(
        this.page,
        this.itemsPerPage,
        startDate,
        endDate,
        this.search,
      )
      .subscribe({
        next: (res: any) => {
          const items = res?.items || [];
          this.purchaseReport = items.map((item: any) =>
            this.mapResponseItem(item),
          );
          this.totalItems = res?.total || 0;
          this.hasData = this.totalItems > 0;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching completed orders:', err);
          this.purchaseReport = [];
          this.totalItems = 0;
          this.hasData = false;
          this.isLoading = false;
        },
      });
  }

  applysearch(): void {
    if (!this.fromDate) return;
    this.page = 1;
    this.fetchAllCollectionReport();
  }

  clearSearch(): void {
    this.search = '';
    this.applysearch();
  }

  preventLeadingSpace(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    if (input.selectionStart === 0 && event.key === ' ') {
      event.preventDefault();
    }
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (!value) {
      this.applysearch();
    }
  }

  onPageChange(page: number): void {
    this.page = page;
    this.fetchAllCollectionReport();
  }

  downloadTemplate1(): void {
    if (!this.fromDate || !this.toDate) return;

    this.isDownloading = true;

    const startDate = this.formatDateForApi(this.fromDate);
    const endDate = this.formatDateForApi(this.toDate);

    this.financeService
      .downloadCompletedOrders(startDate, endDate, this.search)
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${startDate.replace(/-/g, '.')} - ${endDate.replace(/-/g, '.')} Completed Sales.xlsx`;
          link.click();
          window.URL.revokeObjectURL(url);
          this.isDownloading = false;
        },
        error: (err) => {
          console.error('Error downloading completed orders:', err);
          this.isDownloading = false;
        },
      });
  }

  private formatDateTime(dateValue: string | Date | null): string {
    if (!dateValue) return 'N/A';

    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'N/A';

    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // 0 -> 12

    return `${day} ${month}, ${year} ${hours}:${minutes}${ampm}`;
  }
}
