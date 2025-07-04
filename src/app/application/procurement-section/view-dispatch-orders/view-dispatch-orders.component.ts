import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ProcumentsService } from '../../../services/procuments/procuments.service';
import { ActivatedRoute } from '@angular/router';
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
  quantity?: number;
  calculatedPrice?: number;
  displayName?: string;
  productDescription?: string;
  productTypeId?: number;
  isExcluded?: boolean;
}

interface MarketplaceItem {
  id: number;
  displayName: string;
  normalPrice: number;
  discountedPrice: number;
  isExcluded: boolean;
}

interface AdditionalItem {
  id: number;
  qty: number;
  unit: string;
  displayName: string;
  quantity?: number; // Optional if you want to allow editing
}

@Component({
  selector: 'app-view-dispatch-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-dispatch-orders.component.html',
  styleUrl: './view-dispatch-orders.component.css',
})
export class ViewDispatchOrdersComponent implements OnInit {
  excludedItemsArr: ExcludeItems[] = [];
  orderDetails: OrderDetailItem[] = [];
  marketplaceItems: MarketplaceItem[] = [];
  packageItems: any[] = [];
  additionalItems: AdditionalItem[] = [];
  loading = true;
  error = '';
  invoiceNumber = '';
  totalPrice = 0;
  orderId!: number;
  isWithinLimit = true;

  showAdditionalItemsModal = false;
  showExcludedItemsModal = false;

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

    this.fetchExcludedList(this.orderId!);
  }

  fetchExcludedList(orderId: number) {
    this.loading = false;
    this.procurementService
      .getExcludedItems(orderId)
      .subscribe(
        (response) => {
          console.log('response', response);
    
          this.excludedItemsArr = response;
          console.log('excludeItemsArr', this.excludedItemsArr)
    
          this.loading = false;
        },
        (error) => {
          console.error('Error fetching order details:', error);
        }
      );
  }

  fetchPackageItems(orderId: string) {
    this.procurementService
      .getOrderPackagesByOrderId(Number(orderId))
      .subscribe({
        next: (items) => {
          this.packageItems = Array.isArray(items) ? items : [items];
          console.log('Fetched package items:', this.packageItems);
          this.updateProductSelections();
        },
        error: (err) => {
          console.error('Error fetching package items:', err);
          this.error = 'Failed to load package items';
        },
      });
  }

  updateProductSelections() {
    this.orderDetails.forEach((pkg) => {
      const packageItems = this.packageItems.filter(
        (item) => item.orderPackageId === pkg.packageId
      );

      pkg.productTypes.forEach((productType) => {
        const matchingItem = packageItems.find(
          (item) => item.productType === productType.id
        );

        if (matchingItem) {
          productType.productId = matchingItem.productId;
          productType.quantity = matchingItem.qty;
          productType.selectedProductPrice = matchingItem.price;
          productType.calculatedPrice = matchingItem.price * matchingItem.qty;

          // Find and set the display name from marketplace items
          const product = this.marketplaceItems.find(
            (m) => m.id === matchingItem.productId
          );
          if (product) {
            productType.displayName = product.displayName;
          }
        }
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
          isExcluded: false,
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

    this.procurementService.getOrderPackagesByOrderId(Number(id)).subscribe({
      next: (response) => {
        console.log('Full API Response:', response); // Log the full response to check structure

        if (!response || !response.packages) {
          throw new Error('Invalid response structure from API');
        }

        this.orderDetails = response.packages.map((pkg: any) => {
          const packageDetail: OrderDetailItem = {
            packageId: pkg.packageId,
            displayName: pkg.displayName,
            productPrice:
              typeof pkg.productPrice === 'string'
                ? parseFloat(pkg.productPrice)
                : pkg.productPrice,
            invNo: response.invNo,
            productTypes: [],
          };

          if (pkg.productTypes && Array.isArray(pkg.productTypes)) {
            packageDetail.productTypes = pkg.productTypes.map((pt: any) => {
              const productType: ProductTypes = {
                id: pt.id, // This is orderpackageitems.id (if needed for updates)
                typeName: pt.typeName,
                shortCode: pt.shortCode,
                productId: pt.productId || null,
                productTypeId: pt.productTypeId, // Check API response for correct field
                selectedProductPrice: pt.price || undefined,
                quantity: pt.qty || undefined,
                calculatedPrice:
                  pt.price && pt.qty ? pt.price * pt.qty : undefined,
                displayName: pt.displayName || undefined,
                productDescription: pt.productDescription || undefined,
                isExcluded: pt.isExcluded,
              };

              // If productTypeId is still null, check alternative fields
              if (!productType.productTypeId) {
                // Try to get it from another field (adjust based on API response)
                productType.productTypeId =
                  pt.typeId || pt.productType?.id || null;
              }

              // Set displayName from marketplace if missing
              if (pt.productId && !productType.displayName) {
                const product = this.marketplaceItems.find(
                  (m) => m.id === pt.productId
                );
                if (product) {
                  productType.displayName = product.displayName;
                }
              }

              return productType;
            });
          }

          return packageDetail;
        });

        this.invoiceNumber = response.invNo;
        this.calculateTotalPrice();
        this.loading = false;
        this.fetchPackageItems(id);
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

  onProductSelected(productType: ProductTypes, event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedProductId = Number(selectElement.value);

    const selectedProduct = this.marketplaceItems.find(
      (item) => item.id === selectedProductId
    );

    if (selectedProduct) {
      productType.productId = selectedProduct.id;
      productType.selectedProductPrice = selectedProduct.discountedPrice;
      productType.displayName = selectedProduct.displayName;

      // Update calculated price based on current quantity
      if (productType.quantity && productType.quantity > 0) {
        productType.calculatedPrice =
          productType.quantity * selectedProduct.discountedPrice;
      } else {
        productType.calculatedPrice = selectedProduct.discountedPrice; // Default to unit price
      }
    } else {
      productType.productId = null;
      productType.selectedProductPrice = 0;
      productType.calculatedPrice = 0;
      productType.quantity = undefined;
    }
    this.calculateTotalPrice();
  }

  onQuantityChanged(productType: ProductTypes, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const quantity = Number(inputElement.value);

    if (isNaN(quantity) || quantity <= 0) {
      productType.quantity = undefined;
      productType.calculatedPrice = 0;
    } else {
      productType.quantity = quantity;
      // Ensure we have a valid selectedProductPrice
      const unitPrice = productType.selectedProductPrice || 0;
      productType.calculatedPrice = quantity * unitPrice;
    }
    this.calculateTotalPrice();
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

  closeAdditionalItemsModal() {
    this.showAdditionalItemsModal = false;
  }

  openAdditionalItemsModal() {
    this.showAdditionalItemsModal = true;
  }

  closeExcludedItemsModal() {
    this.showExcludedItemsModal = false;
  }

  openExcludedItemsModal() {
    this.showExcludedItemsModal = true;
  }
}

class ExcludeItems {
  id!: number;
  displayName!: string;
}
