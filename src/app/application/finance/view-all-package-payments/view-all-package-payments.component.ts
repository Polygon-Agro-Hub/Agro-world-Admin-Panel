import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
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
    LoadingSpinnerComponent
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
  fromDate: string = '';
  toDate: string = '';
  isLoading: boolean = false;
  hasData: boolean = false;

  constructor(
    private router: Router,
    private financeService: FinanceService
  ) {}

  ngOnInit() {
    // Set default dates (last month)
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    this.toDate = this.formatDate(today);
    this.fromDate = this.formatDate(lastMonth);
    
    this.fetchPackagePayments();
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  fetchPackagePayments() {
    this.isLoading = true;
    
    this.financeService.getAllPackagePayments(
      this.page,
      this.itemsPerPage,
      this.searchTerm,
      this.fromDate,
      this.toDate
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
      }
    );
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchPackagePayments();
  }

  onSearch() {
    this.searchTerm = this.searchTerm?.trim() || '';
    this.page = 1; // Reset to first page on search
    this.fetchPackagePayments();
  }

  offSearch() {
    this.searchTerm = '';
    this.page = 1;
    this.fetchPackagePayments();
  }

  applyDateFilter() {
    this.page = 1; // Reset to first page on filter
    this.fetchPackagePayments();
  }

  back(): void {
    this.router.navigate(['/finance/dashboard']);
  }
}