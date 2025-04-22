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
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-view-products-list',
  standalone: true,
  imports: [CommonModule, DropdownModule, NgxPaginationModule, FormsModule, LoadingSpinnerComponent],
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
    { name: '%, Actual, Sale', value: 'AP&SP&D' }
  ];
  selectedDisplayType: any = null;

  categoryOption = [
    { name: 'Retail', value: 'Retail' },
    { name: 'WholeSale', value: 'WholeSale' }
  ];
  selectedCategoryOption: any = null;
  isLoading = false;

  constructor(
    private viewProductsList: ViewProductListService,
    private router: Router,
    private http: HttpClient,
    private tokenService: TokenService
  ) {}

  fetchAllProducts(page: number = 1, limit: number = this.itemsPerPage) {
    this.isLoading = true;
    const displayTypeValue = this.selectedDisplayType ? this.selectedDisplayType.value : '';
    const categoryValue = this.selectedCategoryOption ? this.selectedCategoryOption.value : '';
    this.viewProductsList
      .getProductList(page, limit, this.searchVariety, displayTypeValue, categoryValue)
      .subscribe(
        (response) => {
          console.log('hello world', response);
          this.viewProductList = response.items;
          this.hasData = this.viewProductList.length > 0;
          this.totalItems = response.total;
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching all Products', error);
          if (error.status === 401) {
          }
          this.isLoading = false;
        }
      );
  }

  onDisplayTypeChange() {
    this.page = 1; // Reset to first page when filter changes
    this.fetchAllProducts();
  }

  ngOnInit() {
    this.fetchAllProducts(this.page, this.itemsPerPage);
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllProducts(this.page, this.itemsPerPage); // Include itemsPerPage
  }

  searchProduct() {
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
    }).then((result) => {
      if (result.isConfirmed) {
        this.http
          .delete(`${environment.API_URL}market-place/delete-product/${id}`, {
            headers,
          })
          .subscribe(
            (data: any) => {
              if (data) {
                Swal.fire(
                  'Deleted!',
                  'The product has been deleted.',
                  'success'
                );
                this.fetchAllProducts();
              }
            },
            (error) => {
              console.error('Error deleting product:', error);
              Swal.fire(
                'Error',
                'There was a problem deleting the product.',
                'error'
              );
            }
          );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Your product is safe', 'info');
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
  discount!: number;
  normalPrice!: number;
  promo!: number;
  unitType!: string;
  changeby!: number;
  category!: string;
}
