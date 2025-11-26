import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { ViewProductListService } from '../../../services/market-place/view-product-list.service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from '../../../environment/environment';
import { error } from 'console';
import { NgxPaginationModule } from 'ngx-pagination';
import { TokenService } from '../../../services/token/services/token.service';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { PermissionService } from '../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-view-products-list',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    NgxPaginationModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './view-products-list.component.html',
  styleUrl: './view-products-list.component.css',
})
export class ViewProductsListComponent {
  viewProductList: ProductList[] = [];
  page: number = 1;
  searchVariety: string = '';
  itemsPerPage: number = 10;
  hasData: boolean = true;
  totalItems: number = 0;
  displayOptions = [
    { name: '%, Actual', value: 'D&AP' },
    { name: 'Actual, Sale', value: 'AP&SP' },
    { name: '%, Actual, Sale', value: 'AP&SP&D' },
    { name: 'No Discount', value: 'NoDiscount' }, // Changed from 'No' to 'NoDiscount'
  ];
  selectedDisplayType: any = null;

  categoryOption = [
    { name: 'Retail', value: 'Retail' },
    { name: 'WholeSale', value: 'WholeSale' },
  ];
  selectedCategoryOption: any = null;
  isLoading = false;

  constructor(
    private viewProductsList: ViewProductListService,
    private router: Router,
    private http: HttpClient,
    public tokenService: TokenService,
    public permissionService: PermissionService,

  ) { }

  fetchAllProducts(
    page: number = 1,
    limit: number = this.itemsPerPage,
    search: string = this.searchVariety,
    displayType: string = this.selectedDisplayType?.value,
    category: string = this.selectedCategoryOption?.value
  ) {
    this.isLoading = true;
    const trimmedSearch = search.trim();

    // Handle "No Discount" case
    let displayTypeValue = displayType || '';
    let discountFilter = '';

    if (displayTypeValue === 'NoDiscount') {
      displayTypeValue = ''; // Clear displayType filter
      discountFilter = 'zero'; // Add special flag for discount filter
    }

    const categoryValue = category || '';

    this.viewProductsList
      .getProductList(page, limit, trimmedSearch, displayTypeValue, categoryValue, discountFilter)
      .subscribe(
        (response) => {
          console.log('this is the response', response);
          this.viewProductList = response.items;
          this.hasData = this.viewProductList.length > 0;
          this.totalItems = response.total;
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching all Products', error);
          this.isLoading = false;
          if (error.status === 401) {
            Swal.fire('Unauthorized', 'Please log in again.', 'error');
          } else {
            Swal.fire('Error', 'Failed to fetch products.', 'error');
          }
        }
      );
  }

  onDisplayTypeChange() {
    this.page = 1;
    this.fetchAllProducts();
  }

  ngOnInit() {
    this.fetchAllProducts(this.page, this.itemsPerPage);
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllProducts(this.page, this.itemsPerPage);
  }

  searchProduct() {
    this.searchVariety = this.searchVariety.trim(); // Trim leading/trailing spaces
    if (!this.searchVariety) {
      Swal.fire('Info', 'Please enter a valid search term.', 'info');
      return;
    }
    this.page = 1;
    this.fetchAllProducts(this.page, this.itemsPerPage);
  }

  clearSearch(): void {
    this.searchVariety = '';
    this.fetchAllProducts(this.page, this.itemsPerPage);
  }

  deleteProduct(id: any) {
    const token = this.tokenService.getToken();

    if (!token) {
      console.error('No token found');
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this product? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-white dark:bg-[#363636] text-gray-800 dark:text-white',
        title: 'dark:text-white',
        icon: '!border-gray-200 dark:!border-gray-500',
        confirmButton: 'hover:!bg-[#3085d6] dark:hover:!bg[#3085d6]',
        cancelButton: '',
        actions: 'gap-2'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.http
          .delete(`${environment.API_URL}market-place/delete-product/${id}`, {
            headers,
          })
          .subscribe(
            (data: any) => {
              if (data) {
                Swal.fire({
                  title: 'Deleted',
                  text: 'The product has been deleted.',
                  icon: 'success',
                  customClass: {
                    popup: 'bg-white dark:bg-[#363636] text-gray-800 dark:text-white',
                    title: 'dark:text-white',
                  }
                });
                this.fetchAllProducts();
              }
            },
            (error) => {
              console.error('Error deleting product:', error);

              Swal.fire({
                title: 'Error',
                text: 'There was a problem deleting the product.',
                icon: 'error',
                customClass: {
                  popup: 'bg-white dark:bg-[#363636] text-gray-800 dark:text-white',
                  title: 'dark:text-white',
                }
              });
            }
          );
      }
    });
  }

  calculateSalePrice(actual: number, precentage: number): number {
    return actual - actual * (precentage / 100);
  }

  checkDiscount(price: number): string {
    if (price > 0) {
      return '% Actual, Sales';
    } else {
      return 'Actual, Sales';
    }
  }

  editProduct(id: number) {
    this.router.navigate([`/market/action/edit-product/${id}`]);
  }

  navigateToAddProduct(): void {
    this.router.navigate(['/market/action/add-product']);
  }

  showMaxQuantityColumn(): boolean {
    // Show if no category selected or if WholeSale is selected
    return (
      !this.selectedCategoryOption ||
      this.selectedCategoryOption.value === 'WholeSale'
    );
  }

  formatDiscountPercentage(discount: number, normalPrice: number): string {
  if (discount <= 0 || normalPrice <= 0) {
    return 'No';
  }
  
  const percentage = (discount / normalPrice) * 100;
  const percentageValue = Number(percentage.toFixed(2));
  
  // Check if the percentage is a whole number
  if (percentageValue % 1 === 0) {
    return `${percentageValue.toFixed(0)}%`; // Display as whole number
  } else {
    return `${percentageValue}%`; // Display with decimals
  }
}
}

class ProductList {
  id!: number;
  cropId!: number;
  cropNameEnglish!: string;
  displayName!: string;
  displayType!: string;
  method!: string;
  varietyNameEnglish!: string;
  discountedPrice: number = -1;
  startValue!: number;
  maxQuantity!: number;
  discount!: number;
  normalPrice!: number;
  promo!: number;
  unitType!: string;
  changeby!: number;
  category!: string;
}
