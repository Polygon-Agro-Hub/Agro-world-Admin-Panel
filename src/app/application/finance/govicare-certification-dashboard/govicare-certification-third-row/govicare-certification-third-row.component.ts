import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CertificatePayment } from '../../../../services/finance/finance.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-govicare-certification-third-row',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './govicare-certification-third-row.component.html',
  styleUrl: './govicare-certification-third-row.component.css'
})
export class GovicareCertificationThirdRowComponent {
  @Input() recentPayments: CertificatePayment[] = [];

  constructor(private router: Router) {}

  formatDate(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatTime(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
  
    ViewAll(): void {
    this.router.navigate(['/finance/action/view-all-certificate-payments']);
  }
}