import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { StakeholderService } from '../../../../services/stakeholder/stakeholder.service';
import { NgxPaginationModule } from 'ngx-pagination';

export interface Supplier {
  id: number;
  shopName: string;
  ownerName: string;
  nic: string;
  phone: string;
  pricePlan: 'Free' | 'Premium' | 'Expired';
  joinedOn: string;
  email?: string;
  address?: string;
  isAvailable?: number;
  userStatus?: string;
  planPrice?: number;
  currentPlanExpireDate?: string;
  planStatus?: string;
  daysRemaining?: number;
  currentPlan?: string;
}

@Component({
  selector: 'app-view-govishop-supliers',
  standalone: true,
  imports: [LoadingSpinnerComponent, CommonModule, FormsModule, DropdownModule, NgxPaginationModule],
  templateUrl: './view-govishop-supliers.component.html',
  styleUrl: './view-govishop-supliers.component.css',
})
export class ViewGovishopSupliersComponent implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef;
  
  isLoading = false;
  searchTerm = '';
  selectedPlan: string | null = null;
  totalSuppliers = 0;
  expiredCount = 0;
  activeCount = 0;

  // Pagination properties
  page: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;

  showDeleteModal = false;
  supplierToDelete: Supplier | null = null;

  planOptions = [
    { label: 'Free', value: 'Free' },
    { label: 'Premium', value: 'Premium' },
    { label: 'Expired', value: 'Expired' },
  ];

  suppliers: Supplier[] = [];

  get filteredSuppliers(): Supplier[] {
    return this.suppliers;
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private goviShopService: StakeholderService
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.isLoading = true;
    
    // Separate currentPlan and planStatus based on selected filter
    let currentPlan: string | undefined;
    let planStatus: string | undefined;
    
    if (this.selectedPlan === 'Expired') {
      planStatus = 'expired';
      currentPlan = undefined;
    } else if (this.selectedPlan) {
      currentPlan = this.selectedPlan;
      planStatus = undefined;
    }
    
    console.log('Fetching suppliers with params:', {
      search: this.searchTerm || undefined,
      currentPlan: currentPlan,
      planStatus: planStatus,
      page: this.page,
      limit: this.itemsPerPage
    });
    
    this.goviShopService.getAllGoviShopUsers(
      this.searchTerm || undefined,
      currentPlan,
      planStatus,
      this.page,
      this.itemsPerPage
    ).subscribe({
      next: (response) => {
        console.log('Raw API Response:', response);
        
        // Handle the response structure
        let shopUsers = [];
        let total = 0;
        let expired = 0;
        let active = 0;
        
        if (response.data && Array.isArray(response.data.shopUsers)) {
          console.log('Using new response structure with data wrapper');
          shopUsers = response.data.shopUsers;
          total = response.data.pagination?.total || response.data.total || 0;
          expired = response.data.stats?.expiredCount || 0;
          active = response.data.stats?.activeCount || 0;
        } else if (response.shopUsers && Array.isArray(response.shopUsers)) {
          console.log('Using old response structure');
          shopUsers = response.shopUsers;
          total = response.total || 0;
        } else if (Array.isArray(response)) {
          console.log('Response is direct array');
          shopUsers = response;
          total = response.length;
        } else {
          console.error('Unexpected response structure:', response);
        }
        
        // Map the raw data to supplier objects
        let mappedSuppliers = shopUsers.map((user: any) => {
          console.log('Mapping user:', user);
          return {
            id: user.id,
            shopName: user.shopName || '',
            ownerName: user.ownername || user.ownerName || '',
            nic: user.nic || '',
            phone: user.shopPhone || user.phone || '',
            pricePlan: this.determinePricePlan(user.currentPlan, user.planStatus),
            joinedOn: this.formatDate(user.createdAt),
            email: user.email || '',
            address: user.adress || user.address || '',
            isAvailable: user.isAvailable,
            userStatus: user.userStatus,
            planPrice: user.planPrice,
            currentPlanExpireDate: user.currentPlanExpireDate ? this.formatDate(user.currentPlanExpireDate) : undefined,
            planStatus: user.planStatus,
            daysRemaining: user.daysRemaining,
            currentPlan: user.currentPlan
          };
        });
        
        // Apply client-side filtering to ensure correct results
        if (this.selectedPlan === 'Expired') {
          mappedSuppliers = mappedSuppliers.filter((s: Supplier) => s.planStatus === 'expired');
        } else if (this.selectedPlan === 'Premium') {
          mappedSuppliers = mappedSuppliers.filter((s: Supplier) => 
            s.pricePlan === 'Premium' && s.planStatus !== 'expired'
          );
        } else if (this.selectedPlan === 'Free') {
          mappedSuppliers = mappedSuppliers.filter((s: Supplier) => 
            s.pricePlan === 'Free' && s.planStatus !== 'expired'
          );
        }
        
        this.suppliers = mappedSuppliers;
        this.totalItems = total;
        this.totalSuppliers = mappedSuppliers.length;
        this.expiredCount = expired;
        this.activeCount = active;
        
        console.log('Filtered suppliers:', this.suppliers);
        console.log('Total suppliers:', this.totalSuppliers);
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading suppliers:', error);
        this.isLoading = false;
        // You might want to show an error message to the user
        alert('Error loading suppliers: ' + error.message);
      }
    });
  }

  determinePricePlan(currentPlan: string, planStatus: string): 'Free' | 'Premium' | 'Expired' {
    console.log('Determining price plan for:', { currentPlan, planStatus });
    
    // If plan status is expired, show Expired
    if (planStatus === 'expired') {
      return 'Expired';
    }
    // Otherwise show the actual plan (Premium or Free)
    if (currentPlan === 'Premium' || currentPlan === 'premium') {
      return 'Premium';
    }
    return 'Free';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Not available';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid date';
    }
  }

  // Search when clicking search icon or pressing Enter
  onSearch(): void {
    this.page = 1; // Reset to first page on search
    this.loadSuppliers();
  }

  // Clear search term and reload data
  clearSearch(): void {
    this.searchTerm = '';
    this.page = 1; // Reset to first page
    this.loadSuppliers();
    // Focus back on search input
    setTimeout(() => this.searchInput?.nativeElement?.focus(), 0);
  }

  // Filter when plan changes
  onPlanChange(): void {
    this.page = 1; // Reset to first page on filter change
    this.loadSuppliers();
  }

  // Clear plan filter and reload data
  clearPlanFilter(): void {
    this.selectedPlan = null;
    this.page = 1; // Reset to first page
    this.loadSuppliers();
  }

  // Pagination method
  onPageChange(event: number): void {
    this.page = event;
    this.loadSuppliers();
  }

  back(): void {
    this.router.navigate(['steckholders/action']);
  }

  // Pass ID as parameter instead of the whole object
  viewSupplierDetails(supplierId: number): void {
    this.router.navigate(['view-govi-shop-suppliers', supplierId], {
      relativeTo: this.route
    });
  }

  openDeleteModal(supplier: Supplier): void {
    this.supplierToDelete = supplier;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.supplierToDelete = null;
  }

  confirmDelete(): void {
    if (this.supplierToDelete) {
      this.isLoading = true;
      this.goviShopService.deleteGoviShopUser(this.supplierToDelete.id).subscribe({
        next: () => {
          this.suppliers = this.suppliers.filter(s => s.id !== this.supplierToDelete?.id);
          this.totalSuppliers--;
          this.totalItems--; // Update total items
          this.showDeleteModal = false;
          this.supplierToDelete = null;
          this.isLoading = false;
          
          // If current page becomes empty after delete, go to previous page
          if (this.suppliers.length === 0 && this.page > 1) {
            this.page--;
            this.loadSuppliers();
          }
        },
        error: (error) => {
          console.error('Error deleting supplier:', error);
          this.isLoading = false;
          this.showDeleteModal = false;
          this.supplierToDelete = null;
          // Show error message to user
          alert('Error deleting supplier: ' + error.message);
        }
      });
    }
  }
}