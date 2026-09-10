import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { GovishopService } from '../../../services/govi-shop/govishop.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';

export interface Shop {
  id: number;
  shopName: string;
  shopType: string;
  email: string;
  phone: string;
  logo: string | null;
  shopTypeImg: string | null;
  isActive: number;
  approvedStatus: 'Pending' | 'Approved' | 'Rejected';
  updatedAt: Date | null;
  updatedBy: string | null;
  ownerName: string | null;
}

@Component({
  selector: 'app-view-all-shops',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, LoadingSpinnerComponent, NgxPaginationModule],
  templateUrl: './view-all-shops.component.html',
  styleUrl: './view-all-shops.component.css',
})

export class ViewAllShopsComponent implements OnInit {
  isLoading = false;

  shops: Shop[] = [];
  totalShops = 0;

  // Filters
  searchTerm = '';
  selectedActiveStatus = '';
  selectedApproval = '';
  selectedBusinessType = '';

  // Pagination
  page = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Toggle confirmation modal
  showToggleModal = false;
  pendingToggleShop: Shop | null = null;
  pendingToggleStatus: number = 0;

  activeStatusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ];

  approvalOptions = [
    { label: 'Approved', value: 'Approved' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Rejected', value: 'Rejected' },
  ];

  businessTypeOptions = [
    { label: 'Limited Liability Company', value: 'Limited Liability Company' },
    { label: 'Partnership Business', value: 'Partnership Business' },
    { label: 'Sole Proprietorship', value: 'Sole propprietorship' },
    { label: 'Cooperative Society', value: 'Cooperative Society' },
    { label: 'No Formal Registration', value: 'No Formal Registration (Request NIC)' },
  ];

  constructor(
    private router: Router,
    private govishopService: GovishopService,
    public permissionService: PermissionService,
    public tokenService: TokenService,
  ) { }

  ngOnInit(): void {
    this.loadShops();
  }

  loadShops(): void {
    this.isLoading = true;
    this.govishopService
      .getAllShops(
        this.page,
        this.itemsPerPage,
        this.selectedActiveStatus || undefined,
        this.selectedApproval || undefined,
        this.selectedBusinessType || undefined,
        this.searchTerm || undefined
      )
      .subscribe({
        next: (response) => {
          this.shops = response.results;
          this.totalItems = response.total;
          this.totalShops = response.total;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading shops:', err);
          this.isLoading = false;
        },
      });
  }

  onSearch(): void {
    this.page = 1;
    this.loadShops();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.page = 1;
    this.loadShops();
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadShops();
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.loadShops();
  }

  toggleShopStatus(shop: Shop): void {
    this.pendingToggleShop = shop;
    this.pendingToggleStatus = shop.isActive === 1 ? 0 : 1;
    this.showToggleModal = true;
  }

  confirmToggle(): void {
    if (!this.pendingToggleShop) return;
    const shop = this.pendingToggleShop;
    const newStatus = this.pendingToggleStatus;

    this.govishopService.toggleShopActiveStatus(shop.id, newStatus).subscribe({
      next: () => {
        shop.isActive = newStatus;
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
    this.pendingToggleShop = null;
  }

  viewShopDetails(id: number): void {
    this.router.navigate(
      ['govi-shop/action/all-govi-shops/preview-govi-shop', id]
    );
  }

  editShop(id: number): void {
    this.router.navigate(
      ['govi-shop/action/update-govi-shop', id]
    );
  }

  viewBranches(shop: Shop): void {
    this.router.navigate(
      ['govi-shop/action/all-branches-pershop'],
      { queryParams: { shopId: shop.id, shopName: shop.shopName } }
    );
  }

  back(): void {
    this.router.navigate(['govi-shop/action']);
  }

  getApprovalClass(status: string): string {
    switch (status) {
      case 'Approved': return 'bg-[#BBFFC6] text-[#308233]';
      case 'Pending':
      case 'Not Approved': return 'bg-[#FFFF9F] text-[#9D8600]';
      case 'Rejected': return 'bg-[#FFB9B7] text-[#D16D6A]';
      default: return 'bg-gray-100 text-gray-500';
    }
  }

  getApprovalLabel(status: string): string {
    if (status === 'Pending') return 'Not Approved';
    return status;
  }
}