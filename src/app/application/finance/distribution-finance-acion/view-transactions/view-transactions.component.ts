import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { FinanceService } from '../../../../services/finance/finance.service';
import { PermissionService } from '../../../../services/roles-permission/permission.service';
import { TokenService } from '../../../../services/token/services/token.service';

interface COPTransaction {
  id: number;
  transactionId: string;
  slip: string;
  officerId: number;
  transactionStatus: 'Pending' | 'Completed';
  purchasedAt: string;
  empId: string;
  officerName: string;
  phoneCode01: string;
  phoneNumber01: string;
  finalizedBy: string;
  finalizeAt: string;
  handOverPrice: number;
  handOverTime: string;
}

interface COPTransactionsResponse {
  results: COPTransaction[];
  total: number;
}

@Component({
  selector: 'app-view-transactions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    DropdownModule,
    CalendarModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './view-transactions.component.html',
  styleUrl: './view-transactions.component.css',
})
export class ViewTransactionsComponent implements OnInit {
  isLoading = false;
  hasData = true;

  submissions: COPTransaction[] = [];
  page = 1;
  itemsPerPage = 10;
  totalItems = 0;

  selectedStatus: string = '';
  date: Date | null = null;
  searchItem: string = '';

  StatusOptions = [
    { label: 'To Review', value: 'Pending' },
    { label: 'Finalized', value: 'Completed' },
  ];

  constructor(
    private router: Router,
    private financeService: FinanceService,
    public tokenService: TokenService,
    public permissionService: PermissionService,
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.isLoading = true;

    const formattedDate = this.date ? this.formatDate(this.date) : '';

    this.financeService
      .getAllCOPTransactions(
        this.page,
        this.itemsPerPage,
        this.selectedStatus,
        formattedDate,
        this.searchItem,
      )
      .subscribe({
        next: (res: COPTransactionsResponse) => {
          this.submissions = res.results || [];
          this.totalItems = res.total || 0;
          this.hasData = this.submissions.length > 0;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching COP transactions', err);
          this.submissions = [];
          this.totalItems = 0;
          this.hasData = false;
          this.isLoading = false;
        },
      });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  statusFilter(): void {
    this.page = 1;
    this.loadTransactions();
  }

  dateFilter(): void {
    this.page = 1;
    this.loadTransactions();
  }

  onDateClear(): void {
    this.date = null;
    this.page = 1;
    this.loadTransactions();
  }

  searchSubmissions(): void {
    this.page = 1;
    this.loadTransactions();
  }

  clearSearch(): void {
    this.searchItem = '';
    this.page = 1;
    this.loadTransactions();
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadTransactions();
  }

  goBack(): void {
    this.router.navigate(['/finance/action/distribution-finance']);
  }

  getStatusLabel(status: 'Pending' | 'Completed'): string {
    if (status === 'Pending') return 'To Review';
    if (status === 'Completed') return 'Finalized';
    return status;
  }

  viewAllOrders(id: number): void {
    this.router.navigate([
      '/finance/action/distribution-finance/view-transactions-all-orders',
      id,
    ]);
  }

  viewDocument(id: number): void {
    this.router.navigate([
      '/finance/action/distribution-finance/view-cop-transactions-document',
      id,
    ]);
  }
}
