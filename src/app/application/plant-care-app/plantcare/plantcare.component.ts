import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component'

@Component({
  selector: 'app-plantcare',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './plantcare.component.html',
  styleUrl: './plantcare.component.css'
})
export class PlantcareComponent {

  isLoading = false;

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
    this.isLoading = true;
    this.router.navigate(['/plant-care/action/create-news']).then(() => {
      this.isLoading = false;
    });
  }

  navigateToManageNews(): void {
    this.isLoading = true;
    this.router.navigate(['/plant-care/action/manage-content']).then(() => {
      this.isLoading = false;
    });
  }




  createCalendar(): void {
    this.router.navigate(['/plant-care/action/create-crop-calender']);
  }

  manageCalendar(): void {
    this.router.navigate(['/plant-care/action/view-crop-calender']);
  }  
  
  createCropGroup(): void {
    this.router.navigate(['/plant-care/action/create-crop-group']);
  }

  viewCropGroup(): void {
    this.router.navigate(['/plant-care/action/view-crop-group']);
  }

  createVariety(): void {
    this.router.navigate(['/plant-care/action/create-crop-variety']);
  }





  publicForum(): void {
    this.router.navigate(['/plant-care/action/public-forum']);
  }






  ongoingCultivation(): void {
    this.router.navigate(['/plant-care/action/ongoing-cultivation']);
  }




  assets(): void {
    this.router.navigate(['/plant-care/action/report-farmer-list']);
  }



  feedBack(): void {
    this.router.navigate(['/plant-care/action/opt-out-feedbacks']);
  }

  
}
