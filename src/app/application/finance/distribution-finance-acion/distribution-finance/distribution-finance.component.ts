import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FinanceService } from '../../../../services/finance/finance.service';
import { PermissionService } from '../../../../services/roles-permission/permission.service';
import { TokenService } from '../../../../services/token/services/token.service';
@Component({
  selector: 'app-distribution-finance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './distribution-finance.component.html',
  styleUrl: './distribution-finance.component.css',
})
export class DistributionFinanceComponent implements OnInit {
  popupShortagePurchases = false;
  popupCODTransactions = false;
  popupCOPTransactions = false;
  popupViewTransactions = false;
  shortageSubmissionsCount = 0;
  copTransactionsCount = 0;
  constructor(
    private router: Router,
    private financeService: FinanceService,
    public tokenService: TokenService,
    public permissionService: PermissionService,
  ) { }
  ngOnInit(): void {
    this.loadShortageSubmissionsCount();
    this.loadCOPTransactionsCount();
  }
  loadShortageSubmissionsCount(): void {
    this.financeService
      .getAllShortageSubmissions(1, 1, '', '', '')
      .subscribe({
        next: (res) => {
          this.shortageSubmissionsCount = res.total || 0;
        },
        error: (err) => {
          console.error('Error fetching shortage submissions count', err);
          this.shortageSubmissionsCount = 0;
        },
      });
  }
  loadCOPTransactionsCount(): void {
    this.financeService
      .getAllCOPTransactions(1, 1, '', '', '')
      .subscribe({
        next: (res) => {
          this.copTransactionsCount = res.total || 0;
        },
        error: (err) => {
          console.error('Error fetching COP transactions count', err);
          this.copTransactionsCount = 0;
        },
      });
  }
  goBack() {
    this.router.navigate(['/finance/action']);
  }
  togglePopupShortagePurchases() {
    this.popupShortagePurchases = !this.popupShortagePurchases;
    if (this.popupShortagePurchases) {
      this.popupCODTransactions = false;
      this.popupViewTransactions = false;
    }
  }
  togglePopupViewTransactions() {
    this.popupViewTransactions = !this.popupViewTransactions;
    if (this.popupViewTransactions) {
      this.popupShortagePurchases = false;
      this.popupCODTransactions = false;
    }
  }
  togglePopupCODTransactions() {
    this.popupCODTransactions = !this.popupCODTransactions;
    if (this.popupCODTransactions) {
      this.popupShortagePurchases = false;
      this.popupViewTransactions = false;
    }
  }
  ViewSubmissions(): void {
    this.router.navigate([
      '/finance/action/distribution-finance/view-submissions',
    ]);
  }
  ViewTransactions(): void {
    this.router.navigate([
      '/finance/action/distribution-finance/view-transactions',
    ]);
  }
}