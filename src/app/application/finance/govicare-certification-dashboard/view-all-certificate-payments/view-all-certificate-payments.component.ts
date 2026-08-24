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
  payType?: string;
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
  hasDateRangeSelected: boolean = false;

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
      this.minToDate = new Date(this.fromDate);
      this.minToDate.setDate(this.minToDate.getDate() + 1);
      
      if (this.toDate) {
        const fromTime = this.fromDate.getTime();
        const toTime = this.toDate.getTime();
        
        if (toTime <= fromTime) {
          this.toDate = null;
        }
      }
    } else {
      this.minToDate = null;
    }
    
    // Reset date range selected status when dates change
    this.hasDateRangeSelected = false;
    this.hasData = false;
  }

  fetchCertificatePayments() {
    this.isLoading = true;
    
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
    // Check if date range is selected
    this.hasDateRangeSelected = !!(this.fromDate && this.toDate);
    
    if (this.hasDateRangeSelected) {
      this.page = 1;
      this.fetchCertificatePayments();
    } else {
      // Optional: Show a message that both dates are required
      console.log('Please select both from and to dates');
    }
  }

  back(): void {
    this.router.navigate(['/finance/action/govicare-certifications-dashboard']);
  }
}