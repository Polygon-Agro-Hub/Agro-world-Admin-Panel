import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';
import { FinanceService } from '../../../services/finance/finance.service';

// Import PrimeNG modules
import { CalendarModule } from 'primeng/calendar';

interface ServicePayment {
  transactionId: number;
  farmerName: string;
  serviceName: string;
  amount: string;
  dateTime: string;
  sortDate: string;
}

interface ServicePaymentsResponse {
  items: ServicePayment[];
  total: number;
}

@Component({
  selector: 'app-view-all-service-payments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    LoadingSpinnerComponent,
    CalendarModule
  ],
  templateUrl: './view-all-service-payments.component.html',
  styleUrl: './view-all-service-payments.component.css'
})
export class ViewAllServicePaymentsComponent implements OnInit {
  servicePayments: ServicePayment[] = [];
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  searchTerm: string = '';
  fromDate: Date | null = null;
  toDate: Date | null = null;
  isLoading: boolean = false;
  hasData: boolean = false;
  isFilterApplied: boolean = false; // New flag to track if filtering is applied

  maxDate: Date = new Date();
  minDate: Date = new Date();

  constructor(
    private router: Router,
    private financeService: FinanceService
  ) { }

  ngOnInit() {
    // Don't fetch data on init - wait for user to apply filters
    this.hasData = false;
    this.isFilterApplied = false;
  }

  formatDateForAPI(date: Date | null): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  fetchServicePayments() {
    this.isLoading = true;

    // Convert Date objects to string format for API
    const fromDateString = this.formatDateForAPI(this.fromDate);
    const toDateString = this.formatDateForAPI(this.toDate);

    this.financeService.getAllServicePayments(
      this.page,
      this.itemsPerPage,
      this.searchTerm,
      fromDateString,
      toDateString
    ).subscribe(
      (response: ServicePaymentsResponse) => {
        this.isLoading = false;
        this.servicePayments = response.items;
        this.totalItems = response.total;
        this.hasData = response.total > 0;
        this.isFilterApplied = true; // Set flag when data is fetched
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching service payments:', error);
        this.hasData = false;
        this.isFilterApplied = true; // Still set flag even on error
      }
    );
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchServicePayments();
  }

  onSearch() {
    this.searchTerm = this.searchTerm?.trim() || '';
    this.page = 1;
    this.fetchServicePayments();
  }

  offSearch() {
    this.searchTerm = '';
    this.page = 1;
    // If no other filters are applied, reset to default state
    if (!this.fromDate && !this.toDate) {
      this.hasData = false;
      this.isFilterApplied = false;
      this.servicePayments = [];
      this.totalItems = 0;
    } else {
      this.fetchServicePayments();
    }
  }

  applyDateFilter() {
    this.page = 1;
    // Only fetch data if at least one date is selected
    if (this.fromDate || this.toDate) {
      this.fetchServicePayments();
    } else {
      // If both dates are cleared, reset to default state
      this.hasData = false;
      this.isFilterApplied = false;
      this.servicePayments = [];
      this.totalItems = 0;
    }
  }

  clearAllFilters() {
    this.searchTerm = '';
    this.fromDate = null;
    this.toDate = null;
    this.page = 1;
    this.hasData = false;
    this.isFilterApplied = false;
    this.servicePayments = [];
    this.totalItems = 0;
  }

  back(): void {
    this.router.navigate(['/finance/action/govilink-services-dashboard']);
  }
}