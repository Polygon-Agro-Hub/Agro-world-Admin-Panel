import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { MatInputModule } from '@angular/material/input';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ThemeService } from '../../../services/theme.service';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-market-add-product',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatChipsModule,
    FormsModule,
    MatIconModule,
    CommonModule,
    MatInputModule,
    DropdownModule,
  ],
  templateUrl: './market-add-product.component.html',
  styleUrls: ['./market-add-product.component.css'],
})
export class MarketAddProductComponent implements OnInit {
  @ViewChild('productForm') productForm!: NgForm;

  readonly templateKeywords = signal<string[]>([]);
  announcer = inject(LiveAnnouncer);
  productObj: MarketPrice = new MarketPrice();
  isImageLoading: boolean = false;

  cropsObj: Crop[] = [];
  selectedVarieties!: Variety[];
  isVerityVisible = false;
  selectedImage!: any;
  tagsTouched = false;
  isNoDiscount: boolean = true;
  formSubmitted = false;

  // In your component.ts
  categoryOptions = [
    { label: 'Retail', value: 'Retail' },
    { label: 'WholeSale', value: 'WholeSale' }
  ];

  // In your component.ts
  unitTypeOptions = [
    { label: 'Kg', value: 'Kg' },
    { label: 'g', value: 'g' }
  ];

  displayTypeOptions = [
    { label: 'With Discount and Actual Price', value: 'D&AP' },
    { label: 'With Actual Price and Sale Price', value: 'AP&SP' },
    { label: 'With Actual Price,Sale Price and Discount', value: 'AP&SP&D' }
  ];

  constructor(
    private marketSrv: MarketPlaceService,
    private router: Router,
    public themeService: ThemeService
  ) { }

  ngOnInit(): void {
    this.getAllCropVerity();
    this.calculeSalePrice();
  }

  getAllCropVerity() {
    this.marketSrv.getCropVerity().subscribe(
      (res) => {
        this.cropsObj = res;
      },
      (error) => { }
    );
  }

  onCropChange() {
    const sample = this.cropsObj.filter(
      (crop) => crop.cropId === +this.productObj.selectId
    );

    if (sample.length > 0) {
      this.selectedVarieties = sample[0].variety;
      this.isVerityVisible = true;
    } else {
      this.selectedVarieties = [];
      this.isVerityVisible = false;
    }
  }

  onImageLoad() {
    this.isImageLoading = false;
  }

  onImageError() {
    this.isImageLoading = false;
  }

  selectVerityImage() {
    if (this.productObj.varietyId > 0) {
      this.isImageLoading = true;
      const sample = this.selectedVarieties.filter(
        (verity) => verity.id === +this.productObj.varietyId
      );
      if (sample.length > 0) {
        this.selectedImage = sample[0].image;
      }
    }
  }

  calculeSalePrice() {
    if (
      this.productObj.displaytype === 'D&AP' ||
      this.productObj.displaytype === 'AP&SP&D'
    ) {
      this.productObj.salePrice =
        this.productObj.normalPrice -
        (this.productObj.normalPrice * this.productObj.discountedPrice) / 100;

      this.productObj.discount =
        (this.productObj.normalPrice * this.productObj.discountedPrice) / 100;
    } else if (this.productObj.displaytype === 'AP&SP') {
      this.productObj.discount =
        this.productObj.normalPrice - this.productObj.salePrice;
    } else {
      this.productObj.salePrice =
        this.productObj.normalPrice - this.productObj.discount;
    }
  }

  dispresent() {
    if (this.productObj.discountValue) {
      this.productObj.discountedPrice = 0;
    }
  }

  disvalue() {
    if (this.productObj.discountedPrice) {
      this.productObj.discountedPrice = 0;
    }
  }

  changeType() {
    this.productObj.normalPrice = 0;
    this.productObj.salePrice = 0;
    this.productObj.discountedPrice = 0;
    this.productObj.discountedPrice = 0;
  }

  applyDiscount() {
    this.isNoDiscount = false;
  }

