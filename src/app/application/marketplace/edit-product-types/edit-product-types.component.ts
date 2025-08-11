// import { Component, OnInit } from '@angular/core';
// import { MarketPlaceService } from '../../../services/market-place/market-place.service';
// import { ActivatedRoute, Router } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import Swal from 'sweetalert2';

// @Component({
//   selector: 'app-edit-product-types',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './edit-product-types.component.html',
//   styleUrl: './edit-product-types.component.css'
// })
// export class EditProductTypesComponent implements OnInit {
//   productObj: ProductType = new ProductType();

//   productTypeId!: number;
//   isLoading: boolean = true;

//   constructor(
//     private marketSrv: MarketPlaceService,
//     private router: Router,
//     private route: ActivatedRoute
//   ) { }

//   ngOnInit(): void {
//     this.productTypeId = this.route.snapshot.params['id'];
//     this.fetchType();
//   }

//   fetchType(){
//     this.isLoading = true;
//     this.marketSrv.getAllProductTypeById(this.productTypeId).subscribe(
//       (res)=>{
//         if (res.status) {
//           this.productObj = res.data;
//           this.isLoading = false;
//         } else {
//           Swal.fire({
//             icon: 'error',
//             title: 'Error',
//             text: res.message || 'Failed to fetch product type details.',
//           });
//           this.isLoading = false;
//           this.router.navigate(['/market/action/view-product-types']);
//         }
//       }
//     )
//   }

//   back(): void {
//   Swal.fire({
//     icon: 'warning',
//     title: 'Are you sure?',
//     text: 'You may lose the added data after going back!',
//     showCancelButton: true,
//     confirmButtonText: 'Yes, Go Back',
//     cancelButtonText: 'No, Stay Here',
//   }).then((result) => {
//     if (result.isConfirmed) {
//       this.router.navigate(['market/action/view-product-types']);
//     }
//   });
// }

// onCancel() {
//   Swal.fire({
//     icon: 'warning',
//     title: 'Are you sure?',
//     text: 'You may lose the added data after canceling!',
//     showCancelButton: true,
//     confirmButtonText: 'Yes, Cancel',
//     cancelButtonText: 'No, Keep Editing',
//   }).then((result) => {
//     if (result.isConfirmed) {
//       this.router.navigate(['market/action/view-product-types']);
//     }
//   });
// }

//   editType() {
//     if (!this.productObj.typeName || !this.productObj.shortCode) {
//       return
//     }
//     this.marketSrv.editProductType(this.productObj, this.productTypeId).subscribe({
//       next: (res) => {
//         if (res.status) {
//           Swal.fire({
//             icon: 'success',
//             title: 'Success',
//             text: res.message || 'Product type edited successfully.',
//           });
//           this.router.navigate(['/market/action/view-product-types']);
//         } else {
//           Swal.fire({
//             icon: 'error',
//             title: 'Error',
//             text: res.message || 'Failed to create product type.',
//           })
//         }

//       },
//       error: (err) => {
//         console.error(err);
//       }
//     });
//   }

//   onTypeNameInput(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     const original = input.value;
//     const trimmed = original.replace(/^\s+/, ''); // Remove leading spaces
//     if (original !== trimmed) {
//       input.value = trimmed; // Update the input's display value
//     }
//     this.productObj.typeName = trimmed; // Update the model
//   }
  
//   onShortCodeInput(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     const original = input.value;
//     const trimmedAndCapitalized = original.replace(/^\s+/, '').toUpperCase();
//     input.value = trimmedAndCapitalized;
//     this.productObj.shortCode = trimmedAndCapitalized;
//   }

// }

// class ProductType {
//   typeName!: string;
//   shortCode!: string;
// }

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

  // Only letters allowed for Short Code (1–3 uppercase letters)
  const shortCodePattern = /^[A-Za-z]{1,3}$/;
  if (!shortCodePattern.test(this.productObj.shortCode)) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Short Code must be 1 to 3 uppercase letters (A–Z) only.',
    });
    return;
  }

  // Duplicate Name + Short Code
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

  // Duplicate Name only
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

  // Duplicate Short Code only
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

  // Proceed with update
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

  // Allow only English letters (A–Z, a–z) and spaces
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
