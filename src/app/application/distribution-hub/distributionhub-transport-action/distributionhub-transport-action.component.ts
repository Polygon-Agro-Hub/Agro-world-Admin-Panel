import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';

@Component({
  selector: 'app-distributionhub-transport-action',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './distributionhub-transport-action.component.html',
  styleUrl: './distributionhub-transport-action.component.css'
})
export class DistributionhubTransportActionComponent {
  isLoading = false;

  constructor(
    private router: Router,
    public permissionService: PermissionService,
    public tokenService: TokenService
  ) { }

  navigateToViewVehicles(): void {
    this.isLoading = true;
    this.router.navigate(['/distribution-hub/action/view-vehicles'], {
      queryParams: { type: 'distribution' }
    }).then(() => {
      this.isLoading = false;
    });
  }

  navigateToResonsToReturn(): void {
    this.isLoading = true;
    this.router.navigate(['/distribution-hub/action/reasons-to-return'], {
      queryParams: { type: 'distribution' }
    }).then(() => {
      this.isLoading = false;
    });
  }

  navigateToTodaysDeliveries(): void {
    this.isLoading = true;
    this.router.navigate(['/distribution-hub/action/todays-deliveries'], {
      queryParams: { type: 'distribution' }
    }).then(() => {
      this.isLoading = false;
    });
  }

  navigateToResonsHold(): void {
    this.isLoading = true;
    this.router.navigate(['/distribution-hub/action/reasons-to-hold'], {
      queryParams: { type: 'distribution' }
    }).then(() => {
      this.isLoading = false;
    });
  }

  navigateTorecievedReturns(): void {
    this.isLoading = true;
    this.router.navigate(['/distribution-hub/action/recieved-returns']).then(() => {
      this.isLoading = false;
    });
  }

  back(): void {
    this.isLoading = true;
    this.router.navigate(['/distribution-hub/action'], {
      queryParams: { type: 'distribution' }
    }).then(() => {
      this.isLoading = false;
    });
  }

}
