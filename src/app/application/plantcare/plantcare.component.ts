import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-plantcare',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plantcare.component.html',
  styleUrl: './plantcare.component.css'
})
export class PlantcareComponent {
  popupVisibleNews = false;
  popupVisibleMarketPrice = false;
  popupVisibleCropCalender = false;

  togglePopupNews() {
    this.popupVisibleNews = !this.popupVisibleNews;
    if(this.popupVisibleMarketPrice=true){
      this.popupVisibleMarketPrice = !this.popupVisibleMarketPrice;
    }
    if(this.popupVisibleCropCalender = true){
      this.popupVisibleCropCalender = !this.popupVisibleCropCalender;
    }
  }

  togglePopupMarketPrice() {
    this.popupVisibleMarketPrice = !this.popupVisibleMarketPrice;
    if(this.popupVisibleNews=true){
      this.popupVisibleNews = !this.popupVisibleNews;
    }
    if(this.popupVisibleCropCalender = true){
      this.popupVisibleCropCalender = !this.popupVisibleCropCalender;
    }
  }

  togglePopupCropCalender(){
    this.popupVisibleCropCalender = !this.popupVisibleCropCalender;
    if(this.popupVisibleNews=true){
      this.popupVisibleNews = !this.popupVisibleNews;
    }
    if(this.popupVisibleMarketPrice = true){
      this.popupVisibleMarketPrice = !this.popupVisibleMarketPrice;
    }
  }
}
