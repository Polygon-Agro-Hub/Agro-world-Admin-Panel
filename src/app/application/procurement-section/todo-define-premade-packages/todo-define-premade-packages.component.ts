import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ProcumentsService } from '../../../services/procuments/procuments.service';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-define-premade-packages.component.html',
  styleUrl: './todo-define-premade-packages.component.css',
})
export class TodoDefinePremadePackagesComponent implements OnInit {
  orderdetailsArr: OrderDetails[] = [];
  orderDetails: OrderDetailItem[] = [];
  marketplaceItems: MarketplaceItem[] = [];
  additionalItems: AdditionalItem[] = [];
  loading = true;
  error = '';
  invoiceNumber = '';
  totalPrice = 0;
  orderId!: number;
  isWithinLimit = true;

  showAdditionalItemsModal = false;

  totalDefinePkgPrice: number = 0.00;

  constructor(
    private procurementService: ProcumentsService,
    private route: ActivatedRoute
  ) { }

  goBack() {
    window.history.back();
  }

  ngOnInit() {
    this.recalculatePackageTotal();
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

    this.procurementService.getOrderDetailsById(id).subscribe(
      (response) => {
        console.log('response', response);

        this.orderdetailsArr = response.data
        console.log('orderdetailsArr', this.orderdetailsArr);
        // this.totalItemssl = response.total;
        // console.log(this.selectdPackage)
        // this.purchaseReport.forEach((head) => {
        //   head.createdAtFormatted = this.datePipe.transform(head.createdAt, 'yyyy/MM/dd \'at\' hh.mm a');
        // });
        // this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching order details:', error);
      }
    );
  }

  // fetchOrderDetails(id: string) {
  //   console.log('Fetching order details for ID:', id);
  //   this.loading = true;
  //   this.error = '';

  //   this.procurementService.getOrderDetailsById(id).subscribe({
  //     next: (response) => {
  //       console.log('API Response:', response);

  //       // Type guard to ensure response has the expected structure
  //       if (!response || !response.packages) {
  //         throw new Error('Invalid response structure from API');
  //       }

  //       // Transform the response to match our component's OrderDetailItem[]
  //       this.orderDetails = response.packages.map((pkg) => ({
  //         packageId: pkg.packageId,
  //         displayName: pkg.displayName,
  //         productPrice:
  //           typeof pkg.productPrice === 'string'
  //             ? parseFloat(pkg.productPrice)
  //             : pkg.productPrice,
  //         invNo: response.invNo,
  //         productTypes: pkg.productTypes
  //           ? pkg.productTypes.map((pt) => ({
  //               id: pt.id,
  //               typeName: pt.typeName,
  //               shortCode: pt.shortCode,
  //               productId: null,
  //               selectedProductPrice: undefined,
  //               quantity: undefined,
  //               calculatedPrice: undefined,
  //             }))
  //           : [],
  //       }));

  //       this.invoiceNumber = response.invNo;
  //       this.additionalItems = response.additionalItems || []; // Add this line
  //       this.calculateTotalPrice();
  //       this.loading = false;
  //     },
  //     error: (err) => {
  //       console.error('Error fetching order details:', err);
  //       this.error =
  //         err.error?.message || err.message || 'Failed to load order details';
  //       this.loading = false;
  //     },
  //   });
  // }

  calculatePrice(item: OrderItem): void {
    console.log('id', item.productId)
    console.log('maitems', this.marketplaceItems)
    const selectedProduct = this.marketplaceItems.find(
      product => +product.id === +item.productId
    );
    console.log('selectedProduct', selectedProduct)

    if (selectedProduct) {
      const price = selectedProduct.discountedPrice ?? 0;
      const qty = item.qty ?? 0;

      item.price = price * qty;
    } else {
      item.price = 0;
    }
    console.log(item.price);

    this.recalculatePackageTotal();
  }


  recalculatePackageTotal(): void {
    this.totalDefinePkgPrice = 0.00; // reset before calculation

    this.orderdetailsArr.forEach((pkg: OrderDetails) => {
      pkg.definePkgPrice = pkg.items.reduce((total, item) => {
        return total + (+item.price || 0);
      }, 0);

      this.totalDefinePkgPrice += pkg.definePkgPrice;
      console.log('hhsdhfkhd', this.totalDefinePkgPrice)
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

  openAdditionalItemsModal() {
    this.showAdditionalItemsModal = true;
  }

  closeAdditionalItemsModal() {
    this.showAdditionalItemsModal = false;
  }
}

class OrderDetails {
  invNo!: string;
  displayName!: string;
  processOrderId!: number;
  orderId!: number;
  packageId!: number;
  productPrice!: number;
  definePackageId!: number;
  definePkgPrice: number = 0.00;
  items!: OrderItem[];

}

class OrderItem {
  productTypeId!: number;
  productTypeShortCode!: string;
  productId!: number;
  productName!: string;
  qty!: number;
  price!: number;
}
