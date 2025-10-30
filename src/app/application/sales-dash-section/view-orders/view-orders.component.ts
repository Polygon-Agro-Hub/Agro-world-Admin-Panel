
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { SalesDashService } from '../../../services/sales-dash/sales-dash.service';
import { finalize } from 'rxjs';
import { FinalinvoiceService } from '../../../services/invoice/finalinvoice.service';

@Component({
  selector: 'app-view-orders',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
    FormsModule,
    DropdownModule,
    CalendarModule,
  ],
  templateUrl: './view-orders.component.html',
  styleUrl: './view-orders.component.css',
  providers: [DatePipe],
})
export class ViewOrdersComponent implements OnInit {
  ordersArr: Orders[] = [];
  date: Date | null = null;
  isLoading = false;
  isPopupVisible = false;
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  hasData: boolean = true;
  searchText: string = '';
  errorMessage: string | null = null;

  deliveryTypeArr = [
    { deliveryType: 'Once a week', value: 'Once a week' },
    { deliveryType: 'Twice a week', value: 'Twice a week' },
    { deliveryType: 'One Time', value: 'One Time' },
  ];

  paymentStatusArr = [
    { paymentStatus: 'Paid', value: '1' },
    { paymentStatus: 'Pending', value: '0' },
  ];

  orderStatusArr = [
    { orderStatus: 'Assigned', value: 'Ordered' },
    { orderStatus: 'Processing', value: 'Processing' },
    { orderStatus: 'Out For Delivery', value: 'Out For Delivery' },
    { orderStatus: 'Ready to Pickup', value: 'Ready to Pickup' },
    { orderStatus: 'Delivered', value: 'Delivered' },
    { orderStatus: 'Cancelled', value: 'Cancelled' },
  ];

  paymentMethodArr = [
    { paymentMethod: 'Online Payment', value: 'Online Payment' },
    { paymentMethod: 'Pay By Cash', value: 'Pay By Cash' },
  ];

  orderStatusFilter: string = '';
  paymentMethodFilter: string = '';
  paymentStatusFilter: string = '';
  deliveryTypeFilter: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private datePipe: DatePipe,
    private finalInvoiceService: FinalinvoiceService,
    private salesDashService: SalesDashService
  ) {}

  ngOnInit() {
    this.fetchAllOrders();
  }

  fetchAllOrders(
    page: number = 1,
    limit: number = this.itemsPerPage,
    orderStatus: string = this.orderStatusFilter,
    paymentMethod: string = this.paymentMethodFilter,
    paymentStatus: string = this.paymentStatusFilter,
    deliveryType: string = this.deliveryTypeFilter,
    search: string = this.searchText
  ) {
    this.isLoading = true;
    console.log('date', this.date);
    this.salesDashService
      .getAllOrders(
        page,
        limit,
        orderStatus,
        paymentMethod,
        paymentStatus,
        deliveryType,
        search,
        this.formatDateForBackend(this.date)
      )
      .subscribe(
        (data) => {
          console.log(data);
          this.isLoading = false;
          this.ordersArr = data.items.map((order: Orders) => {
            return {
              ...order,
              formattedCreatedDate: this.datePipe.transform(
                order.createdAt,
                'd MMM,  y h:mm a'
              ),
              scheduleDateFormattedSL: this.formatDate(order.scheduleDate),
            };
          });

          this.hasData = this.ordersArr.length > 0;
          this.totalItems = data.total;
          console.log(this.ordersArr);
        },
        (error) => {
          console.error('Error fetch news:', error);
          if (error.status === 401) {
            this.isLoading = false;
          }
        }
      );
  }

  formatDateForBackend(date: Date | null): string {
    if (!date) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllOrders(this.page, this.itemsPerPage);
  }

  applyOrderStatusFilters() {
    console.log(this.orderStatusFilter);
    this.fetchAllOrders(
      this.page,
      this.itemsPerPage,
      this.orderStatusFilter,
      this.paymentMethodFilter,
      this.paymentStatusFilter,
      this.deliveryTypeFilter,
      this.searchText
    );
  }

  applyPaymentMethodFilters() {
    console.log(this.paymentMethodFilter);
    this.fetchAllOrders(
      this.page,
      this.itemsPerPage,
      this.orderStatusFilter,
      this.paymentMethodFilter,
      this.paymentStatusFilter,
      this.deliveryTypeFilter,
      this.searchText
    );
  }

  applyPaymentStatusFilters() {
    this.fetchAllOrders(
      this.page,
      this.itemsPerPage,
      this.orderStatusFilter,
      this.paymentMethodFilter,
      this.paymentStatusFilter,
      this.deliveryTypeFilter,
      this.searchText
    );
  }

  applydeliveryTypeFilters() {
    console.log('deliveryTypeFilter', this.deliveryTypeFilter);
    this.fetchAllOrders(
      this.page,
      this.itemsPerPage,
      this.orderStatusFilter,
      this.paymentMethodFilter,
      this.paymentStatusFilter,
      this.deliveryTypeFilter,
      this.searchText
    );
  }

  dateFilter() {
    console.log('date', this.date);
    this.fetchAllOrders(
      this.page,
      this.itemsPerPage,
      this.orderStatusFilter,
      this.paymentMethodFilter,
      this.paymentStatusFilter,
      this.deliveryTypeFilter,
      this.searchText
    );
  }

  formatDate(date: Date | string | null): string {
    return date ? this.datePipe.transform(date, 'yyyy-MM-dd') || '' : '';
  }

  formatTotalItems(): string {
    return this.totalItems < 10
      ? '0' + this.totalItems
      : this.totalItems.toString();
  }

  onSearch() {
    this.searchText = this.searchText?.trim() || ''
    this.fetchAllOrders(
      this.page,
      this.itemsPerPage,
      this.orderStatusFilter,
      this.paymentMethodFilter,
      this.paymentStatusFilter,
      this.deliveryTypeFilter,
      this.searchText
    );
  }

  offSearch() {
    this.searchText = '';
    this.fetchAllOrders(
      this.page,
      this.itemsPerPage,
      this.orderStatusFilter,
      this.paymentMethodFilter,
      this.paymentStatusFilter,
      this.deliveryTypeFilter,
      this.searchText
    );
  }

  Back(): void {
    this.router.navigate(['/sales-dash']);
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  // In your component
async downloadInvoice(orderId: number, invoiceNumber: string): Promise<void> {
  this.isLoading = true;
  try {
    await this.finalInvoiceService.generateAndDownloadInvoice(orderId, invoiceNumber);
  } catch (error) {
    console.error('Error generating invoice:', error);
    this.errorMessage = 'Failed to generate invoice';
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to generate invoice. Please try again.',
      confirmButtonColor: '#3085d6',
    });
  } finally {
    this.isLoading = false;
  }
}

  onDateClear() {
    console.log('date', this.date);
    this.fetchAllOrders(
      this.page,
      this.itemsPerPage,
      this.orderStatusFilter,
      this.paymentMethodFilter,
      this.paymentStatusFilter,
      this.deliveryTypeFilter,
      this.searchText
    );
  }
}

class Orders {
  id!: number;
  orderId!: number;
  invNo!: string;
  cusId!: string;
  fullDiscount!: number;
  fullTotal!: number;
  empId!: string;
  firstName!: string;
  lastName!: string;
  orderStatus!: string;
  paymentMethod!: string;
  paymentStatus!: number;
  scheduleDate!: Date;
  deliveryType!: string;
  timeSlot!: string;
  createdAt!: Date;
  formattedCreatedDate!: string;
  scheduleDateFormattedSL?: string;
  sheduleType!: string;
  sheduleTime!: string;
}
