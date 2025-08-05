
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CalendarModule } from 'primeng/calendar';
import { FinalinvoiceService } from '../../../services/invoice/finalinvoice.service';

@Component({
  selector: 'app-view-wholwsale-orders',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    HttpClientModule,
    NgxPaginationModule,
    FormsModule,
    LoadingSpinnerComponent,
    CalendarModule,
  ],
  templateUrl: './view-wholwsale-orders.component.html',
  styleUrl: './view-wholwsale-orders.component.css',
})
export class ViewWholwsaleOrdersComponent implements OnInit {
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
  errorMessage: string | null = null;

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
    public permissionService: PermissionService,
    private finalInvoiceService: FinalinvoiceService, // Updated service
    private http: HttpClient
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
    formattedDate: string = this.formattedDate
  ) {
    this.isLoading = true;
    console.log('sending', status);
    this.MaketplaceSrv.getAllWholesaleOrders(
      page,
      limit,
      status,
      method,
      searchItem,
      formattedDate
    ).subscribe(
      (response) => {
        console.log('These are the data', response);

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
    this.searchItem = this.searchItem.trim();
    console.log(this.searchItem);
    this.fetchAllRetailOrders();
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
    console.log('status', this.selectStatus);
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
      console.log('Filter by date:', this.formattedDate);
      this.fetchAllRetailOrders();
    }
  }

  dateFilter() {
    console.log('date', this.selectDate);
    this.applyDateFilter();
  }

  onDateClear() {
    this.formattedDate = '';
    this.fetchAllRetailOrders(); 
  }

  navigateDashboard(id: number) {
    this.router.navigate([`/collection-hub/collection-center-dashboard/${id}`]);
  }

  downloadInvoice(id: number, tableInvoiceNo: string): void {
  this.isLoading = true;
  console.log('Starting download - Table InvoiceNo:', tableInvoiceNo, 'ID:', id);

  this.finalInvoiceService.generateAndDownloadInvoice(id, tableInvoiceNo)
    .then(() => {
      this.isLoading = false;
      console.log('Finished loading invoice details');
    })
    .catch((error) => {
      this.isLoading = false;
      console.error('Error generating invoice:', error);
      this.errorMessage = 'Failed to download invoice';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to download invoice. Please try again.',
        confirmButtonColor: '#3085d6',
      });
    });
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