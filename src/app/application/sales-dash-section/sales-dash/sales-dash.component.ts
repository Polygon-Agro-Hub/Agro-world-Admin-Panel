import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component'
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
 
@Component({
  selector: 'app-sales-dash',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './sales-dash.component.html',
  styleUrl: './sales-dash.component.css'
})
export class SalesDashComponent {

  constructor(private router: Router, public tokenService: TokenService,
      public permissionService: PermissionService,){}

  viewOrders(): void {
    // this.isLoading = true;
    this.router.navigate(['/sales-dash/view-orders']).then(() => {
      // this.isLoading = false;
    });
  }


    viewCustomers(): void {
    // this.isLoading = true;
    this.router.navigate(['/sales-dash/customer']).then(() => {
      // this.isLoading = false;
    });
  }


      viewTargets(): void {
    // this.isLoading = true;
    this.router.navigate(['/sales-dash/sales-targets']).then(() => {
      // this.isLoading = false;
    });
  }

}
