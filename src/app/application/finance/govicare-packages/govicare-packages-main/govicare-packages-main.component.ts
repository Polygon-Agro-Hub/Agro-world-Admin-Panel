import { CommonModule } from '@angular/common';
import { Component, OnInit, Inject } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { GovicarePackagesFirstRowComponent } from '../govicare-packages-first-row/govicare-packages-first-row.component';
import { GovicareAreaChartComponent } from '../govicare-area-chart/govicare-area-chart.component';
import { GovicarePichartComponent } from '../govicare-pichart/govicare-pichart.component';
import { GovicareThurdRowComponent } from '../govicare-thurd-row/govicare-thurd-row.component';
import { FinanceService, DashboardData } from '../../../../services/finance/finance.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-govicare-packages-main',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    GovicarePackagesFirstRowComponent,
    GovicareAreaChartComponent,
    GovicarePichartComponent,
    GovicareThurdRowComponent,
  ],
  templateUrl: './govicare-packages-main.component.html',
  styleUrl: './govicare-packages-main.component.css',
})
export class GovicarePackagesMainComponent implements OnInit {
  isLoading: boolean = false;
  dashboardData: DashboardData | null = null;

  constructor(
    @Inject(FinanceService) private financeService: FinanceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.financeService.getDashboardData().subscribe({
      next: (response) => {
        if (response.status) {
          this.dashboardData = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
      }
    });
  }
  
    back(): void {
    this.router.navigate(['/finance/action/govicare-finance']); 
  }
  
  
}