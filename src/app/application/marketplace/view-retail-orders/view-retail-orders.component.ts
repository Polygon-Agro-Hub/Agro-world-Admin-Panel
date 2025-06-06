import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-view-retail-orders',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    HttpClientModule,
    NgxPaginationModule,
    FormsModule,
    LoadingSpinnerComponent,
    CalendarModule
  ],
  templateUrl: './view-retail-orders.component.html',
  styleUrl: './view-retail-orders.component.css'
})
export class ViewRetailOrdersComponent implements OnInit {

  // centerNameObj: CenterName = new CenterName();
  // companyId!: number;
  // collectionObj!: CollectionCenter[];
  // filteredCollection!: CollectionCenter[];

  retailordersArr: RetailOrders[] = [];
  
  searchItem: string = '';
  page: number = 1;
  itemsPerPage: number = 10;
  isLoading = false;
  totalItems: number = 0;
  hasData: boolean = true;
  centerId!: number;

  selectMethod: string = '';
  selectStatus: string = '';
  selectDate: Date | null = null;
  formattedDate: string = '';

  isDateSelected = false;

  methodOptions = [
    { label: 'Delivery', value: 'delivery' },
    { label: 'Pickup', value: 'pickup' },
  ];

  statusOptions = [
    { label: 'Assigned', value: 'Assigned' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Ordered', value: 'Ordered' },
    { label: 'Picked Up', value: 'Picked Up' },
    { label: 'Processing', value: 'Processing' },
  ];

  constructor(
    private router: Router,
    private MaketplaceSrv: MarketPlaceService,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.fetchAllRetailOrders(this.page, this.itemsPerPage);
  }

  fetchAllRetailOrders(
    page: number = this.page,
    limit: number = this.itemsPerPage,
    status: string = this.selectStatus,
    method: string = this.selectMethod,
    searchItem: string = this.searchItem,
    formattedDate: string = this.formattedDate,
  ) {
    this.isLoading = true;
    console.log('sending', status);
    this.MaketplaceSrv
      .getAllRetailOrders(page, limit, status, method, searchItem, formattedDate )
      .subscribe(
        (response) => {
          this.isLoading = false;
          this.retailordersArr = response.items;
          this.hasData = this.retailordersArr.length > 0;
          this.totalItems = response.total;
        },
        (error) => {
          if (error.status === 401) {
            // Unauthorized access handling (left empty intentionally)
          }
        }
      );
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllRetailOrders(this.page, this.itemsPerPage);
  }

  searchReailOrders() {
    console.log(this.searchItem);
    this.fetchAllRetailOrders(
      // this.page,
      // this.itemsPerPage,

    );
  }

  clearSearch(): void {
    this.searchItem = '';
    this.fetchAllRetailOrders();
  }

  applyMethodFilters() {
    this.fetchAllRetailOrders();
  }

  clearMethodFilter() {
    this.selectMethod = '';
    this.fetchAllRetailOrders();
  }

  applyStatusFilters() {
    console.log('status', this.selectStatus)
    this.fetchAllRetailOrders();
  }

  clearStatusFilter() {
    this.selectStatus = '';
    this.fetchAllRetailOrders();
  }

  applyDateFilter() {
    console.log(this.isDateSelected);
    if (this.selectDate instanceof Date) {
      const year = this.selectDate.getFullYear();
      const month = String(this.selectDate.getMonth() + 1).padStart(2, '0');
      const day = String(this.selectDate.getDate()).padStart(2, '0');
      this.formattedDate = `${year}-${month}-${day}`;
      console.log("Filter by date:", this.formattedDate);
      this.fetchAllRetailOrders();
    }
  }

  onDateSelect() {
    this.isDateSelected = true;
    this.applyDateFilter(); // call your original method
  }
  

  onDateChange(event: any): void {
    if (!event) {
      this.isDateSelected = false;
      console.log("Date cleared");
      this.formattedDate = '';
      this.fetchAllRetailOrders(); // or reset filters
    }
  }

  navigateDashboard(id: number) {
    this.router.navigate([`/collection-hub/collection-center-dashboard/${id}`]);
  }

}


class RetailOrders {
  id!: number;
  customerName!: string;
  method!: number;
  amount!: number;
  invNo!: string;
  status!: string;
  orderdDate!: Date;
}