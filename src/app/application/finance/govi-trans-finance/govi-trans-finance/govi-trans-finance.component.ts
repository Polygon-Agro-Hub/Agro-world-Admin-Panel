import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FinanceService } from '../../../../services/finance/finance.service';

@Component({
  selector: 'app-govi-trans-finance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './govi-trans-finance.component.html',
  styleUrl: './govi-trans-finance.component.css'
})
export class GoviTransFinanceComponent implements OnInit {
  popupDriverCategories = false;
  popupCODTransactions = false;

  transactionsCount: number = 0;

  constructor(
    private router: Router,
    private financeSrv: FinanceService,
  ) {}

  ngOnInit(): void {
    this.getTransactionsCount();
  }

  getTransactionsCount(): void {
    this.financeSrv.fetchAllTransactions(1, 1, 'To Review', '', '').subscribe(
      (response) => {
        this.transactionsCount = response.total ?? 0;
      },
      (error) => {
        this.transactionsCount = 0;
      }
    );
  }

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