import { Component, OnInit } from '@angular/core';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-product-types',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-product-types.component.html',
  styleUrl: './edit-product-types.component.css'
})
export class EditProductTypesComponent implements OnInit {
  productObj: ProductType = new ProductType();

  productTypeId!: number;
  isLoading: boolean = true;

  constructor(
    private marketSrv: MarketPlaceService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.productTypeId = this.route.snapshot.params['id'];
    this.fetchType();
  }

  fetchType(){
    this.isLoading = true;
    this.marketSrv.getAllProductTypeById(this.productTypeId).subscribe(
      (res)=>{
        if (res.status) {
          this.productObj = res.data;
          this.isLoading = false;
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: res.message || 'Failed to fetch product type details.',
          });
          this.isLoading = false;
          this.router.navigate(['/market/action/view-product-types']);
        }
      }
    )
  }

  editType() {
    if (!this.productObj.typeName || !this.productObj.shortCode) {
      return
    }
    this.marketSrv.editProductType(this.productObj, this.productTypeId).subscribe({
      next: (res) => {
        if (res.status) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: res.message || 'Product type edited successfully.',
          });
          this.router.navigate(['/market/action/view-product-types']);
        } else {
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

  onTypeNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const original = input.value;
    const trimmed = original.replace(/^\s+/, ''); // Remove leading spaces
    if (original !== trimmed) {
      input.value = trimmed; // Update the input's display value
    }
    this.productObj.typeName = trimmed; // Update the model
  }
  
  onShortCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const original = input.value;
    const trimmedAndCapitalized = original.replace(/^\s+/, '').toUpperCase();
    input.value = trimmedAndCapitalized;
    this.productObj.shortCode = trimmedAndCapitalized;
  }

}

class ProductType {
  typeName!: string;
  shortCode!: string;
}
