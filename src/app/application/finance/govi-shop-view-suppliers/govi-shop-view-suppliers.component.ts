import { Component, OnInit, HostListener } from '@angular/core';
import {
  FinanceService,
  GoviCareRequest,
  GoviCareRequestDetail,
  InvestmentOfficer,
} from '../../../services/finance/finance.service';

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
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { PostinvoiceService } from '../../../services/invoice/postinvoice.service';

@Component({
  selector: 'app-govi-shop-view-suppliers',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
    FormsModule,
    DropdownModule,
    CalendarModule,],
  templateUrl: './govi-shop-view-suppliers.component.html',
  styleUrl: './govi-shop-view-suppliers.component.css'
})
export class GoviShopViewSuppliersComponent implements OnInit {
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

  isAllSuppliers: boolean = true;

  orderStatusArr = [
    { orderStatus: 'Free', value: 'Free' },
    { orderStatus: 'Premium', value: 'Premium' },
  ];

  orderStatusFilter: string = '';
  paymentMethodFilter: string = '';
  paymentStatusFilter: string = '';
  deliveryTypeFilter: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private FinanceService: FinanceService,
    public tokenService: TokenService,
    public permissionService: PermissionService,
    private postInvoiceService: PostinvoiceService,
  ) { }

  ngOnInit() {
    this.fetchAllOrders();
  }

  fetchAllOrders(
    page: number = this.page,
    limit: number = this.itemsPerPage,
    status: string = this.orderStatusFilter,
    search: string = this.searchText,
    allSuppliers: boolean = this.isAllSuppliers
  ) {
    this.isLoading = true;
    this.FinanceService.getAllShopViewAction(page, limit, status, search, allSuppliers).subscribe(
      (data) => {
        this.isLoading = false;
        this.ordersArr = data.items;
        this.hasData = this.ordersArr.length > 0;
        this.totalItems = data.total;
      },
      (error) => {
        console.error('Error fetch news:', error);
        if (error.status === 401) {
          this.isLoading = false;
        }
      },
    );
  }

  formatDateForBackend(date: Date | null): string {
    if (!date) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  applyOrderStatusFilters() {
    this.fetchAllOrders();
  }

  formatTotalItems(): string {
    return this.totalItems < 10
      ? '0' + this.totalItems
      : this.totalItems.toString();
  }

  onSearch() {
    this.searchText = this.searchText?.trim() || '';
    this.fetchAllOrders();
  }

  offSearch() {
    this.searchText = '';
    this.fetchAllOrders();
  }

  Back(): void {
    this.router.navigate(['/finance/action/finance-govishop']);
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  onPageChange(event: number) {
    this.page = event;
    console.log('page', this.page)
    this.fetchAllOrders();
  }

  deleteSupplier(id: number) {

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this Supplier? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
        confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700',
        cancelButton: 'bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 ml-2'
      },
      buttonsStyling: false, // let Tailwind handle button styling
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.FinanceService.deleteGoviShopSupplier(id).subscribe(
          (data) => {
            this.isLoading = false;
            if (data.status) {
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'The GoviShop Supplier has been deleted.',
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold',
                  confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
                },
                buttonsStyling: false
              });
              this.fetchAllOrders();
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'There was an error deleting the GoviShop Supplier.',
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold',
                  confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
                },
                buttonsStyling: false
              });
            }
          },
          () => {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'There was an error deleting the GoviShop Supplier.',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold',
                confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
              },
              buttonsStyling: false
            });
          }
        );
      }
    });
  }
}

class Orders {
  id!: number;
  shopName!: string;
  ownername!: string;
  shopPhone!: string;
  nic!: string;
  userStatus!: string;
  acticatedAt!: Date;
  userName!: string;
  currentPlan!: string;
}
