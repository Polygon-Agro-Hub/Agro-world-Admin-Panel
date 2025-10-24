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

  isLoading: boolean = false;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  page: number = 1;

  selectedStatus: any = '';
  date: Date | null = new Date();
  status = ['Pending', 'Completed', 'Opened'];



  hasData = false;
  hasDataCustom = false;

  clearDate() {
    this.date = null; // Clear the date
    this.getPreMadePackages(); // Reset the data table
  }

  ngOnInit(): void {
    this.getPreMadePackages();
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
      .getMarketPlacePreMadePackages(
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

          this.hasData = response.total > 0;
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

    // Convert using local time instead of UTC
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`; // Local YYYY-MM-DD
  }

  applysearch() {
    this.getPreMadePackages();

  }
  clearSearch() {
    this.search = '';
    this.date = null; // Clear date when clearing search
    this.selectedStatus = ''; // Clear status when clearing search
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

  navigateToPackageView(id: number, invNo: string) {
    this.router.navigate([`/dispatch/view-premade-packages/${id}/${invNo}`])
  }

  navigateToAdditionalItemView(id: number, invNo: string, total: number, name: string, fullTotal: number | string) {
    console.log(id, invNo, name, total);
    this.router.navigate(['/dispatch/additional-items'], {
      queryParams: { id, invNo, name, total, fullTotal },
    });

  }
}

interface PremadePackages {
  id: number;
  processOrderId: number;
  invNo: string;
  sheduleDate: string;
  packageCount: number;
  packagePrice: number;
  totPackageItems: number;
  packPackageItems: number;
  totalAdditionalItems: number;
  packedAdditionalItems: number;
  packingStatus: string;
  additionalItemsStatus: string;
  packageStatus: string,
  adminPackBy: string | null;
  packBy: string | null;
}
