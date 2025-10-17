import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardData } from '../../../../services/plant-care/plantcare-users.service';

@Component({
  selector: 'app-govicare-packages-first-row',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './govicare-packages-first-row.component.html',
  styleUrl: './govicare-packages-first-row.component.css'
})
export class GovicarePackagesFirstRowComponent {
  @Input() dashboardData: DashboardData | null = null;

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}