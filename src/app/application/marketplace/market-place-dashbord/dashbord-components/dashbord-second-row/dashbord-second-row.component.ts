import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-dashbord-second-row',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashbord-second-row.component.html',
  styleUrl: './dashbord-second-row.component.css'
})
export class DashbordSecondRowComponent {
  @Input() secondRow!: SecondRow;

  getPreviousMonth(): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() - 1); // Get previous month

    const monthName = months[currentDate.getMonth()];
    const year = currentDate.getFullYear();

    return `${monthName} ${year}`;
  }
}


interface SecondRow {
  salsesAnalize: AnalyzeReport;
  totalSales: SalesCount;
  totUsers: UserCount;
}

interface AnalyzeReport {
  amount: number;
  precentage: number;
}

interface SalesCount {
  count: number;
}

interface UserCount {
  userCount: number;
}

