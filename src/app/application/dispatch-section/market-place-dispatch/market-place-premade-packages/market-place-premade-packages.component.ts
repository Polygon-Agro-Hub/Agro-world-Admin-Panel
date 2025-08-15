import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { DispatchService } from '../../../../services/dispatch/dispatch.service';
import { Router } from '@angular/router';
import { TokenService } from '../../../../services/token/services/token.service';
import { PermissionService } from '../../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-market-place-premade-packages',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarModule, NgxPaginationModule, DropdownModule, LoadingSpinnerComponent],
  templateUrl: './market-place-premade-packages.component.html',
  styleUrl: './market-place-premade-packages.component.css'
})
export class MarketPlacePremadePackagesComponent implements OnInit {

  premadePackages: PremadePackages[] = [];
  search: string = '';

  isLoading:boolean= false;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  page: number = 1;

  selectedStatus: any = '';
  date: Date = new Date(); 
  status = ['Pending', 'Completed', 'Opened'];



  hasData = false;
  hasDataCustom = false;

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  constructor(
    private dispatchService: DispatchService,
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService,
  ) { }

  getPreMadePackages(page: number = 1, limit: number = this.itemsPerPage) {
    this.isLoading = true;

    this.dispatchService
      .getPreMadePackages(
        page,
        limit,
        this.selectedStatus,
        this.formatDateForAPI(this.date), // Convert Date to string
        this.search.trim()
      )
      .subscribe(
        (response) => {
          // Add fullTotal to each item
          this.premadePackages = response.items
          this.totalItems = response.total;

          this.hasData = response.items && response.items.length > 0;
          console.log(this.premadePackages);
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching ongoing cultivations:', error);
          if (error.status === 401) {
          }
          this.hasData = false; // Set to false on error
          this.isLoading = false;
        }
      );
  }

   private formatDateForAPI(date: Date | null): string {
    if (!date) return '';
    // Format as YYYY-MM-DD (ISO date string format)
    return date.toISOString().split('T')[0];
  }

  applysearch() {
    this.getPreMadePackages();

  }
  clearSearch() {
    this.search = '';
    this.getPreMadePackages();
  }

  onPageChange(event: number) {
    this.page = event;
    this.getPreMadePackages(this.page, this.itemsPerPage);

  }

  applyStatus() {
    this.getPreMadePackages();
  }

  calculateTotPrice(num1: string, num2: string) {
    return parseFloat(num1) + parseFloat(num2);
  }

  navigateToPackageItemView(id: number, invNo: string, total: number, name: string, fullTotal: string | number) {
    console.log(id, invNo, name, total);
    // this.router.navigate(['/dispatch/package-items']);
    this.router.navigate(['/dispatch/package-items'], {
      queryParams: { id, invNo, name, total, fullTotal },
    });
  }

  navigateToAdditionalItemView(id: number, invNo: string, total: number, name: string, fullTotal: number | string) {
    console.log(id, invNo, name, total);
    this.router.navigate(['/dispatch/additional-items'], {
      queryParams: { id, invNo, name, total, fullTotal },
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
  packageStatus: string

  totcount: number
  packCount: number
  orderAdditionalCount: number
  additionalPrice: string
  additionalItemsStatus: string;
}
