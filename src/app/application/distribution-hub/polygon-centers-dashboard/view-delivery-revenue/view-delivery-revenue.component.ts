import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { Subject } from 'rxjs';
import { DistributionHubService } from '../../../../services/distribution-hub/distribution-hub.service';

@Component({
  selector: 'app-view-delivery-revenue',
  standalone: true,
  imports: [LoadingSpinnerComponent, CommonModule, CalendarModule, FormsModule],
  templateUrl: './view-delivery-revenue.component.html',
  styleUrl: './view-delivery-revenue.component.css',
})
export class ViewDeliveryRevenueComponent implements OnInit, OnDestroy {
  isLoading = false;
  centerName: string = '';
  centerRegCode: string = '';
  centerId: string = '';
  searchText: string = '';
  selectedDate: Date = new Date();
  hasData: boolean = false;

  // Data arrays
  revenueData: RevenueItem[] = [];
  filteredRevenueData: RevenueItem[] = [];

  private destroy$ = new Subject<void>();

  // Summary statistics
  totalAmount: number = 0;
  totalOrders: number = 0;

  constructor(
    private route: ActivatedRoute,
    private distributionHubService: DistributionHubService,
  ) { }

  ngOnInit(): void {
    // Get query parameters
    this.route.queryParams.subscribe((params) => {
      this.centerName = params['name'] || '';
      this.centerRegCode = params['regCode'] || '';
    });

    // Get route parameter (center ID)
    this.route.params.subscribe((params) => {
      this.centerId = params['id'] || '';
      if (this.centerId) {
        this.loadRevenueData();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRevenueData(): void {
    this.isLoading = true;

    // Format date for API if selected
    const filterDate = this.selectedDate
      ? this.formatDateForAPI(this.selectedDate)
      : undefined;

    this.searchText = this.searchText.trim();

    this.distributionHubService
      .getDriverCashRevenue(this.centerId, this.searchText, filterDate)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.status && response.data) {
            this.revenueData = response.data;
            this.filteredRevenueData = [...this.revenueData];
            this.calculateSummary();
            this.hasData = this.revenueData.length > 0;
          } else {
            this.revenueData = [];
            this.filteredRevenueData = [];
            this.hasData = false;
            this.resetSummary();
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error loading revenue data:', error);
          this.revenueData = [];
          this.filteredRevenueData = [];
          this.hasData = false;
          this.resetSummary();
        },
      });
  }

  onSearch(): void {
    // Trigger search when Enter is pressed or search icon is clicked
    this.loadRevenueData();
  }

  onDateChange(): void {
    // Reload data when date changes
    this.loadRevenueData();
  }

  onClearSearch(): void {
    this.searchText = '';
    this.loadRevenueData();
  }

  onClearDate(): void {
    this.selectedDate = new Date();
    this.loadRevenueData();
  }

  private calculateSummary(): void {
    this.totalAmount = this.revenueData.reduce(
      (sum, item) => {
        // Safely convert handOverPrice to number
        const price = Number(item.handOverPrice);
        // Return sum + price if price is valid number, otherwise just sum
        return sum + (isNaN(price) ? 0 : price);
      },
      0,
    );
    this.totalOrders = this.revenueData.length;
  }

  private resetSummary(): void {
    this.totalAmount = 0;
    this.totalOrders = 0;
  }

  private formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-LK', {
      minimumFractionDigits: 2,
    }).format(amount);
  }

  formatDateTime(dateTime: string): string {
    if (!dateTime) return 'N/A';

    const date = new Date(dateTime);

    // Format time part: 11:00 AM
    const timeString = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // Format date part: June 2, 2025
    const dateString = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    return `${timeString} ${dateString}`;
  }

  // Alternative method if you want exactly "11:00 AM June 2, 2025" format
  formatDateTimeExact(dateTime: string): string {
    if (!dateTime) return 'N/A';

    const date = new Date(dateTime);

    // Get hours and minutes
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Format time with AM/PM
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const timeString = `${formattedHours}:${formattedMinutes} ${period}`;

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    return `${timeString} ${month} ${day}, ${year}`;
  }

  getOfficerEmpId(item: RevenueItem): string {
    if (item.handOverOfficerEmpId && item.handOverOfficerEmpId.trim() !== '') {
      return item.handOverOfficerEmpId;
    }


    if (item.driverEmpId && item.driverEmpId.trim() !== '') {
      return item.driverEmpId;
    }

    return '';
  }
}

interface RevenueItem {
  id: number;
  invNo: string;
  handOverPrice: number;
  handOverTime: string;
  driverEmpId: string;
  handOverOfficerEmpId: string;
}