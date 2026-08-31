import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css',
})
export class SalesComponent {
  popupCompletedOrders = false;

  constructor(private router: Router) {}

  togglePopupDriverCategories() {
    this.popupCompletedOrders = !this.popupCompletedOrders;
  }

  goBack() {
    this.router.navigate(['/finance/action']);
  }

  ViewAllOrders(): void {
    this.router.navigate([
      '/finance/action/govi-trans-finance/view-transactions',
    ]);
  }
}
