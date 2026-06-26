
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
import { PostinvoiceService } from '../../../services/invoice/postinvoice.service';

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
    { label: 'Out For Delivery', value: 'Out For Delivery' },

  ];

  statusOptions = [
    { label: 'Delivered', value: 'Delivered' },
    { label: 'On the Way', value: 'On the way' },
    { label: 'Assigned', value: 'Ordered' },
    { label: 'Out For Delivery', value: 'Out For Delivery' },
    { label: 'Hold', value: 'Hold' },
    { label: 'Picked Up', value: 'Picked up' },
    { label: 'Processing', value: 'Processing' },
    { label: 'Cancelled', value: 'Cancelled' },
    { label: 'Ready to Pickup', value: 'Ready to Pickup' },
    { label: 'Failed', value: 'Failed' },
  ];

  constructor(
    private router: Router,
    private MaketplaceSrv: MarketPlaceService,
    public tokenService: TokenService,
    public permissionService: PermissionService,
    private finalInvoiceService: FinalinvoiceService, // Updated service
    private http: HttpClient,
    private postInvoiceService: PostinvoiceService,
  ) { }

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
    this.MaketplaceSrv.getAllWholesaleOrders(
      page,
      limit,
      status,
      method,
      searchItem,
      formattedDate
    ).subscribe(
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
    this.searchItem = this.searchItem.trim();
    this.page = 1;
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
    this.fetchAllRetailOrders();
  }

  clearStatusFilter() {
    this.selectStatus = '';
    this.fetchAllRetailOrders();
  }

  applyDateFilter() {
    if (this.selectDate instanceof Date) {
      const year = this.selectDate.getFullYear();
      const month = String(this.selectDate.getMonth() + 1).padStart(2, '0');
      const day = String(this.selectDate.getDate()).padStart(2, '0');
      this.formattedDate = `${year}-${month}-${day}`;
      this.fetchAllRetailOrders();
    }
  }

  dateFilter() {
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

    this.finalInvoiceService.generateAndDownloadInvoice(id, tableInvoiceNo)
      .then(() => {
        this.isLoading = false;
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

  isPostInvoiceEnabled(status: string): boolean {
    // Define the statuses that allow post-invoice download
    const enabledStatuses = [
      'Out For Delivery',
      'Delivered',
      'Picked up',
      'Ready to Pickup',
      'On the way',
      'Failed'
    ];

    return enabledStatuses.includes(status);
  }

  downloadPostInvoice(id: number, tableInvoiceNo: string): void {
    this.isLoading = true;

    this.postInvoiceService.generateAndDownloadInvoice(id, tableInvoiceNo)
      .then(() => {
        // Success case - no action needed unless you want to show a success message
      })
      .catch((error) => {
        console.error('Error generating invoice:', error);
        this.errorMessage = 'Failed to download invoice';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to download invoice. Please try again.',
          confirmButtonColor: '#3085d6',
        });
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  downloadQRCode(qrCodeUrl: string, invNo: string): void {
    // Extract filename from URL or use invoice number
    const fileName = `QR_${invNo}.png`;

    // Fetch the image from the URL
    fetch(qrCodeUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then(blob => {
        // Create a blob URL
        const blobUrl = window.URL.createObjectURL(blob);

        // Create an anchor element
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;

        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the blob URL
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(error => {
        console.error('Error downloading QR code:', error);
        // Optional: Show user-friendly error message
        alert('Failed to download QR code. Please try again.');
      });
  }
}

class RetailOrders {
  id!: number;
  orderId!: number;
  customerName!: string;
  method!: number;
  amount!: number;
  invNo!: string;
  status!: string;
  orderdDate!: Date;
  qrCode!: string;
}