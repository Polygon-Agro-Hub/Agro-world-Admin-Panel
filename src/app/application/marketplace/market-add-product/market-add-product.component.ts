import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { CommonModule } from '@angular/common';

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
  isVerityVisible = false
  constructor(private marketSrv: MarketPlaceService) { }


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
      this.isVerityVisible = true
    } else {
      console.log("No crop found with selectId:", this.productObj.selectId);
    }
  }

  calculeSalePrice(){
    this.productObj.salePrice = this.productObj.normalPrice - this.productObj.normalPrice * this.productObj.discountedPrice /100;
    console.log(this.productObj.salePrice);
  }

  onCancel(){
    this.productObj = new MarketPrice();
    this.selectedVarieties = [];
    this.isVerityVisible = false;
    this.templateKeywords.update(() => []);
  }

  onSubmit() {
    // Handle form submission
    console.log("Form submitted:", this.productObj);
  }

  removeTemplateKeyword(keyword: string) {
    this.templateKeywords.update(keywords => {
      const index = keywords.indexOf(keyword);
      if (index < 0) {
        return keywords;
      }

      keywords.splice(index, 1);
      this.announcer.announce(`removed ${keyword} from template form`);
      return [...keywords];
    });
  }

  addTemplateKeyword(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.templateKeywords.update(keywords => [...keywords, value]);
      this.announcer.announce(`added ${value} to template form`);
    }

    event.chipInput!.clear();
  }
}

class Crop {
  cropId!: number;
  cropNameEnglish!: string;
  variety!: Variety[];
}

class MarketPrice {
  cropName!: string;
  variety!: string;
  displayName!: string;
  normalPrice: number = 0;
  discountedPrice: number = 0;
  promo: boolean = false;

  selectId!: number;
  displaytype!:string
  salePrice:number = 0
}

class Variety {
  id!: number;
  varietyEnglish!: string;
}
