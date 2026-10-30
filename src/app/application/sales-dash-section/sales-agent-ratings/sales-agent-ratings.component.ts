import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import {
  SalesDashService,
  SalesAgentRatingRow,
} from '../../../services/sales-dash/sales-dash.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sales-agent-ratings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    CalendarModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './sales-agent-ratings.component.html',
  styleUrl: './sales-agent-ratings.component.css',
})
export class SalesAgentRatingsComponent implements OnInit {
  isLoading = false;
  hasData = true;

  ratings: SalesAgentRatingRow[] = [];
  agentOptions: { label: string; value: string }[] = [];

  selectedAgent: string | null = null;
  date: Date | null = new Date(); 

  constructor(
    private router: Router,
    private salesDashService: SalesDashService,
  ) { }

  ngOnInit(): void {
    this.loadRatings();
  }

  goBack(): void {
    this.router.navigate(['/sales-dash/action']);
  }

  loadRatings(): void {
    this.isLoading = true;

    const formattedDate = this.date ? this.formatDate(this.date) : '';

    this.salesDashService
      .getSalesAgentRatings(formattedDate, this.selectedAgent)
      .subscribe({
        next: (res) => {
          this.ratings = res.items || [];
          this.hasData = this.ratings.length > 0;
          this.agentOptions = (res.agents || []).map((a) => ({
            label: a.empId,
            value: a.empId,
          }));
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching sales agent ratings', err);
          this.ratings = [];
          this.hasData = false;
          this.isLoading = false;
        },
      });
  }

  agentFilter(): void {
    this.loadRatings();
  }

  dateFilter(): void {
    this.loadRatings();
  }

  onDateClear(): void {
    this.date = null;
    this.loadRatings();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDisplayDate(value: string | null): string {
    if (!value) return '--';

    const [year, month, day] = value.split('-').map(Number);
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const mod100 = day % 100;
    const mod10 = day % 10;
    let suffix = 'th';
    if (mod100 < 11 || mod100 > 13) {
      if (mod10 === 1) suffix = 'st';
      else if (mod10 === 2) suffix = 'nd';
      else if (mod10 === 3) suffix = 'rd';
    }

    return `${day}${suffix} ${months[month - 1]} ${year}`;
  }
}