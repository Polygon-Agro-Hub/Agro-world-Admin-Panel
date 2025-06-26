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
    this.router.navigate(['market/action/view-packages-list']);
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params && params['id']) {
        this.packageId = +params['id'];
        console.log(this.packageId);
        if (this.packageId) {
          this.getProductTypes();
          this.getPackageDetails();
          // this.calculateApproximatedPrice()
          // this.getPackage();
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
      // console.log('this is type', this.productTypeObj);
      // // Initialize quantities with 0 for each product type
      this.selectedImage = this.packageObj.imageUrl;
    });
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
    console.log('selected image', this.selectedImage);
    console.log('submit', this.packageObj);
    console.log('Final quantities:', this.packageObj.quantities);

    // First validate all required fields
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

    // Check if at least one quantity is > 0
    const hasAtLeastOneQuantity = Object.values(
      this.packageObj.quantities
    ).some((qty) => qty > 0);

    if (!hasAtLeastOneQuantity) {
      Swal.fire({
        icon: 'error',
        title: 'No product type selected',
        text: 'You should select at least on product type.',
        confirmButtonText: 'OK',
      });
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    try {
      // First check if display name exists (excluding current package)
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

      // If name doesn't exist or is the same as current package, proceed with update
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
                text: 'The package could not be updated. Please try again.',
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
    }).then((result) => {
      if (result.isConfirmed) {
        this.packageObj = new Package();
        this.router.navigate(['/market/action']);
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
    // Allow only digits (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
  allowDecimalNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    // Allow numbers 0-9
    if (charCode >= 48 && charCode <= 57) {
      return true;
    }
    // Allow decimal point
    if (charCode === 46) {
      const currentValue = (event.target as HTMLInputElement).value;
      // Prevent more than one decimal point
      return currentValue.indexOf('.') === -1;
    }
    // Allow backspace, tab, enter, arrows
    if ([8, 9, 13, 37, 39].includes(charCode)) {
      return true;
    }
    // Prevent all other key presses
    event.preventDefault();
    return false;
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
  imageUrl!: string;
}

class ProductType {
  typeName!: string;
  shortCode!: string;
  id!: number;
}
