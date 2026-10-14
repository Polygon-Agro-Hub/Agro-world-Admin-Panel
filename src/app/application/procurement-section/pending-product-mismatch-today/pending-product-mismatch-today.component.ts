import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CalendarModule } from 'primeng/calendar';
import { ProcumentsService, MismatchReport } from '../../../services/procuments/procuments.service';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-pending-product-mismatch-today',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarModule],
  templateUrl: './pending-product-mismatch-today.component.html',
  styleUrl: './pending-product-mismatch-today.component.css',
})
export class PendingProductMismatchTodayComponent implements OnInit {
  reports: MismatchReport[] = [];
  isLoading = false;
  errorMessage = '';

  today: Date = new Date();
  selectedDate: Date = new Date();

  constructor(
    private router: Router,
    private location: Location,
    private procumentsService: ProcumentsService,
    public tokenService: TokenService,
    public permissionService: PermissionService,
  ) { }

  ngOnInit(): void {
    this.loadReports();
  }

  get totalReports(): number {
    return this.reports.length;
  }

  // Local date -> YYYY-MM-DD (avoids the UTC shift toISOString() causes in UTC+5:30)
  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  onDateChange(): void {
    // Empty (e.g. Clear button) or future date -> fall back to today
    if (!this.selectedDate || this.selectedDate > this.today) {
      this.selectedDate = new Date();
    }
    this.loadReports();
  }

  loadReports(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.procumentsService
      .getLoadMismatchReportsToday(this.formatDate(this.selectedDate))
      .subscribe({
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
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/procurement/procurement-product-mismatch-today', report.id])
    );
    const externalUrl = this.location.prepareExternalUrl(url);
    window.open(externalUrl, '_blank', 'noopener');
  }

  isAllFound(crates: string): boolean {
    return crates.toLowerCase().includes('all found');
  }
}