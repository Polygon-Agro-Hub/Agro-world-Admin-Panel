import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-govi-trans-finance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './govi-trans-finance.component.html',
  styleUrl: './govi-trans-finance.component.css'
})
export class GoviTransFinanceComponent {
  popupDriverCategories = false;
  popupCODTransactions = false;

  constructor(
    private router: Router,
  ) {}

  goBack() {
    this.router.navigate(['/finance/action']);
  }

  togglePopupDriverCategories() {
    this.popupDriverCategories = !this.popupDriverCategories;
    if (this.popupDriverCategories) {
      this.popupCODTransactions = false;
    }
  }

  togglePopupCODTransactions() {
    this.popupCODTransactions = !this.popupCODTransactions;
    if (this.popupCODTransactions) {
      this.popupDriverCategories = false;
    }
  }

  ViewDriverCategories(): void {
    this.router.navigate([
      '/finance/action/govi-trans-finance/view-driver-categories'
    ]);
  }

  ViewTransactions(): void {
    this.router.navigate([
      '/finance/action/govi-trans-finance/view-transactions'
    ]);
  }

  addNewCategory(): void {
    this.router.navigate([
      '/finance/action/govi-trans-finance/add-driver-category',
    ]);
  }
}