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
  selector: 'app-edit-compleated-define-premade-packages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './edit-compleated-define-premade-packages.component.html',
  styleUrl: './edit-compleated-define-premade-packages.component.css',
})
export class EditCompleatedDefinePremadePackagesComponent implements OnInit {
  orderDetails: OrderDetailItem[] = [];
  marketplaceItems: MarketplaceItem[] = [];
  packageItems: any[] = [];
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
        console.log('API Response:', response);

        if (!response || !response.packages) {
          throw new Error('Invalid response structure from API');
        }

        this.orderDetails = response.packages.map((pkg: any) => {
          // First map the basic package info
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

          // Then map each product type with the correct id (orderpackageitems.id)
          if (pkg.productTypes && Array.isArray(pkg.productTypes)) {
            packageDetail.productTypes = pkg.productTypes.map((pt: any) => {
              const productType: ProductTypes = {
                id: pt.id, // This must be the orderpackageitems.id from database
                typeName: pt.typeName,
                shortCode: pt.shortCode,
                productId: pt.productId || null,
                selectedProductPrice: pt.price || undefined,
                quantity: pt.qty || undefined,
                calculatedPrice:
                  pt.price && pt.qty ? pt.price * pt.qty : undefined,
                displayName: pt.displayName || undefined,
                productDescription: pt.productDescription || undefined,
                // These are kept for backward compatibility
              };

              // Find and set the display name from marketplace items if not provided
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

        // After loading details, fetch package items to get complete data
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

  async onComplete() {
    // Check if calculated price is within limit
    if (!this.isWithinLimit) {
      Swal.fire({
        icon: 'error',
        title: 'Cannot Complete Order',
        text: 'Calculated price exceeds the allowed limit!',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    // Check if there are any order details
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
      html: 'Please wait while we save your order and update status',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // Process each package group
      const saveOperations = Object.entries(packageGroups).map(
        async ([packageId, products]) => {
          try {
            // Step 1: Save the package items
            const saveResponse = await this.procurementService
              .createOrderPackageItems(Number(packageId), products)
              .toPromise();

            console.log(`Items saved for package ${packageId}`, saveResponse);

            // Step 2: Update packing status to "Completed"
            const statusResponse = await this.procurementService
              .updateOrderPackagePackingStatus(Number(packageId), 'Completed')
              .toPromise();

            console.log(
              `Status updated for package ${packageId}`,
              statusResponse
            );

            return { packageId, success: true };
          } catch (error) {
            console.error(`Error processing package ${packageId}:`, error);
            return {
              packageId,
              success: false,
              error: this.getErrorMessage(error),
            };
          }
        }
      );

      // Execute all operations
      const results = await Promise.all(saveOperations);

      // Check if all operations were successful
      const failedPackages = results.filter((r) => !r.success);

      if (failedPackages.length > 0) {
        // Some packages failed
        const errorMessages = failedPackages
          .map((p) => `Package ${p.packageId}: ${p.error}`)
          .join('<br><br>');

        Swal.fire({
          icon: 'error',
          title: 'Partial Success',
          html: `Some packages couldn't be processed:<br><br>${errorMessages}`,
          confirmButtonColor: '#3085d6',
        });
      } else {
        // All operations successful
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'All items saved and packing status updated successfully!',
          confirmButtonColor: '#3085d6',
        }).then((result) => {
          if (result.isConfirmed) {
            this.goBack();
          }
        });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred while processing your request',
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

  async onUpdate() {
    // First, prepare all the products to be updated
    const productsToUpdate = this.orderDetails.flatMap((pkg) =>
      pkg.productTypes.map((pt) => ({
        id: pt.id, // This should be the orderpackageitems.id from database
        productId: pt.productId,
        productType: pt.typeName, // or pt.id if you need the type ID
        qty: pt.quantity?.toString() || '0',
        price: pt.calculatedPrice?.toString() || '0',
        displayName: pt.displayName,
      }))
    );

    // Filter out any invalid entries (where id is missing)
    const validProducts = productsToUpdate.filter((product) => product.id);

    if (validProducts.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Valid Items',
        text: 'No valid items to update. Please ensure all items have an ID.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    Swal.fire({
      title: 'Updating...',
      html: 'Please wait while we update your order',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // Send the update request
      const result = await this.procurementService
        .updateOrderPackageItems(this.orderId, validProducts)
        .toPromise();

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Update completed successfully!',
        confirmButtonColor: '#3085d6',
      });

      // Refresh the data
      this.fetchOrderDetails(this.orderId.toString());
    } catch (err) {
      console.error('Error updating order:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred',
        confirmButtonColor: '#3085d6',
      });
    }
  }
}
