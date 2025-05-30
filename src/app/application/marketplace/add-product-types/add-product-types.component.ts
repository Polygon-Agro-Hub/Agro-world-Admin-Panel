import { Component } from '@angular/core';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-product-types',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-product-types.component.html',
  styleUrl: './add-product-types.component.css'
})
export class AddProductTypesComponent {
  productObj: ProductType = new ProductType();

  constructor(
    private marketSrv: MarketPlaceService,
    private router: Router
  ) { }

  createType() {
    if(!this.productObj.typeName || !this.productObj.shortCode) {
      return
    }
    this.marketSrv.createProductType(this.productObj).subscribe({
      next: (res) => {
        if (res.status) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: res.message || 'Product type created successfully.',
          });
          this.router.navigate(['/market/action/view-product-types']);
        }else{
          Swal.fire({
            icon: 'error', 
            title: 'Error',
            text: res.message || 'Failed to create product type.',
          })
        }

      },
      error: (err) => {
        console.error(err);
      }
    });
  }



}

class ProductType {
  typeName!: string;
  shortCode!: string;
}
