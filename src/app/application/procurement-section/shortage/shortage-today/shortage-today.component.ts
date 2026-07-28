import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';

@Component({
  selector: 'app-shortage-today',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shortage-today.component.html',
  styleUrl: './shortage-today.component.css'
})
export class ShortageTodayComponent {
  shortageCount = 0;
  shortages: any[] = [];

  // Set this to whatever date/time the shortages become visible
  availableDate: Date = new Date('2026-06-23T18:00:00');

  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }

  get formattedTime(): string {
    return this.availableDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  get formattedDate(): string {
    const day = this.availableDate.getDate();
    const month = this.availableDate.toLocaleString('en-US', { month: 'long' });
    const year = this.availableDate.getFullYear();
    const suffix = this.getDaySuffix(day);
    return `${day}${suffix} ${month} ${year}`;
  }

  private getDaySuffix(day: number): string {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }
}