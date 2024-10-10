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
  }

  togglePopupMarketPrice() {
    this.popupVisibleMarketPrice = !this.popupVisibleMarketPrice;
  }

  togglePopupCropCalender(){
    this.popupVisibleCropCalender = !this.popupVisibleCropCalender;
  }
}
