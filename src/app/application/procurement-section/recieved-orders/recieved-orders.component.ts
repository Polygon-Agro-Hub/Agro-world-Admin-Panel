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
  date: string = ''; // will hold formatted date string like 'yyyy-MM-dd'
  isDownloading = false;
filterApplied = false;
  // For popup filter UI
  showFilterPopup = false;
  filterTypeTemp = '';
  dateTemp: Date | null = null; // <-- Use Date object here

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
          console.error('Error fetching ongoing cultivations:', error);
          this.isLoading = false;
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
    this.fetchAllPurchaseReport();
  }

  clearFilter(): void {
    this.filterType = '';
    this.date = '';
    this.fetchAllPurchaseReport();
  }

  applysearch() {
    if (!this.search || this.search.trimStart() === '') {
      console.warn('Search is empty or starts only with space(s)');
      return;
    }

    this.search = this.search.trimStart(); // Remove leading spaces
    this.fetchAllPurchaseReport();
  }

  back(): void {
    this.router.navigate(['/procurement']);
  }

  // Popup filter methods
  toggleFilterPopup() {
    this.showFilterPopup = !this.showFilterPopup;
    if (this.showFilterPopup) {
      this.filterTypeTemp = this.filterType;

      // Convert string date to Date object for p-calendar
      this.dateTemp = this.date ? new Date(this.date) : null;
    }
  }

applyFilter() {
  if (!this.dateTemp) {
    Swal.fire('Error', 'Please select a date', 'error');
    return;
  }

  // You no longer need filterTypeTemp
  this.filterType = 'Schedule Date';

  // Convert Date object to string in yyyy-MM-dd format for API
  this.date = formatDate(this.dateTemp, 'yyyy-MM-dd', 'en-US');

  this.showFilterPopup = false;
  this.filterApplied = true; // Add this to hide the Filter By button
  this.fetchAllPurchaseReport();
}

 cancelFilter() {
  this.showFilterPopup = false;
  this.filterApplied = false;
  this.dateTemp = null; // Optional: clear date input
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
      queryParams.push(`search=${this.search}`);
    }

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

    const apiUrl = `${environment.API_URL}procument/download-order-quantity-report${queryString}`;

    fetch(apiUrl, {
      method: 'GET',
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

