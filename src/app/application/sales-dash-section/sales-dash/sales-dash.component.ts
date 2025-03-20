import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component'
 
@Component({
  selector: 'app-sales-dash',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './sales-dash.component.html',
  styleUrl: './sales-dash.component.css'
})
export class SalesDashComponent {

  constructor(private router: Router){}

  viewOrders(): void {
    // this.isLoading = true;
    this.router.navigate(['/sales-dash/view-orders']).then(() => {
      // this.isLoading = false;
    });
  }

}
