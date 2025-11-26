import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { CalendarModule } from 'primeng/calendar';
import { FinanceService } from '../../../services/finance/finance.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

interface PackagePayment {
  transactionId: number;
  farmerName: string;
  phoneNumber: string;
  packagePeriod: string;
  amount: string;
  dateTime: string;
  sortDate: string;
}

@Component({
  selector: 'app-view-all-package-payments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    LoadingSpinnerComponent,
    CalendarModule
  ],
  templateUrl: './view-all-package-payments.component.html',
  styleUrl: './view-all-package-payments.component.css'
})
export class ViewAllPackagePaymentsComponent implements OnInit {
  packagePayments: PackagePayment[] = [];
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  searchTerm: string = '';
  fromDate: Date | null = null;
  toDate: Date | null = null;
  isLoading: boolean = false;
  hasData: boolean = false;
  maxDate: Date = new Date(); // Today's date - for blocking future dates
  minToDate: Date | null = null; // Minimum date for "To" field

  constructor(
    private router: Router,
    private financeService: FinanceService
  ) {}

  ngOnInit() {
    // Keep dates blank by default - don't fetch until user applies filter
  }

  // Called when clear button is clicked in either calendar
  onDateClear() {
    // Reset both dates
    this.fromDate = null;
    this.toDate = null;
    this.minToDate = null;
    
    // Reset to first page and clear the table data
    this.page = 1;
    this.clearTableData();
  }

  // Clear table data and reset pagination
  clearTableData() {
    this.packagePayments = [];
    this.totalItems = 0;
    this.hasData = false;
  }

  // Called when fromDate changes
  onFromDateChange() {
    if (this.fromDate) {
      // Set minimum date for "To" field (day after fromDate)
      this.minToDate = new Date(this.fromDate);
      this.minToDate.setDate(this.minToDate.getDate() + 1);
      
      // If toDate is already set and is invalid, clear it
      if (this.toDate) {
        const fromTime = this.fromDate.getTime();
        const toTime = this.toDate.getTime();
        
        // Clear toDate if it's the same as or before fromDate
        if (toTime <= fromTime) {
          this.toDate = null;
        }
      }
    } else {
      this.minToDate = null;
      // If fromDate is cleared, also clear toDate
      this.toDate = null;
    }
  }

  fetchPackagePayments() {
    // Don't fetch if both dates are not selected
    if (!this.fromDate || !this.toDate) {
      this.clearTableData();
      return;
    }

    this.isLoading = true;
    
    // Convert Date objects to string format for API
    const fromDateStr = this.fromDate ? this.formatDate(this.fromDate) : '';
    const toDateStr = this.toDate ? this.formatDate(this.toDate) : '';
    
    this.financeService.getAllPackagePayments(
      this.page,
      this.itemsPerPage,
      this.searchTerm,
      fromDateStr,
      toDateStr
    ).subscribe(
      (response) => {
        this.isLoading = false;
        this.packagePayments = response.items;
        this.totalItems = response.total;
        this.hasData = response.total > 0;
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching package payments:', error);
        this.hasData = false;
        this.clearTableData();
      }
    );
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchPackagePayments();
  }

  onSearch() {
    this.searchTerm = this.searchTerm?.trim() || '';
    this.page = 1; // Reset to first page on search
    
    // Only fetch if dates are selected
    if (this.fromDate && this.toDate) {
      this.fetchPackagePayments();
    } else {
      this.clearTableData();
    }
  }

  offSearch() {
    this.searchTerm = '';
    this.page = 1;
    
    // Only fetch if dates are selected
    if (this.fromDate && this.toDate) {
      this.fetchPackagePayments();
    } else {
      this.clearTableData();
    }
  }

  applyDateFilter() {
    // Validate that both dates are selected
    if (!this.fromDate || !this.toDate) {
      this.clearTableData();
      return;
    }

    this.page = 1; // Reset to first page on filter
    this.fetchPackagePayments();
  }

  back(): void {
    this.router.navigate(['/finance/action/govicare-packages']);
  }
}