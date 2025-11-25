import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PermissionService } from '../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-investment-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './investment-requests.component.html',
  styleUrl: './investment-requests.component.css',
})
export class InvestmentRequestsComponent {
  constructor(
    private router: Router,
    public permissionService: PermissionService
  ) {}

  goBack() {
    this.router.navigate(['/finance/action']);
  }


  projectInvestments(): void {
    this.router.navigate(['/finance/action/finance-govicapital/project-investments']);
  }
  
    ViewAllGovicareRequests(): void {
    this.router.navigate(['/finance/action/finance-govicapital/ivesment-requests/viewAll-Govicare-requests']);
  }
  
    ViewApprovedGovicareRequests(): void {
    this.router.navigate(['/finance/action/finance-govicapital/ivesment-requests/viewAll-Govicare-ApprovedRequests']);
  }
}
