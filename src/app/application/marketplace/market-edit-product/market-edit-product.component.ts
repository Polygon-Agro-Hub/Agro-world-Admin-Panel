import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from '../../../services/theme.service';
import { ChipsModule } from 'primeng/chips';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-market-edit-product',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatChipsModule,
    FormsModule,
    MatIconModule,
    CommonModule,
     ChipsModule,
     DropdownModule
  ],
  templateUrl: './market-edit-product.component.html',
  styleUrl: './market-edit-product.component.css',
})
export class MarketEditProductComponent implements OnInit {
  readonly templateKeywords = signal<string[]>([]);
  announcer = inject(LiveAnnouncer);
  productObj: MarketPrice = new MarketPrice();

  productId!: number;

  cropsObj: Crop[] = [];
  selectedVarieties!: Variety[];
  isVerityVisible = false;
  selectedImage!: any;
  storedDisplayType!: string;
  storedDiscountPercentage: number = 0.0;
  // discountPercentage: number = 0.0;
  isNoDiscount: boolean = true;

  constructor(
    private marketSrv: MarketPlaceService,
    private router: Router,
    private route: ActivatedRoute,
    public themeService: ThemeService
  ) {}


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
    this.router.navigate(['market/action/view-products-list']);
    }
  });
}


  ngOnInit(): void {
    this.productId = this.route.snapshot.params['id'];
    this.getAllCropVerity();
    this.calculeSalePrice();
    this.getProduct();
  }

  trimDisplayName() {
    if (this.productObj.cropName) {
      this.productObj.cropName = this.productObj.cropName.trimStart();
    }
  }

  preventLeadingSpace(event: KeyboardEvent, fieldName: string): void {
    const input = event.target as HTMLInputElement;
    if (event.key === ' ' && (input.selectionStart === 0 || !input.value.trim())) {
      event.preventDefault();
    }
  }

  getProduct() {
    this.marketSrv.getProductById(this.productId).subscribe((res) => {
      console.log('product:', res);
      this.storedDisplayType = res.displaytype;
      this.productObj = res;
      console.log('this is product', this.productObj);
      this.storedDisplayType;
      this.productObj.selectId = res.cropGroupId;
      this.selectedImage = res.image;
      this.onCropChange();
      // this.productObj.varietyId = res.cropId;
      console.log('this is variety ID', this.productObj.varietyId);
      this.templateKeywords.update(() => res.tags || []);
      this.calculeSalePrice();
      if (res.promo) {
        this.productObj.promo = true;
      } else {
        this.productObj.promo = false;
      }
    });
  }

  
  getAllCropVerity() {
    this.marketSrv.getCropVerity().subscribe(
      (res) => {
        this.cropsObj = res;
        console.log('Crops fetched successfully:', res);
      },
      (error) => {
        console.log('Error: Crop variety fetching issue', error);
      }
    );
  }

  onCropChange() {
    const sample = this.cropsObj.filter(
      (crop) => crop.cropId === +this.productObj.selectId
    );

    console.log('Filtered crops:', sample);

    if (sample.length > 0) {
      this.selectedVarieties = sample[0].variety;
      console.log('Selected crop varieties:', this.selectedVarieties);
      this.isVerityVisible = true;
    } else {
      console.log('No crop found with selectId:', this.productObj.selectId);
    }
  }

  selectVerityImage() {
    const sample = this.selectedVarieties.filter(
      (verity) => verity.id === +this.productObj.varietyId
    );
    console.log(sample[0].image);
    this.selectedImage = sample[0].image;
  }

  // calculeSalePrice() {
  //   this.productObj.discount =
  //     (this.productObj.normalPrice * this.productObj.discountedPrice) / 100;
  //   this.productObj.salePrice =
  //     this.productObj.normalPrice -
  //     (this.productObj.normalPrice * this.productObj.discountedPrice) / 100;
  //   console.log(this.productObj.salePrice);
  // }

  onCancel() {
    console.log('pob', this.productObj)
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after canceling!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'No, Keep Editing',
    }).then((result) => {
      if (result.isConfirmed) {
        this.productObj = new MarketPrice();
        this.selectedVarieties = [];
        this.isVerityVisible = false;
        this.templateKeywords.update(() => []);
        this.updateTags();
        this.navigatePath('/market/action/view-products-list');
      }
    });
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  // private updateTags() {
  //   this.productObj.tags = this.templateKeywords().join(', ');
  // }

  onSubmit() {
  this.updateTags();
  console.log(this.productObj.promo);

  // Validate min and max quantities
  if (this.productObj.category === 'WholeSale' && !this.validateMinMaxQuantities()) {
    Swal.fire({
      icon: 'error',
      title: 'Validation Error',
      text: 'Minimum quantity cannot be greater than maximum quantity.',
      confirmButtonText: 'OK'
    });
    return;
  }

  // Check for empty required fields
  const emptyFields = [];
  
  if (!this.productObj.category) emptyFields.push('Category');
  if (!this.productObj.cropName) emptyFields.push('Display Name');
  if (!this.productObj.varietyId) emptyFields.push('Variety');
  if (!this.productObj.normalPrice) emptyFields.push('Price Per kg');
  if (!this.productObj.unitType) emptyFields.push('Default Unit Type');
  if (!this.productObj.startValue || this.productObj.startValue <= 0.0) emptyFields.push('Minimum Quantity');
  if (!this.productObj.changeby || this.productObj.changeby <= 0.0) emptyFields.push('Increase/Decrease by');
  
  if (this.productObj.category === 'WholeSale' && (!this.productObj.maxQuantity || this.productObj.maxQuantity <= 0.0)) {
      emptyFields.push('Maximum Quantity');
  }
  
  if (this.productObj.promo) {
      if (!this.productObj.discountedPrice) emptyFields.push('Discount Percentage');
      if (!this.productObj.salePrice) emptyFields.push('Sale Price');
      if (!this.productObj.displaytype) emptyFields.push('Display Type');
  }

  if (emptyFields.length > 0) {
      Swal.fire({
          icon: 'warning',
          title: 'Missing Required Fields',
          html: `Please fill in the following fields:<br><br>${emptyFields.join('<br>')}`,
          confirmButtonText: 'OK'
      });
      return;
  }

  this.marketSrv.updateProduct(this.productObj, this.productId).subscribe(
      (res) => {
          if (res.status) {
              Swal.fire('Success', 'Product Updated Successfully', 'success');
              this.router.navigate(['/market/action/view-products-list']);
          } else {
              Swal.fire('Error', 'Product Update Failed', 'error');
          }
      },
      (error) => {
          console.error('Product update error:', error);
          Swal.fire(
              'Error',
              'An error occurred while updating the product',
              'error'
          );
      }
  );
  console.log('Form submitted:', this.productObj);
}
updateTags() {
    this.productObj.tags = this.templateKeywords().join(', ');
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

  applyDiscount() {
    this.isNoDiscount = false;
    this.productObj.displaytype = this.storedDisplayType;
    console.log('discounted price', this.productObj.discountedPrice);

    if (this.productObj.discountedPrice === 0) {
      this.productObj.discountedPrice = this.storedDiscountPercentage;
      this.productObj.salePrice =
        this.productObj.normalPrice -
        (this.productObj.normalPrice * this.productObj.discountedPrice) / 100;

      this.productObj.discount =
        (this.productObj.normalPrice * this.productObj.discountedPrice) / 100;
    }
    console.log('object', this.productObj);

    console.log('store', this.storedDisplayType);
  }


  announceTagAdded(event: any) {
    this.announcer.announce(`Added tag: ${event.value}`);
  }

  announceTagRemoved(event: any) {
    this.announcer.announce(`Removed tag: ${event.value}`);
  }
  compaireDiscount() {
    this.storedDiscountPercentage = this.productObj.discountedPrice;
    this.productObj.displaytype = '';
    this.productObj.discount = 0.0;
    this.productObj.discountedPrice = 0.0;
    this.isNoDiscount = true;
    this.productObj.salePrice =
      this.productObj.normalPrice - this.productObj.discount;
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

  // changeType() {
  //   this.productObj.normalPrice = 0;
  //   this.productObj.salePrice = 0;
  //   this.productObj.discountedPrice = 0;
  //   this.productObj.discountedPrice = 0;
  // }

  validateChangeBy() {
    if (this.productObj.changeby <= 0.0) {
      this.productObj.changeby = 0.0;
    }
  }

  validateMaxQuantity() {
    if (this.productObj.maxQuantity <= 0.0) {
      this.productObj.maxQuantity = 0.0;
    }
  }

  validateMinQuantity() {
    if (this.productObj.startValue <= 0.0) {
      this.productObj.startValue = 0.0;
    }
  }

  validateDecimalInput(event: KeyboardEvent): boolean {
  const input = event.target as HTMLInputElement;
  const value = input.value;
  const key = event.key;

  // Allow control keys
  const controlKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End', 'ArrowLeft', 'ArrowRight', 'Clear', 'Copy', 'Paste'];
  if (controlKeys.includes(key)) {
    return true;
  }

  // Allow numbers and decimal point
  if (!/^[0-9.]$/.test(key)) {
    event.preventDefault();
    return false;
  }

  // Prevent multiple decimal points
  if (key === '.' && value.includes('.')) {
    event.preventDefault();
    return false;
  }

  // Check if adding this character would exceed 2 decimal places
  if (value.includes('.')) {
    const decimalPart = value.split('.')[1];
    if (decimalPart && decimalPart.length >= 2 && key !== '.') {
      event.preventDefault();
      return false;
    }
  }

  // Prevent decimal point at the beginning
  if (key === '.' && value === '') {
    event.preventDefault();
    return false;
  }

  return true;
}

validatePriceFormat(value: any, fieldName: string): boolean {
  if (value === null || value === undefined || value === '') {
    return true; // Allow empty values, required validation will handle this
  }

  const stringValue = value.toString();
  
  // Check for invalid formats like 12..00, 99.999, etc.
  const validPriceRegex = /^\d+(\.\d{1,2})?$/;
  
  if (!validPriceRegex.test(stringValue)) {
    // Show error message or handle invalid format
    console.error(`Invalid format for ${fieldName}: ${stringValue}`);
    return false;
  }

  return true;
}

formatPrice(event: any, fieldName: string): void {
  const input = event.target;
  let value = input.value;

  if (value && !isNaN(value)) {
    const numericValue = parseFloat(value);
    if (numericValue >= 0) {
      const formattedValue = numericValue.toFixed(2);
      input.value = formattedValue;
      
      // Update the model based on field name
      switch (fieldName) {
        case 'normalPrice':
          this.productObj.normalPrice = parseFloat(formattedValue);
          break;
        case 'discountedPrice':
          this.productObj.discountedPrice = parseFloat(formattedValue);
          break;
        case 'salePrice':
          this.productObj.salePrice = parseFloat(formattedValue);
          break;
        case 'startValue':
          this.productObj.startValue = parseFloat(formattedValue);
          break;
        case 'changeby':
          this.productObj.changeby = parseFloat(formattedValue);
          break;
        case 'maxQuantity':
          this.productObj.maxQuantity = parseFloat(formattedValue);
          break;
      }
      
      // Recalculate sale price if needed
      if (fieldName === 'normalPrice' || fieldName === 'discountedPrice') {
        this.calculeSalePrice();
      }
    }
  }
}

validateMinMaxQuantities(): boolean {
  if (this.productObj.category === 'WholeSale' && 
      this.productObj.maxQuantity > 0 && 
      this.productObj.startValue > this.productObj.maxQuantity) {
    return false;
  }
  return true;
}

getMinQuantityError(): string {
  if (this.productObj.startValue <= 0) {
    return 'Please enter a value greater than 0.';
  }
  if (this.productObj.category === 'WholeSale' && 
      this.productObj.maxQuantity > 0 && 
      this.productObj.startValue > this.productObj.maxQuantity) {
    return 'Minimum quantity cannot be greater than maximum quantity.';
  }
  return '';
}

getMaxQuantityError(): string {
  if (this.productObj.maxQuantity <= 0) {
    return 'Please enter a value greater than 0.';
  }
  if (this.productObj.startValue > 0 && 
      this.productObj.maxQuantity < this.productObj.startValue) {
    return 'Maximum quantity must be greater than or equal to minimum quantity.';
  }
  return '';
}

}

class Crop {
  cropId!: number;
  cropNameEnglish!: string;
  variety!: Variety[];
}

class MarketPrice {
  cropName!: string;
  varietyId!: number;
  displayName!: string;
  normalPrice: number = 0;
  discountedPrice: number = 0;
  promo: boolean = false;
  unitType!: string;
  startValue!: number;
  maxQuantity!: number;
  changeby!: number;
  tags: string = '';
  category!: string;
  // displayType!: string;
  variety!: string;

  selectId!: number;
  displaytype!: string;
  salePrice: number = 0;
  discount: number = 0.0;
}

class Variety {
  id!: number;
  varietyEnglish!: string;
  image!: any;
}
