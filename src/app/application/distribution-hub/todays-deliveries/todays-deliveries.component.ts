import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { AllTodaysDeleveriesComponent } from '../all-todays-deleveries/all-todays-deleveries.component';
import { OutForDeliveryTodaysDeleveriesComponent } from '../out-for-delivery-todays-deleveries/out-for-delivery-todays-deleveries.component';
import { OnTheWayTodaysDeleveriesComponent } from '../on-the-way-todays-deleveries/on-the-way-todays-deleveries.component';
import { HoldTodaysDeleveriesComponent } from '../hold-todays-deleveries/hold-todays-deleveries.component';
import { ReturnTodaysDeleveriesComponent } from '../return-todays-deleveries/return-todays-deleveries.component';
import { DeliveredTodaysDeleveriesComponent } from '../delivered-todays-deleveries/delivered-todays-deleveries.component';
import { FormsModule } from '@angular/forms';
import { DistributionHubService } from '../../../services/distribution-hub/distribution-hub.service';

interface Delivery {
  invNo: string;
  regCode: string;
  sheduleTime: string;
  createdAt: string;
  status: string;
  outDlvrTime: string;
  // Additional fields that might be needed for child components
  no?: number; // Will be calculated based on index
  driver?: string; // You might need to fetch this from backend
  phoneNumber?: string; // You might need to fetch this from backend
  // For Return tab specifically
  returnTime?: string; // We'll calculate this from createdAt or outDlvrTime
  deliveryTimeSlot?: string; // We'll format the sheduleTime
  // For Return tab
  orderId?: string; // Using invNo as orderId
  centre?: string; // Using regCode as centre
}

@Component({
  selector: 'app-todays-deliveries',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    DropdownModule,
    AllTodaysDeleveriesComponent,
    OutForDeliveryTodaysDeleveriesComponent,
    OnTheWayTodaysDeleveriesComponent,
    HoldTodaysDeleveriesComponent,
    ReturnTodaysDeleveriesComponent,
    DeliveredTodaysDeleveriesComponent,
    FormsModule
  ],
  templateUrl: './todays-deliveries.component.html',
  styleUrl: './todays-deliveries.component.css',
})
export class TodaysDeliveriesComponent implements OnInit {
  isLoading: boolean = false;
  activeTab: string = 'all';
  
  // Search parameters
  regCode: string = '';
  invNo: string = '';
  searchType: string = 'partial';
  
  // Data from backend
  allDeliveries: Delivery[] = [];
  
  // Filtered data for tabs
  allFilteredDeliveries: Delivery[] = [];
  outForDeliveryData: Delivery[] = [];
  onTheWayData: Delivery[] = [];
  holdData: Delivery[] = [];
  returnData: Delivery[] = [];
  deliveredData: Delivery[] = [];

  constructor(private distributionService: DistributionHubService) {}

  ngOnInit(): void {
    this.fetchDeliveries();
  }

  back(): void {
    window.history.back();
  }

  selectTab(tabName: string): void {
    this.activeTab = tabName;
  }

  fetchDeliveries(): void {
    this.isLoading = true;
    this.distributionService.getTodaysDeliveries(
      this.regCode || undefined,
      this.invNo || undefined,
      this.searchType
    ).subscribe({
      next: (response) => {
        if (response.status && response.data) {
          this.allDeliveries = response.data;
          this.prepareDeliveryData();
          this.filterDataByStatus();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching deliveries:', error);
        this.isLoading = false;
      }
    });
  }

  prepareDeliveryData(): void {
    // Add additional properties that child components might need
    this.allDeliveries = this.allDeliveries.map((delivery, index) => {
      // For Return tab: Convert createdAt or outDlvrTime to returnTime format (e.g., "11.20AM")
      const returnTime = this.formatToReturnTime(delivery.createdAt || delivery.outDlvrTime);
      
      // Format delivery time slot from sheduleTime
      const deliveryTimeSlot = this.formatDeliveryTimeSlot(delivery.sheduleTime);
      
      return {
        ...delivery,
        no: index + 1,
        driver: 'DIV000001', // Replace with actual driver data from backend if available
        phoneNumber: '0781112300', // Replace with actual phone number from backend if available
        returnTime: returnTime, // Add returnTime for Return tab
        deliveryTimeSlot: deliveryTimeSlot, // Add formatted delivery time slot
        orderId: delivery.invNo, // Map invNo to orderId
        centre: delivery.regCode // Map regCode to centre
      };
    });
  }

  // Helper method to format time to "HH.MMAM/PM" format for return time
  private formatToReturnTime(timeString: string): string {
    if (!timeString) return 'N/A';
    
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        // If timeString is already in "HH.MMAM" format, return as is
        if (timeString.includes('.')) return timeString;
        return 'N/A';
      }
      
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      hours = hours % 12;
      hours = hours ? hours : 12; // Convert 0 to 12
      
      const minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();
      
      return `${hours}.${minutesStr}${ampm}`;
    } catch (error) {
      console.error('Error formatting return time:', error);
      return 'N/A';
    }
  }

  // Helper method to format sheduleTime to time slot format
  private formatDeliveryTimeSlot(sheduleTime: string): string {
    if (!sheduleTime) return 'N/A';
    
    try {
      const date = new Date(sheduleTime);
      if (isNaN(date.getTime())) {
        return sheduleTime; // Return as is if not a valid date
      }
      
      const hours = date.getHours();
      
      // Determine time slot based on hour
      if (hours >= 8 && hours < 14) {
        return '8AM - 2PM';
      } else if (hours >= 14 && hours < 20) {
        return '2PM - 8PM';
      } else {
        return 'Other';
      }
    } catch (error) {
      console.error('Error formatting delivery time slot:', error);
      return 'N/A';
    }
  }

  filterDataByStatus(): void {
    // Filter data for each status
    this.allFilteredDeliveries = this.allDeliveries;
    this.outForDeliveryData = this.allDeliveries.filter(d => d.status === 'Out For Delivery');
    this.onTheWayData = this.allDeliveries.filter(d => d.status === 'On the way');
    this.holdData = this.allDeliveries.filter(d => d.status === 'Hold');
    this.returnData = this.allDeliveries.filter(d => d.status === 'Return');
    this.deliveredData = this.allDeliveries.filter(d => d.status === 'Delivered');
  }

  onSearch(): void {
    this.fetchDeliveries();
  }

  clearSearch(): void {
    this.regCode = '';
    this.invNo = '';
    this.fetchDeliveries();
  }

  // Getter methods for counts
  getTotalCount(): number {
    return this.allDeliveries.length;
  }

  getOutForDeliveryCount(): number {
    return this.outForDeliveryData.length;
  }

  getOnTheWayCount(): number {
    return this.onTheWayData.length;
  }

  getHoldCount(): number {
    return this.holdData.length;
  }

  getReturnCount(): number {
    return this.returnData.length;
  }

  getDeliveredCount(): number {
    return this.deliveredData.length;
  }
}