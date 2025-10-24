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
  isFilterApplied: boolean = false;

  maxDate: Date = new Date();
  minDate: Date = new Date();

  constructor(
    private router: Router,
    private financeService: FinanceService
  ) { }

  ngOnInit() {
    this.hasData = false;
    this.isFilterApplied = false;
  }

  onFromDateSelect() {
    if (this.fromDate) {
      this.minDate = new Date(this.fromDate);
    } else {
      this.minDate = new Date();
      this.toDate = null;
    }
  }

  formatDateForAPI(date: Date | null): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // New method to format date for display
  formatDateTimeForDisplay(dateTimeString: string): string {
    if (!dateTimeString) return '';
    
    const date = new Date(dateTimeString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateTimeString; // Return original string if invalid date
    }

    // Format date part: 20 Sep, 2025
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    // Format time part: 07:39AM
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedHours = String(hours).padStart(2, '0');

    return `${day} ${month}, ${year} ${formattedHours}:${minutes}${ampm}`;
  }

  fetchServicePayments() {
    this.isLoading = true;

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
        
        // Format the dateTime for each item before assigning
        this.servicePayments = response.items.map(item => ({
          ...item,
          dateTime: this.formatDateTimeForDisplay(item.dateTime)
        }));
        
        this.totalItems = response.total;
        this.hasData = response.total > 0;
        this.isFilterApplied = true;
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching service payments:', error);
        this.hasData = false;
        this.isFilterApplied = true;
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
    if (this.fromDate || this.toDate) {
      this.fetchServicePayments();
    } else {
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