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
    DropdownModule,
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

  categoryOptions = [
    { label: 'Retail', value: 'Retail' },
    { label: 'WholeSale', value: 'WholeSale' },
  ];

  // In your component.ts
  unitTypeOptions = [
    { label: 'Kg', value: 'Kg' },
    { label: 'g', value: 'g' },
  ];

  productTypeOptions: { label: string; value: number }[] = [];

  displayTypeOptions = [
    { label: 'With Discount and Actual Price', value: 'D&AP' },
    { label: 'With Actual Price and Sale Price', value: 'AP&SP' },
    { label: 'With Actual Price,Sale Price and Discount', value: 'AP&SP&D' },
  ];

  constructor(
    private marketSrv: MarketPlaceService,
    private router: Router,
    private route: ActivatedRoute,
    public themeService: ThemeService,
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
        this.router.navigate(['market/action/view-products-list']);
      }
    });
  }

  // ngOnInit(): void {
  //   this.productId = this.route.snapshot.params['id'];
  //   this.getAllCropVerity();
  //   this.calculeSalePrice();
  //   this.getProduct();
  // }

  ngOnInit(): void {
    this.productId = this.route.snapshot.params['id'];

    Promise.all([
      this.marketSrv.getCropVerity().toPromise(),
      this.marketSrv.fetchProductTypes().toPromise(),
    ])
      .then(([crops, productTypes]) => {
        this.cropsObj = crops;

        const data = productTypes.data || productTypes;
        this.productTypeOptions = data
          .filter((pt: any) => pt.isValid === 1)
          .map((pt: any) => ({
            label: pt.typeName,
            value: pt.id,
          }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label));

        this.getProduct();
      })
      .catch((error) => {
        console.error('Error loading data:', error);
      });
  }

  trimDisplayName() {
    if (this.productObj.cropName) {
      this.productObj.cropName = this.productObj.cropName.trimStart();
    }
  }

  preventLeadingSpace(event: KeyboardEvent, fieldName: string): void {
    const input = event.target as HTMLInputElement;
    if (
      event.key === ' ' &&
      (input.selectionStart === 0 || !input.value.trim())
    ) {
      event.preventDefault();
    }
  }

  // getProduct() {
  //   this.marketSrv.getProductById(this.productId).subscribe((res) => {
  //     console.log('product:', res);
  //     this.storedDisplayType = res.displaytype;
  //     this.productObj = res;
  //     console.log('this is product', this.productObj);
  //     this.storedDisplayType;
  //     this.productObj.selectId = res.cropGroupId;
  //     this.selectedImage = res.image;
  //     this.onCropChange();
  //     // this.productObj.varietyId = res.cropId;
  //     console.log('this is variety ID', this.productObj.varietyId);
  //     this.templateKeywords.update(() => res.tags || []);
  //     this.calculeSalePrice();
  //     if (res.promo) {
  //       this.productObj.promo = true;
  //     } else {
  //       this.productObj.promo = false;
  //     }
  //     console.log("--------------verityes------------------");
  //     console.log(this.selectedVarieties);

  //   });
  // }

  getProduct() {
    this.marketSrv.getProductById(this.productId).subscribe((res) => {
      console.log('product:', res);
      this.storedDisplayType = res.displaytype;
      this.productObj = res;
      this.productObj.productTypeId = res.productTypeId;

      // Ensure quantity fields retain their original decimal places
      this.productObj.startValue = parseFloat(res.startValue);
      this.productObj.changeby = parseFloat(res.changeby);
      if (res.maxQuantity) {
        this.productObj.maxQuantity = parseFloat(res.maxQuantity);
      }
      this.productObj.comPrice = parseFloat(res.comPrice) || 0;
      this.productObj.selectId = res.cropGroupId;
      this.selectedImage = res.image;
      this.templateKeywords.update(() => res.tags || []);
      this.productObj.promo = !!res.promo;
      this.isNoDiscount = !this.productObj.promo;   // <-- add this line
      this.onCropChange();
      this.productObj.varietyId = res.varietyId;
      this.selectVerityImage();
      this.calculeSalePrice();

      console.log('Start value from DB:', this.productObj.startValue); // Should show 1.5, not 1.500
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
      },
    );
  }

  // onCropChange() {
  //   console.log("oncropCange", this.productObj.selectId);

  //   const sample = this.cropsObj.filter(
  //     (crop) => crop.cropId === +this.productObj.selectId
  //   );

  //   console.log('Filtered crops:', sample);

  //   if (sample.length > 0) {
  //     this.selectedVarieties = sample[0].variety;
  //     console.log('Selected crop varieties:', this.selectedVarieties);
  //     this.isVerityVisible = true;
  //   } else {
  //     console.log('No crop found with selectId:', this.productObj.selectId);
  //   }
  // }

  onCropChange() {
    console.log('onCropChange selectId:', this.productObj.selectId);
    const sample = this.cropsObj.filter(
      (crop) => crop.cropId === +this.productObj.selectId,
    );
    console.log('Filtered crops:', sample);
    if (sample.length > 0) {
      this.selectedVarieties = sample[0].variety;
      this.isVerityVisible = true;
      console.log('Selected crop varieties:', this.selectedVarieties);
    } else {
      this.selectedVarieties = [];
      this.isVerityVisible = false;
      console.log('No crop found with selectId:', this.productObj.selectId);
    }
    // Update the selected image after changing varieties
    this.selectVerityImage();
  }

  // selectVerityImage() {
  //   if (!this.productObj.varietyId) {
  //     this.selectedImage = null;
  //     return;
  //   }

  //   // Find the selected variety object
  //   const selectedVariety = this.selectedVarieties.find(
  //     (v) => v.id === Number(this.productObj.varietyId)
  //   );

  //   // Map image if found
  //   this.selectedImage = selectedVariety ? selectedVariety.image : null;
  //   console.log("Selected Image:", this.selectedImage);
  // }

  selectVerityImage() {
    if (!this.productObj.varietyId) {
      this.selectedImage = null;
      console.log('No varietyId selected');
      return;
    }

    const selectedVariety = this.selectedVarieties.find(
      (v) => v.id === Number(this.productObj.varietyId),
    );
    this.selectedImage = selectedVariety ? selectedVariety.image : null;
    console.log('Selected Image:', this.selectedImage);
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
    console.log('pob', this.productObj);
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

  getCompetitorPriceError(): string {
    const comPrice = parseFloat(this.productObj.comPrice?.toString() || '0');

    if (!this.productObj.comPrice || comPrice <= 0) {
      return 'Please enter a value greater than 0.';
    }

    return '';
  }

  onSubmit() {
    this.updateTags();
    console.log(this.productObj.promo);

    if (
      this.productObj.category === 'WholeSale' &&
      !this.validateMinMaxQuantities()
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Minimum quantity cannot be greater than maximum quantity.',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        },
        confirmButtonText: 'OK',
      });
      return;
    }

    const emptyFields: string[] = [];
    if (!this.productObj.category) emptyFields.push('Category');
    if (!this.productObj.cropName) emptyFields.push('Display Name');
    if (!this.productObj.varietyId) emptyFields.push('Variety');
    if (!this.productObj.normalPrice) emptyFields.push('Price Per kg');
    if (!this.productObj.unitType) emptyFields.push('Default Unit Type');
    if (this.templateKeywords().length === 0) emptyFields.push('Tags');
    if (!this.productObj.startValue || this.productObj.startValue <= 0.0)
      emptyFields.push('Minimum Quantity');
    if (!this.productObj.changeby || this.productObj.changeby <= 0.0)
      emptyFields.push('Increase/Decrease by');

    if (!this.productObj.comPrice || this.productObj.comPrice <= 0) {
  emptyFields.push('Competitor Price');
}

    if (
      this.productObj.category === 'WholeSale' &&
      (!this.productObj.maxQuantity || this.productObj.maxQuantity <= 0.0)
    ) {
      emptyFields.push('Maximum Quantity');
    }

    let salePriceForComparison = 0;

