import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { DestributionService } from '../../../services/destribution-service/destribution-service.service';
import { DistributionHubService } from '../../../services/distribution-hub/distribution-hub.service';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { NgxPaginationModule } from 'ngx-pagination';

interface OrderItem {
  invNo: string;
  phoneNum: string;
  regCode: string;
  centerName: string;
  sheduleDate: string;
  packageStatus: 'Unknown' | 'Pending' | 'Opened' | 'Completed';
  additionalItemsStatus: 'Unknown' | 'Pending' | 'Opened' | 'Completed';
  empId: string | null;
  createdAt: string;
}

@Component({
  selector: 'app-distribution-view-customer-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    CalendarModule,
    TooltipModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
  ],
  templateUrl: './distribution-view-customer-orders.component.html',
  styleUrl: './distribution-view-customer-orders.component.css',
})
export class DistributionViewCustomerOrdersComponent implements OnInit {
  isLoading = false;
  items: OrderItem[] = [];

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;

  deliveryDate?: string;
  deliveryDateModel: Date | null = null;
  centerId?: number;
  status?: string;

  searchText: string = '';
  hasData: boolean = true;

  @ViewChild('hiddenDateInput') hiddenDateInput?: ElementRef<HTMLInputElement>;
  deliveryDateOption?: 'today' | 'custom';

  centreOptions: Array<{ label: string; value: number }> = [];
  statusOptions = [
    { label: 'Completed', value: 'Completed' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Opened', value: 'Opened' },
  ];
  deliveryDateOptions = [
    { label: 'Current Date', value: 'today' },
    { label: 'Pick a Date…', value: 'custom' },
  ];

  constructor(
    private distService: DestributionService,
    private distHubService: DistributionHubService
  ) {}

  searchOrders() {
    const trimmed = this.searchText.trim();
    if (!trimmed) {
      this.searchText = '';
      return;
    }
    this.page = 1;
    this.loadData();
  }

  clearSearch() {
    this.searchText = '';
    this.page = 1;
    this.loadData();
  }

  back() {
    window.history.back();
  }

  ngOnInit() {
    this.fetchCentreOptions();
    this.loadData();
  }

  onDateSelected(date: Date) {
    if (!date) return;
    const tzFixed = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    this.deliveryDate = tzFixed.toISOString().slice(0, 10);
    this.applyFilters();
  }

  clearDateFilter() {
    this.deliveryDateModel = null;
    this.deliveryDate = undefined;
    this.applyFilters();
  }

  loadData(page: number = 1, limit: number = this.itemsPerPage) {
    this.isLoading = true;
    this.distService
      .getTargetedCustomersOrders(
        page,
        limit,
        this.deliveryDate,
        this.centerId,
        this.status,
        this.searchText?.trim()
      )
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.items = response.items || [];
          this.hasData = this.items.length > 0;
          this.totalItems = response.total || this.items.length || 0;

          const totalPages =
            this.itemsPerPage > 0
              ? Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage))
              : 1;
          if (this.page > totalPages) {
            this.page = totalPages;
          }
        },
        error: () => {
          this.items = [];
          this.totalItems = 0;
          this.hasData = false;
          this.isLoading = false;
        },
      });
  }

  onPageChange(page: number) {
    this.page = page;
    this.loadData(this.page, this.itemsPerPage);
  }
  applyFilters() {
    this.page = 1;
    this.loadData(this.page, this.itemsPerPage);
  }

  fetchCentreOptions() {
    this.distHubService.getDistributionCenterNames().subscribe({
      next: (res) => {
        const items = res || [];
        this.centreOptions = items
          .map((it: any) => ({
            label: `${it.regCode} - ${it.centerName}`,
            value: it.id,
          }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label));
      },
      error: () => {
        this.centreOptions = [];
      },
    });
  }

  private normalizeStatus(
    s: string | null | undefined
  ): 'Unknown' | 'Pending' | 'Opened' | 'Completed' {
    const v = (s || 'Unknown').toString().trim().toLowerCase();
    if (v === 'completed' || v === 'complete') return 'Completed';
    if (v === 'pending') return 'Pending';
    if (v === 'opened' || v === 'open') return 'Opened';
    return 'Unknown';
  }

  getCombinedStatus(item: any): 'Pending' | 'Opened' | 'Completed' {
    const pkg = this.normalizeStatus(item.packageStatus as any);
    const add = this.normalizeStatus(item.additionalItemsStatus as any);

    if (pkg === 'Opened' || add === 'Opened') return 'Opened';
    if (pkg === 'Pending' && add === 'Pending') return 'Pending';
    if (pkg === 'Completed' && add === 'Completed') return 'Completed';
    if (pkg === 'Completed' || add === 'Completed') return 'Completed';
    if (pkg === 'Pending' || add === 'Pending') return 'Pending';
    return 'Opened';
  }

  getStatusClass(status: 'Pending' | 'Opened' | 'Completed'): string {
    const map: Record<string, string> = {
      Completed:
        'w-[100px] h-[38px] flex items-center justify-center rounded-md ' +
        'text-[14px] font-inter font-medium ' +
        'bg-[#BBFFC6] text-[#308233]',
      Pending:
        'w-[100px] h-[38px] flex items-center justify-center rounded-md ' +
        'text-[14px] font-inter font-medium ' +
        'bg-[#FFB9B7] text-[#D16D6A]',
      Opened:
        'w-[100px] h-[38px] flex items-center justify-center rounded-md ' +
        'text-[14px] font-inter font-medium ' +
        'bg-[#F8FFA6] text-[#A8A100]',
    };
    return map[status] || map['Opened'];
  }
}
