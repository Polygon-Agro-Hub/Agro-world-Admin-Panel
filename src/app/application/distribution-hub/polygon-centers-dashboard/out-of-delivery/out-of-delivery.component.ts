import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router } from '@angular/router';
import { DestributionService } from '../../../../services/destribution-service/destribution-service.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-out-of-delivery',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    CalendarModule,
    DropdownModule,
    NgxPaginationModule,
    FormsModule
  ],
  templateUrl: './out-of-delivery.component.html',
  styleUrl: './out-of-delivery.component.css',
})
export class OutOfDeliveryComponent implements OnChanges {
  @Input() centerObj!: CenterDetails;
  orderArr: Orders[] = [];
  filteredOrders: Orders[] = [];
  orderCount: number = 0;
  selectDate: Date | null = null;
  selectStatus: string = '';
  searchText: string = '';

  statusOptions = [
    { label: 'Late', value: 'Late' },
    { label: 'On Time', value: 'On Time' },
  ]

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['centerObj'] && this.centerObj) {
      this.fetchData();
    }
  }

  onStatusChange() {
    this.applyFilters();
  }

  onDateSelect() {
    this.applyFilters();
  }

  onSearch() {
    this.applyFilters();
  }

  clearSearch() {
    this.searchText = '';
    this.applyFilters();
  }

  applyFilters() {
    // First filter by status
    if (this.selectStatus) {
      this.filteredOrders = this.orderArr.filter(order => 
        order.outDlvrStatus === this.selectStatus
      );
    } else {
      this.filteredOrders = [...this.orderArr];
    }

    // Then filter by search text if provided
    if (this.searchText) {
      this.filteredOrders = this.filteredOrders.filter(order => 
        order.invNo.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }

    // Update the count
    this.orderCount = this.filteredOrders.length;
  }

  constructor(
    private router: Router,
    private DestributionSrv: DestributionService,
  ) { }

  fetchData() {
    this.isLoading = true;
    this.DestributionSrv.getCenterOutForDlvryOrders(
      this.centerObj.centerId, 
      this.selectDate ? this.selectDate.toISOString().split('T')[0] : '', 
      this.selectStatus, 
      this.searchText
    ).subscribe(
      (res) => {
        this.orderArr = res.data || [];
        this.filteredOrders = [...this.orderArr];
        this.orderCount = this.filteredOrders.length;
        this.hasData = this.filteredOrders.length === 0;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching data:', error);
        this.isLoading = false;
        this.hasData = true;
      }
    );
  }
  
  isLoading = false;
  hasData: boolean = false;
}

interface CenterDetails {
  centerId: number;
  centerName: string;
  centerRegCode: string;
}

class Orders {
  id!:number
  invNo!:string 
  firstNameEnglish!:string
  lastNameEnglish!:string 
  sheduleDate!:string 
  outDlvrDate!:string 
  outDlvrStatus!:string 
}