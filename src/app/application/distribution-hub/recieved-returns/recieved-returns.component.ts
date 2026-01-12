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
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

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
  styleUrls: ['./recieved-returns.component.css']
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

  // Add debounce subject for search
  private searchSubject = new Subject<string>();

  constructor(
    private distService: DestributionService,
    private distHubService: DistributionHubService
  ) {}

  ngOnInit() {
    this.fetchCentreOptions();
    this.deliveryDateModel = new Date();
    this.deliveryDate = new Date().toISOString().split('T')[0];
    
    // Setup debounced search
    this.searchSubject
      .pipe(
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged() // Only emit if value changed
      )
      .subscribe(searchTerm => {
        this.performSearch(searchTerm);
      });
    
    this.loadData();
  }

  searchOrders() {
    const trimmed = this.searchText.trim();
    if (!trimmed) {
      this.searchText = '';
      this.loadData();
      return;
    }
    // Trigger the debounced search
    this.searchSubject.next(trimmed);
  }

  // Perform actual search
  performSearch(searchTerm: string) {
    this.isLoading = true;
    
    // First, check if it's a phone number search (remove spaces and special characters)
    const cleanSearch = searchTerm.replace(/[+\s\-()]/g, '');
    
    // Check if search term looks like a phone number
    const isPhoneSearch = /^\d+$/.test(cleanSearch) && cleanSearch.length >= 6;
    
    // Check if search term looks like a centre code (alphanumeric, usually short)
    const isCentreCodeSearch = /^[A-Za-z0-9]{3,10}$/.test(searchTerm);
    
    this.distService
      .getReturnRecievedData(
        this.deliveryDate,
        this.centerId,
        searchTerm // Send the search term to backend
      )
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.driverData = response.items || [];
          this.totalValue = response.grandTotal;
          this.hasData = this.driverData.length > 0;
          this.totalItems = response.total || this.driverData.length || 0;
          
          // If no results from backend, try client-side filtering as fallback
          if (this.driverData.length === 0 && (isPhoneSearch || isCentreCodeSearch)) {
            this.applyClientSideFilter(searchTerm, isPhoneSearch, isCentreCodeSearch);
          }
        },
        error: () => {
          this.isLoading = false;
          // On error, try client-side filtering
          this.applyClientSideFilter(searchTerm, isPhoneSearch, isCentreCodeSearch);
        },
      });
  }

  // Client-side filtering as fallback
  applyClientSideFilter(searchTerm: string, isPhoneSearch: boolean, isCentreCodeSearch: boolean) {
    // This assumes you have all data loaded
    // You might need to load all data first without filters
    if (!this.allDataLoaded) {
      // Load all data first
      this.loadAllDataForClientSideFilter(searchTerm);
      return;
    }

    const filtered = this.allDriverData.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      
      // Check Order ID
      if (item.invNO?.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Check Customer Contact
      const fullPhone = `${item.phoneCode || ''}${item.phoneNumber || ''}`;
      if (fullPhone.includes(searchTerm.replace(/\D/g, ''))) {
        return true;
      }
      
      // Check Centre Code
      if (item.regCode?.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Check Centre Name
      if (item.centerName?.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      return false;
    });
    
    this.driverData = filtered;
    this.hasData = filtered.length > 0;
    this.totalItems = filtered.length;
    this.calculateTotalValue();
  }

  // Calculate total value for filtered data
  calculateTotalValue() {
    this.totalValue = this.driverData.reduce((sum, item) => {
      return sum + (item.total || 0);
    }, 0);
  }

  // Load all data for client-side filtering
  loadAllDataForClientSideFilter(searchTerm: string) {
    this.isLoading = true;
    this.distService
      .getReturnRecievedData(undefined, undefined, undefined) // Get all data
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.allDriverData = response.items || [];
          this.allDataLoaded = true;
          this.applyClientSideFilter(searchTerm, 
            /^\d+$/.test(searchTerm.replace(/[+\s\-()]/g, '')), 
            /^[A-Za-z0-9]{3,10}$/.test(searchTerm)
          );
        },
        error: () => {
          this.isLoading = false;
          this.driverData = [];
          this.hasData = false;
          this.totalItems = 0;
          this.totalValue = 0;
        },
      });
  }

  clearSearch() {
    this.searchText = '';
    this.loadData();
  }

  back() {
    window.history.back();
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
        this.searchText?.trim() || undefined
      )
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.driverData = response.items || [];
          this.totalValue = response.grandTotal;
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

  formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'decimal',   
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

  // Add these properties
  private allDriverData: DriverData[] = [];
  private allDataLoaded = false;
}

class DriverData {
  id!: number;
  invNO!: string;
  empId!: string;
  total!: number;
  regCode!: string;
  centerName!: string;
  sheduleDate!: Date;
  phoneNumber!: string;
  reason!: string;
  other?: string;
  phoneCode!: string;
  returnAt!: Date;
  receivedTime!: Date;
  handOverOfficer!: number;
}