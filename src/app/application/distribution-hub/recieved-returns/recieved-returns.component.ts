import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { DestributionService } from '../../../services/destribution-service/destribution-service.service';
import { DistributionHubService } from '../../../services/distribution-hub/distribution-hub.service';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { NgxPaginationModule } from 'ngx-pagination';


@Component({
  selector: 'app-recieved-returns',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    CalendarModule,
    TooltipModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
  ],
  templateUrl: './recieved-returns.component.html',
  styleUrl: './recieved-returns.component.css'
})
export class RecievedReturnsComponent implements OnInit {
  isLoading = false;
  driverData: DriverData[] = [];
  totalItems: number = 0;

  dataObject: Partial<DriverData> = {};

  deliveryDate?: string;
  deliveryDateModel: Date | null = null;
  centerId?: number;

  searchText: string = '';
  hasData: boolean = true;

  showDetailsModal: boolean = false;

  totalValue!: number;

  centreOptions: Array<{ label: string; value: number }> = [];

  constructor(
    private distService: DestributionService,
    private distHubService: DistributionHubService
  ) {}

  searchOrders() {
    const trimmed = this.searchText.trim();
    if (!trimmed) {
      this.searchText = '';
      return;
    }
    this.loadData();
  }

  clearSearch() {
    this.searchText = '';
    this.loadData();
  }

  back() {
    window.history.back();
  }

  ngOnInit() {
    this.fetchCentreOptions();
    this.deliveryDateModel = new Date()
    this.deliveryDate = new Date().toISOString().split('T')[0];
    console.log('this.deliveryDate', this.deliveryDate)
    this.loadData();
  }
  
  onDateSelected(date: Date) {
    if (!date) return;
    const tzFixed = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    this.deliveryDate = tzFixed.toISOString().slice(0, 10);
    this.applyFilters();
  }

  clearDateFilter() {
    this.deliveryDateModel = null;
    this.deliveryDate = undefined;
    this.applyFilters();
  }

  loadData() {
    this.isLoading = true;
    this.distService
      .getReturnRecievedData(
        this.deliveryDate,
        this.centerId,
        this.searchText?.trim()
      )
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.driverData = response.items || [];
          this.totalValue = response.grandTotal;
          console.log('driverData', this.driverData)
          this.hasData = this.driverData.length > 0;
          this.totalItems = response.total || this.driverData.length || 0;

        },
        error: () => {
          this.driverData = [];
          this.totalItems = 0;
          this.hasData = false;
          this.isLoading = false;
        },
      });
  }

  applyFilters() {
    this.loadData();
  }

  fetchCentreOptions() {
    this.distHubService.getDistributionCenterNames().subscribe({
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

  viewDetails(data: DriverData) {
    this.dataObject = data;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
  }
}

class DriverData {
  id!: number;
  invNO!: string;
  empId!: string;
  total!: number;
  regCode!: string;
  centerName!: string;
  sheduleDate!: Date;
  phone1!: string;
  reason!: string;
  phoneCode1!: string;
  returnAt!: Date;
  receivedTime!: Date
  handOverOfficer!: number
}
