import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FinanceService } from '../../../../services/finance/finance.service';

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

  shortageSubmissionsCount = 0;

  constructor(
    private router: Router,
    private financeService: FinanceService,
  ) {}

  ngOnInit(): void {
    this.loadShortageSubmissionsCount();
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

  goBack() {
    this.router.navigate(['/finance/action']);
  }

  togglePopupShortagePurchases() {
    this.popupShortagePurchases = !this.popupShortagePurchases;
    if (this.popupShortagePurchases) {
      this.popupCODTransactions = false;
    }
  }

  togglePopupCODTransactions() {
    this.popupCODTransactions = !this.popupCODTransactions;
    if (this.popupCODTransactions) {
      this.popupShortagePurchases = false;
    }
  }

  ViewSubmissions(): void {
    this.router.navigate([
      '/finance/action/distribution-finance/view-submissions',
    ]);
  }
}