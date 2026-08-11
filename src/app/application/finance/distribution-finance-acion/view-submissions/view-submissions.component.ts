import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule, PaginationService } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { FinanceService } from '../../../../services/finance/finance.service';
import { Router } from '@angular/router';
import { PermissionService } from '../../../../services/roles-permission/permission.service';
import { TokenService } from '../../../../services/token/services/token.service';

interface Submission {
  id: number;
  imageUrl: string;
  product: string;
  purchasedKg: number;
  assigneeId: string;
  name: string;
  phoneNumber: string;
  centre: string;
  status: 'To Review' | 'Finalized';
  purchasedAt: Date;
  finalizedBy: string | null;
  finalizedAt: Date | null;
}

@Component({
  selector: 'app-view-submissions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    CalendarModule,
    NgxPaginationModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './view-submissions.component.html',
  styleUrl: './view-submissions.component.css',
})
export class ViewSubmissionsComponent implements OnInit {
  isLoading = false;

  searchItem: string = '';
  page: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;

  selectedStatus: string = '';
  date: Date | null = null;

  StatusOptions = [
    { label: 'To Review', value: 'Pending' },
    { label: 'Finalized', value: 'Completed' },
  ];

  submissions: Submission[] = [];

  private readonly paginationId = 'submissions-pagination';

  constructor(
    private router: Router,
    private location: Location,
    private financeService: FinanceService,
    public tokenService: TokenService,
    public permissionService: PermissionService,
  ) { }

  ngOnInit(): void {
    this.fetchSubmissions();
  }

  fetchSubmissions(): void {
    this.isLoading = true;

    const purchasedAt = this.date ? this.formatDate(this.date) : '';

    this.financeService
      .getAllShortageSubmissions(
        this.page,
        this.itemsPerPage,
        this.selectedStatus,
        purchasedAt,
        this.searchItem,
      )
      .subscribe({
        next: (res) => {
          this.submissions = (res.results || []).map((item: any) =>
            this.mapToSubmission(item),
          );
          this.totalItems = res.total || 0;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching shortage submissions', err);
          this.submissions = [];
          this.totalItems = 0;
          this.isLoading = false;
        },
      });
  }

  private mapToSubmission(item: any): Submission {
    return {
      id: item.id,
      imageUrl: item.image,
      product: item.product,
      purchasedKg: Number(item.prchQty),
      assigneeId: item.empId,
      name: item.officerName,
      phoneNumber: this.formatPhoneNumber(item.phoneCode01, item.phoneNumber01),
      centre: item.regCode,
      status: this.mapStatus(item.reqStatus),
      purchasedAt: item.purchasedAt ? new Date(item.purchasedAt) : new Date(),
      finalizedBy: item.finalizedBy,
      finalizedAt: item.finalizeAt ? new Date(item.finalizeAt) : null,
    };
  }

  private mapStatus(reqStatus: string): 'To Review' | 'Finalized' {
    if (reqStatus === 'Pending') return 'To Review';
    if (reqStatus === 'Completed') return 'Finalized';
    return reqStatus as 'To Review' | 'Finalized';
  }

  private formatPhoneNumber(phoneCode: string, phoneNumber: string): string {
    if (!phoneNumber) return '';

    if (phoneCode === '+94') {
      return `0${phoneNumber}`;
    }

    return phoneCode ? `${phoneCode}${phoneNumber}` : phoneNumber;
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  get hasData(): boolean {
    return this.submissions.length > 0;
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchSubmissions();
  }

  searchSubmissions() {
    this.searchItem = this.searchItem?.trim() || '';
    this.page = 1;
    this.fetchSubmissions();
  }

  clearSearch(): void {
    this.searchItem = '';
    this.page = 1;
    this.fetchSubmissions();
  }

  statusFilter() {
    this.page = 1;
    this.fetchSubmissions();
  }

  dateFilter() {
    this.page = 1;
    this.fetchSubmissions();
  }

  onDateClear() {
    this.date = null;
    this.page = 1;
    this.fetchSubmissions();
  }

  navigateToInvoice(id: number) {
    this.router.navigate([
      'finance/action/distribution-finance/view-submissions-document',
      id,
    ]);
  }

  goBack(): void {
    this.location.back();
  }
}
