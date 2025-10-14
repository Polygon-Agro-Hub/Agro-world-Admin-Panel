import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-finance-action',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './finance-action.component.html',
  styleUrl: './finance-action.component.css',
})
export class FinanceActionComponent {
  constructor(
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) {}

  govicarePackages(): void {
    this.router.navigate(['/finance/action/govicare-packages']);
  }
}
