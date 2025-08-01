import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
import { ProcumentsService } from '../../../services/procuments/procuments.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-todo-define-packages',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    DropdownModule,
    NgxPaginationModule,
    FormsModule,
  ],
  templateUrl: './todo-define-packages.component.html',
  styleUrl: './todo-define-packages.component.css',
})
export class TodoDefinePackagesComponent implements OnInit {
  isLoading = true;
  orders: any[] = [];
  page: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;

  statusFilter: string = '';
  dateFilter: string = '';
  dateFilter1: string = '';
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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(
    ordstatus: string = this.statusFilter,
    dateFilter: string = this.dateFilter,
    dateFilter1: string = this.dateFilter1
  ): void {
    this.isLoading = true;

    this.orderService
      .getAllOrdersWithProcessInfo(
        this.page,
        this.itemsPerPage,
        ordstatus,
        dateFilter,
        dateFilter1
      )
      .subscribe({
        next: (response) => {
          console.log('API Response:', response); // Debug log

          if (response && response.data) {
            // Optional: Filter on client side if needed (but better to do it server-side)
            this.orders = response.data.filter(
              (order: { packingStatus: string }) =>
                order.packingStatus === 'Todo'
            );
            console.log('orders', this.orders);
            this.totalItems = response.total || response.totalCount || 0;
            this.hasData = response.total === 0 ? false : true
          } else {
            // Fallback client-side filtering if API doesn't support it
            const allOrders = Array.isArray(response) ? response : [];
            this.orders = allOrders.filter(
              (order) => order.packingStatus === 'Todo'
            );
            this.totalItems = this.orders.length;
          }

          console.log('Orders:', this.orders.length, 'Total:', this.totalItems); // Debug log
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

  onPageChange(event: number): void {
    this.page = event;
    this.fetchOrders();
  }

  private getFilterDate(): string {
    if (!this.dateFilter) return '';

    const today = new Date();
    switch (this.dateFilter) {
      case 'today':
        return today.toISOString().split('T')[0];
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        return weekAgo.toISOString().split('T')[0];
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        return monthAgo.toISOString().split('T')[0];
      default:
        return '';
    }
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
    this.router.navigate(['/procurement/todo-define-premade-packages'], {
      queryParams: { id },
    });
  }
}
