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

  productId!: number;

  cropsObj: Crop[] = [];
  selectedVarieties!: Variety[];
  isVerityVisible = false;
  selectedImage!: any;
  storedDisplayType!: string;
  storedDiscountPercentage: number = 0.0;


  isNoDiscount: boolean = true;

  constructor(
    private marketSrv: MarketPlaceService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  back(): void {
    this.router.navigate(['market/action/view-products-list']);
  }

  ngOnInit(): void {
    this.productId = this.route.snapshot.params['id'];
    this.getAllCropVerity();
    this.calculeSalePrice();
    this.getProduct();
  }

  getProduct() {
    this.marketSrv.getProductById(this.productId).subscribe((res) => {
      console.log('product:', res);
      this.storedDisplayType = res.displaytype;
      this.productObj = res;
      console.log('this is product', this.productObj);
      this.storedDisplayType
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

  private updateTags() {
    this.productObj.tags = this.templateKeywords().join(', ');
  }

  onSubmit() {
    this.updateTags();
    console.log(this.productObj.promo);

    if (this.productObj.promo) {
      if (
        !this.productObj.category ||
        !this.productObj.cropName ||
        !this.productObj.varietyId ||
        !this.productObj.normalPrice ||
        !this.productObj.unitType ||
        !this.productObj.startValue ||
        !this.productObj.changeby ||
        !this.productObj.discountedPrice ||
        !this.productObj.salePrice ||
        !this.productObj.maxQuantity
      ) {
        Swal.fire(
          'Warning',
          'Please fill in all the required fields',
          'warning'
        );
        return;
      }
    } else {
      if (
        !this.productObj.category ||
        !this.productObj.cropName ||
        !this.productObj.varietyId ||
        !this.productObj.normalPrice ||
        !this.productObj.unitType ||
        !this.productObj.startValue ||
        !this.productObj.changeby ||
        !this.productObj.maxQuantity
      ) {
        Swal.fire(
          'Warning',
          'Please fill in all the required fields',
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

  applyDiscount() {
    this.isNoDiscount = false;
    this.productObj.displaytype = this.storedDisplayType;
    console.log('discounted price', this.productObj.discountedPrice);
  
    if (this.productObj.discountedPrice === 0) {
      this.productObj.discountedPrice = this.storedDiscountPercentage;
    }
  
    console.log('store', this.storedDisplayType);
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
  variety!: string


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
