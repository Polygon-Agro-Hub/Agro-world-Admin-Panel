import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../../../services/token/services/token.service';
import { PermissionService } from '../../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css',
})
export class SalesComponent {
  popupCompletedOrders = false;

  constructor(
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService,

  ) { }

  togglePopupDriverCategories() {
    this.popupCompletedOrders = !this.popupCompletedOrders;
  }

  goBack() {
    this.router.navigate(['/finance/action']);
  }

  ViewAllOrders(): void {
    this.router.navigate([
      '/finance/action/finance-sales/view-all-orders',
    ]);
  }
}
