import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AllPikupOdersComponent } from '../all-pikup-oders/all-pikup-oders.component';
import { ReadyToPikupComponent } from '../ready-to-pikup/ready-to-pikup.component';
import { PikupOdersComponent } from '../pikup-oders/pikup-oders.component';
import { ActivatedRoute, Router } from '@angular/router';
import { DestributionService } from '../../../../../services/destribution-service/destribution-service.service';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-pikup-oder-records-main',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    CalendarModule,
    DropdownModule,
    AllPikupOdersComponent,
    ReadyToPikupComponent,
    PikupOdersComponent,
  ],
  templateUrl: './pikup-oder-records-main.component.html',
  styleUrl: './pikup-oder-records-main.component.css',
})
export class PikupOderRecordsMainComponent implements OnInit {
  activeTab: string = 'All';
  centerObj: CenterDetails = {
    centerId: 0,
    centerName: '',
    centerRegCode: '',
  };

  // Data management
  allOrders: any[] = [];
  isLoading = false;

  // Filter properties (kept in sync with child components)
  selectedDate: Date | null = null;
  selectedTimeSlot: string = '';
  searchText: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private destributionService: DestributionService
  ) {}

  ngOnInit(): void {
    // Get route parameters
    this.route.params.subscribe((params) => {
      this.centerObj.centerId = params['id'];
    });

    // Get query parameters
    this.route.queryParams.subscribe((params) => {
      const tab = params['tab'];
      if (tab && ['All', 'Ready to Pickup', 'Picked Up'].includes(tab)) {
        this.activeTab = tab;
      }

      this.centerObj.centerName = params['name'] || '';
      this.centerObj.centerRegCode = params['regCode'] || '';
    });

    // Fetch initial data after getting center details
    if (this.centerObj.centerId > 0) {
      this.fetchAllOrders();
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab },
      queryParamsHandling: 'merge',
    });
  }

  // Main method to fetch all orders
  // Main method to fetch all orders
fetchAllOrders(): void {
  this.isLoading = true;

  // Format date for API
  let formattedDate = '';
  if (this.selectedDate) {
    const year = this.selectedDate.getFullYear();
    const month = (this.selectedDate.getMonth() + 1)
      .toString()
      .padStart(2, '0');
    const day = this.selectedDate.getDate().toString().padStart(2, '0');
    formattedDate = `${year}-${month}-${day}`;
  }

  // Map activeTab to backend parameter
  let backendTabParam = '';
  if (this.activeTab === 'Ready to Pickup') {
    backendTabParam = 'ready-to-pickup';
  } else if (this.activeTab === 'Picked Up') {
    backendTabParam = 'picked-up';
  } else if (this.activeTab === 'All') {
    backendTabParam = 'all';
  }

  this.destributionService
    .getDistributedCenterPickupOrders({
      companycenterId: this.centerObj.centerId,
      sheduleTime: this.selectedTimeSlot,
      date: formattedDate,
      searchText: this.searchText,
      activeTab: backendTabParam
    })
    .subscribe({
      next: (res) => {
        console.log('API Response:', res);
        if (res && res.data) {
          this.allOrders = Array.isArray(res.data) ? res.data : [res.data];
          console.log('Filtered orders count:', this.allOrders.length);
        } else {
          this.allOrders = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching pickup orders:', error);
        this.allOrders = [];
        this.isLoading = false;
      },
    });
}

  // Event handlers for child component filter changes
  onDateChangeFromChild(date: Date | null): void {
    this.selectedDate = date;
    this.fetchAllOrders();
  }

  onTimeSlotChangeFromChild(timeSlot: string): void {
    this.selectedTimeSlot = timeSlot;
    this.fetchAllOrders();
  }

  onSearchChangeFromChild(searchText: string): void {
    this.searchText = searchText;
    this.fetchAllOrders();
  }

  onClearSearchFromChild(): void {
    this.searchText = '';
    this.fetchAllOrders();
  }

  onClearDateFromChild(): void {
    this.selectedDate = null;
    this.fetchAllOrders();
  }

  // Get filtered orders for current tab
  getFilteredOrders(): any[] {
    if (!this.allOrders || this.allOrders.length === 0) {
      return [];
    }

    switch (this.activeTab) {
      case 'Ready to Pickup':
        return this.filterReadyToPickupOrders();
      case 'Picked Up':
        return this.filterPickedUpOrders();
      case 'All':
      default:
        return this.filterAllOrders();
    }
  }

  private filterAllOrders(): any[] {
    return this.allOrders.filter((order) => {
      const status = (order.status || order.orderStatus || '').toLowerCase();
      return (
        status.includes('ready') ||
        status.includes('pending') ||
        status.includes('picked') ||
        status.includes('processing')
      );
    });
  }

  private filterReadyToPickupOrders(): any[] {
    return this.allOrders.filter((order) => {
      const status = (order.status || order.orderStatus || '').toLowerCase();
      const isReady =
        status.includes('ready') ||
        status.includes('ready_for_pickup') ||
        status.includes('ready to pickup');
      const isPickedUp =
        status.includes('picked') ||
        status.includes('picked_up') ||
        status.includes('picked up');
      return isReady && !isPickedUp;
    });
  }

  private filterPickedUpOrders(): any[] {
    return this.allOrders.filter((order) => {
      const status = (order.status || order.orderStatus || '').toLowerCase();
      const isPickedUp =
        status.includes('picked') ||
        status.includes('picked_up') ||
        status.includes('picked up') ||
        status.includes('collected') ||
        status.includes('delivered_to_customer');
      const isReady =
        status.includes('ready') ||
        status.includes('ready_for_pickup') ||
        status.includes('ready to pickup');
      return isPickedUp && !isReady;
    });
  }

  // Get count for each tab
  getAllCount(): number {
    return this.filterAllOrders().length;
  }

  getReadyToPickupCount(): number {
    return this.filterReadyToPickupOrders().length;
  }

  getPickedUpCount(): number {
    return this.filterPickedUpOrders().length;
  }
}

interface CenterDetails {
  centerId: number;
  centerName: string;
  centerRegCode: string;
}
