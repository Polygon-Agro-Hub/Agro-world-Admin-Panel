import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { CommonModule } from '@angular/common';
import { ProcumentsService } from '../../../services/procuments/procuments.service';

@Component({
  selector: 'app-procurement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './procurement.component.html',
  styleUrl: './procurement.component.css',
})
export class ProcurementComponent implements OnInit {

  istogglePopupProductStorageView = false;
  istogglePopupContainerSizesView = false;
  istogglePopupLoadMismatchView = false;
  pendingLoadAlertsCount = 0;

  constructor(
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService,
    private procumentsService: ProcumentsService
  ) { }

  ngOnInit(): void {
    this.loadPendingLoadAlertsCount();
  }

  loadPendingLoadAlertsCount(): void {
    this.procumentsService.getLoadMismatchReportsToday().subscribe({
      next: (data) => {
        this.pendingLoadAlertsCount = data.length;
      },
      error: (err) => {
        console.error('Failed to load pending load alerts count', err);
        this.pendingLoadAlertsCount = 0;
      },
    });
  }

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

  togglePopupContainerSizes(): void {
    this.istogglePopupContainerSizesView = !this.istogglePopupContainerSizesView;
  }
}