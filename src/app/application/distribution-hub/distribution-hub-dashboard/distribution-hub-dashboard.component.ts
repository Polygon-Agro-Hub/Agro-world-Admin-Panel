import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { DistributionHubService } from '../../../services/distribution-hub/distribution-hub.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { DistributionDashboardData } from '../../../services/distribution-hub/distribution-hub.service';

interface CountCard {
  label: string;
  key: keyof Pick<
    DistributionDashboardData,
    'totalHeadOfficers' | 'totalCentres' | 'totalManagers' | 'totalDrivers'
  >;
  bgColor: string;
  faIcon: string;
}

interface MetricCard {
  label: string;
  key: keyof DistributionDashboardData;
  faIcon: string;
  iconBg: string;
  iconColor: string;
  isExpense?: boolean;
  isCurrency?: boolean;
}

@Component({
  selector: 'app-distribution-hub-dashboard',
  standalone: true,
  imports: [CommonModule, NgClass, LoadingSpinnerComponent],
  templateUrl: './distribution-hub-dashboard.component.html',
  styleUrl: './distribution-hub-dashboard.component.css',
})
export class DistributionHubDashboardComponent implements OnInit {
  dashboardData: DistributionDashboardData | null = null;
  loading = true;
  error = false;

  currentMonthLabel = this.getMonthLabel();

  countCards: CountCard[] = [
    {
      label: 'Total Head Officers',
      key: 'totalHeadOfficers',
      bgColor: '#0D9488',
      faIcon: 'fa-solid fa-layer-group',
    },
    {
      label: 'Total Centres',
      key: 'totalCentres',
      bgColor: '#FB923C',
      faIcon: 'fa-solid fa-layer-group',
    },
    {
      label: 'Total Managers',
      key: 'totalManagers',
      bgColor: '#3B82F6',
      faIcon: 'fa-solid fa-layer-group',
    },
    {
      label: 'Total Drivers',
      key: 'totalDrivers',
      bgColor: '#B78C00',
      faIcon: 'fa-solid fa-layer-group',
    },
  ];

  todayCards: MetricCard[] = [
    {
      label: 'Total Delivered Orders',
      key: 'totalDeliveredToday',
      faIcon: 'fa-solid fa-truck',
      iconBg: '#EFF6FF',
      iconColor: '#3B82F6',
    },
    {
      label: 'Total In-Store Pickup Orders',
      key: 'totalPickupToday',
      faIcon: 'fa-solid fa-bag-shopping',
      iconBg: '#FFEDD5',
      iconColor: '#F97316',
    },
    {
      label: 'Loss Due to Returned Orders',
      key: 'returnLossToday',
      faIcon: 'fa-solid fa-triangle-exclamation',
      iconBg: '#FBCCCD',
      iconColor: '#C62828',
      isExpense: true,
      isCurrency: true,
    },
  ];

  monthCards: MetricCard[] = [
    {
      label: 'Total Delivered Orders',
      key: 'totalDeliveredMonth',
      faIcon: 'fa-solid fa-truck',
      iconBg: '#EFF6FF',
      iconColor: '#3B82F6',
    },
    {
      label: 'Total In-Store Pickup Orders',
      key: 'totalPickupMonth',
      faIcon: 'fa-solid fa-bag-shopping',
      iconBg: '#FFEDD5',
      iconColor: '#F97316',
    },
    {
      label: 'Loss Due to Returned Orders',
      key: 'returnLossMonth',
      faIcon: 'fa-solid fa-triangle-exclamation',
      iconBg: '#FBCCCD',
      iconColor: '#C62828',
      isExpense: true,
      isCurrency: true,
    },
  ];

  constructor(private distributionHubService: DistributionHubService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = false;
    this.distributionHubService.getDistributionDashboard().subscribe({
      next: (res) => {
        if (res.success) {
          this.dashboardData = res.data;
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

  getCountValue(
    key: keyof Pick<
      DistributionDashboardData,
      'totalHeadOfficers' | 'totalCentres' | 'totalManagers' | 'totalDrivers'
    >
  ): number {
    return this.dashboardData ? this.dashboardData[key] : 0;
  }

  getDashboardValue(key: keyof DistributionDashboardData): number {
    return this.dashboardData ? (this.dashboardData[key] as number) : 0;
  }

  private getMonthLabel(): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return months[new Date().getMonth()];
  }
}