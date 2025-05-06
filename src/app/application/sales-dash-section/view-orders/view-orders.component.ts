import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';


import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

import { FormsModule } from '@angular/forms';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { SalesDashService } from '../../../services/sales-dash/sales-dash.service';

@Component({
  selector: 'app-view-orders',
  standalone: true,
  imports: [
            HttpClientModule,
            CommonModule,
            LoadingSpinnerComponent,
            NgxPaginationModule,
            FormsModule,
            DropdownModule
  ],
  templateUrl: './view-orders.component.html',
  styleUrl: './view-orders.component.css',
  providers: [DatePipe],
})
export class ViewOrdersComponent implements OnInit {

  ordersArr: Orders[] = [];
  
  date: string = '';
  isLoading = false;
  isPopupVisible = false;

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  hasData: boolean = true;
  searchText: string = '';

  deliveryTypeArr = [
    { deliveryType: 'Once a week', value: 'Once a week'},
    { deliveryType: 'Twice a week', value: 'Twice a week'},
    { deliveryType: 'One Time', value: 'One Time'}
  ]

  paymentStatusArr = [
    { paymentStatus: 'Paid', value: '1'},
    { paymentStatus: 'Pending', value: '0'}
  ]

  orderStatusArr = [
    { orderStatus: 'Ordered', value: 'Ordered' },
    { orderStatus: 'Processing', value: 'Processing' },
    { orderStatus: 'On the way', value: 'On the way' },
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
    
    private salesDashService: SalesDashService,
  ) {}

  ngOnInit() {
    
    this.fetchAllOrders();
  }

  

  fetchAllOrders(page: number = 1, limit: number = this.itemsPerPage, orderStatus: string = this.orderStatusFilter, paymentMethod: string = this.paymentMethodFilter, paymentStatus: string = this.paymentStatusFilter, deliveryType: string = this.deliveryTypeFilter, search: string = this.searchText) {
    
    
    this.isLoading = true;
    this.salesDashService.getAllOrders( page, limit, orderStatus, paymentMethod, paymentStatus, deliveryType, search, this.date).subscribe(
      (data) => {
        console.log(data);
        this.isLoading = false;
        this.ordersArr = data.items.map((order: Orders) => {
          return {
            ...order,
            formattedCreatedDate: this.datePipe.transform(order.createdAt, 'd MMM,  y h:mm a'),
            scheduleDateFormattedSL: this.formatDate(order.scheduleDate)
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

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllOrders(this.page, this.itemsPerPage); // Include itemsPerPage
  }

  applyOrderStatusFilters() {
    console.log(this.orderStatusFilter)
    this.fetchAllOrders(this.page, this.itemsPerPage, this.orderStatusFilter, this.paymentMethodFilter, this.paymentStatusFilter, this.deliveryTypeFilter, this.searchText);
  }

  applyPaymentMethodFilters() {
    console.log(this.paymentMethodFilter)
    this.fetchAllOrders(this.page, this.itemsPerPage, this.orderStatusFilter, this.paymentMethodFilter, this.paymentStatusFilter, this.deliveryTypeFilter, this.searchText);
  }

  applyPaymentStatusFilters() {
    console.log(this.paymentStatusFilter)
    this.fetchAllOrders(this.page, this.itemsPerPage, this.orderStatusFilter, this.paymentMethodFilter, this.paymentStatusFilter, this.deliveryTypeFilter, this.searchText);
  }

  applydeliveryTypeFilters() {
    console.log(this.deliveryTypeFilter)
    this.fetchAllOrders(this.page, this.itemsPerPage, this.orderStatusFilter, this.paymentMethodFilter, this.paymentStatusFilter, this.deliveryTypeFilter, this.searchText);
  }

  dateFilter() {
    this.fetchAllOrders(this.page, this.itemsPerPage, this.orderStatusFilter, this.paymentMethodFilter, this.paymentStatusFilter, this.deliveryTypeFilter, this.searchText);
  }

  formatDate(date: Date | string | null): string {
    return date ? this.datePipe.transform(date, 'yyyy-MM-dd') || '' : '';
  }

  onSearch() {
    this.fetchAllOrders(this.page, this.itemsPerPage, this.orderStatusFilter, this.paymentMethodFilter, this.paymentStatusFilter, this.deliveryTypeFilter, this.searchText);
  }

  offSearch() {
    this.searchText = '';
    this.fetchAllOrders(this.page, this.itemsPerPage, this.orderStatusFilter, this.paymentMethodFilter, this.paymentStatusFilter, this.deliveryTypeFilter, this.searchText);
  }

  Back(): void {
    this.router.navigate(['/sales-dash']);
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }

}

class Orders {
  id!: number;
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
  formattedCreatedDate!:string;
  scheduleDateFormattedSL?: string;
 
  
}



  

  // applyFilters() {
  //   this.fetchAllSalesAgents(this.page, this.itemsPerPage, this.searchText, this.statusFilter);
  // }


