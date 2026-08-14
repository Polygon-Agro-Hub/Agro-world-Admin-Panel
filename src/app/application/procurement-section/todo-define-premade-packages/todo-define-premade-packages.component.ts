import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ProcumentsService } from '../../../services/procuments/procuments.service';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { DropdownModule } from 'primeng/dropdown';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';

interface AdditionalItem {
  id: number;
  qty: number;
  unit: string;
  displayName: string;
  quantity?: number; // Optional if you want to allow editing
}

interface OrderDetailItem {
  packageId: number;
  displayName: string;
  productPrice: number;
  invNo: string;
  productTypes: ProductTypes[];
}

interface ProductTypes {
  id: number;
  typeName: string;
  shortCode: string;
  productId: number | null;
  selectedProductPrice?: number;
  quantity?: number; // Add this
  calculatedPrice?: number; // Add this
}

interface MarketplaceItem {
  id: number;
  productTypeId: number;
  displayName: string;
  normalPrice: number;
  discountedPrice: number;
  category: string;
  changeby: string;
  discount: string;
  isExcluded: boolean;
  startValue: string;
  unitType: string;
  varietyId: number;
  isPreferred: boolean;
  isDisable: boolean;
}

interface PackageItem {
  packageId: number;
  displayName: string;
  productPrice: number;
  productTypes: ProductTypes[];
}

@Component({
  selector: 'app-todo-define-premade-packages',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, DropdownModule],
  templateUrl: './todo-define-premade-packages.component.html',
  styleUrl: './todo-define-premade-packages.component.css',
})
export class TodoDefinePremadePackagesComponent implements OnInit {

  orderdetailsArr: OrderDetails[] = [];
  excludeItemsArr: ExcludeItems[] = [];
  orderDetails: OrderDetailItem[] = [];
  marketplaceItems: MarketplaceItem[] = [];
  additionalItems: AdditionalItem[] = [];
  categories: Categories[] = [];
  loading = true;
  error = '';
  invoiceNumber = '';
  totalPrice = 0;
  orderId!: number;
  isWithinLimit = true;

  showAdditionalItemsModal = false;
  showExcludedItemsModal = false;
  isNewAddPopUp: boolean = false
  excludedItemsCount!: number;
  additionalItemsCount!: number;


  totalDefinePkgPrice: number = 0.00;

  totalPackagePrice: number = 0.00;

  selectedOption: string = '';

  isLoading: boolean = true;

  selectPackageId: number | string = '';
  selectCategoryId: number | string = '';
  newItem: OrderItem = new OrderItem();

  tab: string = 'todo';

  constructor(
    private procurementService: ProcumentsService,
    private route: ActivatedRoute,
    private router: Router,
    public permissionService: PermissionService,
    public tokenService: TokenService,
    public location: Location
  ) { }

