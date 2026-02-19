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
import { ActivatedRoute, Router } from '@angular/router';

interface Delivery {
  id:number
  invNo:string 
  regCode:string 
  centerName:string
  sheduleTime:string 
  sheduleDate:string 
  createdAt:string 
  status:string 
  outDlvrTime:string 
  collectTime:string 
  driverEmpId:string 
  driverStartTime:string 
  returnTime:string 
  deliveryTime:string;
  driverPhone:string
  holdTime:string
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

  // Center dropdown options
  centreOptions: Array<{ label: string; value: number }> = [];
  regCode: string = '';

  // Data from backend
  deliveryArr: Delivery[] = [];

  centerId: number = 66;
  centerName: string = ''
  centerRegCode: string = ''

  urlSegment: string = '';

  selectedStatus: any = null;
  searchText: string = '';

  selectedDate: string | Date | null = null;

  constructor(
    private distributionService: DistributionHubService,
    private collectionService: CollectionService,
    private router: Router, private route: ActivatedRoute
  ) { }

  ngOnInit(): void {

    this.fetchCentreOptions();
    this.fetchDeliveries();
    this.selectTab('all');
    
  }

  back(): void {
    window.history.back();
  }

  selectTab(tabName: string): void {
    this.activeTab = tabName;
    this.fetchDeliveries();
  }

  fetchDeliveries(): void {
    this.isLoading = true;
    this.distributionService
      .getTodaysDeliveries(
        this.activeTab,
        this.regCode,
        this.invNo
      )
      .subscribe({
        next: (response) => {
          if (response.status && response.data) {
            this.deliveryArr = response.data;
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching deliveries:', error);
          this.isLoading = false;
        },
      });
  }

  fetchCentreOptions() {
    this.distributionService.getDistributionCenterNames().subscribe({
      next: (res) => {
        const items = res || [];
        this.centreOptions = items
          .map((it: any) => ({
            label: `${it.regCode} - ${it.centerName}`,
            value: it.id,
          }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label));
      },
      error: () => {
        this.centreOptions = [];
      },
    });
  }

  // In TodaysDeliveriesComponent's prepareDeliveryData() method, update it like this:


  onSearch(): void {
    this.fetchDeliveries();
  }

  clearSearch(): void {
    this.regCode = '';
    this.invNo = '';
    this.fetchDeliveries();
  }


}
