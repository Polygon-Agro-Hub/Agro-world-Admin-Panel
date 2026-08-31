import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CalendarModule } from 'primeng/calendar';
import { NgxPaginationModule } from 'ngx-pagination';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';

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

  allOrders: CompletedOrder[] = [
    {
      invoiceNo: '2608010001',
      customerName: 'Kasun Kalhara',
      contactNo: '+94786767588',
      orderType: 'Home Delivery',
      amount: 2000.0,
      cashPaid: 0.0,
      cardPaid: 0.0,
      creditPaid: 2000.0,
      orderedAt: '1 Nov, 2024 1:55PM',
      completedAt: '5 Nov, 2024 1:55PM',
      platform: 'SalesDash',
      buyerType: 'Retail',
    },
    {
      invoiceNo: '2608010002',
      customerName: 'Pathumi Perera',
      contactNo: '+94786767587',
      orderType: 'Home Delivery',
      amount: 1000.0,
      cashPaid: 1000.0,
      cardPaid: 0.0,
      creditPaid: 0.0,
      orderedAt: '1 Nov, 2024 1:50PM',
      completedAt: '5 Nov, 2024 1:50PM',
      platform: 'Polygon',
      buyerType: 'Retail',
    },
    {
      invoiceNo: '2608010003',
      customerName: 'Hashini Perera',
      contactNo: '+94786767586',
      orderType: 'In Store Pickup',
      amount: 500.0,
      cashPaid: 0.0,
      cardPaid: 300.0,
      creditPaid: 200.0,
      orderedAt: '1 Nov, 2024 1:40PM',
      completedAt: '5 Nov, 2024 1:40PM',
      platform: 'Polygon',
      buyerType: 'Retail',
    },
  ];

  purchaseReport: CompletedOrder[] = [];

  constructor(private router: Router) {
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

  fetchAllCollectionReport(): void {
    if (!this.fromDate) return;

    this.isLoading = true;

    // TODO: replace with real API call using fromDate / toDate
    setTimeout(() => {
      this.purchaseReport = this.allOrders;
      this.totalItems = this.purchaseReport.length;
      this.hasData = this.totalItems > 0;
      this.isLoading = false;
    }, 500);
  }

  applysearch(): void {
    if (!this.search.trim()) {
      this.purchaseReport = this.allOrders;
    } else {
      this.purchaseReport = this.allOrders.filter((o) =>
        o.invoiceNo.toLowerCase().includes(this.search.toLowerCase()),
      );
    }
    this.totalItems = this.purchaseReport.length;
    this.hasData = this.totalItems > 0;
    this.page = 1;
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
  }

  downloadTemplate1(): void {
    this.isDownloading = true;
    // TODO: replace with real download/export logic
    setTimeout(() => {
      this.isDownloading = false;
    }, 800);
  }
}
