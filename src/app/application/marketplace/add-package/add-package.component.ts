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
  cropObj: Crop[] = [];
  selectedVarieties: Variety[] = [];
  selectedPrice: Variety = new Variety();
  packageObj: Package = new Package();
  inputPackageObj: InputPackage = new InputPackage();

  selectedImage: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  selectedFileName!: string;
  isLoading: boolean = false;

  constructor(private marketSrv: MarketPlaceService, private router: Router) {}

  back(): void {
    this.router.navigate(['/market/action']);
  }

  ngOnInit(): void {
    this.getCropProductData();
    this.packageObj.Items = [];
  }

  getCropProductData() {
    this.marketSrv.getProuctCropVerity().subscribe((res) => {
      this.cropObj = res.sort(
        (a: { cropNameEnglish: string }, b: { cropNameEnglish: any }) =>
          a.cropNameEnglish.localeCompare(b.cropNameEnglish)
      );
    });
  }

  onCropChange() {
    const selectedCrop = this.cropObj.find(
      (crop) => crop.cropId === +this.inputPackageObj.cID
    );
    if (selectedCrop) {
      // Sort varieties by displayName in ascending order
      this.selectedVarieties = selectedCrop.variety.sort((a, b) =>
        a.displayName.localeCompare(b.displayName)
      );
    } else {
      this.selectedVarieties = [];
    }
  }
  onPriceChange() {
    const selectedVariety = this.selectedVarieties.find(
      (variety) => variety.id === +this.inputPackageObj.mpItemId
    );
    if (selectedVariety) {
      this.selectedPrice = { ...selectedVariety };
    } else {
      this.selectedPrice = new Variety();
    }
  }

  onAdd() {
    // Check for required fields
    if (
      !this.inputPackageObj.qtytype ||
      !this.inputPackageObj.mpItemId ||
      !this.inputPackageObj.cID

    ) {
      let errorMessage = 'Please fill in all the required fields:';

      if (!this.inputPackageObj.qtytype) errorMessage += '<br>- Quantity Type';
      if (!this.inputPackageObj.mpItemId) errorMessage += '<br>- Variety';
      if (!this.inputPackageObj.cID) errorMessage += '<br>- Crop';


      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        html: errorMessage,
        confirmButtonText: 'OK',
      });
      return;
    }


    if (
      !this.inputPackageObj.quantity
    ) {
      let errorMessage = 'You cannot add 0 as the product Quantity';

     

      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        html: errorMessage,
        confirmButtonText: 'OK',
      });
      return;
    }

    // Convert input quantity to kg if grams are selected
    const quantityInKg =
      this.inputPackageObj.qtytype === 'g'
        ? this.inputPackageObj.quantity / 1000
        : this.inputPackageObj.quantity;

    // Check if item already exists in the package
    const existingItemIndex = this.packageObj.Items.findIndex(
      (item) => item.mpItemId === this.inputPackageObj.mpItemId
    );

    if (existingItemIndex !== -1) {
      Swal.fire({
        icon: 'warning',
        title: 'Item Already Exists',
        html: `This item (${this.selectedPrice.displayName}) is already in the package.`,
        confirmButtonText: 'OK',
      });
      return;
    }

    // Calculate initial discount percentage
    const initialDiscountPercentage =
      this.selectedPrice.normalPrice > 0
        ? Math.round(
            (this.selectedPrice.discount / this.selectedPrice.normalPrice) * 100
          )
        : 0;

    this.packageObj.Items.push({
      displayName: this.selectedPrice.displayName,
      mpItemId: this.inputPackageObj.mpItemId,
      quantity: quantityInKg, // Always stored in kg
      qtytype: this.inputPackageObj.qtytype as 'g' | 'Kg',
      itemName: this.selectedPrice.displayName,
      normalPrice: this.selectedPrice.normalPrice, // Price per kg
      discount: this.selectedPrice.discount, // Discount per kg
      discountPercentage: initialDiscountPercentage,
    });

    // Reset form fields
    this.inputPackageObj = new InputPackage();
    this.selectedPrice = new Variety();
    this.selectedVarieties = [];
  }

  toggleUnitType(index: number, unit: 'g' | 'Kg') {
    const item = this.packageObj.Items[index];
    if (item.qtytype === unit) return;

    item.qtytype = unit;
  }

  onQuantityChange(index: number, event: any) {
    const newValue = parseFloat(event.target.value);
    const item = this.packageObj.Items[index];

    if (!isNaN(newValue)) {
      if (item.qtytype === 'g') {
        // Convert grams to kg for storage
        item.quantity = newValue / 1000;
      } else {
        // Keep kg value as is
        item.quantity = newValue;
      }

      // Ensure minimum quantity (100g or 0.1kg)
      if (item.quantity < 0.1) {
        item.quantity = 0.1;
        if (item.qtytype === 'g') {
          event.target.value = 100; // Show 100g in input
        } else {
          event.target.value = 0.1; // Show 0.1kg in input
        }
      }
    }
  }

  onDiscountPercentageChange(index: number, event: any) {
    const newValue = parseInt(event.target.value);
    const item = this.packageObj.Items[index];

    if (!isNaN(newValue)) {
      // Ensure value stays between 0-100
      if (newValue >= 0 && newValue <= 100) {
        item.discountPercentage = newValue;
        this.updateDiscountFromPercentage(index);
      } else {
        // Reset to previous value if invalid
        event.target.value = item.discountPercentage;
      }
    }
  }

  incrementQuantity(index: number) {
    const item = this.packageObj.Items[index];
    if (item.qtytype === 'g') {
      item.quantity += 0.1; // Add 100g (0.1kg)
    } else {
      item.quantity += 0.1; // Add 0.1kg
    }
    item.quantity = parseFloat(item.quantity.toFixed(2));
  }

  decrementQuantity(index: number) {
    const item = this.packageObj.Items[index];
    const minValue = 0.1; // Minimum 100g or 0.1kg

    if (item.quantity > minValue) {
      if (item.qtytype === 'g') {
        item.quantity -= 0.1; // Subtract 100g (0.1kg)
      } else {
        item.quantity -= 0.1; // Subtract 0.1kg
      }
      item.quantity = parseFloat(item.quantity.toFixed(2));
    }
  }

  incrementDiscountPercentage(index: number) {
    if (this.packageObj.Items[index]) {
      if (this.packageObj.Items[index].discountPercentage < 100) {
        this.packageObj.Items[index].discountPercentage += 1;
        this.updateDiscountFromPercentage(index);
      }
    }
  }

  decrementDiscountPercentage(index: number) {
    if (this.packageObj.Items[index]) {
      if (this.packageObj.Items[index].discountPercentage > 0) {
        this.packageObj.Items[index].discountPercentage -= 1;
        this.updateDiscountFromPercentage(index);
      }
    }
  }

  updateDiscountFromPercentage(index: number) {
    const item = this.packageObj.Items[index];
    item.discount = (item.discountPercentage / 100) * item.normalPrice;
    item.discount = parseFloat(item.discount.toFixed(2));
  }

  getDisplayQuantity(item: Items): number {
    return item.qtytype === 'g' ? item.quantity * 1000 : item.quantity;
  }

  getTotalPrice(): number {
    return this.packageObj.Items.reduce((sum, item) => {
      const actualPrice = item.normalPrice * item.quantity;
      const totalDiscount = (item.discountPercentage / 100) * actualPrice;
      const totalPrice = sum + (actualPrice - totalDiscount);
      this.packageObj.total = parseFloat(totalPrice.toFixed(2));
      return this.packageObj.total;
    }, 0);
  }

  removeItem(index: number) {
    if (index >= 0 && index < this.packageObj.Items.length) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'Do you really want to remove this item?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, remove it!',
        cancelButtonText: 'No, keep it',
      }).then((result) => {
        if (result.isConfirmed) {
          this.packageObj.Items.splice(index, 1);
          Swal.fire('Removed!', 'The item has been removed.', 'success');
        }
      });
    }
  }

  onSubmit() {
    this.isLoading = true;
    if (
      !this.packageObj.displayName ||
      !this.packageObj.description ||
      !this.selectedImage ||
      this.packageObj.Items.length === 0
    ) {
      let errorMessage = '';

      if (!this.packageObj.displayName)
        errorMessage += 'Display Package Name is required.<br>';
      if (!this.packageObj.description)
        errorMessage += 'Description is required.<br>';
      if (!this.selectedImage) errorMessage += 'Package Image is required.<br>';
      if (this.packageObj.Items.length === 0)
        errorMessage += 'Please add at least one product item.<br>';

      Swal.fire({
        icon: 'error',
        title: 'Missing Required Fields',
        html: errorMessage,
        confirmButtonText: 'OK',
      });
      this.isLoading = false;
      return;
    }

    // All quantities are already stored in kg, no conversion needed before submit
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
        this.inputPackageObj = new InputPackage();
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

  preventNegativeNumbers(event: KeyboardEvent) {
    if (event.key === '-' || event.key === 'e' || event.key === 'E') {
      event.preventDefault();
    }
  }
}

class Crop {
  cropId!: number;
  cropNameEnglish!: string;
  variety!: Variety[];
}

class Variety {
  id!: number;
  displayName: string = '';
  normalPrice: number = 0;
  discountedPrice: number = 0;
  discount: number = 0;
}

class Package {
  displayName!: string;
  status: string = 'Disabled';
  Items: Items[] = [];
  cID!: number;
  total!: number;
  description!: string;
  image!: any;
  selectedFileName!: string;
}

class Items {
  displayName: string | undefined = undefined;
  mpItemId!: number;
  quantity: number = 0; // Always stored in kg
  qtytype: 'g' | 'Kg' = 'Kg'; // Current display unit
  itemName: string | undefined = '';
  normalPrice: number = 0; // Price per kg
  discount: number = 0; // Discount per kg
  discountPercentage: number = 0;
}

class InputPackage {
  name!: string;
  status: string = 'Disabled';
  cID!: number;
  packageId!: number;
  mpItemId!: number;
  quantity: number = 0;
  discountedPrice: number = 0;
  qtytype: string = '';
  itemName!: string;
  normalPrice!: number;
  discount: number = 0;
}
