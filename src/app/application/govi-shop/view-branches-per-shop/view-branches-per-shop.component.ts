import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { GovishopService } from '../../../services/govi-shop/govishop.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { NgxPaginationModule } from 'ngx-pagination';

export interface Branch {
  id: number;
  branchName: string;
  district: string | null;
  province: string | null;
  isActive: number;
  mobilePhone: string | null;
  managerCount: number;
  posCount: number;
  updatedAt: Date | null;
  updatedBy: string | null;
}

@Component({
  selector: 'app-view-branches-per-shop',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
  ],
  templateUrl: './view-branches-per-shop.component.html',
  styleUrl: './view-branches-per-shop.component.css',
})
export class ViewBranchesPerShopComponent implements OnInit {
  isLoading = false;

  shopId: number | null = null;
  shopName = '';

  branches: Branch[] = [];
  totalBranches = 0;

  // Filters
  searchTerm = '';
  selectedProvince = '';
  selectedDistrict = '';

  // Pagination
  page = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Toggle confirmation modal
  showToggleModal = false;
  pendingToggleBranch: Branch | null = null;
  pendingToggleStatus: number = 0;

  provinceOptions = [
    { label: 'Western', value: 'Western' },
    { label: 'Central', value: 'Central' },
    { label: 'Southern', value: 'Southern' },
    { label: 'Northern', value: 'Northern' },
    { label: 'Eastern', value: 'Eastern' },
    { label: 'North Western', value: 'North Western' },
    { label: 'North Central', value: 'North Central' },
    { label: 'Uva', value: 'Uva' },
    { label: 'Sabaragamuwa', value: 'Sabaragamuwa' },
  ];

  districtOptions = [
    { label: 'Colombo', value: 'Colombo' },
    { label: 'Gampaha', value: 'Gampaha' },
    { label: 'Kalutara', value: 'Kalutara' },
    { label: 'Kandy', value: 'Kandy' },
    { label: 'Matale', value: 'Matale' },
    { label: 'Nuwara Eliya', value: 'Nuwara Eliya' },
    { label: 'Galle', value: 'Galle' },
    { label: 'Matara', value: 'Matara' },
    { label: 'Hambantota', value: 'Hambantota' },
    { label: 'Jaffna', value: 'Jaffna' },
    { label: 'Kilinochchi', value: 'Kilinochchi' },
    { label: 'Mannar', value: 'Mannar' },
    { label: 'Mullaitivu', value: 'Mullaitivu' },
    { label: 'Vavuniya', value: 'Vavuniya' },
    { label: 'Trincomalee', value: 'Trincomalee' },
    { label: 'Batticaloa', value: 'Batticaloa' },
    { label: 'Ampara', value: 'Ampara' },
    { label: 'Kurunegala', value: 'Kurunegala' },
    { label: 'Puttalam', value: 'Puttalam' },
    { label: 'Anuradhapura', value: 'Anuradhapura' },
    { label: 'Polonnaruwa', value: 'Polonnaruwa' },
    { label: 'Badulla', value: 'Badulla' },
    { label: 'Monaragala', value: 'Monaragala' },
    { label: 'Ratnapura', value: 'Ratnapura' },
    { label: 'Kegalle', value: 'Kegalle' },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private govishopService: GovishopService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.shopId = params['shopId'] ? Number(params['shopId']) : null;
      this.shopName = params['shopName'] || 'Shop';
      if (this.shopId) {
        this.loadBranches();
      }
    });
  }

  loadBranches(): void {
    if (!this.shopId) return;
    this.isLoading = true;

    this.govishopService
      .getBranchesByShopId(
        this.shopId,
        this.page,
        this.itemsPerPage,
        this.selectedProvince || undefined,
        this.selectedDistrict || undefined,
        this.searchTerm || undefined,
      )
      .subscribe({
        next: (response) => {
          this.branches = response.results;
          this.totalItems = response.total;
          this.totalBranches = response.total;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading branches:', err);
          this.isLoading = false;
        },
      });
  }

  onSearch(): void {
    this.page = 1;
    this.loadBranches();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.page = 1;
    this.loadBranches();
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadBranches();
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.loadBranches();
  }

  toggleBranchStatus(branch: Branch): void {
    this.pendingToggleBranch = branch;
    this.pendingToggleStatus = branch.isActive === 1 ? 0 : 1;
    this.showToggleModal = true;
  }

  confirmToggle(): void {
    if (!this.pendingToggleBranch) return;
    const branch = this.pendingToggleBranch;
    const newStatus = this.pendingToggleStatus;

    this.govishopService
      .toggleBranchActiveStatus(branch.id, newStatus)
      .subscribe({
        next: () => {
          branch.isActive = newStatus;
          this.closeToggleModal();
        },
        error: (err) => {
          console.error('Toggle error:', err);
          this.closeToggleModal();
        },
      });
  }

  closeToggleModal(): void {
    this.showToggleModal = false;
    this.pendingToggleBranch = null;
  }

  viewBranchDetails(branchId: number): void {
    this.router.navigate(['govi-shop/action/view-branch-details', branchId]);
  }

  viewBranchProducts(
    branchId: number,
    branchName: string,
    shopName: string,
  ): void {
    this.router.navigate(['govi-shop/action/branch-products', branchId], {
      queryParams: {
        branchName,
        shopName,
      },
    });
  }

  editBranch(branchId: number): void {
    // navigate to edit page or open edit modal
  }

  back(): void {
    this.router.navigate(['govi-shop/action/all-govi-shops'], {
      queryParams: {},
    });
  }
}
