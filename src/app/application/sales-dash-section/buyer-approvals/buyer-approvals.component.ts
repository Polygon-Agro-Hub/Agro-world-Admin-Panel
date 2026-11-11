import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import {
  BuyerApplication,
  OnboardedOption,
  SalesDashService,
} from '../../../services/sales-dash/sales-dash.service';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-buyer-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, LoadingSpinnerComponent],
  templateUrl: './buyer-approvals.component.html',
  styleUrl: './buyer-approvals.component.css',
})
export class BuyerApprovalsComponent implements OnInit {
  isLoading = false;
  searchText = '';
  selectedOnboarded: string | null = null;

  onboardedOptions: OnboardedOption[] = [];
  applications: BuyerApplication[] = [];

  // pagination
  page = 1;
  limit = 10;
  total = 0;

  constructor(
    private location: Location,
    private router: Router,
    private salesDashService: SalesDashService,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) { }

  ngOnInit(): void {
    this.loadOnboardedOptions();
    this.fetchApplications();
  }

  get hasData(): boolean {
    return this.applications.length > 0;
  }

  get totalItems(): string {
    return this.total.toString().padStart(2, '0');
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.limit));
  }

  Back() {
     this.router.navigate(['sales-dash/action']);
  }

  loadOnboardedOptions() {
    this.salesDashService.getOnboardedOptions().subscribe({
      next: (res) => (this.onboardedOptions = res.options),
      error: (err) => console.error('Failed to load onboarded options', err),
    });
  }

  fetchApplications() {
    this.isLoading = true;
    this.salesDashService
      .getPendingWholesaleBuyers(
        this.page,
        this.limit,
        this.searchText.trim(),
        this.selectedOnboarded ?? '',
        'To Review'
      )
      .subscribe({
        next: (res) => {
          this.applications = res.items;
          this.total = res.total;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load applications', err);
          this.applications = [];
          this.total = 0;
          this.isLoading = false;
        },
      });
  }

  // Filter / search always reset to the first page
  applyFilters() {
    this.page = 1;
    this.fetchApplications();
  }

  onSearch() {
    this.applyFilters();
  }

  offSearch() {
    this.searchText = '';
    this.applyFilters();
  }

  changePage(newPage: number) {
    if (newPage < 1 || newPage > this.totalPages || newPage === this.page) return;
    this.page = newPage;
    this.fetchApplications();
  }

  trackByApplication(_: number, item: BuyerApplication) {
    return item.applicationId;
  }

  // Adds a "." after the title if it's missing: "Mr Kasun" -> "Mr. Kasun"
  formatName(name: string | null | undefined): string {
    if (!name) return '';
    return name
      .trim()
      .replace(
        /^(mr|mrs|ms|miss|dr|prof|rev|ven)(?!\.)(?=\s)/i,
        (title) => title + '.'
      );
  }

  // Pass the userId on to the documents screen
  openDocuments(item: BuyerApplication) {
    this.router.navigate(['/sales-dash/action/wholesale-buyer/document/', item.userId], {
      // queryParams: { applicationId: item.applicationId },
    });
  }
}