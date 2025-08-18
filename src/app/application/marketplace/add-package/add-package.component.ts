import { Component, OnInit } from '@angular/core';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-add-package',
  standalone: true,
  imports: [FormsModule, CommonModule, LoadingSpinnerComponent],
  templateUrl: './add-package.component.html',
  styleUrls: ['./add-package.component.css'],
})
export class AddPackageComponent implements OnInit {
  packageObj: Package = new Package();
  productTypeObj: ProductType[] = [];

  selectedImage: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  selectedFileName!: string;
  isLoading: boolean = false;

  // Form state tracking properties
  fieldTouched = {
    displayName: false,
    description: false,
    productPrice: false,
    packageFee: false,
    serviceFee: false,
    image: false,
    quantities: false
  };
  
  submitAttempted = false;

  constructor(private marketSrv: MarketPlaceService, private router: Router) {}


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
      this.router.navigate(['/market/action']);
    }
  });
}


  ngOnInit(): void {
    this.getProductTypes();
  }

  // Field touch tracking methods
  onDisplayNameBlur(): void {
    this.fieldTouched.displayName = true;
  }

  onDescriptionBlur(): void {
    this.fieldTouched.description = true;
  }

  onProductPriceBlur(): void {
    this.fieldTouched.productPrice = true;
  }

  onPackageFeeBlur(): void {
    this.fieldTouched.packageFee = true;
  }

  onServiceFeeBlur(): void {
    this.fieldTouched.serviceFee = true;
  }

  onQuantityBlur(): void {
    this.fieldTouched.quantities = true;
  }

  // Validation getter methods
  get shouldShowDisplayNameError(): boolean {
    return (this.fieldTouched.displayName || this.submitAttempted) && 
           !this.packageObj.displayName?.trim();
  }

  get shouldShowDescriptionError(): boolean {
    return (this.fieldTouched.description || this.submitAttempted) && 
           !this.packageObj.description?.trim();
  }

  get shouldShowProductPriceError(): boolean {
    return (this.fieldTouched.productPrice || this.submitAttempted) && 
           (!this.packageObj.productPrice || this.packageObj.productPrice <= 0);
  }

  get shouldShowPackageFeeError(): boolean {
    return (this.fieldTouched.packageFee || this.submitAttempted) && 
           (this.packageObj.packageFee < 0);
  }

  get shouldShowServiceFeeError(): boolean {
    return (this.fieldTouched.serviceFee || this.submitAttempted) && 
           (this.packageObj.serviceFee < 0);
  }

  get shouldShowImageError(): boolean {
    return (this.fieldTouched.image || this.submitAttempted) && 
           !this.selectedImage;
  }

  get shouldShowQuantityError(): boolean {
    return (this.fieldTouched.quantities || this.submitAttempted) && 
           this.productTypeObj.length > 0 && 
           !Object.values(this.packageObj.quantities).some(qty => qty > 0);
  }

  onDisplayNameChange(event: any): void {
    let value = event.target.value;
    value = value.replace(/^\s+/, '');
    if (value.length > 0) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }
    this.packageObj.displayName = value;
    event.target.value = value;
  }

  preventNegative(event: any): void {
    const value = parseFloat(event.target.value);
    if (value < 0) {
      event.target.value = 0;
      // Update the model value based on the input field
      const inputName = event.target.name;
      if (inputName === 'productPrice') {
        this.packageObj.productPrice = 0;
      } else if (inputName === 'serviceFee') {
        this.packageObj.serviceFee = 0;
      } else if (inputName === 'packageFee') {
        this.packageObj.packageFee = 0;
      }
      this.calculateApproximatedPrice();
    }
  }

  getProductTypes() {
    this.marketSrv.fetchProductTypes().subscribe((res) => {
      this.productTypeObj = res.data;
      console.log('this is type', this.productTypeObj);
      // Initialize quantities with 0 for each product type
      for (let item of this.productTypeObj) {
        this.packageObj.quantities[item.id] = 0;
      }
      console.log('Initial quantities:', this.packageObj.quantities);
    });
  }

  // Fixed method - removed the problematic null check that was resetting values
  onInputChange(id: number, event: Event) {
    const target = event.target as HTMLInputElement;
    // Convert to number, default to 0 if invalid
    const numValue = Number(target.value) || 0;
    this.packageObj.quantities[id] = numValue;
    console.log('Updated quantities:', this.packageObj.quantities);
    console.log(`Product ${id} quantity: ${this.packageObj.quantities[id]}`);
  }

  async onSubmit() {
  this.submitAttempted = true;
  // Mark all fields as touched when submit is attempted
  Object.keys(this.fieldTouched).forEach(key => {
    this.fieldTouched[key as keyof typeof this.fieldTouched] = true;
  });

  // Validation with specific error messages
  let errorMessages: string[] = [];

  // Required field validations
  if (!this.packageObj.displayName?.trim()) {
    errorMessages.push('Display Package Name is required');
  }
  if (!this.packageObj.description?.trim()) {
    errorMessages.push('Description is required');
  }
  if (!this.packageObj.productPrice ) {
    errorMessages.push('Total Package Price is required');
  }
  if (this.packageObj.packageFee === undefined ) {
    errorMessages.push('Packaging Fee is required');
  }
  if (this.packageObj.serviceFee === undefined ) {
    errorMessages.push('Service Fee is required');
  }
  if (!this.selectedImage) {
    errorMessages.push('Package Image is required');
  }
  // if (this.productTypeObj.length > 0 && !Object.values(this.packageObj.quantities).some(qty => qty > 0)) {
  //   errorMessages.push('At least one product type with quantity greater than 0 is required');
  // }

  // // Decimal validation
  // const decimalRegex = /^\d+(\.\d{1,2})?$/;
  // if (!decimalRegex.test(this.packageObj.productPrice?.toString())) {
  //   errorMessages.push('Total Package Price must have up to 2 decimal places');
  // }
  // if (!decimalRegex.test(this.packageObj.packageFee?.toString())) {
  //   errorMessages.push('Packaging Fee must have up to 2 decimal places');
  // }
  // if (!decimalRegex.test(this.packageObj.serviceFee?.toString())) {
  //   errorMessages.push('Service Fee must have up to 2 decimal places');
  // }

  if (errorMessages.length > 0) {
    Swal.fire({
      icon: 'error',
      title: 'Validation Error',
      html: errorMessages.join('<br>'),
      confirmButtonText: 'OK',
    });
    return;
  }

  this.isLoading = true;

  try {
    // Check if display name exists
    const nameCheck = await this.marketSrv
      .checkPackageDisplayName(this.packageObj.displayName)
      .toPromise();

    if (nameCheck.exists) {
      Swal.fire({
        icon: 'error',
        title: 'Package Name Exists',
        text: 'A package with this display name already exists. Please choose a different name.',
        confirmButtonText: 'OK',
      });
      this.isLoading = false;
      return;
    }

    // Proceed with package creation
    this.marketSrv.createPackage(this.packageObj, this.selectedImage).subscribe(
      (res) => {
        if (res.status) {
          Swal.fire({
            icon: 'success',
            title: 'Package Created',
            text: 'The package was created successfully!',
            confirmButtonText: 'OK',
          }).then(() => {
            this.packageObj = new Package();
            this.router.navigate(['/market/action/view-packages-list']);
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Package Not Created',
            text: 'The package could not be created. Please try again.',
            confirmButtonText: 'OK',
          });
        }
        this.isLoading = false;
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'An Error Occurred',
          text: 'There was an error while creating the package. Please try again later.',
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
    }).then((result) => {
      if (result.isConfirmed) {
        this.packageObj = new Package();
        this.router.navigate(['/market/action']);
      }
    });
  }

  onFileSelected(event: any): void {
    this.fieldTouched.image = true; // Mark image as touched when file is selected
    
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
    // Allow only digits (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  allowDecimalNumbers(event: KeyboardEvent) {
  const input = event.target as HTMLInputElement;
  const value = input.value;
  const charCode = event.which ? event.which : event.keyCode;
  
  // Allow numbers 0-9
  if (charCode >= 48 && charCode <= 57) {
    // Check if we're adding to the decimal part and if it already has 2 digits
    if (value.includes('.') && value.split('.')[1].length >= 2) {
      event.preventDefault();
      return false;
    }
    return true;
  }
  
  // Allow decimal point only if not already present and not at the start
  if (charCode === 46) {
    if (value.indexOf('.') !== -1 || value.length === 0) {
      event.preventDefault();
      return false;
    }
    return true;
  }
  
  // Allow backspace, tab, enter, arrows
  if ([8, 9, 13, 37, 39].includes(charCode)) {
    return true;
  }
  
  // Prevent all other key presses
  event.preventDefault();
  return false;
}

validateDecimalInput(event: Event, fieldName: 'productPrice' | 'packageFee' | 'serviceFee') {
  const target = event.target as HTMLInputElement;
  const value = target.value;
  
  if (value === '') {
    // If empty, set to 0
    this.packageObj[fieldName] = 0;
    target.value = '0';
    this.calculateApproximatedPrice();
    return;
  }
  
  // Check for valid number format with up to 2 decimal places
  if (!/^\d*\.?\d{0,2}$/.test(value)) {
    // If invalid, reset to previous valid value or 0
    target.value = this.packageObj[fieldName]?.toFixed(2) || '0.00';
    this.packageObj[fieldName] = parseFloat(target.value) || 0;
    this.calculateApproximatedPrice();
    return;
  }
  
  // Round to 2 decimal places if needed
  const numValue = parseFloat(value);
  if (!isNaN(numValue)) {
    const roundedValue = Math.round(numValue * 100) / 100;
    if (roundedValue !== numValue) {
      target.value = roundedValue.toFixed(2);
      this.packageObj[fieldName] = roundedValue;
      this.calculateApproximatedPrice();
    }
  }
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
  quantities: { [id: number]: number } = {};
}

class ProductType {
  typeName!: string;
  shortCode!: string;
  id!: number;
}