  compaireDiscount() {
    this.productObj.displaytype = '';
    this.productObj.discount = 0.0;
    this.productObj.discountedPrice = 0.0;
    this.isNoDiscount = true;
    this.productObj.salePrice =
      this.productObj.normalPrice - this.productObj.discount;
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
        this.productObj = new MarketPrice();
        this.selectedVarieties = [];
        this.isVerityVisible = false;
        this.templateKeywords.update(() => []);
        this.updateTags();
        this.navigatePath('/market/action');
      }
    });
  }

  seeCategory() { }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  private updateTags() {
    this.productObj.tags = this.templateKeywords().join(', ');
  }

  onSubmit() {
    this.formSubmitted = true;
    this.tagsTouched = true;

    // Mark all form controls as touched to show validation messages
    if (this.productForm) {
      Object.keys(this.productForm.controls).forEach(key => {
        const control = this.productForm.controls[key];
        control.markAsTouched();
      });
    }

    // First, validate quantity range for wholesale
    if (this.productObj.category === 'WholeSale' &&
      !this.validateQuantityRange()) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Quantity Range',
        html: 'Minimum quantity cannot be greater than maximum quantity',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        },
      });
      return;
    }

    // Round all decimal values to 2 places
    this.productObj.normalPrice = parseFloat(this.productObj.normalPrice.toFixed(2));
    if (this.productObj.promo) {
      this.productObj.discountedPrice = parseFloat(this.productObj.discountedPrice.toFixed(2));
      this.productObj.salePrice = parseFloat(this.productObj.salePrice.toFixed(2));
    }
    this.productObj.startValue = parseFloat(this.productObj.startValue.toFixed(2));
    this.productObj.changeby = parseFloat(this.productObj.changeby.toFixed(2));

    if (this.productObj.category === 'WholeSale') {
      this.productObj.maxQuantity = parseFloat(this.productObj.maxQuantity.toFixed(2));
    }

    this.updateTags();

    // Check for empty required fields
    const emptyFields = [];
    console.log(this.productObj);


    if (!this.productObj.category) emptyFields.push('Category');
    if (!this.productObj.cropName) emptyFields.push('Display Name');
    if (!this.productObj.selectId) emptyFields.push('Crop');
    if (!this.productObj.varietyId) emptyFields.push('Variety');
    if (!this.productObj.normalPrice && this.productObj.normalPrice === 0) emptyFields.push('Price Per kg');
    if (!this.productObj.unitType) emptyFields.push('Unit Type');
    if (!this.productObj.startValue && this.productObj.startValue === 0) emptyFields.push('Starting Value');
    if (!this.productObj.changeby && this.productObj.changeby === 0) emptyFields.push('Increase/Decrease by');
    if (this.templateKeywords().length === 0) emptyFields.push('Tags');

    if (this.productObj.category === 'WholeSale' && (!this.productObj.maxQuantity && this.productObj.maxQuantity === 0)) {
      emptyFields.push('Maximum Quantity');
    }

    if (this.productObj.promo) {
      if (!this.productObj.displaytype) {
        emptyFields.push('Display Type');
      } else {
        if (this.productObj.displaytype === 'D&AP') {
          if (this.productObj.discountedPrice === 0) emptyFields.push('Discount Percentage');
        } else if (this.productObj.displaytype === 'AP&SP') {
          if (this.productObj.salePrice === 0) emptyFields.push('Sale Price');
        } else if (this.productObj.displaytype === 'AP&SP&D') {
          if (this.productObj.discountedPrice === 0) emptyFields.push('Discount Percentage');
          if (this.productObj.salePrice === 0) emptyFields.push('Sale Price');
        }
      }

    }

    if (emptyFields.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Required Fields',
        html: `Please fill in the following fields:<br><br>${emptyFields.join('<br>')}`,
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        },
      });
      return;
    }

    if (this.templateKeywords().length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Required Fields',
        html: 'Please add at least one keyword',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        },
      });
      return;
    }

    // Validate decimal places for all numeric fields
    const decimalIssues = [];

    if (!/^\d+(\.\d{1,2})?$/.test(this.productObj.normalPrice.toString())) {
      decimalIssues.push('Price Per kg must have max 2 decimal places');
    }

    if (this.productObj.promo && this.productObj.discountedPrice &&
      !/^\d+(\.\d{1,2})?$/.test(this.productObj.discountedPrice.toString())) {
      decimalIssues.push('Discount Percentage must have max 2 decimal places');
    }

    if (!/^\d+(\.\d{1,2})?$/.test(this.productObj.startValue.toString())) {
      decimalIssues.push('Starting Value must have max 2 decimal places');
    }

    if (!/^\d+(\.\d{1,2})?$/.test(this.productObj.changeby.toString())) {
      decimalIssues.push('Increase/Decrease by must have max 2 decimal places');
    }

    if (this.productObj.category === 'WholeSale' &&
      !/^\d+(\.\d{1,2})?$/.test(this.productObj.maxQuantity.toString())) {
      decimalIssues.push('Maximum Quantity must have max 2 decimal places');
    }

    if (decimalIssues.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Decimal Values',
        html: decimalIssues.join('<br>'),
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        },
      });
      return;
    }

    // Validate price relationships
    if (this.productObj.promo) {
      if (this.productObj.salePrice <= 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid Value',
          text: 'Sale Price must be greater than 0, check the discount you applied',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          },
        });
        return;
      }

      if (this.productObj.displaytype === 'AP&SP' &&
        this.productObj.salePrice >= this.productObj.normalPrice) {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid Value',
          text: 'Sale Price must be less than Actual Price',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          },
        });
        return;
      }
    }

    // Additional validations
    if (this.productObj.startValue <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Value',
        text: 'Starting Value must be greater than 0',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        },
      });
      return;
    }

    if (this.productObj.category === 'WholeSale' && this.productObj.maxQuantity <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Value',
        text: 'Maximum Quantity must be greater than 0',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        },
      });
      return;
    }

    if (this.productObj.changeby <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Value',
        text: 'Increase/Decrease by must be greater than 0',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        },
      });
      return;
    }

    // Convert grams to kg if needed
    if (this.productObj.unitType == 'g') {
      this.productObj.startValue = this.productObj.startValue / 1000;
      this.productObj.changeby = this.productObj.changeby / 1000;
      if (this.productObj.category === 'WholeSale') {
        this.productObj.maxQuantity = this.productObj.maxQuantity / 1000;
      }
    }

    // Submit the form
    this.marketSrv.createProduct(this.productObj).subscribe(
      (res) => {
        if (res.status === true) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Product Created Successfully',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
            },
          });
          this.router.navigate(['/market/action/view-products-list']);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: res.message,
            confirmButtonText: 'OK',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
            },
          });
        }
      },
      (error) => {
        console.error('Product creation error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message,
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          },
        });
      }
    );
  }

  addTemplateKeyword(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.templateKeywords.update((keywords) => {
        const updatedKeywords = [...keywords, value];
        this.updateTags();
        return updatedKeywords;
      });
      this.announcer.announce(`added ${value} to template form`);
    }

    event.chipInput!.clear();
    console.log('tags', this.productObj.tags)
  }

  removeTemplateKeyword(keyword: string) {
    this.templateKeywords.update((keywords) => {
      const index = keywords.indexOf(keyword);
      if (index < 0) {
        return keywords;
      }

      keywords.splice(index, 1);
      this.updateTags();
      this.announcer.announce(`removed ${keyword} from template form`);
      return [...keywords];
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
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/market/action']);
      }
    });
  }

  trimDisplayName() {
    if (this.productObj.cropName) {
      this.productObj.cropName = this.productObj.cropName.trimStart();
    }
  }

  validateDiscountPercentage() {
    if (this.productObj.discountedPrice < 0) {
      this.productObj.discountedPrice = 0;
    }
    if (this.productObj.discountedPrice > 100) {
      this.productObj.discountedPrice = 100;
    }
    this.productObj.discountedPrice = parseFloat(this.productObj.discountedPrice.toFixed(2));
  }

  validateNormalPrice() {
    if (this.productObj.normalPrice < 0) {
      this.productObj.normalPrice = 0;
    }
    this.productObj.normalPrice = parseFloat(this.productObj.normalPrice.toFixed(2));
  }

  validateSalePrice() {
    if (this.productObj.salePrice < 0) {
      this.productObj.salePrice = 0;
    }
  }

  validateChangeBy() {
    if (this.productObj.changeby < 0) {
      this.productObj.changeby = 0;
    }
    this.productObj.changeby = parseFloat(this.productObj.changeby.toFixed(2));

    // Mark the field as touched to show validation messages
    if (this.productForm && this.productForm.controls['changeby']) {
      this.productForm.controls['changeby'].markAsTouched();
    }
  }

  validateMaxQuantity() {
    if (this.productObj.maxQuantity < 0) {
      this.productObj.maxQuantity = 0;
    }
    this.productObj.maxQuantity = parseFloat(this.productObj.maxQuantity.toFixed(2));

    // Mark the field as touched to show validation messages
    if (this.productForm && this.productForm.controls['maxQuntity']) {
      this.productForm.controls['maxQuntity'].markAsTouched();
    }
  }

  validateMinQuantity() {
    if (this.productObj.startValue < 0) {
      this.productObj.startValue = 0;
    }
    this.productObj.startValue = parseFloat(this.productObj.startValue.toFixed(2));

    // Mark the field as touched to show validation messages
    if (this.productForm && this.productForm.controls['startValue']) {
      this.productForm.controls['startValue'].markAsTouched();
    }
  }

  preventLeadingSpace(event: KeyboardEvent, fieldName: string): void {
    const input = event.target as HTMLInputElement;
    if (event.key === ' ' && (input.selectionStart === 0 || !input.value.trim())) {
      event.preventDefault();
    }
  }

  validatePriceInput(event: Event, fieldName: string) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Prevent negative numbers and invalid characters
    if (value.includes('-') || value.toLowerCase().includes('e')) {
      value = value.replace(/[-e]/g, '');
      input.value = value;

      // Update the model and mark as touched
      switch (fieldName) {
        case 'normalPrice':
          this.productObj.normalPrice = value ? parseFloat(value) : 0;
          if (this.productForm && this.productForm.controls['normalPrice']) {
            this.productForm.controls['normalPrice'].markAsTouched();
          }
          break;
        case 'discountedPrice':
          this.productObj.discountedPrice = value ? parseFloat(value) : 0;
          if (this.productForm && this.productForm.controls['discountedPrice']) {
            this.productForm.controls['discountedPrice'].markAsTouched();
          }
          break;
        case 'startValue':
          this.productObj.startValue = value ? parseFloat(value) : 0;
          if (this.productForm && this.productForm.controls['startValue']) {
            this.productForm.controls['startValue'].markAsTouched();
          }
          break;
        case 'changeby':
          this.productObj.changeby = value ? parseFloat(value) : 0;
          if (this.productForm && this.productForm.controls['changeby']) {
            this.productForm.controls['changeby'].markAsTouched();
          }
          break;
        case 'maxQuantity':
          this.productObj.maxQuantity = value ? parseFloat(value) : 0;
          if (this.productForm && this.productForm.controls['maxQuntity']) {
            this.productForm.controls['maxQuntity'].markAsTouched();
          }
          break;
      }

      event.preventDefault();
      return;
    }

    // Rest of your existing validation for decimal places
    if (value.includes('.') && value.split('.')[1].length > 2) {
      const truncatedValue = parseFloat(value).toFixed(2);
      input.value = truncatedValue;

      switch (fieldName) {
        case 'normalPrice':
          this.productObj.normalPrice = parseFloat(truncatedValue);
          break;
        case 'discountedPrice':
          this.productObj.discountedPrice = parseFloat(truncatedValue);
          break;
        case 'startValue':
          this.productObj.startValue = parseFloat(truncatedValue);
          break;
        case 'changeby':
          this.productObj.changeby = parseFloat(truncatedValue);
          break;
        case 'maxQuantity':
          this.productObj.maxQuantity = parseFloat(truncatedValue);
          break;
      }
    }

    // Trigger the calculation if needed
    this.calculeSalePrice();
  }

  preventInvalidChars(event: KeyboardEvent) {
    // Block '-' and 'e' characters
    if (event.key === '-' || event.key.toLowerCase() === 'e') {
      event.preventDefault();
    }
  }

  validateQuantityRange() {
    if (this.productObj.category === 'WholeSale' &&
      this.productObj.startValue &&
      this.productObj.maxQuantity) {
      return this.productObj.startValue <= this.productObj.maxQuantity;
    }
    return true;
  }
}

class Crop {
  cropId!: number;
  cropNameEnglish!: string;
  variety!: Variety[];
}

class MarketPrice {
  cropName: string = '';
  varietyId: number = 0;
  displayName: string = '';
  normalPrice: number = 0;
  discountedPrice: number = 0;
  promo: boolean = false;
  unitType: string = '';
  startValue: number = 0;
  changeby: number = 0;
  tags: string = '';
  category: string = '';

  selectId: number = 0;
  displaytype: string = '';
  salePrice: number = 0;
  discount: number = 0.0;
  maxQuantity: number = 0;

  discountValue: number = 0;
}

class Variety {
  id!: number;
  varietyEnglish!: string;
  image!: any;
}