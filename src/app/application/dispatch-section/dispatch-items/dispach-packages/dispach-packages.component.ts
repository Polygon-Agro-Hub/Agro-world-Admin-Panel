import { Component, OnInit } from '@angular/core';
import { DispatchService } from '../../../../services/dispatch/dispatch.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenService } from '../../../../services/token/services/token.service';
import { PermissionService } from '../../../../services/roles-permission/permission.service';
import { CommonModule, Location } from '@angular/common';
import Swal from 'sweetalert2';
import { CountDownComponent } from '../../../../components/count-down/count-down.component';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
@Component({
  selector: 'app-dispach-packages',
  standalone: true,
  imports: [CommonModule, FormsModule, CountDownComponent, LoadingSpinnerComponent,   DropdownModule,],
  templateUrl: './dispach-packages.component.html',
  styleUrl: './dispach-packages.component.css'
})
export class DispachPackagesComponent implements OnInit {
  packageArr: PakageItem[] = [];
  productArr: MarketPlaceItems[] = [];
  selectProduct!: PakageItem;
  // In your component class, add proper initialization:
  newProductObj: MarketPlaceItems | null = null;
  packageId!: number;
  orderId!: number;
  invNo: string = '';
  price: number = 0;
  packageName: string = '';
  packgeQty:number = 1;

  isLoading: boolean = true;
  validationFailedMessage: string = '';
  validationSuccessMessage: string = '';

  showCountdown: boolean = false;

  isPopupOpen: boolean = false;
  isLastOrder: boolean = false;
  isAllPacked: boolean = false;


  ngOnInit(): void {
    this.packageId = this.route.snapshot.params['id']
    this.orderId = this.route.snapshot.params['orderId']
    this.isLastOrder = this.route.snapshot.queryParams['status'] === 'true' ? true : false;
    this.price = this.route.snapshot.queryParams['price'];
    this.invNo = this.route.snapshot.queryParams['invNo'];
    this.packageName = this.route.snapshot.queryParams['packageName'];
    this.packgeQty = this.route.snapshot.queryParams['packgeQty'];
   
    

    this.fetchData();
  }

  constructor(
    private dispatchService: DispatchService,
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService,
    private route: ActivatedRoute,
    private location: Location,

  ) { }


  fetchData() {
    this.isLoading = true;
    this.dispatchService.getPackageItemsForDispatch(this.packageId, this.orderId).subscribe(
      (res) => {
        // this.packageObj = res
        this.packageArr = res.packageData;
        this.productArr = res.marketplaceItems
        this.isLoading = false
      }
    )
  }
  onCancel() {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after canceling!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'No, Keep Editing',
            customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
    },
    }).then((result) => {
      if (result.isConfirmed) {
       this.location.back();
      }
    });
  }

  saveCheckedItems() {
    if (this.isLastOrder && this.isAllPacked) {
      this.showCountdown = true;
    } else {
      this.executeApiCall();
    }
  }

  onTimerCompleted() {
    this.showCountdown = false;
    this.executeApiCall(); // Perform the API call
  }

  onTimerCancelled() {
    this.showCountdown = false;
  }

  private executeApiCall() {
    this.isLoading = true;

    const updatedData = this.packageArr.map(item => ({

      id: item.id,
      isPacked: item.isPacked,
      qty: item.qty,
      price: item.price,

    }));
    this.dispatchService.dispatchPackageItemData(updatedData, this.orderId, this.isLastOrder).subscribe(
      (res) => {
        this.isLoading = false;
        if (res.status) {
          Swal.fire('Success', 'Packaging status has been changed successfully.', 'success');
          // this.router.navigate(['/dispatch/salesdash-orders']);
          this.location.back();
        } else {
          Swal.fire('Error', 'Packaging status has been changed faild.', 'error');

        }

      },
      (err) => {
        console.error('Update failed:', err);
        Swal.fire('Error', 'Product Update Unsuccessfull', 'error');
      }
    );
  }


  onCheckboxChange(item: PakageItem, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    item.isPacked = isChecked ? 1 : 0;

    const allPacked = this.packageArr.every(i => i.isPacked === 1);
    this.isAllPacked = allPacked;

    if (!allPacked) {
      this.validationFailedMessage = "Unchecked items remain. Saving now keeps the order in 'Opened' Status.";
      this.validationSuccessMessage = '';
    } else {
      this.validationSuccessMessage = "All checked. Order will move to 'Completed' on save.";
      this.validationFailedMessage = '';
    }
  }

  openPopUp(item: PakageItem) {
    this.isPopupOpen = true;
    this.selectProduct = item;
    // this.newProductObj.displayName = item.displayName;
    // this.newProductObj.id = item.
  }
  onCancelPopup() {
    this.isPopupOpen = false;
  }

// In your component class
isExcludedOption(product: MarketPlaceItems): boolean {
  return product.isExcluded; // true = disabled, false = enabled
}


  replaceProduct() {
    this.dispatchService.replaceDispatchPackageItemsData(this.selectProduct, this.newProductObj).subscribe(
      (res) => {
        this.isLoading = false;
        if (res.status) {
          Swal.fire('Success', res.message, 'success');
          // this.router.navigate(['/dispatch/salesdash-orders']);
          this.isPopupOpen = false;
          this.newProductObj = null;
          this.fetchData();
        } else {
          Swal.fire('Error', res.message, 'error');

        }

      },
      (err) => {
        console.error('Update failed:', err);
        Swal.fire('Error', 'Product Update Unsuccessfull', 'error');
      }
    );
  }

  cangeReplacePrice() {
    if (this.newProductObj) {
      this.newProductObj.price = this.newProductObj.discountedPrice * (this.newProductObj.qty);
    }
  }

onProductChange() {
  if (this.newProductObj?.isExcluded) {
    // If the selected product is excluded, ignore it
    Swal.fire({
      icon: 'warning',
      title: 'Cannot select this product',
      text: 'This product is excluded.',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    });
    this.newProductObj = null; // Reset selection
    return;
  }

  if (this.newProductObj) {
    // Normal behavior for allowed products
    this.newProductObj.qty = this.newProductObj.startValue;
    this.cangeReplacePrice();
  }
}


  updateQuantity(newQty: number): void {
    if (this.newProductObj) {
      this.newProductObj.qty = newQty;
      this.cangeReplacePrice();
    }
  }
}

interface PakageItem {
  id: number;
  qty: number;
  isPacked: number;
  price: number;
  discountedPrice: number;
  displayName: string;
}

interface MarketPlaceItems {
  id: number
  varietyId: number
  displayName: string
  normalPrice: number
  discountedPrice: number
  discount: number
  unitType: number
  startValue: number
  changeby: number
  isExcluded: boolean

  price: number;
  qty: number;
}

interface ReplaceItem {
  id: number
  varietyId: number;
  normalPrice: number
  discountedPrice: number
  unitType: number
  price: number;
  qty: number;

}
