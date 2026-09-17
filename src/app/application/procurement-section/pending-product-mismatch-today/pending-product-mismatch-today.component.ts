import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProcumentsService, MismatchReport } from '../../../services/procuments/procuments.service'; 

@Component({
  selector: 'app-pending-product-mismatch-today',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-product-mismatch-today.component.html',
  styleUrl: './pending-product-mismatch-today.component.css',
})
export class PendingProductMismatchTodayComponent implements OnInit {
  reports: MismatchReport[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private procumentsService: ProcumentsService
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  get totalReports(): number {
    return this.reports.length;
  }

  loadReports(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.procumentsService.getLoadMismatchReportsToday().subscribe({
      next: (data) => {
        this.reports = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load reports';
        this.isLoading = false;
      },
    });
  }

  back(): void {
    this.router.navigate(['/procurement']);
  }

  onView(report: MismatchReport): void {
    this.router.navigate(['/procurement/procurement-product-mismatch-today', report.id]);
  }

  isAllFound(crates: string): boolean {
    return crates.toLowerCase().includes('all found');
  }
}