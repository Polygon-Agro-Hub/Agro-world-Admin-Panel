import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { CalendarModule } from 'primeng/calendar';
import { FinanceService } from '../../../../services/finance/finance.service';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';

interface CertificatePayment {
  transactionId: string;
  farmerName: string;
  amount: string;
  dateTime: string;
  expireDate: string;
  validityPeriod: string;
  sortDate: string;
}

@Component({
  selector: 'app-view-all-certificate-payments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    LoadingSpinnerComponent,
    CalendarModule
  ],
  templateUrl: './view-all-certificate-payments.component.html',
  styleUrl: './view-all-certificate-payments.component.css'
})
export class ViewAllCertificatePaymentsComponent implements OnInit {
  certificatePayments: CertificatePayment[] = [];
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
    // Don't call fetchCertificatePayments() here
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
    }
  }

  fetchCertificatePayments() {
    this.isLoading = true;
    
    // Convert Date objects to string format for API
    const fromDateStr = this.fromDate ? this.formatDate(this.fromDate) : '';
    const toDateStr = this.toDate ? this.formatDate(this.toDate) : '';
    
    this.financeService.getAllCertificatePayments(
      this.page,
      this.itemsPerPage,
      this.searchTerm,
      fromDateStr,
      toDateStr
    ).subscribe(
      (response) => {
        this.isLoading = false;
        this.certificatePayments = response.items;
        this.totalItems = response.total;
        this.hasData = response.total > 0;
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching certificate payments:', error);
        this.hasData = false;
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
    this.fetchCertificatePayments();
  }

  onSearch() {
    this.searchTerm = this.searchTerm?.trim() || '';
    this.page = 1; // Reset to first page on search
    this.fetchCertificatePayments();
  }

  offSearch() {
    this.searchTerm = '';
    this.page = 1;
    this.fetchCertificatePayments();
  }

  applyDateFilter() {
    this.page = 1; // Reset to first page on filter
    this.fetchCertificatePayments();
  }

  back(): void {
    this.router.navigate(['/finance/action/govicare-certifications-dashboard']);
  }
}