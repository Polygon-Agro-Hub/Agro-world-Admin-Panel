import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { ViewProductListService } from '../../../services/market-place/view-product-list.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-products-list',
  standalone: true,
  imports: [CommonModule, DropdownModule],
  templateUrl: './view-products-list.component.html',
  styleUrl: './view-products-list.component.css',
})
export class ViewProductsListComponent {
  viewProductList: ProductList[] = [];
  constructor(
    private viewProductsList: ViewProductListService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchAllProducts();
  }
  fetchAllProducts() {
    this.viewProductsList.getProductList().subscribe(
      (response) => {
        console.log('hello world', response);
        this.viewProductList = response.items;
      },
      (error) => {
        console.error('Error fetching all Products', error);
        if (error.status === 401) {
        }
      }
    );
  }
}

class ProductList {
  itemId!: number;
  cropId!: number;
  itemDisplayName!: string;
  itemNormalPrice!: number;
  itemDiscountedPrice!: number;
  itemPromo!: number;
  unitType!: string;
  startValue!: number;
  changeby!: number;
  cropVarietyEnglish!: string;
  cropNameEnglish!:string;
}