if (this.productObj.promo) {
  if (
    this.productObj.displaytype === 'D&AP' ||
    this.productObj.displaytype === 'AP&SP&D'
  ) {
    salePriceForComparison = this.productObj.salePrice;
  } else if (this.productObj.displaytype === 'AP&SP') {
    salePriceForComparison = this.productObj.salePrice;
  } else {
    salePriceForComparison =
      this.productObj.salePrice || this.productObj.normalPrice;
  }
} else {
  salePriceForComparison = this.productObj.normalPrice;
}

if (this.productObj.comPrice <= salePriceForComparison) {
  Swal.fire({
    icon: 'error',
    title: 'Invalid Competitor Price',
    html: 'Competitor price cannot be equal or lower than the Sale Price.',
    confirmButtonText: 'OK',
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
    },
  });
  return;
}

    if (emptyFields.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Required Fields',
        html: `Please fill in the following fields:<br><br>${emptyFields.join('<br>')}`,
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        },
        confirmButtonText: 'OK',
      });
      return;
    }

    this.marketSrv.updateProduct(this.productObj, this.productId).subscribe(
      (res) => {
        if (res.status) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Product Updated Successfully',
            customClass: {
              popup:
                'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          }).then(() => {
            this.router.navigate(['/market/action/view-products-list']);
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: res.message || 'Product Update Failed',
            customClass: {
              popup:
                'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
        }
      },
      (error) => {
        console.error('Product update error:', error);
        let errorMessage = 'An error occurred while updating the product';

        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error && error.error.error) {
          errorMessage = error.error.error;
        }

        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: errorMessage,
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
      },
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
    if (this.productObj.changeby < 0) {
      this.productObj.changeby = 0;
    }
    // Ensure 3 decimal places
    this.productObj.changeby = parseFloat(this.productObj.changeby.toFixed(3));
  }

  validateMaxQuantity() {
    if (this.productObj.maxQuantity <= 0.0) {
      this.productObj.maxQuantity = 0.0;
    }
  }

  validateMinQuantity() {
    if (this.productObj.startValue < 0) {
      this.productObj.startValue = 0;
    }
    // Ensure 3 decimal places
    this.productObj.startValue = parseFloat(
      this.productObj.startValue.toFixed(3),
    );
  }

  validateDecimalInput(event: KeyboardEvent): boolean {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const key = event.key;
    const fieldName = input.id; // or you can pass fieldName as parameter

    // Allow control keys
    const controlKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'Home',
      'End',
      'ArrowLeft',
      'ArrowRight',
      'Clear',
      'Copy',
      'Paste',
    ];
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

    // Check decimal places based on field type
    if (value.includes('.')) {
      const decimalPart = value.split('.')[1];

      // Determine max decimal places based on field
      let maxDecimals = 2; // Default for price fields
      if (
        input.id === 'startValue' ||
        input.id === 'changeby' ||
        input.id === 'maxQuantity'
      ) {
        maxDecimals = 3; // 3 decimals for quantity fields
      }

      if (decimalPart && decimalPart.length >= maxDecimals && key !== '.') {
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
        // Different decimal places for different field types
        let formattedValue;

        // Price fields - 2 decimal places
        if (
          fieldName === 'normalPrice' ||
          fieldName === 'discountedPrice' ||
          fieldName === 'salePrice' ||
          fieldName === 'comPrice'
        ) {
          formattedValue = numericValue.toFixed(2);
        }
        // Quantity fields - 3 decimal places
        else if (
          fieldName === 'startValue' ||
          fieldName === 'changeby' ||
          fieldName === 'maxQuantity'
        ) {
          formattedValue = numericValue.toFixed(3);
        } else {
          formattedValue = numericValue.toFixed(2); // Default
        }

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
          case 'comPrice':
            this.productObj.comPrice = parseFloat(formattedValue);
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
    if (
      this.productObj.category === 'WholeSale' &&
      this.productObj.maxQuantity > 0 &&
      this.productObj.startValue > this.productObj.maxQuantity
    ) {
      return false;
    }
    return true;
  }

  getMinQuantityError(): string {
    const startValue = parseFloat(
      this.productObj.startValue?.toString() || '0',
    );
    const maxQuantity = parseFloat(
      this.productObj.maxQuantity?.toString() || '0',
    );

    if (isNaN(startValue) || startValue <= 0) {
      return 'Please enter a value greater than 0.';
    }

    // Check if it has more than 3 decimal places
    if (
      this.productObj.startValue &&
      this.productObj.startValue.toString().includes('.') &&
      this.productObj.startValue.toString().split('.')[1].length > 3
    ) {
      return 'Minimum quantity cannot have more than 3 decimal places.';
    }

    if (
      this.productObj.category === 'WholeSale' &&
      maxQuantity > 0 &&
      startValue > maxQuantity
    ) {
      return 'Minimum quantity cannot be greater than maximum quantity.';
    }
    return '';
  }

  getMaxQuantityError(): string {
    const maxQuantity = parseFloat(
      this.productObj.maxQuantity?.toString() || '0',
    );
    const startValue = parseFloat(this.productObj.startValue.toString());
    if (isNaN(maxQuantity) || maxQuantity <= 0) {
      return 'Please enter a value greater than 0.';
    }
    if (startValue > 0 && maxQuantity < startValue) {
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
  selectId!: number;
  displaytype!: string;
  salePrice: number = 0;
  discount: number = 0.0;
  variety?: string;
  productTypeId!: number;
  productTypeName!: string;
  comPrice: number = 0;
}

class Variety {
  id!: number;
  varietyEnglish!: string;
  image!: any;
}
