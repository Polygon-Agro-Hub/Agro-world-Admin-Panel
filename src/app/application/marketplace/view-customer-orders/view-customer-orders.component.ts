import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-customer-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-customer-orders.component.html',
  styleUrl: './view-customer-orders.component.css',
})
export class ViewCustomerOrdersComponent {
  activeTab: string = 'assigned';
  constructor(private router: Router) {}

  back(): void {
    this.router.navigate(['/market/action/view-wholesale-customers']);
  }
}