  goBack(): void {
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
      buttonsStyling: true,
    }).then((result) => {
      if (result.isConfirmed) {
        // Only go back if user confirms
        const tab = this.tab
        this.router.navigate(['/procurement/define-packages'], {
          queryParams: { tab },
        });
      }
      // If user clicks "No" or dismisses, the modal will automatically close
    });
  }

  ngOnInit() {
    this.recalculatePackageTotal();
    this.route.queryParamMap.subscribe((params) => {
      const id = params.get('id');
      if (!id) {
        this.error = 'No order ID provided in URL';
        this.loading = false;
        return;
      }

      this.orderId = Number(id);

      // First fetch marketplace items
      this.fetchMarketplaceItems(() => {
        // Then fetch order details
        this.fetchOrderDetails(id);
      });
    });

  }
  isExcluded(product: MarketplaceItem): boolean {
    return product.isExcluded;
  }
  onSelectionChange() {
    // Add any additional logic here
  }

  getSelectedOptionText(): string {
    switch (this.selectedOption) {
      case 'option1': return 'First Option';
      case 'option2': return 'Second Option';
      case 'option3': return 'Third Option';
      default: return '';
    }
  }

  fetchMarketplaceItems(callback?: () => void) {
    this.loading = true;
    this.procurementService.getAllMarketplaceItems(this.orderId).subscribe({
      next: (data: any) => {
        this.marketplaceItems = data.items.map((item: any) => ({
          id: item.id,
          displayName: item.displayName,
          normalPrice: item.normalPrice,
          discountedPrice: item.discountedPrice,
          isExcluded: item.isExcluded,
          isDisable: item.isDisable,
          isPreferred: item.isPreferred,
          productTypeId: item.productTypeId,

        }));
        if (callback) callback();
      },

      error: (err) => {
        console.error('Error fetching marketplace items:', err);
        this.error = 'Failed to load product options';
        if (callback) callback();
      },
    });
    this.loading = false;
  }

  fetchOrderDetails(id: string) {
    this.loading = true;
    this.error = '';
    this.isLoading = true;

    this.procurementService.getOrderDetailsById(id).subscribe(
      (response) => {
        this.orderdetailsArr = response.data;
        this.additionalItems = response.additionalItems;
        this.excludeItemsArr = response.excludeList;
        this.excludedItemsCount = response.excludeList.length;
        // this.categories = response.category;
        this.categories = response.category.filter((cat: any) => cat.isValid === 1);
        this.additionalItemsCount = response.additionalItems.length || 0;

        // ✅ Reset totals
        this.totalDefinePkgPrice = 0.00;
        this.totalPackagePrice = 0.00;

        this.orderdetailsArr.forEach(order => {
          let packageTotal = 0.00;

          // ✅ Sum package's productPrice for totalPackagePrice
          this.totalPackagePrice += order.productPrice ?? 0;

          // Sort items A→Z by product type short code
          order.items.sort((a, b) =>
            (a.productTypeShortCode || '').localeCompare(b.productTypeShortCode || '')
          );

          order.items.forEach(item => {
            const selectedProduct = this.marketplaceItems.find(
              product => +product.id === +item.productId
            );
            item.isExcluded = selectedProduct?.isExcluded ?? false;
            item.isDisable = selectedProduct?.isDisable ?? true;

            const qty = item.qty ?? 0;
            const discountedPrice = selectedProduct?.discountedPrice ?? 0;

            item.price = discountedPrice * qty;
            packageTotal += item.price;
          });

          order.definePkgPrice = packageTotal;
          this.totalDefinePkgPrice += packageTotal;
        });

        this.loading = false;
        this.isLoading = false;

      },
      (error) => {
        console.error('Error fetching order details:', error);
      }
    );
  }


  calculatePrice(item: OrderItem): void {
    const selectedProduct = this.marketplaceItems.find(
      product => +product.id === +item.productId
    );

    if (selectedProduct) {
      const price = selectedProduct.discountedPrice ?? 0;
      const qty = item.qty ?? 0;

      item.price = price * qty;

      item.isExcluded = selectedProduct.isExcluded;
      item.isDisable = selectedProduct.isDisable;
    } else {
      item.price = 0;
      item.isExcluded = false; // fallback
      item.isDisable = false;
    }

    this.recalculatePackageTotal();
  }

  recalculatePackageTotal(): void {
    this.totalDefinePkgPrice = 0.00;
    this.totalPackagePrice = 0.00;

    this.orderdetailsArr.forEach((pkg: OrderDetails) => {
      // Sum up the definePkgPrice using item prices
      pkg.definePkgPrice = pkg.items.reduce((total, item) => {
        return total + (+item.price || 0);
      }, 0);

      this.totalDefinePkgPrice += pkg.definePkgPrice;

      // Sum up the original productPrice per package
      this.totalPackagePrice += +pkg.productPrice || 0;
    });

    // Compare against 1.08 * totalPackagePrice
    const limit = 1.08 * this.totalPackagePrice;
    this.isWithinLimit = this.totalDefinePkgPrice <= limit;
  }




  calculateTotalPrice() {
    if (this.orderDetails && this.orderDetails.length) {
      this.totalPrice = this.getCombinedProductPrice();

      // Calculate the allowed limit (8% of the total price)
      const allowedLimit = this.totalPrice * 1.08;

      // Calculate the current total (sum of all package totals)
      const currentTotal = this.orderDetails.reduce(
        (sum: number, pkg: OrderDetailItem) => sum + this.getPackageTotal(pkg),
        0
      );

      // Validate if current total is within the allowed limit
      this.isWithinLimit = currentTotal <= allowedLimit;
    } else {
      this.totalPrice = 0;
      this.isWithinLimit = true;
    }
  }

  onProductSelected(productType: ProductTypes, event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedProductId = Number(selectElement.value);

    // Find the selected product
    const selectedProduct = this.marketplaceItems.find(
      (item) => item.id === selectedProductId
    );

    if (selectedProduct) {
      productType.productId = selectedProduct.id;
      productType.selectedProductPrice = selectedProduct.discountedPrice;
      // Set calculated price to normal price by default (for 1 unit)
      productType.calculatedPrice = selectedProduct.discountedPrice;
    } else {
      productType.productId = null;
      productType.selectedProductPrice = 0;
      productType.calculatedPrice = 0;
    }
    productType.quantity = undefined; // Reset quantity
  }

  onQuantityChanged(productType: ProductTypes, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const quantity = parseFloat(inputElement.value);

    if (isNaN(quantity)) {
      productType.quantity = undefined;
      productType.calculatedPrice = productType.selectedProductPrice || 0;
    } else {
      productType.quantity = quantity;
      productType.calculatedPrice =
        quantity * (productType.selectedProductPrice || 0);
    }
    this.calculateTotalPrice(); // Add this line
  }

  getPackageTotal(packageItem: OrderDetailItem): number {
    if (!packageItem.productTypes) return 0;

    return packageItem.productTypes.reduce((sum, productType) => {
      return sum + (productType.calculatedPrice || 0);
    }, 0);
  }

  getAllowedLimit(packageItem: OrderDetailItem): string {
    const allowedLimit = packageItem.productPrice * 1.08;
    return allowedLimit.toFixed(2);
  }

  onComplete() {
    this.loading = true;

    const hasInvalidProduct = this.orderdetailsArr.some((pkg, pkgIndex) => {
      return pkg.items.some((item, itemIndex) => {
        return (
          (item.productId === null || item.productId === undefined || item.productId === null || Number.isNaN(item.productId)) && (item.qty === 0 || item.qty === null)
        );
      });
    });

    const hasInvalidItem = this.orderdetailsArr.some((pkg, pkgIndex) => {
      return pkg.items.some((item, itemIndex) => {
        return (
          (item.productId === null || item.productId === undefined || item.productId === null || Number.isNaN(item.productId))
        );
      });
    });

    const hasInvalidQty = this.orderdetailsArr.some((pkg, pkgIndex) => {
      return pkg.items.some((item, itemIndex) => {
        return (
          (item.qty === 0 || item.qty === null)
        );
      });
    });

    const hasExcludeProduct = this.orderdetailsArr.some((pkg, pkgIndex) => {
      return pkg.items.some((item, itemIndex) => {
        return item.isExcluded === true;
      });
    });

    const hasDisbledProduct = this.orderdetailsArr.some((pkg, pkgIndex) => {
      return pkg.items.some((item, itemIndex) => {
        console.log('Checking disabled product:', item);
        return item.isDisable === true;
      });
    });

    if (hasInvalidProduct) {
      this.loading = false;
      Swal.fire({
        title: 'Missing or Invalid Information',
        text: 'Product & Quantity are missing.',
        icon: 'warning',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        }
      });
      return;
    } else if (hasDisbledProduct) {
      this.loading = false;
      Swal.fire({
        title: 'Disabled Product Selected',
        text: 'Please, do not select disabled products.',
        icon: 'warning',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        }
      });
      return;
    } else if (hasInvalidItem) {
      this.loading = false;
      Swal.fire({
        title: 'Missing or Invalid Information',
        text: 'Product is missing.',
        icon: 'warning',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        }
      });
      return;
    } else if (hasInvalidQty) {
      this.loading = false;
      Swal.fire({
        title: 'Missing or Invalid Information',
        text: 'Quantity is missing.',
        icon: 'warning',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        }
      });
      return;
    } else if (hasExcludeProduct) {
      this.loading = false;
      Swal.fire({
        title: 'Invalid Product',
        text: 'Please, do not select excluded products.',
        icon: 'warning',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        }
      });
      return;
    }

    this.procurementService.updateDefinePackageItemData(this.orderdetailsArr, this.orderId).subscribe(
      (res) => {
        this.loading = false;
        // Show success message and redirect to sent tab
        Swal.fire({
          title: 'Success!',
          text: 'Order has been successfully dispatched',
          icon: 'success',
          confirmButtonColor: '#3980C0',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          },
        }).then((result) => {
          if (result.isConfirmed) {
            // Redirect to define-packages component with sent tab
            this.router.navigate(['/procurement/define-packages'], {
              queryParams: { tab: 'sent' }
            });
          }
        });
      },
      (err) => {
        this.loading = false;
        console.error('Update failed:', err);
        Swal.fire({
          title: 'Error',
          text: 'Product Update Unsuccessful',
          icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          }
        });
      }
    );
  }


  private getErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'Unknown error occurred';
  }

  private saveItemsSequentially(items: any[], index = 0) {
    if (index >= items.length) {
      this.loading = false;
      alert('All items saved successfully!');
      this.goBack();
      return;
    }

    // Provide an empty array or appropriate products array as the second argument
    this.procurementService
      .createOrderPackageItems(items[index], [])
      .subscribe({
        next: () => {
          this.saveItemsSequentially(items, index + 1);
        },
        error: (err) => {
          console.error(`Error saving item ${index}:`, err);
          this.loading = false;
          alert(`Failed to save item ${index + 1}. Please try again.`);
        },
      });
  }

  getCombinedProductPrice(): number {
    if (!this.orderDetails || this.orderDetails.length === 0) {
      return 0;
    }

    // Sum of all package product prices
    return this.orderDetails.reduce(
      (sum, pkg) => sum + (pkg.productPrice || 0),
      0
    );
  }

  getCombinedCalculatedTotal(): number {
    if (!this.orderDetails || this.orderDetails.length === 0) {
      return 0;
    }

    // Sum of all package calculated totals
    return this.orderDetails.reduce(
      (sum, pkg) => sum + this.getPackageTotal(pkg),
      0
    );
  }

  openAdditionalItemsModal() {
    this.showAdditionalItemsModal = true;
  }

  closeAdditionalItemsModal() {
    this.showAdditionalItemsModal = false;
  }

  openExcludedItemsModal() {
    this.showExcludedItemsModal = true;
  }

  closeExcludedItemsModal() {
    this.showExcludedItemsModal = false;
  }

  OpenAddNewItemPopUp(id: number) {
    this.selectPackageId = id;
    this.selectCategoryId = '';
    this.newItem = new OrderItem();  
    this.isNewAddPopUp = true;
  }

  closeAddNewItemPopUp() {
    this.isNewAddPopUp = false;
    this.selectPackageId = '';
    this.selectCategoryId = ''; // Add this line to clear the dropdown
  }

  addNewItems() {
    // Find the order detail that matches the selected packageId
    const selectedOrderDetail = this.orderdetailsArr.find(
      detail => detail.packageId.toString() === this.selectPackageId.toString()
    );

    if (!selectedOrderDetail) {
      console.error('No matching package found');
      return;
    }

    const selectedCategory = this.categories.find(
      cat => cat.id.toString() === this.selectCategoryId.toString()
    );

    if (!selectedCategory) {
      console.error('No matching category found');
      return;
    }

    if (!this.newItem.qty) {
      this.newItem.qty = 0;
    }

    const selectedProduct = this.marketplaceItems.find(
    product => product.id === this.newItem.productId
  );

    this.newItem.productTypeId = Number(this.selectCategoryId);
    this.newItem.productName = selectedCategory.typeName;
    this.newItem.productTypeShortCode = selectedCategory.shortCode;
    this.newItem.isDisable = selectedProduct?.isDisable ?? false;

    const existingItemIndex = selectedOrderDetail.items.findIndex(
      item => item.productId === this.newItem.productId &&
        item.productTypeId === this.newItem.productTypeId
    );

    if (existingItemIndex !== -1) {
      selectedOrderDetail.items[existingItemIndex] = { ...this.newItem };
    } else {
      selectedOrderDetail.items.push({ ...this.newItem });
    }

    this.newItem = new OrderItem();
    this.selectCategoryId = ''; 

    selectedOrderDetail.items.sort((a, b) => a.productTypeId - b.productTypeId);
    this.isNewAddPopUp = false;
  }

  validateQuantity(item: any) {
    // Ensure quantity is not negative
    if (item.qty < 0) {
      item.qty = 0;
    }

    // Ensure max 2 decimal places, even from paste or spinner arrows
    if (item.qty !== null && item.qty !== undefined) {
      item.qty = Math.round(item.qty * 100) / 100;
    }

    this.calculatePrice(item);
  }

  preventNegativeInput(event: KeyboardEvent) {
    // Prevent minus key (-) from being entered
    if (event.key === '-' || event.key === 'Subtract') {
      event.preventDefault();
    }
  }

  goToCompleteTab() {
    this.router.navigate(['/procurement/define-packages'], {
      queryParams: { tab: 'completed' }
    });
  }

  confirmClear() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will clear all your changes. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3980C0',
      cancelButtonColor: '#74788D',
      confirmButtonText: 'Yes, clear it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.clearForm();
      }
    });
  }

  confirmComplete() {
    // Only show confirmation if within limit
    if (!this.isWithinLimit) {
      return;
    }

    Swal.fire({
      title: 'Send to Dispatch',
      text: 'Are you sure you want to send this order to dispatch?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3980C0',
      cancelButtonColor: '#74788D',
      confirmButtonText: 'Yes, send to dispatch!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.onComplete(); // This should call onComplete, not completeOrder
      }
    });
  }

  clearForm() {
    // Implement your clear logic here
    // For now, just calling ngOnInit as in your original code
    this.ngOnInit();
    this.isWithinLimit = true;

  }

  onCancelClick() {
    this.selectCategoryId = ''; // Clear the dropdown selection
    this.closeAddNewItemPopUp(); // Close the popup
  }

  filterMarketItemByTypeId(typeId: number): MarketplaceItem[] {
    const filteredItems = this.marketplaceItems.filter(item => item.productTypeId === typeId);

    const preferred = filteredItems
      .filter(item => item.isPreferred && !item.isExcluded)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));

    const remaining = filteredItems
      .filter(item => !item.isPreferred && !item.isExcluded)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));

    const excluded = filteredItems
      .filter(item => item.isExcluded)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));

    return [...preferred, ...remaining, ...excluded];
  }

  restrictDecimals(item: any, event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    const regex = /^\d*\.?\d{0,2}$/;

    if (!regex.test(value)) {
      const parts = value.split('.');
      if (parts.length > 1) {
        value = parts[0] + '.' + parts[1].slice(0, 2);
      }

      input.value = value;
    }

    item.qty = value === '' ? null : Number(value);
  }

}

class OrderDetails {
  invNo!: string;
  displayName!: string;
  processOrderId!: number;
  orderId!: number;
  packageId!: number;
  orderpkgId!: number;
  productPrice!: number;
  definePackageId!: number;
  definePkgPrice: number = 0.00;
  items!: OrderItem[];
  packageQty: number = 1;

}

class OrderItem {
  itemId!: number;
  productTypeId!: number;
  productTypeShortCode!: string;
  productId!: number;
  productName!: string;
  qty!: number;
  price!: number;
  isExcluded: boolean = false;
  isDisable: boolean = false;
}

class ExcludeItems {
  id!: number;
  displayName!: string;
}

class Categories {
  id!: number;
  typeName!: string;
  shortCode!: string;
}
