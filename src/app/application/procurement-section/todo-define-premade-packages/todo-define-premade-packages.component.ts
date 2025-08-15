import { CommonModule } from '@angular/common';
import { Component, OnInit,Output, EventEmitter } from '@angular/core';
import { ProcumentsService } from '../../../services/procuments/procuments.service';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

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
  category: string;
  changeby: string;
  discount: string;
  isExcluded: boolean;
  startValue: string;
  unitType: string;
  varietyId: number;
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
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
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

  onSelectionChange() {
    console.log('Selected option:', this.selectedOption);
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
        console.log('data', data);
        this.marketplaceItems = data.items.map((item: any) => ({
          id: item.id,
          displayName: item.displayName,
          normalPrice: item.normalPrice,
          discountedPrice: item.discountedPrice,
          isExcluded: item.isExcluded,

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
    this.loading = false;
  }

  fetchOrderDetails(id: string) {
    console.log('Fetching order details for ID:', id);
    this.loading = true;
    this.error = '';
    this.isLoading = true;

    this.procurementService.getOrderDetailsById(id).subscribe(
      (response) => {
        console.log('response', response);

        this.orderdetailsArr = response.data;
        this.additionalItems = response.additionalItems;
        this.excludeItemsArr = response.excludeList;
        this.excludedItemsCount = response.excludeList.length;
        this.categories = response.category;
        this.additionalItemsCount = response.additionalItems.length || 0;


        console.log('orderdetailsArr', this.orderdetailsArr);
        console.log('sdfasd', this.excludeItemsArr);

        // ✅ Reset totals
        this.totalDefinePkgPrice = 0.00;
        this.totalPackagePrice = 0.00;

        this.orderdetailsArr.forEach(order => {
          let packageTotal = 0.00;

          // ✅ Sum package's productPrice for totalPackagePrice
          this.totalPackagePrice += order.productPrice ?? 0;

          order.items.forEach(item => {
            const selectedProduct = this.marketplaceItems.find(
              product => +product.id === +item.productId
            );
            item.isExcluded = selectedProduct?.isExcluded ?? false;

            const qty = item.qty ?? 0;
            const discountedPrice = selectedProduct?.discountedPrice ?? 0;

            item.price = discountedPrice * qty;
            packageTotal += item.price;
          });

          order.definePkgPrice = packageTotal;
          this.totalDefinePkgPrice += packageTotal;
        });

        console.log('Total Define Package Price (discounted):', this.totalDefinePkgPrice);
        console.log('Total Package Price (original from OrderDetails):', this.totalPackagePrice);

        this.loading = false;
        this.isLoading = false;

      },
      (error) => {
        console.error('Error fetching order details:', error);
      }
    );
  }


  calculatePrice(item: OrderItem): void {
    console.log('id', item.productId);
    console.log('maitems', this.marketplaceItems);

    const selectedProduct = this.marketplaceItems.find(
      product => +product.id === +item.productId
    );
    console.log('selectedProduct', selectedProduct);

    if (selectedProduct) {
      const price = selectedProduct.discountedPrice ?? 0;
      const qty = item.qty ?? 0;

      item.price = price * qty;


      item.isExcluded = selectedProduct.isExcluded;
    } else {
      item.price = 0;
      item.isExcluded = false; // fallback
    }

    console.log('price', item.price);

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

    console.log('Total Define Package Price:', this.totalDefinePkgPrice);
    console.log('Total Package Price (Original):', this.totalPackagePrice);

    // Compare against 1.08 * totalPackagePrice
    const limit = 1.08 * this.totalPackagePrice;
    this.isWithinLimit = this.totalDefinePkgPrice <= limit;

    console.log('Is Within Limit:', this.isWithinLimit);
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
    console.log('orderdetailsArr', this.orderdetailsArr);
    this.loading = true;

    const hasInvalidProduct = this.orderdetailsArr.some((pkg, pkgIndex) => {
      return pkg.items.some((item, itemIndex) => {
        console.log(`Package ${pkgIndex}, Item ${itemIndex}, productId:`, item.productId, 'Type:', typeof item.productId);

        return (
          item.productId === null ||
          item.productId === undefined ||
          item.productId === null ||
          item.qty === 0 ||
          Number.isNaN(item.productId)
        );
      });
    });

    const hasExcludeProduct = this.orderdetailsArr.some((pkg, pkgIndex) => {
      return pkg.items.some((item, itemIndex) => {
        console.log(`Package ${pkgIndex}, Item ${itemIndex}, productId:`, item.productId, 'Type:', typeof item.productId);

        return (
          item.isExcluded === true
        );
      });
    });

    console.log('hasInvalidProduct', hasInvalidProduct);


    if (hasInvalidProduct) {
      this.loading = false;
      Swal.fire('Missing Product', 'Please select products for all inputs before submitting.', 'warning');
      return;
    } else if (hasExcludeProduct) {
      this.loading = false;
      Swal.fire('Invalid Product', 'Please Do not Select Excluded products.', 'warning');
      return;
    }

    console.log('odarray', this.orderdetailsArr)

    this.procurementService.updateDefinePackageItemData(this.orderdetailsArr).subscribe(
      
      (res) => {

        this.loading = false;
        console.log('Updated successfully:', res);
        Swal.fire('Success', 'Product Updated Successfully', 'success');
      },
      (err) => {
        this.loading = false;
        console.error('Update failed:', err);
        Swal.fire('Error', 'Product Update Unsuccessful', 'error');
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
    this.isNewAddPopUp = true;
  }

  closeAddNewItemPopUp() {
    this.isNewAddPopUp = false;
    this.selectPackageId = '';

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

    this.newItem.productTypeId = Number(this.selectCategoryId);
    this.newItem.productName = selectedCategory.typeName;
    this.newItem.productTypeShortCode = selectedCategory.shortCode;

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

    selectedOrderDetail.items.sort((a, b) => a.productTypeId - b.productTypeId);
    this.isNewAddPopUp = false;
  }

  validateQuantity(item: any) {
  // Ensure quantity is not negative
  if (item.qty < 0) {
    item.qty = 0;
  }
  this.calculatePrice(item);
}

preventNegativeInput(event: KeyboardEvent) {
  // Prevent minus key (-) from being entered
  if (event.key === '-' || event.key === 'Subtract') {
    event.preventDefault();
  }
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
