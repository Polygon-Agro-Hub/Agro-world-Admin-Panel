import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { StakeholderService } from '../../../../services/stakeholder/stakeholder.service';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';

export interface Supplier {
  id: number;
  ownername: string;
  nic: string;
  shopPhone: string;
  pricePlan: string;
  email: string;
  paymentStatus: string;
  expireStatus: string;
  activatedAt: Date;
  onbordStatus: string;
  createdAt: Date;

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
  selectedPlan: string = '';
  totalSuppliers!: number;
  expiredCount = 0;
  activeCount = 0;

  text: string = ''
  mobileNumber: string = ''

  // Pagination properties
  page: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;

  showDeleteModal = false;
  supplierToDelete: Supplier | null = null;

  hasData: boolean = false;
  textAreaTouched: boolean = false;

  planOptions = [
    { label: 'Standard', value: 'Standard' },
    { label: 'Premium', value: 'Premium' },
  ];

  suppliers: Supplier[] = [];

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
    
    console.log('Fetching suppliers with params:', {
      search: this.searchTerm || undefined,
      currentPlan: this.selectedPlan,
      page: this.page,
      limit: this.itemsPerPage
    });
    
    this.goviShopService.getAllGoviShopUsers(
      this.searchTerm || undefined,
      this.selectedPlan,
      this.page,
      this.itemsPerPage
    ).subscribe({
      next: (response) => {

        console.log('Raw API Response:', response);
        this.suppliers = response.data.shopUsers; 
        this.totalItems = response.data.pagination.total
        this.totalSuppliers = this.suppliers.length || 0;

        console.log('totalSuppliers', this.totalSuppliers)
        this.hasData = this.suppliers.length > 0;
        console.log('suppliers', this.suppliers);
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading suppliers:', error);
        this.isLoading = false;
      }
    });
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
    this.selectedPlan = '';
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
  viewShops(id: number, name: string) {
    this.router.navigate(['steckholders/action/govi-shop-suppliers/govishop-view-shops', ], {
      queryParams: { id, name },
    });
  }

  openDeleteModal(supplier: Supplier): void {
    this.supplierToDelete = supplier;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.supplierToDelete = null;
    this.text = '';
    this.mobileNumber = '';
  }

  onTextareaClick() {
    this.textAreaTouched = true;
  }

  confirmDelete(form: NgForm): void {

    form.form.markAllAsTouched();
    this.textAreaTouched = true;
    if(this.supplierToDelete && this.text !== '' && this.mobileNumber && this.mobileNumber === this.supplierToDelete.shopPhone) {
      Swal.fire({
        icon: 'info',
        title: 'Are you sure?',
        text: 'Do you really want to Delete this GoViShop Supplier?',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete',
        cancelButtonText: 'No, Cancel',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
        buttonsStyling: true,
      }).then((result) => {
        if (result.isConfirmed) {
          this.confirmDeleteSupplier();
        } else {
          // User cancelled
          this.isLoading = false;
        }
      });
    }
    
  }

  confirmDeleteSupplier() {
      this.isLoading = true;
      this.goviShopService.deleteGoviShopUser(this.supplierToDelete!.id, this.text).subscribe({
        next: (response) => {
          if (response.status) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            html: 'GoViShop Supplier deleted Successfully',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'bg-white dark:bg-[#363636] text-[#534E4E] dark:text-textDark',
              title: 'font-semibold text-lg',
              htmlContainer: 'text-left',
            },
          });
        }
          this.showDeleteModal = false;
          this.isLoading = false;
          this.supplierToDelete = null;
          this.text = '';
          this.mobileNumber = '';
          
          this.loadSuppliers();
        },
        error: (error) => {
          console.error('Error deleting GoViShop Supplier:', error);
          this.isLoading = false;
          this.showDeleteModal = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            html: 'Error deleting GoViShop Supplier',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'bg-white dark:bg-[#363636] text-[#534E4E] dark:text-textDark',
              title: 'font-semibold text-lg',
              htmlContainer: 'text-left',
            },
          });
        }
      });
  }

  addNew() {
    this.router.navigate(['/steckholders/action/govi-shop-suppliers/create-govi-shop-supplier']);
  }

  blockInvalidKeypressForPhone(event: KeyboardEvent) {

    const input = event.target as HTMLInputElement;
  
    // Allow control keys
    if (['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(event.key)) {
      return;
    }
  
    // Only allow digits
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      return;
    }
  
    // If first digit and not 7 → force 7
    if (input.value.length === 0 && event.key !== '7') {
      event.preventDefault();
  
      input.value = '7';                 // visually set
      input.dispatchEvent(new Event('input')); // update ngModel
    }
  }
  
  blockInvalidPasteForPhone(event: ClipboardEvent) {
  
    const pastedData = event.clipboardData?.getData('text') || '';
  
    // Must match 7XXXXXXXX
    if (!/^7[0-9]{0,8}$/.test(pastedData)) {
      event.preventDefault();
    }
  }

  editSupplier(id: number): void {
    this.router.navigate(['steckholders/action/govi-shop-suppliers/edit-govi-shop-supplier', ], {
      queryParams: { id },
    });
  }

  viewManagerUsers(id: number, name: string) {
  this.router.navigate(['steckholders/action/govi-shop-suppliers/govishop-users'], {
    queryParams: { 
      shopId: id, 
      shopName: name,
      role: 'Manager' 
    },
  });
}

viewPOSUsers(id: number, name: string) {
  this.router.navigate(['steckholders/action/govi-shop-suppliers/govishop-users'], {
    queryParams: { 
      shopId: id, 
      shopName: name,
      role: 'POS' 
    },
  });
}
  
}