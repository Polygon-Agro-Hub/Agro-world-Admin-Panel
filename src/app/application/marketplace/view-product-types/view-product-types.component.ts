import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-view-product-types',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, DropdownModule],
  templateUrl: './view-product-types.component.html',
  styleUrl: './view-product-types.component.css',
})
export class ViewProductTypesComponent implements OnInit {
  productArr: ProductType[] = [];
  filteredProductArr: ProductType[] = [];
  hasData: boolean = false;
  productCount: number = 0;
  searchText: string = '';
  isLoading = false;

  showConfirmModal = false;
confirmProductName = '';
confirmNewStatusLabel = '';
isDeactivating = false; // add this
private pendingToggleId: number | null = null;
private pendingNewStatus: number | null = null;
private pendingActionText = '';

selectedStatus: number | null = null;

statusOptions = [
  { label: 'Active', value: 1 },
  { label: 'Inactive', value: 0 }
];

  constructor(
    private marketSrv: MarketPlaceService,
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService,
  ) { }

  ngOnInit(): void {
    this.fetchProductType();
  }

  

  fetchProductType() {
    this.isLoading = true;
    this.marketSrv.getAllProductType().subscribe(
      (res) => {
        this.isLoading = false;
        this.productArr = res.data;
        this.filteredProductArr = res.data;
        this.productCount = res.data.length;
        this.hasData = this.productCount > 0;
      }
    );
  }

  filterProducts(): void {
  const search = this.searchText.toLowerCase().trim();

  this.filteredProductArr = this.productArr.filter(product => {
    const matchesSearch = search
      ? product.typeName.toLowerCase().includes(search) ||
        product.shortCode.toLowerCase().includes(search)
      : true;

    const matchesStatus = this.selectedStatus !== null && this.selectedStatus !== undefined
      ? product.isValid === this.selectedStatus
      : true;

    return matchesSearch && matchesStatus;
  });

  this.productCount = this.filteredProductArr.length;
  this.hasData = this.productCount > 0;
}

  clearSearch(): void {
    this.searchText = '';
    this.filterProducts();
  }

  deleteProductType(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.marketSrv.deleteProductType(id).subscribe({
          next: (res) => {
            if (res.status) {
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: res.message || 'Product type deleted successfully.',
              });
              this.fetchProductType();
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: res.message || 'Failed to delete product type.',
              });
            }
          },
          error: (err) => {
            console.error(err);
          }
        });
      }
    });
  }

  navigateToBack(): void {
    this.router.navigate(['/market/action']);
  }

  navigateToAdd(): void {
    this.router.navigate(['/market/action/add-product-type']);
  }

  navigateEdit(id: number): void {
    this.router.navigate([`/market/action/edit-product-type/${id}`]);
  }

  toggleProductTypeStatus(id: number, currentStatus: number): void {
  const newStatus = currentStatus === 1 ? 0 : 1;
  const product = this.productArr.find(p => p.id === id);

  this.pendingToggleId = id;
  this.pendingNewStatus = newStatus;
  this.pendingActionText = newStatus === 1 ? 'activated' : 'deactivated';
  this.confirmProductName = product?.typeName || 'this product type';
  this.confirmNewStatusLabel = newStatus === 1 ? 'Active' : 'Inactive';
  this.isDeactivating = newStatus === 0; // add this
  this.showConfirmModal = true;
}

onConfirmCancel(): void {
  this.showConfirmModal = false;
  this.pendingToggleId = null;
  this.pendingNewStatus = null;
  this.isDeactivating = false; // reset it here too
}

onConfirmProceed(): void {
  this.showConfirmModal = false;

  const id = this.pendingToggleId!;
  const newStatus = this.pendingNewStatus!;
  const actionText = this.pendingActionText;

  this.isLoading = true;
  this.marketSrv.updateProductTypeStatus(id, newStatus).subscribe({
    next: (res) => {
      this.isLoading = false;
      if (res.status) {
        Swal.fire({
          icon: 'success',
          title: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)}!`,
          text: res.message || `Product type ${actionText} successfully.`,
        });

        this.fetchProductType();

      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: res.message || `Failed to update product type status.`,
        });
      }
    },
    error: (err) => {
      this.isLoading = false;
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while updating the status.',
      });
    }
  });

  this.pendingToggleId = null;
  this.pendingNewStatus = null;
}
}

class ProductType {
  id!: number;
  typeName!: string;
  shortCode!: string;
  isValid!: number;
  modifyId!: string;
  modifyUserName!: string;
}