import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RecentPayment } from '../../../../services/plant-care/plantcare-users.service';

@Component({
  selector: 'app-govicare-thurd-row',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './govicare-thurd-row.component.html',
  styleUrl: './govicare-thurd-row.component.css'
})
export class GovicareThurdRowComponent {
  @Input() recentPayments: RecentPayment[] = [];

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
}