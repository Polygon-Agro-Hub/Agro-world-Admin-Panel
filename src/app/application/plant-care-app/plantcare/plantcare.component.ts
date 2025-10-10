import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';

@Component({
  selector: 'app-plantcare',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './plantcare.component.html',
  styleUrl: './plantcare.component.css',
})
export class PlantcareComponent {
  isLoading = false;
  popupVisibleNews = false;
  popupVisibleMarketPrice = false;
  popupVisibleCropCalender = false;
  popupVisibleCertification = false;
  constructor(
    private router: Router,
    public permissionService: PermissionService,
    public tokenService: TokenService
  ) {}

  togglePopupNews() {
    this.popupVisibleNews = !this.popupVisibleNews;
    if ((this.popupVisibleMarketPrice = true)) {
      this.popupVisibleMarketPrice = !this.popupVisibleMarketPrice;
    }
    if ((this.popupVisibleCropCalender = true)) {
      this.popupVisibleCropCalender = !this.popupVisibleCropCalender;
    }
  }

  togglePopupMarketPrice() {
    this.popupVisibleMarketPrice = !this.popupVisibleMarketPrice;
    if ((this.popupVisibleNews = true)) {
      this.popupVisibleNews = !this.popupVisibleNews;
    }
    if ((this.popupVisibleCropCalender = true)) {
      this.popupVisibleCropCalender = !this.popupVisibleCropCalender;
    }
  }

  togglePopupCropCalender() {
    this.popupVisibleCropCalender = !this.popupVisibleCropCalender;
    if ((this.popupVisibleNews = true)) {
      this.popupVisibleNews = !this.popupVisibleNews;
    }
    if ((this.popupVisibleMarketPrice = true)) {
      this.popupVisibleMarketPrice = !this.popupVisibleMarketPrice;
    }
  }

  togglePopupCertification() {
    this.popupVisibleCertification = !this.popupVisibleCertification;
    if (this.popupVisibleNews) this.popupVisibleNews = false;
    if (this.popupVisibleMarketPrice) this.popupVisibleMarketPrice = false;
    if (this.popupVisibleCropCalender) this.popupVisibleCropCalender = false;
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

  addCompany(): void {
    this.router.navigate(['/plant-care/action/add-company-details']);
  }

  viewCompanyList(): void {
    this.router.navigate(['/plant-care/action/view-company-list']);
  }

  addCertificate(): void {
    this.router.navigate(['/plant-care/action/add-certificate-details']);
  }

  viewCertificateList(): void {
    this.router.navigate(['/plant-care/action/view-certificate-list']);
  }
}
