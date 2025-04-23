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
  ],
  templateUrl: './market-edit-product.component.html',
  styleUrl: './market-edit-product.component.css',
})
export class MarketEditProductComponent implements OnInit {
  readonly templateKeywords = signal<string[]>([]);
  announcer = inject(LiveAnnouncer);
  productObj: MarketPrice = new MarketPrice();

  discountPercentage: number = 0.00;

  isDisplayNameOnlyNumbers: boolean = false;


  productId!: number;

  cropsObj: Crop[] = [];
  selectedVarieties!: Variety[];
  isVerityVisible = false;
  selectedImage!: any;

  isNoDiscount: boolean = false;

  constructor(
    private marketSrv: MarketPlaceService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.params['id'];
    this.getAllCropVerity();
    this.calculeSalePrice();
    this.getProduct();
  }

  getProduct() {
    this.marketSrv.getProductById(this.productId).subscribe((res) => {
      console.log('product:', res);
      this.productObj = res;
      this.productObj.selectId = res.cropGroupId;
      this.selectedImage = res.image;
      this.onCropChange();
      // this.productObj.varietyId = res.cropId;
      console.log('product object', this.productObj)
      this.templateKeywords.update(() => res.tags || []);
      if (res.normalPrice && res.discount) {
        this.discountPercentage = this.calculateDiscountPercentage(
          res.normalPrice,
          res.discount
        );
      } else {
        this.discountPercentage = 0.00; // Default to 0 if no discount
      }
      this.calculeSalePrice();
      if (res.promo) {
        this.productObj.promo = true;
      } else {
        this.productObj.promo = false;
      }
    });
  }

  calculateDiscountPercentage(normalPrice: number, discountAmount: number): number {
    console.log(discountAmount);
    if (normalPrice <= 0) return 0;
    const percentage = (discountAmount / normalPrice) * 100;
    return parseFloat(percentage.toFixed(2)); // Ensures 2 decimal places
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

  calculeSalePrice() {
    this.productObj.discount =
      (this.productObj.normalPrice * this.discountPercentage) / 100;
    this.productObj.discountedPrice =
      this.productObj.normalPrice -
      (this.productObj.normalPrice * this.discountPercentage) / 100;
    console.log(this.productObj.discountedPrice);
  }

  calculeSalePriceForDiscountValue() {
  
    this.productObj.discountedPrice =
      this.productObj.normalPrice - this.productObj.discount;
    console.log(this.productObj.discountedPrice);
  }

  onCancel() {
    this.productObj = new MarketPrice();
    this.selectedVarieties = [];
    this.isVerityVisible = false;
    this.templateKeywords.update(() => []);
    this.updateTags();
  }

  private updateTags() {
    this.productObj.tags = this.templateKeywords().join(', ');
  }

  onSubmit() {
    this.updateTags();
    console.log(this.productObj.promo);
    console.log('this is product object', this.productObj)

    if (this.productObj.startValue <= 0) {
      Swal.fire(
        'Invalid Value',
        'Starting Value must be greater than 0',
        'warning'
      );
      return;
    }
  
    // Check if changeby is invalid
    if (this.productObj.changeby <= 0) {
      Swal.fire(
        'Invalid Value',
        'Change By value must be greater than 0',
        'warning'
      );
      return;
    }

    if (this.productObj.normalPrice <= 0) {
      Swal.fire(
        'Invalid Value',
        'Actual value must be greater than 0',
        'warning'
      );
      return;
    }

    if (this.discountPercentage < 0 || (!this.isNoDiscount && this.discountPercentage === 0)) {
      Swal.fire(
        'Invalid Value',
        this.discountPercentage < 0
          ? 'Discount percentage cannot be less than 0'
          : 'Discount percentage must be greater than 0',
        'warning'
      );
      return;
    }


    if (this.productObj.discount < 0 || (!this.isNoDiscount && this.productObj.discount === 0)) {
      Swal.fire(
        'Invalid Value',
        this.productObj.discount < 0
          ? 'Discount value cannot be less than 0'
          : 'Discount value must be greater than 0',
        'warning'
      );
      return;
    }

    if (this.productObj.promo) {
      if (
        this.isDisplayNameOnlyNumbers ||
        !this.productObj.category ||
        !this.productObj.cropName ||
        !this.productObj.varietyId ||
        !this.productObj.normalPrice ||
        !this.productObj.unitType ||
        !this.productObj.startValue ||
        !this.productObj.changeby ||
        !this.productObj.discountedPrice
        // !this.productObj.salePrice
      ) {
        Swal.fire(
          'Warning',
          'Please fill in all the required fields correctly',
          'warning'
        );
        return;
      }
    } else {
      if (
        this.isDisplayNameOnlyNumbers ||
        !this.productObj.category ||
        !this.productObj.cropName ||
        !this.productObj.varietyId ||
        !this.productObj.normalPrice ||
        !this.productObj.unitType ||
        !this.productObj.startValue ||
        !this.productObj.changeby
      ) {
        Swal.fire(
          'Warning',
          'Please fill in all the required fields correctly',
          'warning'
        );
        return;
      }
    }

    this.marketSrv.updateProduct(this.productObj, this.productId).subscribe(
      (res) => {
        if (res.status) {
          Swal.fire('Success', 'Product Created Successfully', 'success');
          this.router.navigate(['/market/action/view-products-list']);

          this.onCancel();
        } else {
          Swal.fire('Error', 'Product Creation Failed', 'error');
        }
      },
      (error) => {
        console.error('Product creation error:', error);
        Swal.fire(
          'Error',
          'An error occurred while creating the product',
          'error'
        );
      }
    );
    console.log('Form submitted:', this.productObj);
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


  compaireDiscount(){
    this.productObj.displaytype='';
    this.productObj.discount= 0.00;
    this.discountPercentage= 0.00;
    console.log(this.productObj.discount);
    this.isNoDiscount = true;
    this.productObj.discountedPrice = this.productObj.normalPrice - this.productObj.discount
    console.log('discointe', this.productObj.discountedPrice);
  }

  

validateDisplayName() {
  if (this.productObj.cropName) {
    // Check if the display name contains only digits
    this.isDisplayNameOnlyNumbers = /^\d+$/.test(this.productObj.cropName);
  } else {
    this.isDisplayNameOnlyNumbers = false;
  }
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
  normalPrice!: number;
  discountedPrice!: number;
  promo: boolean = false;
  unitType!: string;
  startValue!: number;
  changeby!: number;
  tags: string = '';
  category!: String;

  selectId!: number;
  displaytype!: string;
  // salePrice: number = 0;
  discount!: number;
}

class Variety {
  id!: number;
  varietyEnglish!: string;
  image!: any;
}
