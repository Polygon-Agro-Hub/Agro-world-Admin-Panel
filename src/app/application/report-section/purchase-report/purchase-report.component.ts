import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
import { HttpClientModule } from '@angular/common/http';
import { CollectionService } from '../../../services/collection.service';
import { Router } from '@angular/router';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import Swal from 'sweetalert2';
import { environment } from '../../../environment/environment';
import { CalendarModule } from 'primeng/calendar';

interface PurchaseReport {
  id: number;
  grnNumber: string;
  regCode: string;
  centerName: string;
  amount: string;
  firstName: string;
  lastName: string;
  nic: string;
  userId: number;
  collQr: string;
  createdAt: string;
  createdAtFormatted: string | null;
}

@Component({
  selector: 'app-purchase-report',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    NgxPaginationModule,
    DropdownModule,
    FormsModule,
    LoadingSpinnerComponent,
    CalendarModule,
  ],
  templateUrl: './purchase-report.component.html',
  styleUrl: './purchase-report.component.css',
  providers: [DatePipe],
})
export class PurchaseReportComponent {
  isLoading = false;
  purchaseReport: PurchaseReport[] = [];
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  grandTotal: number = 0;
  isDownloading = false;
  fromDate: Date | null = null;
  toDate: Date | null = null;
  maxDate: Date;

  centers!: Centers[];
  months: Months[] = [
    { id: 1, monthName: 'January' },
    { id: 2, monthName: 'February' },
    { id: 3, monthName: 'March' },
    { id: 4, monthName: 'April' },
    { id: 5, monthName: 'May' },
    { id: 6, monthName: 'June' },
    { id: 7, monthName: 'July' },
    { id: 8, monthName: 'August' },
    { id: 9, monthName: 'September' },
    { id: 10, monthName: 'October' },
    { id: 11, monthName: 'November' },
    { id: 12, monthName: 'December' },
  ];
  selectedCenter: Centers | null = null;
  selectedMonth: Months | null = null;
  createdDate: string = new Date().toISOString().split('T')[0];
  search: string = '';
  dateFilter: any;

  constructor(
    private collectionoOfficer: CollectionService,
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService,
    private datePipe: DatePipe
  ) {
    // Initialize maxDate to today
    this.maxDate = new Date();
    this.maxDate.setHours(23, 59, 59, 999);
  }

  ngOnInit() {
    this.getAllCenters();
    // Refresh maxDate on init to ensure it's current
    this.maxDate = new Date();
    this.maxDate.setHours(23, 59, 59, 999);
  }

  get hasData(): boolean {
    return this.purchaseReport && this.purchaseReport.length > 0;
  }

  preventLeadingSpace(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart;
    
    // Prevent space if:
    // 1. Search is completely empty, OR
    // 2. Cursor is at position 0 and pressing space
    if (event.key === ' ' && (this.search.length === 0 || cursorPosition === 0)) {
      event.preventDefault();
    }
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Remove any leading spaces that might have been pasted
    this.search = input.value.replace(/^\s+/, '');
  }

  fetchAllPurchaseReport(page: number = 1, limit: number = this.itemsPerPage) {
    // If either fromDate or toDate is null/cleared, clear the data
    if (!this.fromDate || !this.toDate) {
      this.clearData();
      return;
    }

    this.isLoading = true;
    const centerId = this.selectedCenter?.id || '';
    
    const formattedFromDate = this.fromDate 
      ? this.datePipe.transform(this.fromDate, 'yyyy-MM-dd') 
      : '';
    const formattedToDate = this.toDate 
      ? this.datePipe.transform(this.toDate, 'yyyy-MM-dd') 
      : '';

    this.collectionoOfficer
      .fetchAllPurchaseReport(
        page,
        limit,
        centerId,
        formattedFromDate,
        formattedToDate,
        this.search
      )
      .subscribe(
        (response) => {
          this.purchaseReport = response.items;
          this.totalItems = response.total;
          this.grandTotal = response.grandTotal;
          this.purchaseReport.forEach((head) => {
            head.createdAtFormatted = this.datePipe.transform(
              head.createdAt,
              "yyyy/MM/dd 'at' hh.mm a"
            );
          });
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching report:', error);
          if (error.status === 401) {
            // Handle unauthorized access
          }
          this.isLoading = false;
        }
      );
  }

  // New method to clear data when dates are cleared
  clearData(): void {
    this.purchaseReport = [];
    this.totalItems = 0;
    this.grandTotal = 0;
    this.page = 1;
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllPurchaseReport(this.page, this.itemsPerPage);
  }

  back(): void {
    this.router.navigate(['/reports']);
  }

  applyFiltersCrop() {
    this.fetchAllPurchaseReport();
  }

  applyFiltersMonth() {
    this.createdDate = '';
    this.fetchAllPurchaseReport();
  }

  applysearch() {
    // Trim the search string before applying
    this.search = this.search.trim();
    this.selectedMonth = null;
    this.createdDate = '';
    this.fetchAllPurchaseReport();
  }

