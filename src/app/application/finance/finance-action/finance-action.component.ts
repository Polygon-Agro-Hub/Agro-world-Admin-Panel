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
  constructor(
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService
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
}
