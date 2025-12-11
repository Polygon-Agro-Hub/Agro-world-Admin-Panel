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