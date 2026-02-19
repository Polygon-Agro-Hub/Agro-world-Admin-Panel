import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

interface CallLog {
  id: string;
  name: string;
  contactNumber: string;
  duration: string;
  dateTime: string;
  callerRating: number;
  officerRating: number;
  overallRating: number;
}

@Component({
  selector: 'app-all-call-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './all-call-logs.component.html',
  styleUrl: './all-call-logs.component.css',
})
export class AllCallLogsComponent implements OnInit {
  isLoading = false;
  callLogs: CallLog[] = [];
  total = 0;
  searchTerm = '';

  // Sample data 
  private sampleData: CallLog[] = [
    {
      id: '001',
      name: 'Pasan Ranshika',
      contactNumber: '+94 70 1111000',
      duration: '00:59:00',
      dateTime: '2026-06-01T11:00:00',
      callerRating: 5,
      officerRating: 5,
      overallRating: 5,
    },
    {
      id: '002',
      name: 'Hashini Herath',
      contactNumber: '+94 70 1111001',
      duration: '00:50:01',
      dateTime: '2026-06-01T11:00:00',
      callerRating: 0.5,
      officerRating: 3.5,
      overallRating: 2.5,
    },
    {
      id: '003',
      name: 'Himaya Ranathunga',
      contactNumber: '+94 70 1111000',
      duration: '00:00:59',
      dateTime: '2026-06-01T11:00:00',
      callerRating: 3.5,
      officerRating: 3.5,
      overallRating: 3.5,
    },
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadCallLogs();
  }

  loadCallLogs() {
    this.isLoading = true;
    setTimeout(() => {
      this.callLogs = this.sampleData;
      this.total = this.callLogs.length;
      this.isLoading = false;
    }, 500);
  }

  formatNumber(index: number): string {
    return (index + 1).toString().padStart(3, '0');
  }

  formatDateTime(dateTime: string): string {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    const time = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const dateStr = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    });
    return `${time}\n${dateStr}`;
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.callLogs = this.sampleData;
      this.total = this.callLogs.length;
      return;
    }

    this.callLogs = this.sampleData.filter((log) =>
      log.contactNumber.toLowerCase().includes(this.searchTerm.toLowerCase()),
    );
    this.total = this.callLogs.length;
  }

  onClearSearch() {
    this.searchTerm = '';
    this.callLogs = this.sampleData;
    this.total = this.callLogs.length;
  }

  back() {
    this.router.navigate(['/call-centers/action']).then(() => {});
  }

  getStarClass(starPosition: number, rating: number): string {
    if (rating >= starPosition) {
      return 'fa-solid fa-star text-yellow-400 text-[16px] w-[19px] h-[16px]';
    } else if (rating >= starPosition - 0.5) {
      return 'fa-solid fa-star-half-stroke text-yellow-400 text-[16px] w-[19px] h-[16px]';
    } else {
      return 'fa-solid fa-star text-gray-300 dark:text-gray-600 text-[16px] w-[19px] h-[16px]';
    }
  }
}

