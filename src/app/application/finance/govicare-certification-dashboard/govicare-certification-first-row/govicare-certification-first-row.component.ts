import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Define the interface locally to match the certificate dashboard structure
export interface CertificateStatistics {
  totalCertificates: number;
  activeEnrollments: number;
  expiredEnrollments: number;
  monthlyIncome: number;
  relativeIncomeValue: number;
  incomeStatus: string;
}

export interface CertificateDashboardData {
  statistics: CertificateStatistics;
}

@Component({
  selector: 'app-govicare-certification-first-row',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './govicare-certification-first-row.component.html',
  styleUrl: './govicare-certification-first-row.component.css'
})
export class GovicareCertificationFirstRowComponent {
  @Input() dashboardData: CertificateDashboardData | null = null;

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}