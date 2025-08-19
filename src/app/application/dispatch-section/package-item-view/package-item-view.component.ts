import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";
import { ProcumentsService } from '../../../services/procuments/procuments.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DropdownModule } from 'primeng/dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { DispatchService } from '../../../services/dispatch/dispatch.service';
import Swal from 'sweetalert2';
import { CountDownComponent } from '../../../components/count-down/count-down.component';

@Component({
  selector: 'app-package-item-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    DropdownModule,
    NgxPaginationModule,
    LoadingSpinnerComponent,
    CountDownComponent,
  ],
  templateUrl: './package-item-view.component.html',
  styleUrl: './package-item-view.component.css'
})
export class PackageItemViewComponent implements OnInit {

  id!: number | null;
  invNo!: string | null;
  total: number = 0;
  name!: string;
  fullTotal!: number;
  packageItemsArr: packageItems[] = [];
  productItemsArr: ProductItems[] = [];
  totalPackageItems!: number;

  selectedProductId: number | null = null;
  quantity: number | null = null;
  unitPrice: number | null = null;
  totalPrice: number | null = null;

  previousProductId!: number;
  previousDisplayName!: string;
  previousQuantity!: number;
  previousPrice!: number;

  productIdsArr: number[] = [];
  

  validationFailedMessage: string = '';
  validationSuccessMessage: string = '';
  packedAll: boolean = false;

  isLoading: boolean = false;
  isPopupOpen: boolean = false;

  showCountdown: boolean = false;

  constructor(
    private dispatchService: DispatchService,
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.id = params['id'] ? +params['id'] : null;
      this.invNo = params['invNo'] || null;
      this.total = params['total'] ? +params['total'] : 0;
      this.name = params['name'] || '';
      this.fullTotal = params['fullTotal'] ? +params['fullTotal'] : 0;
      console.log(this.id);
    });

    this.getPackageItemData(this.id!);
    this.getAllProducts();

  }

  getPackageItemData(id: number) {
    this.isLoading = true;
  
    this.dispatchService.getPackageItems(id).subscribe(
      (response) => {
        console.log(response);
  
        // Extract product IDs
        this.productIdsArr = response.items.map((item: packageItems) => item.productId);
        console.log('productIDs', this.productIdsArr)

        this.packedAll = response.items.every((item: packageItems) => item.packedStatus === 1);
        console.log('All Packed:', this.packedAll);

        // Map the full item objects
        this.packageItemsArr = response.items.map((item: packageItems) => {
          return {
            ...item,
            quantity: item.quantity,
            price: item.price
          };
        });
  
        this.totalPackageItems = response.total;

        if (!this.packedAll) {
          this.validationFailedMessage = "Unchecked items remain. Saving now keeps the order in 'Opened' Status.";
          this.validationSuccessMessage = ''
        } else {
          this.validationSuccessMessage = "All checked. Order will move to 'Completed' on save.";
          this.validationFailedMessage = ''
        }

        this.isLoading = false;
  
        console.log('Product IDs:', this.productIdsArr);
        console.log('Array:', this.packageItemsArr);
      },
      (error) => {
        console.error('Error fetching package items:', error);
        if (error.status === 401) {
          // Handle unauthorized error if needed
        }
        this.isLoading = false;
      }
    );
  }
  
