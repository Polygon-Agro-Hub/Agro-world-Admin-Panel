import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { Subject, takeUntil } from 'rxjs'; // Remove debounceTime and distinctUntilChanged imports
import { DistributionHubService } from '../../../../services/distribution-hub/distribution-hub.service';

@Component({
  selector: 'app-view-pikup-cash-revenue',
  standalone: true,
  imports: [LoadingSpinnerComponent, CommonModule, CalendarModule, FormsModule],
  templateUrl: './view-pikup-cash-revenue.component.html',
  styleUrl: './view-pikup-cash-revenue.component.css',
})
export class ViewPikupCashRevenueComponent implements OnInit, OnDestroy {
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

  // Remove the searchSubject as we don't need debounce anymore
  private destroy$ = new Subject<void>();

  // Summary statistics
  totalAmount: number = 0;
  totalOrders: number = 0;

  constructor(
    private route: ActivatedRoute,
    private distributionHubService: DistributionHubService,
  ) {}

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

    // Remove the debounced search setup
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
      .getPickupCashRevenue(this.centerId, this.searchText, filterDate)
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

  // You can remove the applyFilters method if it's not used elsewhere
  // applyFilters(): void {
  //   // Apply client-side filtering if needed
  //   // Or reload from server (currently reloading from server)
  //   this.loadRevenueData();
  // }

  private calculateSummary(): void {
    this.totalAmount = this.revenueData.reduce(
      (sum, item) => sum + (item.handOverPrice || 0),
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

  // Helper method to format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-LK', {
      minimumFractionDigits: 2,
    }).format(amount);
  }

  // Helper method to format date/time like "11:00 AM June 2, 2025"
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
    
    // Month names
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Get date parts
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    return `${timeString} ${month} ${day}, ${year}`;
  }

  // Helper method to get officer EMP ID
  getOfficerEmpId(item: RevenueItem): string {
    // Return handOverOfficerEmpId if it exists and is not null/empty
    if (item.handOverOfficerEmpId && item.handOverOfficerEmpId.trim() !== '') {
      return item.handOverOfficerEmpId;
    }

    // Otherwise return issuedOfficerEmpId
    if (item.issuedOfficerEmpId && item.issuedOfficerEmpId.trim() !== '') {
      return item.issuedOfficerEmpId;
    }

    // If both are null/empty, return empty string (will show as "N/A" from template)
    return '';
  }
}

interface RevenueItem {
  id: number;
  invNo: string;
  handOverPrice: number;
  handOverTime: string;
  issuedOfficerEmpId: string;
  handOverOfficerEmpId: string;
}

interface CashPrice{
  total_price:number;
  total_orders:number;
}