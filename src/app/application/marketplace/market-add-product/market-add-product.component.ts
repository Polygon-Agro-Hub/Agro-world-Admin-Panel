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

@Component({
  selector: 'app-market-add-product',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatChipsModule,
    FormsModule,
    MatIconModule,
    CommonModule
  ],
  templateUrl: './market-add-product.component.html',
  styleUrls: ['./market-add-product.component.css']
})
export class MarketAddProductComponent implements OnInit {
  readonly templateKeywords = signal<string[]>([]);
  announcer = inject(LiveAnnouncer);
  productObj: MarketPrice = new MarketPrice();

  cropsObj: Crop[] = [];
  selectedVarieties!: Variety[];
  isVerityVisible = false;
  selectedImage!: any

  constructor(private marketSrv: MarketPlaceService, private router: Router) { }

  ngOnInit(): void {
    this.getAllCropVerity();
    this.calculeSalePrice();
  }

  getAllCropVerity() {
    this.marketSrv.getCropVerity().subscribe(
      (res) => {
        this.cropsObj = res;
        console.log("Crops fetched successfully:", res);
      },
      (error) => {
        console.log("Error: Crop variety fetching issue", error);
      }
    );
  }

  onCropChange() {
    const sample = this.cropsObj.filter(crop => crop.cropId === +this.productObj.selectId);

    console.log("Filtered crops:", sample);

    if (sample.length > 0) {
      this.selectedVarieties = sample[0].variety;
      console.log("Selected crop varieties:", this.selectedVarieties);
      this.isVerityVisible = true;
    } else {
      console.log("No crop found with selectId:", this.productObj.selectId);
    }
  }

  selectVerityImage() {
    const sample = this.selectedVarieties.filter(verity => verity.id === +this.productObj.variety);
    console.log(sample[0].image);
    this.selectedImage = sample[0].image


  }


  calculeSalePrice() {
    this.productObj.discount = this.productObj.normalPrice * this.productObj.discountedPrice / 100;
    this.productObj.salePrice = this.productObj.normalPrice - this.productObj.normalPrice * this.productObj.discountedPrice / 100;
    console.log(this.productObj.salePrice);
  }

  // displayType

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


    if (this.productObj.promo) {
      if (!this.productObj.category || !this.productObj.cropName || !this.productObj.variety || !this.productObj.normalPrice || !this.productObj.unitType || !this.productObj.startValue || !this.productObj.changeby || !this.productObj.discountedPrice || !this.productObj.salePrice) {
        Swal.fire('Warning', 'Please fill in all the required fields', 'warning');
        return;
      }
    } else {
      if (!this.productObj.category || !this.productObj.cropName || !this.productObj.variety || !this.productObj.normalPrice || !this.productObj.unitType || !this.productObj.startValue || !this.productObj.changeby) {
        Swal.fire('Warning', 'Please fill in all the required fields', 'warning');
        return;
      }
    }

    this.marketSrv.createProduct(this.productObj).subscribe(
      (res) => {
        if (res.status) {
          Swal.fire('Success', 'Product Created Successfully', 'success');
          this.router.navigate(['/market/action/view-products-list'])

          this.onCancel();
        } else {
          Swal.fire('Error', 'Product Creation Failed', 'error');
        }
      },
      (error) => {
        console.error("Product creation error:", error);
        Swal.fire('Error', 'An error occurred while creating the product', 'error');
      }
    );
    console.log("Form submitted:", this.productObj);
  }

  addTemplateKeyword(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.templateKeywords.update(keywords => {
        const updatedKeywords = [...keywords, value];
        this.updateTags();
        return updatedKeywords;
      });
      this.announcer.announce(`added ${value} to template form`);
    }

    event.chipInput!.clear();
  }

  removeTemplateKeyword(keyword: string) {
    this.templateKeywords.update(keywords => {
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
}

class Crop {
  cropId!: number;
  cropNameEnglish!: string;
  variety!: Variety[];
}

class MarketPrice {
  cropName!: string;
  variety!: number;
  displayName!: string;
  normalPrice: number = 0;
  discountedPrice: number = 0;
  promo: boolean = false;
  unitType!: string;
  startValue!: number;
  changeby!: number;
  tags: string = '';
  category!: String

  selectId!: number;
  displaytype!: string;
  salePrice: number = 0;
  discount:number = 0.00;
}

class Variety {
  id!: number;
  varietyEnglish!: string;
  image!: any
}

