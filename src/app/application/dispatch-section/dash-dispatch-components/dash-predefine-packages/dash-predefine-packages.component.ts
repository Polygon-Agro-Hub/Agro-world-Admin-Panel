
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
  dateFilter: Date | null = new Date(); 
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
    this.getPreMadePackages();
  }

  getPreMadePackages(page: number = 1, limit: number = this.itemsPerPage) {
    this.isLoading = true;
    const formattedDate = this.formatDateForAPI(this.dateFilter);

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
      return ''; 
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;
    return formatted;
  }

  onDateFilterClear(): void {
    this.dateFilter = null; 
    this.page = 1;
    this.getPreMadePackages(); 
  }

  onFilterChange(): void {
    this.page = 1;
    this.getPreMadePackages();
  }



  applySearch(): void {
    this.page = 1;
    this.getPreMadePackages();
  }

  clearSearch(): void {
    this.search = '';
    this.page = 1;
    this.getPreMadePackages();
  }

  applyStatus(): void {
    this.page = 1;
    this.getPreMadePackages();
  }

  onPageChange(event: number): void {
    this.page = event;
    this.getPreMadePackages(this.page, this.itemsPerPage);
  }

  calculateTotPrice(num1: string, num2: string): number {
    return parseFloat(num1) + parseFloat(num2);
  }

  navigateToPackageItemView(item: PremadePackages): void {
    
    let status = true;
    if (item.additionalItemsStatus === 'Opened' || item.additionalItemsStatus === 'Pending') {
      status = false;
    }

    this.router.navigate([`/dispatch/dispatch-package/${item.orderPackageId}/${item.processOrderId}`], {
      queryParams: { status: status, price: item.productPrice, invNo: item.invNo, packageName: item.displayName }
    });
  }

  navigateToAdditionalItemView(item: PremadePackages): void {
    
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