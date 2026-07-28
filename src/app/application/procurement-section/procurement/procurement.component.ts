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
}