import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FinanceService } from '../../../services/finance/finance.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import {
  FinanceMainDashboardCounts,
  FinanceMainDashboardIncome,
} from '../../../services/finance/finance.service';

interface CountCard {
  label: string;
  key: keyof FinanceMainDashboardCounts;
  bgColor: string;
  faIcon: string;
}

interface IncomeCard {
  label: string;
  key: keyof FinanceMainDashboardIncome;
  faIcon: string;
  iconBg: string;
  iconColor: string;
  isExpense?: boolean;
}

@Component({
  selector: 'app-finance-dashboard',
  standalone: true,
  imports: [CommonModule, NgClass, LoadingSpinnerComponent],
  templateUrl: './finance-dashboard.component.html',
  styleUrl: './finance-dashboard.component.css',
})
export class FinanceDashboardComponent implements OnInit {
  counts: FinanceMainDashboardCounts | null = null;
  income: FinanceMainDashboardIncome | null = null;
  loading = true;
  error = false;

  currentMonthLabel = this.getMonthLabel();

  countCards: CountCard[] = [
    {
      label: 'All Pension Requests',
      key: 'allPensionRequests',
      bgColor: '#0D9488',
      faIcon: 'fa-solid fa-hand-holding-heart',
    },
    {
      label: 'Supplier Upgrades',
      key: 'supplierUpgrades',
      bgColor: '#FB923C',
      faIcon: 'fa-solid fa-arrow-up-right-dots',
    },
    {
      label: 'All Project Requests',
      key: 'allProjectRequests',
      bgColor: '#3B82F6',
      faIcon: 'fa-solid fa-diagram-project',
    },
    {
      label: 'Published Projects',
      key: 'publishedProjects',
      bgColor: '#B78C00',
      faIcon: 'fa-solid fa-bullhorn',
    },
  ];

  incomeCards: IncomeCard[] = [
    {
      label: 'GoViCare Pro Income',
      key: 'goviCareProIncome',
      faIcon: 'fa-regular fa-star',
      iconBg: '#FFFBE7',
      iconColor: '#F9A825',
    },
    {
      label: 'Certifications Income',
      key: 'certificationsIncome',
      faIcon: 'fa-solid fa-certificate',
      iconBg: '#D5FFF8',
      iconColor: '#00897B',
    },
    {
      label: 'Collection Expenses',
      key: 'collectionExpenses',
      faIcon: 'fa-solid fa-carrot',
      iconBg: '#FFEDD0',
      iconColor: '#EF6C00',
      isExpense: true,
    },
    {
      label: 'GoViMart Sales Income',
      key: 'goviMartSalesIncome',
      faIcon: 'fa-solid fa-coins',
      iconBg: '#F7E4FF',
      iconColor: '#6A1B9A',
    },
    {
      label: 'SalesDash Sales Income',
      key: 'salesDashIncome',
      faIcon: 'fa-solid fa-bag-shopping',
      iconBg: '#F7E4FF',
      iconColor: '#6A1B9A',
    },
    {
      label: 'Loss Due to Returned Orders',
      key: 'returnedOrdersLoss',
      faIcon: 'fa-solid fa-triangle-exclamation',
      iconBg: '#FBCCCD',
      iconColor: '#C62828',
      isExpense: true,
    },
    {
      label: 'GoViShop Premium Income',
      key: 'goviShopPremiumIncome',
      faIcon: 'fa-solid fa-star',
      iconBg: '#FFF1E2',
      iconColor: '#FF8F00',
    },
    {
      label: 'GoViShop Order Commission',
      key: 'goviShopOrderCommission',
      faIcon: 'fa-solid fa-percent',
      iconBg: '#FFEDD5',
      iconColor: '#E65100',
    },
  ];

  constructor(private financeService: FinanceService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = false;
    this.financeService.getFinanceMainDashboard().subscribe({
      next: (res) => {
        if (res.status) {
          this.counts = res.data.counts;
          this.income = res.data.income;
        } else {
          this.error = true;
        }
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  formatCurrency(value: number | undefined): string {
    if (value === undefined || value === null) return 'Rs. 0.00';
    return `Rs. ${value.toLocaleString('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  getCountValue(key: keyof FinanceMainDashboardCounts): number {
    return this.counts ? this.counts[key] : 0;
  }

  getIncomeValue(key: keyof FinanceMainDashboardIncome): number {
    return this.income ? this.income[key] : 0;
  }

  private getMonthLabel(): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return months[new Date().getMonth()];
  }
}