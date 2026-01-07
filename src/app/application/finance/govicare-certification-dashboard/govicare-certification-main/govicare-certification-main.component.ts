import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { GovicareCertificationFirstRowComponent } from '../govicare-certification-first-row/govicare-certification-first-row.component';
import { GovicareCertificationAreaChartComponent } from '../govicare-certification-area-chart/govicare-certification-area-chart.component';
import { GovicareCertificationPichartComponent } from '../govicare-certification-pichart/govicare-certification-pichart.component';
import { GovicareCertificationThirdRowComponent } from '../govicare-certification-third-row/govicare-certification-third-row.component';
import {
  FinanceService,
  CertificateDashboardData,
} from '../../../../services/finance/finance.service';
import { Router } from '@angular/router';

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
  dashboardData: CertificateDashboardData | null = null;

  constructor(
    private location: Location,
    private router: Router,
    private financeService: FinanceService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  onBack(): void {
    this.router.navigate(['/finance/action/govicare-finance']);
  }

  loadDashboardData(): void {
    this.isLoading = true;

    this.financeService.getCertificateDashboardData().subscribe({
      next: (response) => {
        if (response.status) {
          this.dashboardData = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
      },
    });
  }

  refreshData(): void {
    this.loadDashboardData();
  }
}
