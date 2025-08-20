import { Component } from '@angular/core';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-market-edit-packages',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './market-edit-packages.component.html',
  styleUrl: './market-edit-packages.component.css',
})
export class MarketEditPackagesComponent {
  packageId!: number;

  packageObj: Package = new Package();
  productTypeObj: ProductType[] = [];
  error!: string;

  selectedImage: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  selectedFileName!: string;
  isLoading: boolean = false;

  constructor(
    private marketSrv: MarketPlaceService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

 

  back(): void {
  Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: 'You may lose the added data after going back!',
    showCancelButton: true,
    confirmButtonText: 'Yes, Go Back',
    cancelButtonText: 'No, Stay Here',
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
    },
  }).then((result) => {
    if (result.isConfirmed) {
 this.router.navigate(['market/action/view-packages-list']);
  }

  });
}


  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params && params['id']) {
        this.packageId = +params['id'];
        console.log(this.packageId);
        if (this.packageId) {
          this.getProductTypes();
          this.getPackageDetails();
          this.calculateApproximatedPrice();
        } else {
          console.error('No package ID provided');
          this.error = 'No package ID provided';
        }
      } else {
        console.error('Params are undefined');
        this.error = 'Failed to retrieve route parameters';
      }
    });
  }

  getPackageDetails() {
    this.marketSrv.getPackageById(this.packageId).subscribe((res) => {
      console.log('this is response', res);
      this.packageObj = res;
      this.selectedImage = this.packageObj.imageUrl;

      // ✅ Sort items by typeName alphabetically
      this.packageObj.packageItems.sort((a, b) => {
        const nameA = a.typeName?.toLowerCase() || '';
        const nameB = b.typeName?.toLowerCase() || '';
        return nameA.localeCompare(nameB);
      });
    });
  }

  getProductTypes() {
    this.marketSrv.fetchProductTypes().subscribe((res) => {
      this.productTypeObj = res.data;
      console.log('this is type', this.productTypeObj);
    });
  }

