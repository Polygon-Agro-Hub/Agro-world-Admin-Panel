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
  sheduleDate: string;
  createdAt: string;
  status: string;
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
  filteredDeliveries: Delivery[] = [];

  constructor(private distributionService: DistributionHubService) {}

  ngOnInit(): void {
    this.fetchDeliveries();
  }

  back(): void {
    window.history.back();
  }

  selectTab(tabName: string): void {
    this.activeTab = tabName;
    this.filterDeliveriesByTab();
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
          this.filterDeliveriesByTab();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching deliveries:', error);
        this.isLoading = false;
      }
    });
  }

  filterDeliveriesByTab(): void {
    switch(this.activeTab) {
      case 'all':
        this.filteredDeliveries = this.allDeliveries;
        break;
      case 'out-for-delivery':
        this.filteredDeliveries = this.allDeliveries.filter(d => d.status === 'Out For Delivery');
        break;
      case 'on-the-way':
        this.filteredDeliveries = this.allDeliveries.filter(d => d.status === 'On the way');
        break;
      case 'hold':
        this.filteredDeliveries = this.allDeliveries.filter(d => d.status === 'Hold');
        break;
      case 'return':
        this.filteredDeliveries = this.allDeliveries.filter(d => d.status === 'Return');
        break;
      case 'delivered':
        this.filteredDeliveries = this.allDeliveries.filter(d => d.status === 'Delivered');
        break;
      default:
        this.filteredDeliveries = this.allDeliveries;
    }
  }

  onSearch(): void {
    this.fetchDeliveries();
  }

  clearSearch(): void {
    this.regCode = '';
    this.invNo = '';
    this.fetchDeliveries();
  }

  getTotalCount(): number {
    return this.allDeliveries.length;
  }

  getOutForDeliveryCount(): number {
    return this.allDeliveries.filter(d => d.status === 'Out For Delivery').length;
  }

  getOnTheWayCount(): number {
    return this.allDeliveries.filter(d => d.status === 'On the way').length;
  }

  getHoldCount(): number {
    return this.allDeliveries.filter(d => d.status === 'Hold').length;
  }

  getReturnCount(): number {
    return this.allDeliveries.filter(d => d.status === 'Return').length;
  }

  getDeliveredCount(): number {
    return this.allDeliveries.filter(d => d.status === 'Delivered').length;
  }

  getCountByTab(): number {
    return this.filteredDeliveries.length;
  }
}