  clearSearch(): void {
    this.search = '';
    this.createdDate = new Date().toISOString().split('T')[0];
    this.fetchAllPurchaseReport();
  }

  onDateChange(): void {
    this.selectedMonth = null;
    this.fetchAllPurchaseReport();
  }

  // New method to handle when fromDate is cleared
  onFromDateClear(): void {
    this.fromDate = null;
    this.toDate = null; // Also clear toDate when fromDate is cleared
    this.clearData();
  }

  // New method to handle when toDate is cleared
  onToDateClear(): void {
    this.toDate = null;
    this.clearData();
  }

  getAllCenters() {
    this.collectionoOfficer.getAllCenters().subscribe(
      (res) => {
        this.centers = res;
      },
      (error) => {
        Swal.fire('Error!', 'There was an error fetching centers.', 'error');
      }
    );
  }

  downloadTemplate1() {
    this.isDownloading = true;

    let queryParams = [];

    if (this.selectedCenter) {
      queryParams.push(`centerId=${this.selectedCenter.id}`);
    }

    if (this.fromDate) {
      const formattedFromDate = this.datePipe.transform(this.fromDate, 'yyyy-MM-dd');
      queryParams.push(`startDate=${formattedFromDate}`);
    }

    if (this.toDate) {
      const formattedToDate = this.datePipe.transform(this.toDate, 'yyyy-MM-dd');
      queryParams.push(`endDate=${formattedToDate}`);
    }

    if (this.search) {
      queryParams.push(`search=${this.search}`);
    }

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

    const apiUrl = `${environment.API_URL}auth/download-purchase-report${queryString}`;

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

        // Generate filename according to requirements
        const filename = this.generateFileName();
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

  // Helper method to generate the filename
  private generateFileName(): string {
    const now = new Date();
    const generatedDate = this.datePipe.transform(now, 'MM/dd');
    const generatedTime = this.datePipe.transform(now, 'hh.mm a');
    
    let fileName = 'Purchase Report';
    
    // Add center code if selected
    if (this.selectedCenter) {
      fileName += ` of ${this.selectedCenter.regCode}`;
    }
    
    // Add date range
    if (this.fromDate && this.toDate) {
      const fromDateFormatted = this.formatDateForFilename(this.fromDate);
      const toDateFormatted = this.formatDateForFilename(this.toDate);
      fileName += ` on ${fromDateFormatted} to ${toDateFormatted}`;
    } else if (this.fromDate) {
      const fromDateFormatted = this.formatDateForFilename(this.fromDate);
      fileName += ` on ${fromDateFormatted}`;
    }
    
    // Add generated timestamp
    fileName += ` Generated at ${generatedDate} ${generatedTime}`;
    
    return fileName + '.xlsx';
  }

  // Helper method to format date as "04th August"
  private formatDateForFilename(date: Date): string {
    const day = date.getDate();
    const month = this.datePipe.transform(date, 'MMMM');
    
    // Add ordinal suffix to day
    const getOrdinalSuffix = (day: number): string => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    
    return `${day}${getOrdinalSuffix(day)} ${month}`;
  }

  navigateToFamerListReport(id: number, userId: number, QRcode: string) {
    this.router.navigate(['/reports/farmer-list-report'], {
      queryParams: { id, userId, QRcode },
    });
  }

  onFromDateSelect() {
    // Reset toDate if it's before the newly selected fromDate
    if (this.fromDate && this.toDate && this.toDate < this.fromDate) {
      this.toDate = null;
    }
    
    // Additional validation to ensure toDate doesn't exceed maxDate
    if (this.toDate && this.toDate > this.maxDate) {
      this.toDate = this.maxDate;
    }
    
    console.log('From date selected:', this.fromDate);
  }

  onToDateSelect() {
    // Validate that toDate is not in the future
    this.validateToDate();
  }

  validateToDate(): void {
    if (this.toDate && this.toDate > this.maxDate) {
      this.toDate = this.maxDate;
      Swal.fire({
        icon: 'warning',
        title: 'Date Adjusted',
        text: 'The "To" date cannot be in the future. It has been set to today.',
        timer: 2000,
        showConfirmButton: false
      });
    }
    
    // Also validate that toDate is not before fromDate
    if (this.fromDate && this.toDate && this.toDate < this.fromDate) {
      this.toDate = this.fromDate;
      Swal.fire({
        icon: 'warning',
        title: 'Date Adjusted',
        text: 'The "To" date cannot be before the "From" date. It has been adjusted.',
        timer: 2000,
        showConfirmButton: false
      });
    }
  }

  // Utility method to get today's date without time component
  getTodayDate(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  // Utility method to check if a date is in the future
  isFutureDate(date: Date): boolean {
    const today = this.getTodayDate();
    return date > today;
  }
}

class Centers {
  id!: string;
  centerName!: string;
  regCode!: string;
}

interface Months {
  id: number;
  monthName: string;
}