preventNegative(event: any): void {
  const value = parseFloat(event.target.value);
  if (value < 0) {
    event.target.value = 0;
    event.target.dispatchEvent(new Event('input'));
  }
}

  async onSubmit() {
    console.log('selected image', this.selectedImage);
    console.log('submit', this.packageObj);

    if (
      !this.packageObj.displayName ||
      !this.packageObj.description ||
      !this.packageObj.productPrice ||
      !this.packageObj.packageFee ||
      !this.packageObj.serviceFee ||
      !this.selectedImage
    ) {
      let errorMessage = '';

      if (!this.packageObj.displayName)
        errorMessage += 'Display Package Name is required.<br>';
      if (!this.packageObj.description)
        errorMessage += 'Description is required.<br>';
      if (!this.packageObj.productPrice)
        errorMessage += 'Product price is required.<br>';
      if (!this.packageObj.packageFee)
        errorMessage += 'Package fee is required.<br>';
      if (!this.packageObj.serviceFee)
        errorMessage += 'Service fee is required.<br>';
      if (!this.selectedImage) errorMessage += 'Package Image is required.<br>';

      Swal.fire({
        icon: 'error',
        title: 'Missing Required Fields',
        html: errorMessage,
        confirmButtonText: 'OK',
      });
      this.isLoading = false;
      return;
    }
     const hasValidQty = this.packageObj.packageItems.some(
    (item) => item.qty !== null && item.qty > 0
  );

  if (!hasValidQty) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Input',
      text: 'At least one quantity field must be greater than 0.',
      confirmButtonText: 'OK',
    });
    this.isLoading = false;
    return;
  }


    try {
      this.marketSrv
        .editPackage(this.packageObj, this.selectedImage, this.packageId)
        .subscribe(
          (res) => {
            if (res.status) {
              Swal.fire({
                icon: 'success',
                title: 'Package Updated',
                text: 'The package was updated successfully!',
                confirmButtonText: 'OK',
              }).then(() => {
                this.packageObj = new Package();
                this.router.navigate(['/market/action/view-packages-list']);
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Package Not Updated',
                text: res.message,
                confirmButtonText: 'OK',
              });
            }
            this.isLoading = false;
          },
          (error) => {
            Swal.fire({
              icon: 'error',
              title: 'An Error Occurred',
              text: 'There was an error while updating the package. Please try again later.',
              confirmButtonText: 'OK',
            });
            this.isLoading = false;
          }
        );
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'An Error Occurred',
        text: 'There was an error checking the package name. Please try again later.',
        confirmButtonText: 'OK',
      });
      this.isLoading = false;
    }
  }

  onCancel() {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after canceling!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'No, Keep Editing',
      customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
    },
    }).then((result) => {
      if (result.isConfirmed) {
        this.packageObj = new Package();
         this.router.navigate(['market/action/view-packages-list']);
      }
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        Swal.fire('Error', 'File size should not exceed 5MB', 'error');
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire('Error', 'Only JPEG, JPG and PNG files are allowed', 'error');
        return;
      }

      this.selectedFile = file;
      this.packageObj.image = file;
      this.selectedFileName = file.name;
      this.packageObj.selectedFileName = file.name;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFileInput(event: Event): void {
    event.preventDefault();
    const fileInput = document.getElementById('imageUpload');
    fileInput?.click();
  }

  calculateApproximatedPrice() {
    const productPrice = Number(this.packageObj.productPrice) || 0.0;
    const serviceFee = Number(this.packageObj.serviceFee) || 0.0;
    const packageFee = Number(this.packageObj.packageFee) || 0.0;

    this.packageObj.approximatedPrice =
      productPrice + (serviceFee + packageFee);

    console.log('Approximated Price:', this.packageObj.approximatedPrice);
    return this.packageObj.approximatedPrice;
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  allowDecimalNumbers(event: KeyboardEvent): boolean {
  const input = event.target as HTMLInputElement;
  const value = input.value;
  const key = event.key;
  
  // Allow: backspace, delete, tab, escape, enter
  if ([8, 9, 13, 27].includes(event.keyCode)) {
    return true;
  }
  
  // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
  if ((event.ctrlKey || event.metaKey) && [65, 67, 86, 88].includes(event.keyCode)) {
    return true;
  }
  
  // Allow: left arrow, right arrow, home, end
  if ([37, 39, 36, 35].includes(event.keyCode)) {
    return true;
  }
  
  // Only allow numbers and one decimal point
  if ((event.keyCode < 48 || event.keyCode > 57) && event.keyCode !== 46) {
    event.preventDefault();
    return false;
  }
  
  // Check for existing decimal point
  if (event.key === '.' && value.includes('.')) {
    event.preventDefault();
    return false;
  }
  
  // If there's already a decimal point, limit to 2 decimal places
  if (value.includes('.')) {
    const decimalParts = value.split('.');
    if (decimalParts[1].length >= 2) {
      event.preventDefault();
      return false;
    }
  }
  
  return true;
}

  trackByFn(index: number, item: any): any {
    return item.productTypeId;
  }

  validateDecimalInput(event: any): void {
  const input = event.target as HTMLInputElement;
  let value = input.value;
  
  // Remove any invalid characters
  value = value.replace(/[^0-9.]/g, '');
  
  // Handle cases with multiple decimal points
  const decimalParts = value.split('.');
  if (decimalParts.length > 2) {
    value = decimalParts[0] + '.' + decimalParts.slice(1).join('');
  }
  
  // Ensure maximum of 2 decimal places
  if (decimalParts.length === 2) {
    value = decimalParts[0] + '.' + decimalParts[1].slice(0, 2);
  }
  
  // Update the input value
  input.value = value;
  
  // Update the model if needed
  if (input.name === 'productPrice') {
    this.packageObj.productPrice = value ? parseFloat(value) : 0;
  } else if (input.name === 'serviceFee') {
    this.packageObj.serviceFee = value ? parseFloat(value) : 0;
  } else if (input.name === 'packageFee') {
    this.packageObj.packageFee = value ? parseFloat(value) : 0;
  }
  
  this.calculateApproximatedPrice();
}

}

class Package {
  displayName!: string;
  status: string = 'Enabled';
  cID!: number;
  total!: number;
  description!: string;
  image!: any;
  selectedFileName!: string;
  productPrice!: number;
  packageFee!: number;
  serviceFee!: number;
  approximatedPrice!: number;
  imageUrl!: string;
  packageItems: PackageItems[] = [];
}

class ProductType {
  typeName!: string;
  shortCode!: string;
  id!: number;
}

class PackageItems {
  id!: number | null;
  productTypeId!: number | null;
  typeName!: string | null; // ✅ Fixed type
  qty!: number | null;
}
