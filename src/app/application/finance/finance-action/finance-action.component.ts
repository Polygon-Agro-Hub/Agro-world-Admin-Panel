import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-finance-action',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './finance-action.component.html',
  styleUrl: './finance-action.component.css',
})
export class FinanceActionComponent {
  popupVisiblePentionRequests = false;
  popupVisibleFarmerPension = false;

  constructor(
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService,
  ) {}

  farmerPayments(): void {
    this.router.navigate(['/finance/action/farmer-payments']);
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

  back(): void {
    this.router.navigate(['finance/action']);
  }

  viewPentionRequests(): void {
    this.router.navigate(['/finance/action/pension-requests']);
  }

  togglePopupPentionRequests() {
    this.popupVisiblePentionRequests = !this.popupVisiblePentionRequests;
  }

  togglePopupFarmerPension() {
    this.popupVisibleFarmerPension = !this.popupVisibleFarmerPension;
  }

  viewUnder5YearsFarmersPension(): void {
    this.router.navigate(['/finance/action/farmer-pension-under-5-years']);
  }

  viewFarmerPension5YearsPlus(): void {
    this.router.navigate(['/finance/action/farmer-pension-5-years-plus']);
  }
}
