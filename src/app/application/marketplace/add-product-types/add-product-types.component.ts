import { Component } from '@angular/core';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location  } from '@angular/common';

@Component({
  selector: 'app-add-product-types',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-product-types.component.html',
  styleUrl: './add-product-types.component.css'
})
export class AddProductTypesComponent {
  productObj: ProductType = new ProductType();
  existingProductTypes: ProductType[] = [];

  constructor(
    private marketSrv: MarketPlaceService,
    private router: Router,
    private location: Location
  ) {
    // Fetch existing product types on component initialization
    this.fetchProductTypes();
  }

  fetchProductTypes() {
    this.marketSrv.getAllProductType().subscribe({
      next: (res) => {
        this.existingProductTypes = res.data;
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
      this.location.back();
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
      this.location.back();
    }
  });
}



onTypeNameInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  let value = input.value;

  value = value.replace(/^\s+/, '');


  value = value.replace(/[^A-Za-z\s]/g, '');

  if (value.length > 0) {
    value = value.charAt(0).toUpperCase() + value.slice(1);
  }

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

createType() {
  // Check if fields are empty
  const missingFields: string[] = [];
  
  if (!this.productObj.typeName) {
    missingFields.push('Type Name');
  }
  if (!this.productObj.shortCode) {
    missingFields.push('Short Code');
  }
  
  if (missingFields.length > 0) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: `${missingFields.join(' and ')} ${missingFields.length > 1 ? 'are' : 'is'} required.`,
    });
    return;
  }
  
  // Validate shortCode: must be exactly 3 uppercase letters (A-Z)
  const shortCodePattern = /^[A-Z]{3}$/;
  if (!shortCodePattern.test(this.productObj.shortCode)) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Short Code must be exactly 3 uppercase letters (A–Z) only.',
    });
    return;
  }

  // Check for duplicate product type name and short code
  const duplicateType = this.existingProductTypes.find(
    product => 
      product.typeName.toLowerCase() === this.productObj.typeName.toLowerCase() &&
      product.shortCode.toLowerCase() === this.productObj.shortCode.toLowerCase()
  );

  if (duplicateType) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'You already have a product type with this name and short code',
    });
    return;
  }

  // Check for duplicate product type name
  const duplicateName = this.existingProductTypes.find(
    product => product.typeName.toLowerCase() === this.productObj.typeName.toLowerCase()
  );

  if (duplicateName) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'You already have a product type with this name',
    });
    return;
  }

  // Check for duplicate short code
  const duplicateCode = this.existingProductTypes.find(
    product => product.shortCode.toLowerCase() === this.productObj.shortCode.toLowerCase()
  );

  if (duplicateCode) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'You already have a product type with this short code',
    });
    return;
  }

  // Proceed with API call
  this.marketSrv.createProductType(this.productObj).subscribe({
    next: (res) => {
      if (res.status) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: res.message || 'Product type created successfully.',
        });
        this.router.navigate(['/market/action/view-product-types']);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: res.message || 'Failed to create product type.',
        });
      }
    },
    error: (err) => {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while creating the product type.',
      });
    },
  });
}}

class ProductType {
  typeName!: string;
  shortCode!: string;
}