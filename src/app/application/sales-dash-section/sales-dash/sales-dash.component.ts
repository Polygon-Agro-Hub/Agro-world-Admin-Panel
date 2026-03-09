import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
 
@Component({
  selector: 'app-sales-dash',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-dash.component.html',
  styleUrl: './sales-dash.component.css'
})
export class SalesDashComponent {

  constructor(private router: Router, public tokenService: TokenService,
      public permissionService: PermissionService,){}

  viewOrders(): void {
    this.router.navigate(['/sales-dash/view-orders']).then(() => {
    });
  }


    viewCustomers(): void {
    this.router.navigate(['/sales-dash/customer']).then(() => {
    });
  }


      viewTargets(): void {
    this.router.navigate(['/sales-dash/sales-targets']).then(() => {
    });
  }

}
