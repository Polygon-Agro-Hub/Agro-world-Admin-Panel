import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';

@Component({
  selector: 'app-view-product-types',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-product-types.component.html',
  styleUrl: './view-product-types.component.css',
})
export class ViewProductTypesComponent implements OnInit {
  productArr: ProductType[] = []

  hasData: boolean = false;
  productCount: number = 0;

  constructor(
    private marketSrv: MarketPlaceService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.fetchProductType();
  }

  fetchProductType() {
    this.marketSrv.getAllProductType().subscribe(
      (res) => {
        this.productArr = res.data;
        this.productCount = res.data.length
        this.productCount > 0 ? this.hasData = true : this.hasData = false;
      }
    )
  }

  navigateToBack(): void {
    this.router.navigate(['/market/action']);
  }

  navigateToAdd(): void {
    this.router.navigate(['/market/action/add-product-type']);
  }
}


class ProductType {
  id!: number;
  typeName!: string;
  shortCode!: string;
}
