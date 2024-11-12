import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { CommonModule } from '@angular/common';  // Importing CommonModule

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
  productObj:MarketPrice = new MarketPrice()

  cropsObj: Crop[] = []

  constructor(
    private marketSrv: MarketPlaceService
  ) { }

  ngOnInit(): void {
    this.getAllCropVerity();
  }

  getAllCropVerity() {
    this.marketSrv.getCropVerity().subscribe(
      (res) => {
        this.cropsObj = res;
        console.log(res);
      },
      (error) => {
        console.log("Error: Crop variety fetching issue", error);
      }
    );
  }

  onSubmit(){

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
  cropId!:number
  displayName!:string
  normalPrice!:string
  discountedPrice!:string
  promo!:string

  cropName!:String
}

class Variety {
  id!: number;
  varietyEnglish!: string;
}
