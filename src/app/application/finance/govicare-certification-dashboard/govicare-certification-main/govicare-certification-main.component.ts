import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { GovicareCertificationFirstRowComponent } from '../govicare-certification-first-row/govicare-certification-first-row.component';
import { GovicareCertificationAreaChartComponent } from '../govicare-certification-area-chart/govicare-certification-area-chart.component';
import { GovicareCertificationPichartComponent } from '../govicare-certification-pichart/govicare-certification-pichart.component';
import { GovicareCertificationThirdRowComponent } from '../govicare-certification-third-row/govicare-certification-third-row.component';

export interface DashboardData {
  statistics: {
    totalUsers: number;
    proUsers: number;
    freeUsers: number;
    monthlyIncome: number;
    relativeIncomeValue: number;
    incomeStatus: string;
  };
  recentPayments: {
    transactionId: string;
    farmerName: string;
    packagePeriod: string;
    amount: string;
    dateTime: string;
  }[];
  packageEnrollments: {
    free: number;
    pro: number;
  };
  monthlyStatistics: {
    month: string;
    monthName: string;
    payments: number;
    revenue: number;
  }[];
  areaChartData: {
    labels: string[];
    values: number[];
  };
}

@Component({
  selector: 'app-govicare-certification-main',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    GovicareCertificationFirstRowComponent,
    GovicareCertificationAreaChartComponent,
    GovicareCertificationPichartComponent,
    GovicareCertificationThirdRowComponent,
  ],
  templateUrl: './govicare-certification-main.component.html',
  styleUrl: './govicare-certification-main.component.css',
})
export class GovicareCertificationMainComponent implements OnInit {
  isLoading: boolean = false;
  dashboardData: DashboardData | null = null;

  constructor(private location: Location) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  onBack(): void {
    this.location.back();
  }

  loadDashboardData(): void {
    this.isLoading = true;

    // Simulate API call delay
    setTimeout(() => {
      this.dashboardData = this.getDummyData();
      this.isLoading = false;
    }, 1000);
  }

  private getDummyData(): DashboardData {
    return {
      status: true,
      data: {
        statistics: {
          totalUsers: 54,
          proUsers: 1,
          freeUsers: 53,
          monthlyIncome: 1416.666666,
          relativeIncomeValue: 0,
          incomeStatus: 'stable',
        },
        recentPayments: [
          {
            transactionId: 'TXN-8',
            farmerName: 'Hashinika Dilrukshi',
            packagePeriod: '12months',
            amount: '8,500.00',
            dateTime: '2025-09-10 07:39',
          },
          {
            transactionId: 'TXN-7',
            farmerName: 'Hashinika Dilrukshi',
            packagePeriod: '12months',
            amount: '8,500.00',
            dateTime: '2025-09-10 07:36',
          },
        ],
        packageEnrollments: {
          free: 53,
          pro: 1,
        },
        monthlyStatistics: [
          {
            month: '2025-01',
            monthName: 'Jan',
            payments: 0,
            revenue: 0,
          },
          {
            month: '2025-02',
            monthName: 'Feb',
            payments: 0,
            revenue: 0,
          },
          {
            month: '2025-03',
            monthName: 'Mar',
            payments: 0,
            revenue: 0,
          },
          {
            month: '2025-04',
            monthName: 'Apr',
            payments: 0,
            revenue: 0,
          },
          {
            month: '2025-05',
            monthName: 'May',
            payments: 0,
            revenue: 0,
          },
          {
            month: '2025-06',
            monthName: 'Jun',
            payments: 0,
            revenue: 0,
          },
          {
            month: '2025-07',
            monthName: 'Jul',
            payments: 0,
            revenue: 0,
          },
          {
            month: '2025-08',
            monthName: 'Aug',
            payments: 0,
            revenue: 0,
          },
          {
            month: '2025-09',
            monthName: 'Sep',
            payments: 2,
            revenue: 1416.666666,
          },
          {
            month: '2025-10',
            monthName: 'Oct',
            payments: 0,
            revenue: 0,
          },
        ],
        areaChartData: {
          labels: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
          ],
          values: [0, 0, 0, 0, 0, 0, 0, 0, 1416.666666, 0],
        },
      },
    }.data;
  }

  // Optional: Method to refresh data if needed
  refreshData(): void {
    this.loadDashboardData();
  }
}
