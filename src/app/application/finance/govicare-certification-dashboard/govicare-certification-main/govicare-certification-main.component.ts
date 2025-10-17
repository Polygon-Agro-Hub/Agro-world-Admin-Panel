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
      statistics: {
        totalUsers: 156,
        proUsers: 42,
        freeUsers: 114,
        monthlyIncome: 89250,
        relativeIncomeValue: 15.3,
        incomeStatus: 'increased',
      },
      recentPayments: [
        {
          transactionId: 'TXN-015',
          farmerName: 'Kamal Perera',
          packagePeriod: '12months',
          amount: '12,500.00',
          dateTime: '2025-01-15 09:25',
        },
        {
          transactionId: 'TXN-014',
          farmerName: 'Samantha Silva',
          packagePeriod: '6months',
          amount: '7,500.00',
          dateTime: '2025-01-14 14:30',
        },
        {
          transactionId: 'TXN-013',
          farmerName: 'Nimal Fernando',
          packagePeriod: '12months',
          amount: '12,500.00',
          dateTime: '2025-01-13 11:15',
        },
        {
          transactionId: 'TXN-012',
          farmerName: 'Priya Rathnayake',
          packagePeriod: '3months',
          amount: '4,500.00',
          dateTime: '2025-01-12 16:45',
        },
      ],
      packageEnrollments: {
        free: 114,
        pro: 42,
      },
      monthlyStatistics: [
        {
          month: '2024-01',
          monthName: 'Jan',
          payments: 12,
          revenue: 45000,
        },
        {
          month: '2024-02',
          monthName: 'Feb',
          payments: 18,
          revenue: 68000,
        },
        {
          month: '2024-03',
          monthName: 'Mar',
          payments: 22,
          revenue: 82000,
        },
        {
          month: '2024-04',
          monthName: 'Apr',
          payments: 15,
          revenue: 58000,
        },
        {
          month: '2024-05',
          monthName: 'May',
          payments: 28,
          revenue: 15000,
        },
        {
          month: '2024-06',
          monthName: 'Jun',
          payments: 32,
          revenue: 12000,
        },
        {
          month: '2024-07',
          monthName: 'Jul',
          payments: 30,
          revenue: 18000,
        },
        {
          month: '2024-08',
          monthName: 'Aug',
          payments: 35,
          revenue: 14000,
        },
        {
          month: '2024-09',
          monthName: 'Sep',
          payments: 38,
          revenue: 16000,
        },
        {
          month: '2024-10',
          monthName: 'Oct',
          payments: 34,
          revenue: 35000,
        },
        {
          month: '2024-11',
          monthName: 'Nov',
          payments: 40,
          revenue: 82000,
        },
        {
          month: '2024-12',
          monthName: 'Dec',
          payments: 45,
          revenue: 82000,
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
          'Nov',
          'Dec',
        ],
        values: [
          45000, 68000, 82000, 58000, 82000, 58000, 82000, 58000, 82000, 58000,
          58000, 58000,
        ],
      },
    };
  }

  // Optional: Method to refresh data if needed
  refreshData(): void {
    this.loadDashboardData();
  }
}
