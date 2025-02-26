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

@Component({
  selector: 'app-view-products-list',
  standalone: true,
  imports: [CommonModule, DropdownModule, NgxPaginationModule],
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

  constructor(
    private viewProductsList: ViewProductListService,
    private router: Router,
    private http: HttpClient,
    private tokenService: TokenService

  ) {}

  fetchAllProducts(page: number = 1, limit: number = this.itemsPerPage) {
    this.viewProductsList
      .getProductList(page, limit, this.searchVariety)
      .subscribe(
        (response) => {
          console.log('hello world', response);
          this.viewProductList = response.items;
          this.hasData = this.viewProductList.length > 0;
          this.totalItems = response.total;
        },
        (error) => {
          console.error('Error fetching all Products', error);
          if (error.status === 401) {
          }
        }
      );
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

  editProduct(id:number){
    this.router.navigate([`/market/action/edit-product/${id}`])
  }
}

class ProductList {
  id!: number;
  cropId!: number;
  cropNameEnglish!: string;
  displayName!: string;
  method!: string;
  varietyNameEnglish!: string;
  discountedPrice: number = -1;
  startValue!: number;
  normalPrice!: number;
  promo!: number;
  unitType!: string;
  changeby!: number;
  category!:string;
}
