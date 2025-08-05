import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { DropdownModule } from 'primeng/dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { ProcumentsService } from '../../../services/procuments/procuments.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-view-send-to-dispatch',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    DropdownModule,
    NgxPaginationModule,
    FormsModule,
    CalendarModule
  ],
  templateUrl: './view-send-to-dispatch.component.html',
  styleUrl: './view-send-to-dispatch.component.css',
})
export class ViewSendToDispatchComponent implements OnInit {
  isLoading = false;
  orders: any[] = [];
  page: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;

  statusFilter: string = '';
  dateFilter: Date | null = null; // Changed to Date type
  deliveryDateFilter: string = '';
  searchTerm: string = '';
  hasData: boolean = false;

  statusOptions = [
    { label: 'Paid', value: 'Paid' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  dateOptions = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
  ];

  constructor(
    private orderService: ProcumentsService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(dateFilter: string = this.dateFilter ? this.formatDate(this.dateFilter) : '', 
              searchTerm: string = this.searchTerm): void {
    this.isLoading = true;

    this.orderService
      .getAllOrdersWithProcessInfoDispatched(
        this.page,
        this.itemsPerPage,
        dateFilter,
        searchTerm
      )
      .subscribe({
        next: (response) => {
          console.log('API Response:', response);
          this.hasData = response.total === 0 ? false : true;

          if (response && response.data) {
            this.orders = response.data.filter(
              (order: { packingStatus: string }) =>
                order.packingStatus === 'Dispatch'
            );
            this.totalItems = response.total || response.totalCount || 0;
          } else {
            const allOrders = Array.isArray(response) ? response : [];
            this.orders = allOrders.filter(
              (order) => order.packingStatus === 'Dispatch'
            );
            this.totalItems = this.orders.length;
          }

          console.log('Orders:', this.orders.length, 'Total:', this.totalItems);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching orders:', error);
          this.orders = [];
          this.totalItems = 0;
          this.isLoading = false;
        },
      });
  }

  // Helper method to format Date to YYYY-MM-DD string
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSearch(): void {
    this.page = 1;
    this.fetchOrders();
  }

  onClearSearch(): void {
    this.searchTerm = '';
    this.page = 1;
    this.fetchOrders();
  }

  onFilterChange(): void {
    this.page = 1;
    this.fetchOrders();
  }

  onDateSelect(): void {
    this.page = 1;
    this.fetchOrders();
  }

  onDateClear(): void {
    this.dateFilter = null;
    this.page = 1;
    this.fetchOrders();
  }

  onPageChange(event: number): void {
    this.page = event;
    this.fetchOrders();
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  viewPremadePackages(id: number) {
    this.router.navigate(['/procurement/view-dispatched-define-package'], {
      queryParams: { id },
    });
  }

  trimLeadingSpaces() {
    if (this.searchTerm.startsWith(' ')) {
      this.searchTerm = this.searchTerm.trimStart();
    }
  }
}

class ExcludeItems {
  id!: number;
  displayName!: string;
}