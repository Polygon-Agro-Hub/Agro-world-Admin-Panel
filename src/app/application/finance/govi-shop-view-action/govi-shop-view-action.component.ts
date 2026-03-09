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
  selector: 'app-govi-shop-view-action',
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
  templateUrl: './govi-shop-view-action.component.html',
  styleUrl: './govi-shop-view-action.component.css',
})
export class GoviShopViewActionComponent implements OnInit {
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

  orderStatusArr = [
    { orderStatus: 'Activated', value: 'Activate' },
    { orderStatus: 'Deactivated', value: 'Deactivate' },
    { orderStatus: 'Rejected', value: 'Rejected' },
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
  ) {}

  ngOnInit() {
    this.fetchAllOrders();
  }

  fetchAllOrders(
    status: string = this.orderStatusFilter,
    search: string = this.searchText,
  ) {
    this.isLoading = true;
    this.FinanceService.getAllShopViewAction(status, search).subscribe(
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
    this.router.navigate(['/finance/action']);
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  viewDocuments(id: number) {
    this.router.navigate([
      '/finance/action/finance-govishop/view-documents',
      id,
    ]);
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
}