getAllProducts() {
  this.isLoading = true;

  this.dispatchService.getAllProducts().subscribe(
    (response) => {
      console.log(response);

      // Sort products alphabetically by productName
      this.productItemsArr = response.items.sort((a: ProductItems, b: ProductItems) => 
        a.productName.localeCompare(b.productName)
      );

      this.isLoading = false;

      console.log('product array', this.productItemsArr);
    },
    (error) => {
      console.error('Error fetching package items:', error);
      if (error.status === 401) {
        // Handle unauthorized error if needed
      }
      this.isLoading = false;
    }
  );
}
  onCheckboxChange(item: packageItems, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    item.packedStatus = isChecked ? 1 : 0;

    const allPacked = this.packageItemsArr.every(i => i.packedStatus === 1);

    if (!allPacked) {
      this.validationFailedMessage = "Unchecked items remain. Saving now keeps the order in 'Opened' Status.";
      this.validationSuccessMessage = '';
    } else {
      this.validationSuccessMessage = "All checked. Order will move to 'Completed' on save.";
      this.validationFailedMessage = '';
    }
    console.log(this.packageItemsArr);
  }

  saveCheckedItems() {
    this.showCountdown = true;
  }
  
  // Called when countdown finishes or user clicks "Mark as Completed"
  onTimerCompleted() {
    this.showCountdown = false;
    this.executeApiCall(); // Perform the API call
  }
  
  // Called when user clicks "Go Back to Edit"
  onTimerCancelled() {
    this.showCountdown = false;
    // Optionally: reset form or show editing state again
  }

  private executeApiCall() {
    this.isLoading = true;

    const updatedData = this.packageItemsArr.map(item => ({

      productId: item.productId,
      packedStatus: item.packedStatus,
      quantity: item.quantity,
      price: item.price,

    }));
    this.dispatchService.updatePackageItemData(updatedData, this.id!).subscribe(
      (res) => {
        this.isLoading = false;
        console.log('Updated successfully:', res);
        Swal.fire('Success', 'Order dispatched successfully!', 'success');
        this.router.navigate(['/dispatch/salesdash-orders']);
      },
      (err) => {
        console.error('Update failed:', err);
        Swal.fire('Error', 'Product Update Unsuccessfull', 'error');
      }
    );
  }

  // saveCheckedItems() {
  //   this.isLoading = true;

  //   const updatedData = this.packageItemsArr.map(item => ({

  //     productId: item.productId,
  //     packedStatus: item.packedStatus,
  //     quantity: item.quantity,
  //     price: item.price,

  //   }));
  //   this.dispatchService.updatePackageItemData(updatedData, this.id!).subscribe(
  //     (res) => {
  //       this.isLoading = false;
  //       console.log('Updated successfully:', res);
  //       Swal.fire('Success', 'Product Updated Successfully', 'success');
  //       this.router.navigate(['/dispatch/salesdash-orders']);
  //     },
  //     (err) => {
  //       console.error('Update failed:', err);
  //       Swal.fire('Error', 'Product Update Unsuccessfull', 'error');
  //     }
  //   );
  // }

  openPopUp(productId: number, displayName: string, quantity: number, price: number) {
    this.isPopupOpen = true;
    this.previousProductId = productId;
    this.previousDisplayName = displayName;
    this.previousQuantity = quantity;
    this.previousPrice = price;
  }

  onCancel() {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after canceling!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'No, Keep Editing',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isPopupOpen = false;
        this.router.navigate(['/dispatch/salesdash-orders']);
      }
    })
  };

  onProductChange() {
    console.log('Selected Product ID (before conversion):', this.selectedProductId, typeof this.selectedProductId);
    
    if (this.selectedProductId) {
      // Convert to number explicitly (using + or Number())
      const selectedId = +this.selectedProductId; // or Number(this.selectedProductId)
      
      console.log('Selected Product ID (after conversion):', selectedId, typeof selectedId);
      
      const selectedProduct = this.productItemsArr.find(p => p.id === selectedId);
      console.log('Found Product:', selectedProduct);
      
      if (selectedProduct) {
        this.unitPrice = selectedProduct.discountedPrice;
        this.calculateTotal();
      }
    } else {
      this.unitPrice = 0;
      this.totalPrice = 0;
    }
  }

  validateQuantity() {
    if (this.quantity === null || this.quantity < 1) {
      this.quantity = 1;
    }
    this.calculateTotal();
  }

  blockInvalidKeys(event: KeyboardEvent) {
    // Prevent entering minus sign, 'e' or other invalid characters
    if (['-', '+', 'e'].includes(event.key)) {
      event.preventDefault();
    }
  }

  calculateTotal() {
    if (this.quantity && this.unitPrice) {
      this.totalPrice = this.quantity * this.unitPrice;
    } else {
      this.totalPrice = 0;
    }
    console.log(this.totalPrice);
  }

  replaceProduct() {
    this.isLoading = true;

    if (!this.selectedProductId || !this.quantity) {
      console.error('Product ID or quantity is missing');
      return;
    }

    this.dispatchService.replaceProductData(this.selectedProductId, this.quantity, this.totalPrice, this.id!, this.previousProductId).subscribe(
      (res) => {
        this.isLoading = false;
        console.log('Updated successfully:', res);
        Swal.fire('Success', 'Product Replaced Successfully', 'success');
        this.isPopupOpen = false;
        this.getPackageItemData(this.id!);
        this.selectedProductId = null;
        this.unitPrice = null;
        this.quantity = 0;
        this.totalPrice = null;
      },
      (err) => {
        console.error('Update failed:', err);
        Swal.fire('Error', 'Product Replaced Unsuccessfull', 'error');
        this.isPopupOpen = false;
        this.getPackageItemData(this.id!);
        this.selectedProductId = null;
        this.unitPrice = null;
        this.quantity = 0;
        this.totalPrice = null;
      }
    );
  }

onCancelPopup() {
  this.router.navigate(['/dispatch/salesdash-orders']);
}




}

class packageItems {
  processOrderId!: number;
  orderId!: number;
  invNo!: string;
  quantity!: number;
  price!: number;
  productId!: number;
  isPacking!: number;
  displayName!: string;
  unitType!: string;
  total!: number;
  discountedPrice!: number;
  packedStatus!: number;
}

class ProductItems {
  id!: number;
  productName!: string;
  discountedPrice!: number;
} 