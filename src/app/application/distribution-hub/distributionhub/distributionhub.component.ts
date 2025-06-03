import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';

@Component({
  selector: 'app-distributionhub',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './distributionhub.component.html',
  styleUrl: './distributionhub.component.css',
})
export class DistributionhubComponent {
  isLoading = false;

  popupVisibleNews = false;
  popupVisibleMarketPrice = false;
  popupVisibleCropCalender = false;

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

  navigateToCreateNews(): void {
    this.isLoading = true;
    this.router.navigate(['/distribution-hub/action']).then(() => {
      this.isLoading = false;
    });
  }

  navigateToViewCompanies(): void {
    this.isLoading = true;
    this.router
      .navigate(['/distribution-hub/action/view-companies'])
      .then(() => {
        this.isLoading = false;
      });
  }

  createCalendar(): void {
    this.router.navigate(['/distribution-hub/action']);
  }

  manageCalendar(): void {
    this.router.navigate(['/distribution-hub/action']);
  }

  createCropGroup(): void {
    this.router.navigate(['/distribution-hub/action']);
  }

  viewCropGroup(): void {
    this.router.navigate(['/distribution-hub/action']);
  }

  createVariety(): void {
    this.router.navigate(['/distribution-hub/action']);
  }

  publicForum(): void {
    this.router.navigate(['/distribution-hub/action']);
  }

  ongoingCultivation(): void {
    this.router.navigate(['/distribution-hub/action']);
  }

  assets(): void {
    this.router.navigate(['/distribution-hub/action']);
  }

  feedBack(): void {
    this.router.navigate(['/distribution-hub/action']);
  }
}
