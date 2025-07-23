import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  ],
  templateUrl: './market-add-product.component.html',
  styleUrls: ['./market-add-product.component.css'],
})
export class MarketAddProductComponent implements OnInit {
  readonly templateKeywords = signal<string[]>([]);
  announcer = inject(LiveAnnouncer);
  productObj: MarketPrice = new MarketPrice();
  isImageLoading: boolean = false;

  cropsObj: Crop[] = [];
  selectedVarieties!: Variety[];
  isVerityVisible = false;
  selectedImage!: any;

  isNoDiscount: boolean = true;

  constructor(
    private marketSrv: MarketPlaceService,
    private router: Router,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.getAllCropVerity();
    this.calculeSalePrice();
  }

  getAllCropVerity() {
    this.marketSrv.getCropVerity().subscribe(
      (res) => {
        this.cropsObj = res;
      },
      (error) => {}
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
      this.selectedImage = sample[0].image;
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

  seeCategory() {}

  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  private updateTags() {
    this.productObj.tags = this.templateKeywords().join(', ');
  }

  onSubmit() {
    this.updateTags();

    if (this.templateKeywords().length === 0) {
      Swal.fire(
        'Warning',
        'Please add at least one keyword before submitting.',
        'warning'
      );
      return;
    }

    if (this.productObj.salePrice <= 0) {
      Swal.fire(
        'Invalid Value',
        'Sale Price must be greater than 0, check the discount you applied',
        'warning'
      );
      return;
    }

    if (this.productObj.promo) {
      if (
        !this.productObj.category ||
        !this.productObj.cropName ||
        !this.productObj.varietyId ||
        !this.productObj.normalPrice ||
        !this.productObj.unitType ||
        !this.productObj.startValue ||
        !this.productObj.changeby ||
        !this.productObj.salePrice ||
        (this.productObj.category === 'WholeSale' &&
          !this.productObj.maxQuantity) ||
        this.productObj.startValue <= 0.0 ||
        this.productObj.startValue <= 0.0 ||
        (this.productObj.category === 'WholeSale' &&
          this.productObj.maxQuantity <= 0.0)
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
        (this.productObj.category === 'WholeSale' &&
          !this.productObj.maxQuantity) ||
        this.productObj.startValue <= 0.0 ||
        this.productObj.startValue <= 0.0 ||
        (this.productObj.category === 'WholeSale' &&
          this.productObj.maxQuantity <= 0.0)
      ) {
        Swal.fire(
          'Warning',
          'Please fill in all the required fields',
          'warning'
        );
        return;
      }
    }

    if (this.productObj.unitType == 'g') {
      this.productObj.startValue = this.productObj.startValue / 1000;
      this.productObj.changeby = this.productObj.changeby / 1000;
    }
    console.log('productObj', this.productObj);
    this.marketSrv.createProduct(this.productObj).subscribe(
      (res) => {
        if (res.status === true) {
          Swal.fire('Success', 'Product Created Successfully', 'success');
          this.router.navigate(['/market/action/view-products-list']);
        } else {
          Swal.fire('Error', res.message, 'error');
        }
      },
      (error) => {
        console.error('Product creation error:', error);
        Swal.fire('Error', error.message, 'error');
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
    this.router.navigate(['/market/action']);
  }

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
  changeby!: number;
  tags: string = '';
  category!: String;

  selectId!: number;
  displaytype!: string;
  salePrice: number = 0;
  discount: number = 0.0;
  maxQuantity!: number;

  discountValue: number = 0;
}

class Variety {
  id!: number;
  varietyEnglish!: string;
  image!: any;
}
