import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ProcumentsService } from '../../../services/procuments/procuments.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

interface OrderDetailItem {
  packageId: number;
  displayName: string;
  productPrice: number;
  invNo: string;
  packageQty:number;
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
  imports: [CommonModule, LoadingSpinnerComponent],
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
  isLoading: boolean = false;
  additionalItemsCount: number = 0;
  tab: string = 'sent';

  showAdditionalItemsModal = false;
  showExcludedItemsModal = false;

  constructor(
    private procurementService: ProcumentsService,
    private route: ActivatedRoute,
    public location: Location,
    private router: Router,
  ) { }

  goBack() {
    const tab = this.tab
    this.router.navigate(['/procurement/define-packages'], {
      queryParams: { tab },
    });
  }

  ngOnInit() {
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

    this.fetchExcludedList(this.orderId!);
  }

  fetchExcludedList(orderId: number) {
    this.loading = false;
    this.procurementService
      .getExcludedItems(orderId)
      .subscribe(
        (response) => {
          this.excludedItemsArr = response;
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
          console.log('matchingItem', matchingItem)
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
    this.isLoading = true;
    this.procurementService.getAllMarketplaceItems(this.orderId).subscribe({
      next: (data: any) => {
        this.marketplaceItems = data.items.map((item: any) => ({
          id: item.id,
          displayName: item.displayName,
          normalPrice: item.normalPrice,
          discountedPrice: item.discountedPrice,
          isExcluded: false,
        }));
        // When a callback (fetchOrderDetails) follows, it keeps the loader on
        // and turns it off once the order details arrive.
        if (callback) {
          callback();
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error fetching marketplace items:', err);
        this.error = 'Failed to load product options';
        if (callback) {
          callback();
        } else {
          this.isLoading = false;
        }
      },
    });
  }

 fetchOrderDetails(id: string) {
    this.loading = true;
    this.isLoading = true;
    this.error = '';

    this.procurementService.getOrderPackagesByOrderId(Number(id)).subscribe({

      next: (response) => {
        this.additionalItems = response?.additionalItems || [];
        this.additionalItemsCount = this.additionalItems.length;

        if (!response || !response.packages) {
          this.loading = false;
          this.isLoading = false;
          throw new Error('Invalid response structure from API');
        }

        this.orderDetails = response.packages.map((pkg: any) => {
          const packageDetail: OrderDetailItem = {
            packageId: pkg.packageId,
            displayName: pkg.displayName,
            packageQty: pkg.packageQty,
            productPrice: this.toNumber(pkg.productPrice) ?? 0,
            invNo: response.invNo,
            productTypes: [],
          };

          if (pkg.productTypes && Array.isArray(pkg.productTypes)) {
            packageDetail.productTypes = pkg.productTypes.map((pt: any) => {
              const productType: ProductTypes = {
                id: pt.id,
                typeName: pt.typeName,
                shortCode: pt.shortCode,
                productId: pt.productId || null,
                productTypeId: pt.productTypeId,
                // API returns DECIMAL columns as strings (e.g. "260.00") — convert to numbers
                selectedProductPrice: this.toNumber(pt.price) || undefined,
                quantity: this.toNumber(pt.qty) || undefined,
                calculatedPrice: this.toNumber(pt.price),
                // calculatedPrice:
                //   pt.price && pt.qty ? pt.price * pt.qty : undefined,
                displayName: pt.displayName || undefined,
                productDescription: pt.productDescription || undefined,
                isExcluded: pt.isExcluded,
              };

              if (!productType.productTypeId) {
                productType.productTypeId =
                  pt.typeId || pt.productType?.id || null;
              }

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
        this.isLoading = false;
        this.fetchPackageItems(id);
      },
      error: (err) => {
        console.error('Error fetching order details:', err);
        this.error =
          err.error?.message || err.message || 'Failed to load order details';
        this.loading = false;
        this.isLoading = false;
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
    } else {
      this.totalPrice = 0;
      this.isWithinLimit = true;
    }
  }

  getPackageTotal(packageItem: OrderDetailItem): number {
    if (!packageItem.productTypes) return 0;

    return packageItem.productTypes.reduce((sum, productType) => {
      return sum + (this.toNumber(productType.calculatedPrice) ?? 0);
    }, 0);
  }

  /** Converts API values (numbers or numeric strings like "260.00") to a number; undefined if not numeric. */
  private toNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') return undefined;
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }

  getCombinedProductPrice(): number {
    if (!this.orderDetails || this.orderDetails.length === 0) {
      return 0;
    }

    // Sum of all package product prices
    return this.orderDetails.reduce(
      (sum, pkg) => sum + (this.toNumber(pkg.productPrice) ?? 0),
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
