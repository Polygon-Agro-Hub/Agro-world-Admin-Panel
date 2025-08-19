

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';

interface OrderDetailItem {
  packageId: number;
  displayName: string;
  productPrice: number | null;
  productTypes: ProductTypes[];
}

interface ProductTypes {
  id: number;
  typeName: string | null;
  shortCode: string | null;
  qty: number;
  productId: number | null;
  selectedProductPrice?: number;
  quantity?: number;
  calculatedPrice?: number;
}

interface MarketplaceItem {
  id: number;
  displayName: string;
  normalPrice: number;
  discountedPrice: number;
}

@Component({
  selector: 'app-define-package-view',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './define-package-view.component.html',
  styleUrl: './define-package-view.component.css',
})
export class DefinePackageViewComponent implements OnInit {
  orderDetails: OrderDetailItem[] = [];
  marketplaceItems: MarketplaceItem[] = [];
  totalPrice = 0;
  isWithinLimit = true;
  id!: number;
  loading = true;
  error = '';
  packagePrice: number = 0;
  isLoading: boolean = true;
  formSubmitted = false; // Track form submission for validation

  constructor(
    private marketplaceService: MarketPlaceService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    console.log('Component initialized');
    this.route.queryParamMap.subscribe((params) => {
      const id = params.get('id');
      console.log('Query parameter ID:', id);
      if (!id) {
        this.error = 'No order ID provided in URL';
        this.loading = false;
        return;
      }

      this.id = Number(id);

      // First fetch marketplace items
      this.fetchMarketplaceItems(() => {
        // Then fetch order details
        this.fetchOrderDetails(id);
        this.isLoading = false;
      });
    });
  }
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
      window.history.back();
    }
  });
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
    buttonsStyling: true,
  }).then((result) => {
    if (result.isConfirmed) {
      window.history.back();
    }
  });

}

  fetchOrderDetails(id: string) {
    console.log('Fetching order details for ID:', id);
    this.loading = true;
    this.error = '';

    this.marketplaceService.getOrderDetailsById(id).subscribe({
      next: (response) => {
        console.log('API Response:', response);

        if (!response?.success || !response.data?.packages) {
          throw new Error('Invalid response structure from API');
        }

        this.orderDetails = response.data.packages.map((pkg: any) => ({
          packageId: pkg.packageId,
          displayName: pkg.displayName,
          productPrice: pkg.productPrice ? parseFloat(pkg.productPrice) : null,
          productTypes: pkg.productTypes.map((pt: any) => ({
            id: pt.id,
            typeName: pt.typeName,
            shortCode: pt.shortCode,
            qty: pt.qty,
            productId: null,
            selectedProductPrice: undefined,
            quantity: undefined,
            calculatedPrice: undefined,
          })),
        }));
        this.packagePrice = response.data.packages[0].productPrice || 0;

        this.calculateTotalPrice();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching order details:', err);
        this.error =
          err.error?.message || err.message || 'Failed to load order details';
        this.loading = false;
      },
    });
  }

  fetchMarketplaceItems(callback?: () => void) {
    this.marketplaceService.getAllMarketplaceItems(this.id).subscribe({
      next: (data: any) => {
        this.marketplaceItems = data.items.map((item: any) => ({
          id: item.id,
          displayName: item.displayName,
          normalPrice: item.normalPrice,
          discountedPrice: item.discountedPrice,
        }));
        console.log('Fetched marketplace items:', this.marketplaceItems);
        if (callback) callback();
      },
      error: (err) => {
        console.error('Error fetching marketplace items:', err);
        this.error = 'Failed to load product options';
        if (callback) callback();
      },
    });
  }

  onProductSelected(productType: ProductTypes, event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedProductId = Number(selectElement.value);
  
    const selectedProduct = this.marketplaceItems.find(
      (item) => item.id === selectedProductId
    );
  
    if (selectedProduct) {
      productType.productId = selectedProduct.id;
      productType.selectedProductPrice = selectedProduct.discountedPrice;
      productType.calculatedPrice = productType.quantity
        ? productType.quantity * selectedProduct.discountedPrice
        : selectedProduct.discountedPrice;
    } else {
      productType.productId = null;
      productType.selectedProductPrice = undefined;
    }
  
    // Recalculate price if quantity already exists
    if (productType.quantity !== undefined) {
      productType.calculatedPrice = (productType.quantity || 0) * (productType.selectedProductPrice || 0);
    } else {
      productType.calculatedPrice = undefined;
    }
    this.calculateTotalPrice();
  }
  

  preventNegative(event: KeyboardEvent) {
    if (event.key === '-' || event.key === 'Subtract') {
      event.preventDefault();
    }
  }

  onQuantityChanged(productType: ProductTypes, event: Event) {
  const inputElement = event.target as HTMLInputElement;
  let value = inputElement.value;
  
  // Remove any extra decimal points
  if ((value.match(/\./g) || []).length > 1) {
    value = value.substring(0, value.lastIndexOf('.'));
    inputElement.value = value;
  }
  
  // Enforce max 2 decimal places
  if (value.includes('.')) {
    const parts = value.split('.');
    if (parts[1].length > 2) {
      value = parts[0] + '.' + parts[1].substring(0, 2);
      inputElement.value = value;
    }
  }

  const quantity = parseFloat(value);
  
  if (isNaN(quantity)) {
    productType.quantity = undefined;
    productType.calculatedPrice = undefined;
  } else {
    if (quantity <= 0) {
      productType.quantity = undefined;
      productType.calculatedPrice = undefined;
      inputElement.value = '';
      Swal.fire('Warning', 'Quantity must be greater than 0!', 'warning');
      return;
    }
    productType.quantity = quantity;
    productType.calculatedPrice = quantity * (productType.selectedProductPrice || 0);
  }
  this.calculateTotalPrice();
}

  calculateTotalPrice() {
    if (this.orderDetails && this.orderDetails.length) {
      this.totalPrice = this.getCombinedProductPrice();
      const allowedLimit = this.totalPrice * 1.08;
      const currentTotal = this.orderDetails.reduce(
        (sum: number, pkg: OrderDetailItem) => sum + this.getPackageTotal(pkg),
        0
      );
      this.isWithinLimit = currentTotal <= allowedLimit;
    } else {
      this.totalPrice = 0;
      this.isWithinLimit = true;
    }
  }

  getCombinedProductPrice(): number {
    if (!this.orderDetails || this.orderDetails.length === 0) {
      return 0;
    }
    return this.orderDetails.reduce(
      (sum, pkg) => sum + (pkg.productPrice || 0),
      0
    );
  }

  getPackageTotal(packageItem: OrderDetailItem): number {
    if (!packageItem.productTypes) return 0;
    return packageItem.productTypes.reduce((sum, productType) => {
      return sum + (productType.calculatedPrice || 0);
    }, 0);
  }

  getCombinedCalculatedTotal(): number {
    if (!this.orderDetails || this.orderDetails.length === 0) {
      return 0;
    }
    return this.orderDetails.reduce(
      (sum, pkg) => sum + this.getPackageTotal(pkg),
      0
    );
  }

  isFormValid(): boolean {
    return this.orderDetails.every((pkg) =>
      pkg.productTypes.every(
        (pt) =>
          pt.productId !== null &&
          pt.productId !== undefined &&
          pt.quantity !== undefined &&
          pt.quantity > 0 &&
          pt.selectedProductPrice !== undefined
      )
    );
  }

  async onSave() {
    this.formSubmitted = true; // Mark form as submitted to show validation errors

    if (!this.isFormValid()) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please select a product and enter a valid quantity greater than 0 for all items.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    if (!this.isWithinLimit) {
      Swal.fire({
        icon: 'error',
        title: 'Cannot Complete Package',
        text: 'Calculated price exceeds the allowed limit!',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    if (!this.orderDetails.length) {
      Swal.fire({
        icon: 'warning',
        title: 'No Package Details',
        text: 'No package details available',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    const packageData = {
      packageId: String(this.id),
      price: this.getCombinedCalculatedTotal(),
    };

    const packageItems = this.orderDetails.flatMap((pkg) =>
      pkg.productTypes
        .filter(
          (pt) =>
            pt.productId !== null &&
            pt.productId !== undefined &&
            pt.quantity !== undefined &&
            pt.quantity > 0 &&
            pt.selectedProductPrice !== undefined
        )
        .map((pt) => ({
          productType: String(pt.id),
          productId: pt.productId as number,
          qty: pt.quantity as number,
          price: pt.selectedProductPrice as number,
        }))
    );

    if (packageItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Valid Items',
        text: 'No valid package items to save. Please ensure all items have a product selected, quantity, and price.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    try {
      this.isLoading = true;
      const response = await this.marketplaceService
        .createDefinePackageWithItems(packageData, packageItems)
        .toPromise();

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Package defined successfully!',
        confirmButtonColor: '#3085d6',
      }).then((result) => {
        this.isLoading = false;
        if (result.isConfirmed) {
          this.goBack();
        }
      });
    } catch (error) {
      this.isLoading = false;
      console.error('Error creating package:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: this.getErrorMessage(error) || 'Failed to create package',
        confirmButtonColor: '#3085d6',
      });
    }
  }

  private getErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'An unknown error occurred';
  }

  validateQuantityInput(event: KeyboardEvent) {
  const input = event.target as HTMLInputElement;
  const key = event.key;
  
  // Allow: backspace, delete, tab, escape, enter, arrows (up/down/left/right)
  if (
    ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', '.', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key) ||
    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    (event.ctrlKey === true && ['a', 'c', 'v', 'x'].includes(key.toLowerCase()))
  ) {
    return; // let it happen, don't do anything
  }

  // Ensure that it is a number and stop the keypress if not
  if (event.key === ' ' || isNaN(Number(key))) {
    event.preventDefault();
    return;
  }

  // Get the current value and proposed new value
  const currentValue = input.value;
  const selectionStart = input.selectionStart || 0;
  const selectionEnd = input.selectionEnd || 0;
  const proposedValue = 
    currentValue.substring(0, selectionStart) + 
    key + 
    currentValue.substring(selectionEnd);

  // Check if the proposed value matches our pattern
  const pattern = /^\d*\.?\d{0,2}$/;
  if (!pattern.test(proposedValue)) {
    event.preventDefault();
  }

  // Only allow one decimal point
  if (key === '.' && currentValue.includes('.')) {
    event.preventDefault();
  }
}


}