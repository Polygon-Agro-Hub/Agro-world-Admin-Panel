import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { StakeholderService } from '../../../../services/stakeholder/stakeholder.service';

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
}

@Component({
  selector: 'app-view-govishop-supliers',
  standalone: true,
  imports: [LoadingSpinnerComponent, CommonModule, FormsModule, DropdownModule],
  templateUrl: './view-govishop-supliers.component.html',
  styleUrl: './view-govishop-supliers.component.css',
})
export class ViewGovishopSupliersComponent implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef;
  
  isLoading = false;
  searchTerm = '';
  selectedPlan: string | null = null;
  totalSuppliers = 0;

  showDeleteModal = false;
  supplierToDelete: Supplier | null = null;

  planOptions = [
    { label: 'All', value: null },
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
    
    this.goviShopService.getAllGoviShopUsers(
      this.searchTerm || undefined,
      this.selectedPlan || undefined
    ).subscribe({
      next: (response) => {
        this.suppliers = response.shopUsers.map((user: any) => ({
          id: user.id,
          shopName: user.shopName,
          ownerName: user.ownername,
          nic: user.nic,
          phone: user.shopPhone,
          pricePlan: user.currentPlan || 'Free',
          joinedOn: this.formatDate(user.createdAt),
          email: user.email,
          address: user.adress,
          isAvailable: user.isAvailable,
          userStatus: user.userStatus
        }));
        
        this.totalSuppliers = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading suppliers:', error);
        this.isLoading = false;
        // You might want to show an error message to the user
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  // Search when clicking search icon or pressing Enter
  onSearch(): void {
    this.loadSuppliers();
  }

  // Clear search term and reload data
  clearSearch(): void {
    this.searchTerm = '';
    this.loadSuppliers();
    // Focus back on search input
    setTimeout(() => this.searchInput?.nativeElement?.focus(), 0);
  }

  // Filter when plan changes
  onPlanChange(): void {
    this.loadSuppliers();
  }

  // Clear plan filter and reload data
  clearPlanFilter(): void {
    this.selectedPlan = null;
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
          this.showDeleteModal = false;
          this.supplierToDelete = null;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error deleting supplier:', error);
          this.isLoading = false;
          this.showDeleteModal = false;
          this.supplierToDelete = null;
          // Show error message to user
        }
      });
    }
  }
}