import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface MismatchReport {
  id: number;
  driverId: string;
  loaded: number;
  unloaded: number;
  missing: number;
  crates: string; // e.g. "1 Missing", "All Found", "2 Missing"
  distributionCentre: string;
  reportedAt: string;
}

@Component({
  selector: 'app-pending-product-mismatch-today',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-product-mismatch-today.component.html',
  styleUrl: './pending-product-mismatch-today.component.css'
})
export class PendingProductMismatchTodayComponent {
  reports: MismatchReport[] = [
    {
      id: 1,
      driverId: 'L-DRV0001260913001',
      loaded: 20.0,
      unloaded: 10.0,
      missing: 10.0,
      crates: '1 Missing',
      distributionCentre: 'D-WPCK-01',
      reportedAt: '06:00 AM'
    },
    {
      id: 2,
      driverId: 'L-DRV0001260913001',
      loaded: 50.0,
      unloaded: 45.0,
      missing: 5.0,
      crates: 'All Found',
      distributionCentre: 'D-WPCK-01',
      reportedAt: '06:01 AM'
    },
    {
      id: 3,
      driverId: 'L-DRV0001260913001',
      loaded: 100.0,
      unloaded: 10.0,
      missing: 90.0,
      crates: '2 Missing',
      distributionCentre: 'D-WPCK-01',
      reportedAt: '06:02 AM'
    }
  ];

  constructor(private router: Router) {}

  get totalReports(): number {
    return this.reports.length;
  }

  back(): void {
    this.router.navigate(['/procurement']);
  }

  onView(report: MismatchReport): void {
    // Placeholder - hook up navigation/modal later
    console.log('View report:', report);
  }

  isAllFound(crates: string): boolean {
    return crates.toLowerCase().includes('all found');
  }
}