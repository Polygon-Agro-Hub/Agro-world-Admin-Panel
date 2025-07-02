import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { ActivatedRoute } from '@angular/router';

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
        this.orderDetails = response.data.packages.map((pkg) => ({
          packageId: pkg.packageId,
          displayName: pkg.displayName,
          productPrice: pkg.productPrice ? parseFloat(pkg.productPrice) : null,
          productTypes: pkg.productTypes.map((pt) => ({
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
}
