import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-finance-action-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './finance-action-main.component.html',
  styleUrl: './finance-action-main.component.css'
})
export class FinanceActionMainComponent {
  popupVisibleCropCalender = false;
  popupVisibleNews = false;
  popupVisibleMarketPrice = false;

  constructor(
      private router: Router,
      public tokenService: TokenService,
      public permissionService: PermissionService
    ) { }

    farmerPayments(): void {
    this.router.navigate(['/finance/action/govicare-finance']);
  }

  govicarePackages(): void {
    this.router.navigate(['/finance/action/govicare-packages']);
  }

  govilinkServices(): void {
    this.router.navigate(['/finance/action/govilink-services-dashboard']);
  }

  govicareCertificates(): void {
    this.router.navigate(['/finance/action/govicare-certifications-dashboard']);
  }

  commissionRangeNavigation(): void {
    this.router.navigate(['/finance/action/commission-range']);
  }

  PaymentHistoryNavigation(): void {
    this.router.navigate(['/finance/action/viewAll-payments']);
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

  invesmentRequest(): void {
    this.router.navigate(['/finance/action/finance-govicapital/ivesment-requests']);
  }
}
