import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';

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
    private router: Router
  ) { }

  navigateToResonsToReturn(): void {
    this.isLoading = true;
    this.router.navigate(['/distribution-hub/action/reasons-to-return'], {
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

  back(): void{
    this.isLoading= true;
     this.router.navigate(['/distribution-hub/action'], {
      queryParams: { type: 'distribution' }
    }).then(() => {
      this.isLoading = false;
    });
  }

}
