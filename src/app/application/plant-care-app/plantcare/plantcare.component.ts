import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

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

   constructor(private router: Router){}
  

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




  navigateToCreateNews(): void {
    this.router.navigate(['/plant-care/action/create-news']);
  }

  navigateToManageNews(): void {
    this.router.navigate(['/plant-care/action/manage-content']);
  }
}
