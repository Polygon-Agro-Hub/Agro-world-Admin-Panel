import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';
import { GovishopService } from '../../../services/govi-shop/govishop.service';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-view-delete-shops',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, LoadingSpinnerComponent],
  templateUrl: './view-delete-shops.component.html',
  styleUrl: './view-delete-shops.component.css',
})

export class ViewDeleteShopsComponent implements OnInit {
  isLoading = false;
  deletedShops: any[] = [];
  totalCount = 0;

  // Filter and search properties
  businessType: string = '';
  searchItem: string = '';

  // Modal properties
  showReasonModal: boolean = false;
  selectedShop: any = null;

  // Dropdown options for business types
  businessTypes = [
    { label: 'Limited Liability Company', value: 'Limited Liability Company' },
    { label: 'Partnership Business', value: 'Partnership Business' },
    { label: 'Sole Proprietorship', value: 'Sole propprietorship' },
    { label: 'Cooperative Society', value: 'Cooperative Society' },
    { label: 'No Formal Registration', value: 'No Formal Registration (Request NIC)' },
  ];

  constructor(
    private router: Router,
    private shopService: GovishopService,
    public permissionService: PermissionService,
    public tokenService: TokenService,
  ) { }

  ngOnInit(): void {
    this.loadDeletedShops();
  }

  loadDeletedShops(): void {
    this.isLoading = true;

    this.shopService.getAllRemovedShops(
      this.businessType || null,
      this.searchItem || null
    ).subscribe({
      next: (response) => {
        this.deletedShops = response.results;
        this.totalCount = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading deleted shops:', error);
        this.isLoading = false;
        // You can add a toast notification here
      }
    });
  }

  onBusinessTypeChange(): void {
    this.loadDeletedShops();
  }

  onSearch(): void {
    this.loadDeletedShops();
  }

  clearSearch(): void {
    this.searchItem = '';
    this.loadDeletedShops();
  }

  back(): void {
    this.router.navigate(['govi-shop/action']);
  }

  getLogoUrl(logo: string): string {
    if (logo && logo !== 'null' && logo !== 'undefined') {
      return logo;
    }
    return ''; // Return empty string to show default icon
  }

  // Modal methods
  openReasonModal(shop: any): void {
    this.selectedShop = shop;
    this.showReasonModal = true;
    // Optional: Add body class to prevent background scroll
    document.body.style.overflow = 'hidden';
  }

  closeReasonModal(): void {
    this.showReasonModal = false;
    this.selectedShop = null;
    // Restore body scroll
    document.body.style.overflow = '';
  }
}