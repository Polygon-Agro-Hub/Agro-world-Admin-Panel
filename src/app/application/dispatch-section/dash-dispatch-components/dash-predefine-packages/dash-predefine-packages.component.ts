
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { DispatchService } from '../../../../services/dispatch/dispatch.service';
import { Router } from '@angular/router';
import { TokenService } from '../../../../services/token/services/token.service';
import { PermissionService } from '../../../../services/roles-permission/permission.service';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-dash-predefine-packages',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarModule, NgxPaginationModule, DropdownModule, LoadingSpinnerComponent],
  templateUrl: './dash-predefine-packages.component.html',
  styleUrls: ['./dash-predefine-packages.component.css']
})
export class DashPredefinePackagesComponent implements OnInit {
  premadePackages: PremadePackages[] = [];
  search: string = '';
  isLoading = false;
  status = ['Pending', 'Completed', 'Opened'];
  selectedStatus: string = '';
  dateFilter: Date | null = new Date(); // Initialize with current date for initial filter
  itemsPerPage: number = 10;
  totalItems: number = 0;
  page: number = 1;
  isPremade = true;
  hasData = false;
  hasDataCustom = false;

  constructor(
    private dispatchService: DispatchService,
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) { }

  ngOnInit(): void {
    console.log('Initializing with date:', this.dateFilter);
    this.getPreMadePackages(); // Fetch packages for current date on init
  }

  getPreMadePackages(page: number = 1, limit: number = this.itemsPerPage) {
    this.isLoading = true;
    const formattedDate = this.formatDateForAPI(this.dateFilter);
    console.log('Fetching packages with:', { page, limit, status: this.selectedStatus, date: this.dateFilter, formattedDate, search: this.search.trim() });

    this.dispatchService
      .getPreMadePackages(
        page,
        limit,
        this.selectedStatus,
        formattedDate,
        this.search.trim()
      )
      .subscribe({
        next: (response) => {
          console.log('API Response:', response);

          if (response && response.items) {
            this.premadePackages = response.items;
            this.totalItems = response.total || response.totalCount || 0;
            this.hasData = response.total === 0 ? false : true;
          } else {
            const allPackages = Array.isArray(response) ? response : [];
            this.premadePackages = allPackages;
            this.totalItems = this.premadePackages.length;
            this.hasData = this.premadePackages.length === 0 ? false : true;
          }

          console.log('Processed Packages:', this.premadePackages);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching packages:', error);
          this.premadePackages = [];
          this.totalItems = 0;
          this.hasData = false;
          this.isLoading = false;
        }
      });
  }

  private formatDateForAPI(date: Date | null): string {
    if (!date || isNaN(date.getTime())) {
      console.log('Invalid or null date, returning empty string');
      return ''; // Return empty string to fetch all packages
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;
    console.log('Formatted date for API:', formatted);
    return formatted;
  }

  onDateFilterClear(): void {
    console.log('Date filter cleared');
    this.dateFilter = null; // Clear UI date picker to show placeholder
    this.page = 1;
    this.getPreMadePackages(); // Fetch all packages (no date filter)
  }

  onFilterChange(): void {
    console.log('Date filter changed:', this.dateFilter, 'Event:', event);
    this.page = 1;
    this.getPreMadePackages();
  }



  applySearch(): void {
    console.log('Applying search:', this.search);
    this.page = 1;
    this.getPreMadePackages();
  }

  clearSearch(): void {
    console.log('Clearing search');
    this.search = '';
    this.page = 1;
    this.getPreMadePackages();
  }

  applyStatus(): void {
    console.log('Applying status:', this.selectedStatus);
    this.page = 1;
    this.getPreMadePackages();
  }

  onPageChange(event: number): void {
    console.log('Page changed:', event);
    this.page = event;
    this.getPreMadePackages(this.page, this.itemsPerPage);
  }

  calculateTotPrice(num1: string, num2: string): number {
    return parseFloat(num1) + parseFloat(num2);
  }

  navigateToPackageItemView(item: PremadePackages): void {
    // this.router.navigate(['/dispatch/package-items'], {
    //   queryParams: { id, invNo, name, total, fullTotal }
    // });
    let status = true;
    if (item.additionalItemsStatus === 'Opened' || item.additionalItemsStatus === 'Pending') {
      status = false;
    }

    this.router.navigate([`/dispatch/dispatch-package/${item.orderPackageId}/${item.processOrderId}`], {
      queryParams: { status: status, price: item.productPrice, invNo: item.invNo, packageName: item.displayName }
    });
  }

  navigateToAdditionalItemView(item: PremadePackages): void {
    // this.router.navigate(['/dispatch/additional-items'], {
    //   queryParams: { id, invNo, name, total, fullTotal }
    // });
    let status = true;
    if (item.packageStatus === 'Opened' || item.packageStatus === 'Pending') {
      status = false;
    }
    this.router.navigate([`/dispatch/dispatch-additional-items/${item.processOrderId}`], {
      queryParams: { status: status}
    });
  }
}

interface PremadePackages {
  orderId: number;
  processOrderId: number;
  orderPackageId: number;
  displayName: string;
  productPrice: string;
  sheduleDate: Date;
  invNo: string;
  hasData: boolean;
  packageStatus: string;
  totcount: number;
  packCount: number;
  orderAdditionalCount: number;
  additionalPrice: string;
  additionalItemsStatus: string;
  userName: string;
  packOfficer: string;
}