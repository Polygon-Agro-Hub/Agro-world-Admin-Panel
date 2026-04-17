import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-govishop-action',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './govishop-action.component.html',
  styleUrl: './govishop-action.component.css'
})
export class GovishopActionComponent {
  constructor(
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService,
  ) { }

  navPath(path: string) {
    this.router.navigate([path]);
  }

  navigateToShopRequests() {
    this.router.navigate(['/govi-shop/action/all-shop-requests']).then(() => {});
  }

    navigateToShops() {
    this.router.navigate(['/govi-shop/action/all-govi-shops']).then(() => {});
  }

  navigateToDeletedSuppliers() {
    this.router.navigate(['/govi-shop/action/deleted-suppliers']).then(() => {}); 
  }
  
}
