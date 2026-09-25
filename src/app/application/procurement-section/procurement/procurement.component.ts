import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-procurement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './procurement.component.html',
  styleUrl: './procurement.component.css',
})
export class ProcurementComponent {

  istogglePopupProductStorageView = false;

  constructor(
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) { }

  istogglePopupLoadMismatchView = false;
  pendingLoadAlertsCount = 3; // replace with real value from your service later

  togglePopupLoadMismatch() {
    this.istogglePopupLoadMismatchView = !this.istogglePopupLoadMismatchView;
  }

  togglePopupProductStorage(): void {
    this.istogglePopupProductStorageView = !this.istogglePopupProductStorageView;
  }

  purchaseReport(): void {
    this.router.navigate(['/procurement/received-orders']);
  }

  viewCenterRequirement(): void {
    this.router.navigate(['/procurement/view-centre-requirement']);
  }

  definePackages(): void {
    this.router.navigate(['/procurement/define-packages']);
  }
  dailypackingtarget(): void {
    this.router.navigate(['/procurement/daily-packing-target']);
  }

    loadmismatch(): void {
    this.router.navigate(['/procurement/pending-procurement-product-mismatch-today']);
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }
}