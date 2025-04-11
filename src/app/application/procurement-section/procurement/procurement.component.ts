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
  styleUrl: './procurement.component.css'
})
export class ProcurementComponent {
  constructor(
    private router: Router, 
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) {}


  purchaseReport(): void {
    this.router.navigate(['/procurement/received-orders']);
  }


}
