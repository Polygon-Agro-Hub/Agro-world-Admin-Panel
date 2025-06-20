import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ProcumentsService } from '../../../services/procuments/procuments.service';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

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

interface PackageItem {
  packageId: number;
  displayName: string;
  productPrice: number;
  productTypes: ProductTypes[];
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
      next: (response) => {
        console.log('API Response:', response);

        // Type guard to ensure response has the expected structure
        if (!response || !response.packages) {
          throw new Error('Invalid response structure from API');
        }

        // Transform the response to match our component's OrderDetailItem[]
        this.orderDetails = response.packages.map((pkg) => ({
          packageId: pkg.packageId,
          displayName: pkg.displayName,
          productPrice:
            typeof pkg.productPrice === 'string'
              ? parseFloat(pkg.productPrice)
              : pkg.productPrice,
          invNo: response.invNo,
          productTypes: pkg.productTypes
            ? pkg.productTypes.map((pt) => ({
                id: pt.id,
                typeName: pt.typeName,
                shortCode: pt.shortCode,
                productId: null,
                selectedProductPrice: undefined,
                quantity: undefined,
                calculatedPrice: undefined,
              }))
            : [],
        }));

        this.invoiceNumber = response.invNo;
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
      Swal.fire({
        icon: 'error',
        title: 'Cannot Complete Order',
        text: 'Calculated price exceeds the allowed limit!',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    if (!this.orderDetails.length) {
      Swal.fire({
        icon: 'warning',
        title: 'No Order Details',
        text: 'No order details available',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    // Group products by packageId
    const packageGroups: { [key: number]: any[] } = {};

    this.orderDetails.forEach((pkg) => {
      const validProducts = pkg.productTypes
        .filter((pt) => pt.productId && pt.quantity && pt.selectedProductPrice)
        .map((pt) => ({
          productType: pt.id,
          productId: pt.productId,
          qty: pt.quantity,
          price: pt.selectedProductPrice,
        }));

      if (validProducts.length > 0) {
        if (!packageGroups[pkg.packageId]) {
          packageGroups[pkg.packageId] = [];
        }
        packageGroups[pkg.packageId].push(...validProducts);
      }
    });

    // Check if we have any valid packages
    if (Object.keys(packageGroups).length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Valid Items',
        text: 'No valid package items to save. Please ensure all items have a product selected, quantity, and price.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    console.log('Package groups to save:', packageGroups);

    Swal.fire({
      title: 'Processing...',
      html: 'Please wait while we save your order',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Process each package group
    const saveOperations = Object.entries(packageGroups).map(
      ([packageId, products]) => {
        return this.procurementService
          .createOrderPackageItems(Number(packageId), products)
          .toPromise();
      }
    );

    // Execute all save operations
    Promise.all(saveOperations)
      .then((responses) => {
        console.log('All saves successful, responses:', responses);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'All items saved successfully!',
          confirmButtonColor: '#3085d6',
        }).then((result) => {
          if (result.isConfirmed) {
            this.goBack();
          }
        });
      })
      .catch((err) => {
        console.error('Error saving items:', err);
        let errorMessage = 'Failed to save items. Please try again.';
        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.error?.errors) {
          errorMessage = `Some items failed to save: ${err.error.errors
            .map((e: { error: any }) => e.error)
            .join(', ')}`;
        }

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonColor: '#3085d6',
        });
      });
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
}
