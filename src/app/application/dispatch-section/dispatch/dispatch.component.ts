import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-dispatch',
  standalone: true,
  imports: [],
  templateUrl: './dispatch.component.html',
  styleUrl: './dispatch.component.css'
})
export class DispatchComponent {
constructor(
    private router: Router, 
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) {}



  salesDashOrders(): void {
    this.router.navigate(['/dispatch/salesdash-orders']);
  }

}
