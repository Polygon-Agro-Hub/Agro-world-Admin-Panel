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
import * as XLSX from 'xlsx';

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
  ) { }

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

  // downloadTemplate1() {
  //   this.isDownloading = true;

  //   let queryParams = [];

  //   if (this.filterType) {
  //     queryParams.push(`filterType=${this.filterType}`);
  //   }

  //   if (this.date) {
  //     queryParams.push(`date=${this.date}`);
  //   }

  //   if (this.search) {
  //     queryParams.push(`search=${encodeURIComponent(this.search)}`);
  //   }

  //   const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

  //   const apiUrl = `${environment.API_URL}procument/download-order-quantity-report${queryString}`;

  //   fetch(apiUrl, {
  //     method: 'GET',
  //     headers: {
  //       'Authorization': `Bearer ${this.tokenService.getToken()}`
  //     }
  //   })
  //     .then((response) => {
  //       if (response.ok) {
  //         return response.blob();
  //       } else {
  //         throw new Error('Failed to download the file');
  //       }
  //     })
  //     .then((blob) => {
  //       const url = window.URL.createObjectURL(blob);
  //       const a = document.createElement('a');
  //       a.href = url;

  //       let filename = 'Procument_Items_Report';
  //       if (this.filterType) {
  //         filename += `_${this.filterType}`;
  //       }
  //       if (this.date) {
  //         filename += `_${this.date}`;
  //       }
  //       if (this.search) {
  //         filename += `_search_${this.search.substring(0, 10)}`;
  //       }

  //       filename += '.xlsx';

  //       a.download = filename;
  //       a.click();
  //       window.URL.revokeObjectURL(url);

  //       Swal.fire({
  //         icon: 'success',
  //         title: 'Downloaded',
  //         text: 'Please check your downloads folder',
  //       });
  //       this.isDownloading = false;
  //     })
  //     .catch((error) => {
  //       Swal.fire({
  //         icon: 'error',
  //         title: 'Download Failed',
  //         text: error.message,
  //       });
  //       this.isDownloading = false;
  //     });
  // }

  downloadTemplate1() {
    this.isDownloading = true;

    // Get all data without pagination for aggregation
    this.procumentService
      .getRecievedOrdersQuantity(1, 10000, this.filterType, this.date, this.search)
      .subscribe(
        (response) => {
          // Aggregate the data
          const aggregatedData = this.aggregatePurchaseData(response.items);

          // Now proceed with download using the aggregated data
          this.downloadAggregatedReport(aggregatedData);
        },
        (error) => {
          console.error('Error fetching data for download:', error);
          this.isDownloading = false;
          Swal.fire('Error', 'Failed to prepare data for download', 'error');
        }
      );
  }

  private aggregatePurchaseData(items: any[]): any[] {
    const aggregationMap = new Map();

    items.forEach(item => {
      // Create a unique key based on crop, variety, order date, and schedule date
      const key = `${item.cropNameEnglish}_${item.varietyNameEnglish}_${item.OrderDate}_${item.scheduleDate}`;

      if (aggregationMap.has(key)) {
        // If the key exists, add the quantity to the existing entry
        const existingItem = aggregationMap.get(key);
        existingItem.quantity += item.quantity;
      } else {
        // If the key doesn't exist, create a new entry
        aggregationMap.set(key, {
          ...item,
          // Make sure to clone the object to avoid reference issues
          quantity: item.quantity
        });
      }
    });

    // Convert the map back to an array
    return Array.from(aggregationMap.values());
  }

  private downloadAggregatedReport(aggregatedData: any[]) {
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

    // Sort the aggregated data by Crop (A-Z) and then by Variety (A-Z)
    const sortedData = aggregatedData.sort((a, b) => {
      // First sort by crop name
      const cropComparison = a.cropNameEnglish.localeCompare(b.cropNameEnglish);
      if (cropComparison !== 0) {
        return cropComparison;
      }

      // If crops are the same, sort by variety name
      return a.varietyNameEnglish.localeCompare(b.varietyNameEnglish);
    });

    // Create a Blob from the sorted aggregated data
    const worksheet = XLSX.utils.json_to_sheet(sortedData.map(item => ({
      'Crop': item.cropNameEnglish,
      'Variety': item.varietyNameEnglish,
      'Quantity (kg)': item.quantity,
      'Ordered On': this.formatDateForExcel(item.createdAt),
      'Scheduled Date': this.formatDateForExcel(item.sheduleDate),
      'To Collection Centre': this.formatDateForExcel(item.toCollectionCentre),
      'To Dispatch Centre': this.formatDateForExcel(item.toDispatchCenter)
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Procurement Report');

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'Procument_Items_Report');
  }

  private formatDateForExcel(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new DatePipe('en-US').transform(date, 'yyyy-MM-dd') || '';
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    let finalFileName = fileName;
    if (this.filterType) {
      finalFileName += `_${this.filterType}`;
    }
    if (this.date) {
      finalFileName += `_${this.date}`;
    }
    if (this.search) {
      finalFileName += `_search_${this.search.substring(0, 10)}`;
    }
    finalFileName += '.xlsx';

    // For browsers that support the download attribute
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(data);
      link.setAttribute('href', url);
      link.setAttribute('download', finalFileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Swal.fire({
        icon: 'success',
        title: 'Downloaded',
        text: 'Please check your downloads folder',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        }
      });
    } else {
      // Fallback for older browsers
      window.open(URL.createObjectURL(data));
    }

    this.isDownloading = false;
  }
}