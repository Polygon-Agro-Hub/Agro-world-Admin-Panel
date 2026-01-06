import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { AllTodaysDeleveriesComponent } from '../all-todays-deleveries/all-todays-deleveries.component';
import { OutForDeliveryTodaysDeleveriesComponent } from '../out-for-delivery-todays-deleveries/out-for-delivery-todays-deleveries.component';
import { OnTheWayTodaysDeleveriesComponent } from '../on-the-way-todays-deleveries/on-the-way-todays-deleveries.component';
import { HoldTodaysDeleveriesComponent } from '../hold-todays-deleveries/hold-todays-deleveries.component';
import { ReturnTodaysDeleveriesComponent } from '../return-todays-deleveries/return-todays-deleveries.component';
import { DeliveredTodaysDeleveriesComponent } from '../delivered-todays-deleveries/delivered-todays-deleveries.component';
import { FormsModule } from '@angular/forms';
import { DistributionHubService } from '../../../../services/distribution-hub/distribution-hub.service';
import { CollectedComponent } from '../collected/collected.component';
import { CollectionService } from '../../../../services/collection.service';

interface Delivery {
  invNo: string;
  regCode: string;
  centerName?: string;
  sheduleTime: string;
  createdAt: string;
  status: string;
  outDlvrTime: string;
  no?: number;
  driver?: string;
  phoneNumber?: string;
  returnTime?: string;
  deliveryTimeSlot?: string;
  // Add these properties for child component compatibility
  orderId?: string;
  centre?: string;
  deliveryTime?: string;
  collectTime?: string;
  // Add backend properties
  driverEmpId?: string;
  driverStartTime?: string;
  // Add startedTime for child components
  startedTime?: string;
}

interface CenterOption {
  code: string;
  name: string;
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
    FormsModule,
    CollectedComponent,
  ],
  templateUrl: './todays-deliveries.component.html',
  styleUrl: './todays-deliveries.component.css',
})
export class TodaysDeliveriesComponent implements OnInit {
  isLoading: boolean = false;
  activeTab: string = 'all';

  // Search parameters
  invNo: string = '';
  searchType: string = 'partial';

  // Center dropdown options
  centerOptions: CenterOption[] = [];
  regCode: string = '';

  // Data from backend
  allDeliveries: Delivery[] = [];

  // Filtered data for tabs
  allFilteredDeliveries: Delivery[] = [];
  outForDeliveryData: Delivery[] = [];
  collectedData: Delivery[] = [];
  onTheWayData: Delivery[] = [];
  holdData: Delivery[] = [];
  returnData: Delivery[] = [];
  deliveredData: Delivery[] = []; // This will hold Delivered status data

  constructor(
    private distributionService: DistributionHubService,
    private collectionService: CollectionService
  ) {}

  ngOnInit(): void {
    this.fetchCenters();
    this.fetchDeliveries();
    this.selectTab('all');
  }

  back(): void {
    window.history.back();
  }

  selectTab(tabName: string): void {
    this.activeTab = tabName;
  }

  fetchDeliveries(): void {
    this.isLoading = true;
    this.distributionService
      .getTodaysDeliveries(
        this.regCode || undefined,
        this.invNo || undefined,
        this.searchType
      )
      .subscribe({
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
        },
      });
  }

  fetchCenters(): void {
    // Load unique centres from centers API (not deliveries)
    this.distributionService.getTodaysDeliveries().subscribe({
      next: (response) => {
        if (response?.status && Array.isArray(response.data)) {
          const seen = new Set<string>();
          const options: CenterOption[] = [];

          for (const center of response.data) {
            const code: string =
              center?.regCode ?? center?.centerNumber ?? center?.code ?? '';
            const name: string = center?.centerName ?? center?.name ?? '';
            if (!code) continue;
            if (seen.has(code)) continue;
            seen.add(code);
            options.push({ code, name });
          }

          this.centerOptions = options;
        } else {
          this.centerOptions = [];
        }
      },
      error: (error) => {
        console.error('Error fetching centers:', error);
        this.centerOptions = [];
      },
    });
  }

  // In TodaysDeliveriesComponent's prepareDeliveryData() method, update it like this:
  prepareDeliveryData(): void {
    this.allDeliveries = this.allDeliveries.map((delivery, index) => {
      // Format return time from createdAt or outDlvrTime
      const returnTime = this.formatToReturnTime(
        delivery.returnTime || delivery.createdAt || delivery.outDlvrTime
      );

      // Format delivery time slot from sheduleTime
      const deliveryTimeSlot = this.formatDeliveryTimeSlot(
        delivery.sheduleTime
      );

      // Format delivery time for delivered items (use outDlvrTime or createdAt)
      const deliveryTime = this.formatToReturnTime(
        delivery.deliveryTime || delivery.outDlvrTime || delivery.createdAt
      );

      // Format driver start time (NEW: use driverStartTime from backend)
      const driverStartTime = this.formatToReturnTime(
        delivery.driverStartTime || ''
      );

      // Format collect time for collected tab
      const collectTime = this.formatToReturnTime(delivery.collectTime ?? '');

      // Format centre display with code and name
      const centreDisplay = delivery.centerName
        ? `${delivery.regCode} - ${delivery.centerName}`
        : delivery.regCode;

      return {
        ...delivery,
        no: index + 1,
        driver: delivery.driverEmpId || 'DIV000001', // Use driverEmpId from backend if available
        phoneNumber: '0781112300', // Placeholder - update with actual data if available
        returnTime: returnTime,
        deliveryTimeSlot: deliveryTimeSlot,
        deliveryTime: deliveryTime,
        collectTime: collectTime, // Add for collected tab
        startedTime: driverStartTime, // NEW: Add startedTime using driverStartTime
        orderId: delivery.invNo,
        centre: centreDisplay, // Show code and name
      };
    });
  }

  private formatToReturnTime(timeString: string): string {
    if (!timeString) return 'N/A';

    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        if (timeString.includes('.')) return timeString;
        return 'N/A';
      }

      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';

      hours = hours % 12;
      hours = hours ? hours : 12;

      const minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();

      return `${hours}.${minutesStr}${ampm}`;
    } catch (error) {
      console.error('Error formatting return time:', error);
      return 'N/A';
    }
  }

  private formatDeliveryTimeSlot(sheduleTime: string): string {
    if (!sheduleTime) return 'N/A';

    try {
      const date = new Date(sheduleTime);
      if (isNaN(date.getTime())) {
        return sheduleTime;
      }

      const hours = date.getHours();

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
    this.outForDeliveryData = this.allDeliveries.filter(
      (d) => d.status === 'Out For Delivery'
    );
    this.collectedData = this.allDeliveries.filter(
      (d) => d.status === 'Collected'
    );
    this.onTheWayData = this.allDeliveries.filter(
      (d) => d.status === 'On the way'
    );
    this.holdData = this.allDeliveries.filter((d) => d.status === 'Hold');
    this.returnData = this.allDeliveries.filter((d) => d.status === 'Return');
    this.deliveredData = this.allDeliveries.filter(
      (d) => d.status === 'Delivered'
    );
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
  get getOnTheWayCount(): number {
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
