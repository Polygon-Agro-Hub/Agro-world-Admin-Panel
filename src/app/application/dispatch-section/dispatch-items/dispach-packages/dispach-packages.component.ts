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
  imports: [CommonModule, FormsModule, CountDownComponent, LoadingSpinnerComponent, DropdownModule,],
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
  packgeQty: number = 1;
  total: number = 0;

  isLoading: boolean = true;
  validationFailedMessage: string = '';
  validationSuccessMessage: string = '';

  showCountdown: boolean = false;

  isPopupOpen: boolean = false;
  isLastOrder: boolean = false;
  isAllPacked: boolean = false;

  isInvalidPriceRange: boolean = false;

  isShouldAllblock:boolean = true;
  isCompleted: boolean = false; 
  hasChanges: boolean = false;
  productReplaced: boolean = false;


  ngOnInit(): void {
    this.packageId = this.route.snapshot.params['id']
    this.orderId = this.route.snapshot.params['orderId']
    this.isLastOrder = this.route.snapshot.queryParams['status'] === 'true' ? true : false;
    this.price = parseFloat(this.route.snapshot.queryParams['price']) || 0;
    this.invNo = this.route.snapshot.queryParams['invNo'];
    this.packageName = this.route.snapshot.queryParams['packageName'];
    this.packgeQty = parseInt(this.route.snapshot.queryParams['packgeQty']) || 1;



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
        this.packageArr = res.packageData;
        this.productArr = res.marketplaceItems
        this.isLoading = false;
        this.isShouldAllblock = res.packageData.every((i:any) => i.isPacked === 1);
        this.isCompleted = this.isShouldAllblock;
        this.total = this.packageArr.length;
        this.hasChanges = false;
        this.productReplaced = false;
        this.updatePackingStatus();
      }
    )
  }

  updatePackingStatus(): void {
    if (!this.packageArr || this.packageArr.length === 0) {
      this.validationFailedMessage = '';
      this.validationSuccessMessage = '';
      this.isAllPacked = false;
      return;
    }

    const allPacked = this.packageArr.every(i => i.isPacked === 1);
    this.isAllPacked = allPacked;

    if (allPacked) {
      this.validationSuccessMessage = "All checked. Order will move to 'Completed' on save.";
      this.validationFailedMessage = '';
    } else {
      this.validationFailedMessage = "Unchecked items remain. Saving now keeps the order in 'Opened' Status.";
      this.validationSuccessMessage = '';
    }
  }

  onBack() {
    if (this.isCompleted) {
        this.location.back();
        return;
      }
  
      Swal.fire({
        icon: 'warning',
        title: 'Are you sure?',
        text: 'You may lose the added data after going back!',
        showCancelButton: true,
        confirmButtonText: 'Yes, Go Back',
        cancelButtonText: 'No, Stay Here',
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

  onCancel() {
    if (this.isCompleted) {
      this.location.back();
      return;
    }

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
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Packaging status has been changed successfully.',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
          // this.router.navigate(['/dispatch/salesdash-orders']);
          this.location.back();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Packaging status has been changed faild.',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });

        }

      },
      (err) => {
        console.error('Update failed:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Product Update Unsuccessfull',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
      }
    );
  }


  onCheckboxChange(item: PakageItem, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    item.isPacked = isChecked ? 1 : 0;

    this.hasChanges = this.packageArr.some(i => i.isPacked === 1) || this.productReplaced;

    this.updatePackingStatus();
  }

  openPopUp(item: PakageItem) {
    if(item.isPacked === 1) {
      Swal.fire({
        icon: 'warning', 
        title: 'Cannot replace this product',
        text: 'This product is already packed.',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });
      return;
    }

    this.isPopupOpen = true;
    this.selectProduct = item;
  }
  onCancelPopup() {
    this.isPopupOpen = false;
    // this.selectProduct = 
    this.newProductObj = null;
    this.isInvalidPriceRange = false;
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
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: res.message,
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
          this.isPopupOpen = false;
          this.newProductObj = null;
          this.productReplaced = true;
          this.fetchData();
          this.hasChanges = true;   
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: res.message,
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
        }

      },
      (err) => {
        console.error('Update failed:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Product Update Unsuccessfull',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
      }
    );
  }

  cangeReplacePrice() {
    if (this.newProductObj) {
      this.newProductObj.price = this.newProductObj.discountedPrice * (this.newProductObj.qty);
      this.isInvalidPriceRange = this.selectProduct.price < this.newProductObj.price
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
      let qty = (newQty === null || newQty < 0) ? 0 : newQty;

      qty = Math.round(qty * 100) / 100;

      this.newProductObj.qty = qty;
      this.cangeReplacePrice();
    }
  }

  filterMarketItemsByTypeId(typeId:number): MarketPlaceItems[] {
    const filtered = this.productArr.filter(item => item.productTypeId === typeId);

    const preferred = filtered
      .filter(item => item.isPreferred && !item.isExcluded)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));

    const remaining = filtered
      .filter(item => !item.isPreferred && !item.isExcluded)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));

    const excluded = filtered
      .filter(item => item.isExcluded)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));

    return [...preferred, ...remaining, ...excluded];
  }

  formatQty(qty: number): number {
    if (qty === null || qty === undefined) {
      return 0;
    }

    return parseFloat(qty.toString());
  }

  preventNegativeInput(event: KeyboardEvent) {
    if (event.key === '-' || event.key === 'Subtract' || event.key === 'e' || event.key === 'E') {
      event.preventDefault();
    }
  }

  preventNegativePaste(event: ClipboardEvent) {
    const pasted = event.clipboardData?.getData('text') ?? '';
    if (pasted.includes('-')) {
      event.preventDefault();
    } 
  }

  restrictDecimals(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    const regex = /^\d*\.?\d{0,2}$/;

    if (!regex.test(value)) {
      const parts = value.split('.');
      if (parts.length > 1) {
        value = parts[0] + '.' + parts[1].slice(0, 2);
      }

      input.value = value;

      this.updateQuantity(value === '' ? 0 : Number(value));
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
  typeName: string;
  typeId: number;
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
  isPreferred: boolean
  price: number;
  qty: number;
  productTypeId: number;
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