import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

interface OrderDetailItem {
  packageId: number;
  displayName: string;
  productPrice: number | null;
  productTypes: ProductTypes[];
}

interface ProductTypes {
  id: number;
  typeName: string | null; // Make nullable
  shortCode: string | null; // Make nullable
  qty: number; // Add this missing property
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
  imports: [CommonModule],
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
      });
    });
  }

  goBack() {
    window.history.back();
  }

  fetchOrderDetails(id: string) {
    console.log('Fetching order details for ID:', id);
    this.loading = true;
    this.error = '';

    this.marketplaceService.getOrderDetailsById(id).subscribe({
      next: (response) => {
        console.log('API Response:', response);

        // Validate response structure
        if (!response?.success || !response.data?.packages) {
          throw new Error('Invalid response structure from API');
        }

        // Transform the response to match our component's OrderDetailItem[]
        this.orderDetails = response.data.packages.map((pkg:any) => ({
          packageId: pkg.packageId,
          displayName: pkg.displayName,
          productPrice: pkg.productPrice ? parseFloat(pkg.productPrice) : null,
          productTypes: pkg.productTypes.map((pt:any) => ({
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

      console.log('Calculated total price:', this.totalPrice);
      console.log('Allowed limit:', allowedLimit);
      console.log('Current total:', currentTotal);
      console.log('Is within limit:', this.isWithinLimit);
    } else {
      this.totalPrice = 0;
      this.isWithinLimit = true;
    }
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

    // Sum of all package calculated totals
    return this.orderDetails.reduce(
      (sum, pkg) => sum + this.getPackageTotal(pkg),
      0
    );
  }

  async onSave() {
    // Check if calculated price is within limit
    if (!this.isWithinLimit) {
      Swal.fire({
        icon: 'error',
        title: 'Cannot Complete Package',
        text: 'Calculated price exceeds the allowed limit!',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    // Check if there are any order details
    if (!this.orderDetails.length) {
      Swal.fire({
        icon: 'warning',
        title: 'No Package Details',
        text: 'No package details available',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    // Prepare the package data and items
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
            pt.selectedProductPrice !== undefined
        )
        .map((pt) => ({
          productType: String(pt.id),
          productId: pt.productId as number,
          qty: pt.quantity as number,
          price: pt.selectedProductPrice as number,
        }))
    );

    // Check if we have any valid items
    if (packageItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Valid Items',
        text: 'No valid package items to save. Please ensure all items have a product selected, quantity, and price.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    console.log('Package data to save:', { packageData, packageItems });

    Swal.fire({
      title: 'Processing...',
      html: 'Please wait while we create your package',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // Create the package with items
      const response = await this.marketplaceService
        .createDefinePackageWithItems(packageData, packageItems)
        .toPromise();

      console.log('Package created successfully:', response);

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Package created successfully!',
        confirmButtonColor: '#3085d6',
      }).then((result) => {
        if (result.isConfirmed) {
          this.goBack();
        }
      });
    } catch (error) {
      console.error('Error creating package:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: this.getErrorMessage(error) || 'Failed to create package',
        confirmButtonColor: '#3085d6',
      });
    }
  }

  // Helper function to get error message
  private getErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'An unknown error occurred';
  }
}
