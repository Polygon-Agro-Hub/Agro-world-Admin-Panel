import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-govi-shop-finance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './govi-shop-finance.component.html',
  styleUrl: './govi-shop-finance.component.css'
})
export class GoviShopFinanceComponent {
  popupVisibleGoviShop: boolean = false;
  popupVisibleView: boolean = false;

  constructor(
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService,

  ) { }


  togglePopupGoviShopCalender() {
    this.popupVisibleGoviShop = !this.popupVisibleGoviShop;
    if ((this.popupVisibleView = true)) {
      this.popupVisibleView = !this.popupVisibleView;
    }
  }

  navPath(path: string) {
    this.router.navigate([path])
  }

}
