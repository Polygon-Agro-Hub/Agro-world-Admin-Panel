

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
  originalTypeName: string = ''; // Store the original typeName
  originalShortCode: string = ''; // Store the original shortCode
  productObj: ProductType = new ProductType();
  productTypeId!: number;
  isLoading: boolean = true;
  existingProductTypes: ProductType[] = [];

  constructor(
    private marketSrv: MarketPlaceService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

ngOnInit(): void {
    this.productTypeId = this.route.snapshot.params['id'];
    this.fetchType();
    this.fetchProductTypes();
  }

  fetchType() {
    this.isLoading = true;
    this.marketSrv.getAllProductTypeById(this.productTypeId).subscribe(
      (res) => {
        if (res.status) {
          this.productObj = res.data;
          this.originalTypeName = res.data.typeName; // Store original typeName
          this.originalShortCode = res.data.shortCode; // Store original shortCode
          
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: res.message || 'Failed to fetch product type details.',
          });
          this.router.navigate(['/market/action/view-product-types']);
        }
        this.isLoading = false;
      }
    );
  }
  fetchProductTypes() {
    this.marketSrv.getAllProductType().subscribe({
      next: (res) => {
        // exclude the current editing one from the duplicate check
        this.existingProductTypes = res.data.filter(
          (p: ProductType) => p.id !== this.productTypeId
        );
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch existing product types.',
        });
      }
    });
  }

  back(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after going back!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Go Back',
      cancelButtonText: 'No, Stay Here',
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['market/action/view-product-types']);
      }
    });
  }

  onCancel() {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after canceling!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'No, Keep Editing',
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['market/action/view-product-types']);
      }
    });
  }

editType() {
    const errors: string[] = [];

    // Required field: Type Name
    if (!this.productObj.typeName) {
      errors.push('Type Name is required');
    }

    // Required field: Short Code
    if (!this.productObj.shortCode) {
      errors.push('Short Code is required');
    }

    // Short Code must be exactly 3 letters
    const shortCodePattern = /^[A-Za-z]{3}$/;
    if (this.productObj.shortCode && !shortCodePattern.test(this.productObj.shortCode)) {
      errors.push('Short Code must be exactly 3 letters (A–Z)');
    }

    // For duplicate checks, use the filtered list of other products
    const otherProducts = this.existingProductTypes;

    // Check for duplicate Type Name only if it has changed
    if (this.productObj.typeName !== this.originalTypeName) {
      const duplicateName = otherProducts.find(
        p => p.typeName.toLowerCase() === this.productObj.typeName?.toLowerCase()
      );
      if (duplicateName) {
        errors.push('A product type with this Name already exists');
      }
    }

    // Check for duplicate Short Code only if it has changed
    if (this.productObj.shortCode !== this.originalShortCode) {
      const duplicateCode = otherProducts.find(
        p => p.shortCode.toLowerCase() === this.productObj.shortCode?.toLowerCase()
      );
      if (duplicateCode) {
        errors.push('The Short Code is already used by another product');
      }
    }

    // Show errors if any
    if (errors.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        html: errors.map(err => `<p>${err}</p>`).join(''),
      });
      return;
    }

    // Proceed with update
    this.marketSrv.editProductType(this.productObj, this.productTypeId).subscribe({
      next: (res) => {
        if (res.status) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: res.message || 'Product type edited successfully.',
          }).then(() => {
            this.router.navigate(['/market/action/view-product-types']);
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: res.message || 'Failed to update product type.',
          });
        }
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while updating the product type.',
        });
      }
    });
  }
onTypeNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Remove leading spaces
    value = value.replace(/^\s+/, '');

    // Allow only English letters (A–Z, a–z) and spaces, remove Sinhala/Tamil characters
    value = value.replace(/[\u0D80-\u0DFF\u0B80-\u0BFF]/g, ''); // Sinhala: U+0D80–U+0DFF, Tamil: U+0B80–U+0BFF
    value = value.replace(/[^A-Za-z\s]/g, '');

    input.value = value;
    this.productObj.typeName = value;
  }

onShortCodeInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  let value = input.value;

  // 1. Remove leading spaces
  value = value.replace(/^\s+/, '');

  // 2. Remove anything that is NOT a letter (A–Z or a–z)
  value = value.replace(/[^A-Za-z]/g, '');

  // 3. Convert to uppercase
  value = value.toUpperCase();

  // 4. Assign back to input and model
  input.value = value;
  this.productObj.shortCode = value;
}


}

class ProductType {
  id?: number;
  typeName!: string;
  shortCode!: string;
}
