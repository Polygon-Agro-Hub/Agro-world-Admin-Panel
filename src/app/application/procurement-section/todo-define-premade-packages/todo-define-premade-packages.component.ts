import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ProcumentsService } from '../../../services/procuments/procuments.service';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

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
  displayName: string;
  normalPrice: number;
  discountedPrice: number;
}

@Component({
  selector: 'app-todo-define-premade-packages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './todo-define-premade-packages.component.html',
  styleUrl: './todo-define-premade-packages.component.css',
})
export class TodoDefinePremadePackagesComponent implements OnInit {
  orderDetails: OrderDetailItem[] = [];
  marketplaceItems: MarketplaceItem[] = [];
  loading = true;
  error = '';
  invoiceNumber = '';
  totalPrice = 0;
  orderId!: number;
  isWithinLimit = true;

  constructor(
    private procurementService: ProcumentsService,
    private route: ActivatedRoute
  ) {}

  goBack() {
    window.history.back();
  }

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

      this.orderId = Number(id);

      // First fetch marketplace items
      this.fetchMarketplaceItems(() => {
        // Then fetch order details
        this.fetchOrderDetails(id);
      });
    });
  }

  fetchMarketplaceItems(callback?: () => void) {
    this.procurementService.getAllMarketplaceItems(this.orderId).subscribe({
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

  fetchOrderDetails(id: string) {
    console.log('Fetching order details for ID:', id);
    this.loading = true;
    this.error = '';

    this.procurementService.getOrderDetailsById(id).subscribe({
      next: (data: OrderDetailItem[]) => {
        console.log('API Response:', data);
        this.orderDetails = data;
        this.calculateTotalPrice();
        this.loading = false;
      },
      error: (err) => {
        console.error('API Error Details:', err);
        this.error =
          err.error?.message || err.message || 'Failed to load order details';
        this.loading = false;
      },
    });
  }

  calculateTotalPrice() {
    if (this.orderDetails && this.orderDetails.length) {
      this.totalPrice = this.orderDetails.reduce(
        (sum: number, pkg: OrderDetailItem) => sum + (pkg.productPrice || 0),
        0
      );

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
    if (!this.isWithinLimit) {
      alert(
        'Cannot complete order - calculated price exceeds the allowed limit!'
      );
      return;
    }

    if (!this.orderDetails.length) {
      alert('No order details available');
      return;
    }

    this.loading = true;

    // Prepare all package items
    const packageItems = this.orderDetails.flatMap((pkg) =>
      pkg.productTypes
        .filter((pt) => pt.productId && pt.quantity)
        .map((pt) => ({
          orderPackageId: pkg.packageId,
          productType: pt.id,
          productId: pt.productId,
          qty: pt.quantity,
          price: pt.selectedProductPrice,
        }))
    );

    if (packageItems.length === 0) {
      this.loading = false;
      alert('No valid package items to save');
      return;
    }

    // Send all items in a single request
    this.procurementService.createOrderPackageItems(packageItems).subscribe({
      next: (response) => {
        this.loading = false;
        alert('All items saved successfully!');
        this.goBack();
      },
      error: (err) => {
        console.error('Error saving items:', err);
        this.loading = false;
        alert('Failed to save items. Please try again.');
      },
    });
  }

  private saveItemsSequentially(items: any[], index = 0) {
    if (index >= items.length) {
      this.loading = false;
      alert('All items saved successfully!');
      this.goBack();
      return;
    }

    this.procurementService.createOrderPackageItems(items[index]).subscribe({
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
}
