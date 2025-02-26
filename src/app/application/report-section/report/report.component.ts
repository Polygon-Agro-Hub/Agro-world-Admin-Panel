import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css'
})
export class ReportComponent {
  constructor(private router: Router, public tokenService: TokenService,
      public permissionService: PermissionService) {}

  coReport(): void {
    this.router.navigate(['/reports/collective-officer-report']);
  }

  districtReport(): void {
    this.router.navigate(['/reports/collective-officer/district-report']);
  }

  provinceReport(): void {
    this.router.navigate(['/reports/collective-officer/province-report']);
  }

}
