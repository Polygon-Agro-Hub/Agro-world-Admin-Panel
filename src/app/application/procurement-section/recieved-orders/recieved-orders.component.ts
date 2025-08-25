import { CommonModule, DatePipe, formatDate } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { ProcumentsService } from '../../../services/procuments/procuments.service';
import { Router } from '@angular/router';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import Swal from 'sweetalert2';
import { environment } from '../../../environment/environment';
import { CalendarModule } from 'primeng/calendar';

interface PurchaseReport {
  id: number;
  varietyNameEnglish: string;
  cropNameEnglish: string;
  quantity: number;
  OrderDate: string;
  sheduleDate: Date;
  toCollectionCentre: Date;
  toDispatchCenter: Date;
  createdAt: Date;
}

interface FilterType {
  display: string;
  value: string;
}

@Component({
  selector: 'app-recieved-orders',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    NgxPaginationModule,
    DropdownModule,
    FormsModule,
    LoadingSpinnerComponent,
    DatePipe,
    CalendarModule,
  ],
  templateUrl: './recieved-orders.component.html',
  styleUrl: './recieved-orders.component.css',
})
export class RecievedOrdersComponent {
  search: string = '';
  isLoading = false;
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  purchaseReport: PurchaseReport[] = [];
  filterType: string = '';
  date: string = '';
  isDownloading = false;
  filterApplied = false;
  
  // For popup filter UI
  showFilterPopup = false;
  selectedFilterType: FilterType | null = null;
  dateTemp: Date | null = null;

  // Available filter types
  filterTypes: FilterType[] = [
    { display: 'Scheduled Date', value: 'scheduleDate' },
    { display: 'To Collection Centre', value: 'toCollectionCenter' },
    { display: 'To Dispatch Centre', value: 'toDispatchCenter' }
  ];

  constructor(
    private procumentService: ProcumentsService,
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) {}

  ngOnInit() {
    this.fetchAllPurchaseReport();
  }

  fetchAllPurchaseReport(page: number = 1, limit: number = this.itemsPerPage) {
    this.isLoading = true;

    // Reset to page 1 when searching or filtering
    if (this.search || this.filterType) {
      page = 1;
    }

    this.procumentService
      .getRecievedOrdersQuantity(page, limit, this.filterType, this.date, this.search)
      .subscribe(
        (response) => {
          this.purchaseReport = response.items.map((item: any) => ({
            ...item,
            orderDateFormatted: this.formatDate(item.OrderDate),
            scheduleDateFormatted: this.formatDate(item.scheduleDate),
            toCollectionCenterFormatted: this.formatDate(item.toCollectionCenter),
            toDispatchCenterFormatted: this.formatDate(item.toDispatchCenter),
          }));
          this.totalItems = response.total;
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching received orders:', error);
          this.isLoading = false;
          Swal.fire('Error', 'Failed to load orders data', 'error');
        }
      );
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new DatePipe('en-US').transform(date, 'd MMM, yyyy') || '';
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllPurchaseReport(this.page, this.itemsPerPage);
  }

  clearSearch(): void {
    this.search = '';
    this.page = 1; // Reset to first page when clearing search
    this.fetchAllPurchaseReport();
  }

  clearFilter(): void {
    this.filterType = '';
    this.date = '';
    this.selectedFilterType = null;
    this.filterApplied = false;
    this.page = 1; // Reset to first page when clearing filter
    this.fetchAllPurchaseReport();
  }

  applysearch() {
    if (!this.search || this.search.trim() === '') {
      Swal.fire('Info', 'Please enter a search term', 'info');
      return;
    }

    this.search = this.search.trim();
    this.page = 1; // Reset to first page when searching
    this.fetchAllPurchaseReport();
  }

  back(): void {
    this.router.navigate(['/procurement']);
  }

  // Popup filter methods
  toggleFilterPopup() {
    this.showFilterPopup = !this.showFilterPopup;
    if (this.showFilterPopup) {
      // If we already have a filter applied, pre-select it
      if (this.filterType && this.selectedFilterType === null) {
        this.selectedFilterType = this.filterTypes.find(
          filter => filter.value === this.filterType
        ) || null;
      }
      
      // Convert string date to Date object for p-calendar
      this.dateTemp = this.date ? new Date(this.date) : null;
    }
  }

  applyFilter() {
    if (!this.dateTemp || !this.selectedFilterType) {
      Swal.fire('Error', 'Please select both filter type and date', 'error');
      return;
    }

    this.filterType = this.selectedFilterType.value;
    this.date = formatDate(this.dateTemp, 'yyyy-MM-dd', 'en-US');
    this.page = 1; // Reset to first page when applying filter

    this.showFilterPopup = false;
    this.filterApplied = true;
    this.fetchAllPurchaseReport();
  }

  cancelFilter() {
    this.showFilterPopup = false;
    this.dateTemp = null;
  }

  getDisplayFilterType(): string {
    if (this.selectedFilterType) {
      return this.selectedFilterType.display;
    }
    
    // Fallback for existing filterType value
    const foundFilter = this.filterTypes.find(filter => filter.value === this.filterType);
    return foundFilter ? foundFilter.display : this.filterType;
  }

  downloadTemplate1() {
    this.isDownloading = true;

    let queryParams = [];

    if (this.filterType) {
      queryParams.push(`filterType=${this.filterType}`);
    }

    if (this.date) {
      queryParams.push(`date=${this.date}`);
    }

    if (this.search) {
      queryParams.push(`search=${encodeURIComponent(this.search)}`);
    }

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

    const apiUrl = `${environment.API_URL}procument/download-order-quantity-report${queryString}`;

    fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.tokenService.getToken()}`
      }
    })
      .then((response) => {
        if (response.ok) {
          return response.blob();
        } else {
          throw new Error('Failed to download the file');
        }
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        let filename = 'Procument_Items_Report';
        if (this.filterType) {
          filename += `_${this.filterType}`;
        }
        if (this.date) {
          filename += `_${this.date}`;
        }
        if (this.search) {
          filename += `_search_${this.search.substring(0, 10)}`;
        }

        filename += '.xlsx';

        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);

        Swal.fire({
          icon: 'success',
          title: 'Downloaded',
          text: 'Please check your downloads folder',
        });
        this.isDownloading = false;
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Download Failed',
          text: error.message,
        });
        this.isDownloading = false;
      });
  }
}