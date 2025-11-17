import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CollectionService } from '../../../services/collection.service';
import { Router } from '@angular/router';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import Swal from 'sweetalert2';
import { environment } from '../../../environment/environment';
import { CalendarModule } from 'primeng/calendar';

interface PurchaseReport {
  id: number;
  regCode: string;
  centerName: string;
  cropGroupName: string;
  varietyName: string;
  gradeAquan: number;
  gradeBquan: number;
  gradeCquan: number;
  amount: number;
  createdAt: string;
  createdAtFormatted: string | null;
}

@Component({
  selector: 'app-collection-report',
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
  templateUrl: './collection-report.component.html',
  styleUrl: './collection-report.component.css',
  providers: [DatePipe],
})
export class CollectionReportComponent {
  isLoading = false;
  fromDate: Date | null = null;
  toDate: Date | null = null;
  maxDate: Date = new Date();
  minToDate: Date | null = null;
  itemsPerPage: number = 10;
  centers!: Centers[];
  selectedCenter: Centers | null = null;
  purchaseReport: PurchaseReport[] = [];
  totalItems: number = 0;
  search: string = '';
  page: number = 1;
  isDownloading = false;

  constructor(
    private collectionoOfficer: CollectionService,
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.getAllCenters();
    this.maxDate = new Date(); // Today's date
  }

  fetchAllCollectionReport(page: number = 1, limit: number = this.itemsPerPage) {
    this.isLoading = true;
    const centerId = this.selectedCenter?.id || '';
    
    // Convert Date objects to formatted strings
    const formattedFromDate = this.fromDate ? this.datePipe.transform(this.fromDate, 'yyyy-MM-dd') : '';
    const formattedToDate = this.toDate ? this.datePipe.transform(this.toDate, 'yyyy-MM-dd') : '';

    this.collectionoOfficer
      .fetchAllCollectionReport(
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
          this.isLoading = false;
        }
      );
  }

  getAllCenters() {
    this.collectionoOfficer.getAllCenters().subscribe(
      (res) => {
        this.centers = res;
      },
      (error) => {
        Swal.fire('Error!', 'There was an error fetching crops.', 'error');
      }
    );
  }

  preventLeadingSpace(event: KeyboardEvent): void {
    if (event.key === ' ') {
      const input = event.target as HTMLInputElement;
      const cursorPosition = input.selectionStart;
      
      // Prevent space if it's at the beginning or if there's a space at cursor position
      if (cursorPosition === 0 || this.search.trim() === '') {
        event.preventDefault();
      }
    }
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Trim leading and trailing spaces
    this.search = input.value.trim();
  }

  get hasData(): boolean {
    return this.purchaseReport && this.purchaseReport.length > 0;
  }

  applyFiltersCrop() {
    this.fetchAllCollectionReport();
  }

  back(): void {
    this.router.navigate(['/reports']);
  }

  applysearch() {
    // Trim the search string before applying
    this.search = this.search.trim();
    this.fetchAllCollectionReport();
  }

  clearSearch(): void {
    this.search = '';
    this.fetchAllCollectionReport();
  }

  downloadTemplate1() {
  this.isDownloading = true;

  let queryParams = [];

  if (this.selectedCenter) {
    queryParams.push(`centerId=${this.selectedCenter.id}`);
  }

  // Convert Date objects to formatted strings for download
  const formattedFromDate = this.fromDate ? this.datePipe.transform(this.fromDate, 'yyyy-MM-dd') : '';
  const formattedToDate = this.toDate ? this.datePipe.transform(this.toDate, 'yyyy-MM-dd') : '';

  if (formattedFromDate) {
    queryParams.push(`startDate=${formattedFromDate}`);
  }

  if (formattedToDate) {
    queryParams.push(`endDate=${formattedToDate}`);
  }

  if (this.search) {
    queryParams.push(`search=${this.search}`);
  }

  const queryString =
    queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  const apiUrl = `${environment.API_URL}auth/download-collection-report${queryString}`;

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
      let filename = 'Collection Report';
      
      // Add centre code if selected
      if (this.selectedCenter) {
        filename += ` of ${this.selectedCenter.regCode}`;
      }
      
      // Add date range if both dates are selected
      if (formattedFromDate && formattedToDate) {
        const fromDateObj = new Date(this.fromDate!);
        const toDateObj = new Date(this.toDate!);
        
        const fromDateFormatted = this.formatDateForFilename(fromDateObj);
        const toDateFormatted = this.formatDateForFilename(toDateObj);
        
        filename += ` on ${fromDateFormatted} to ${toDateFormatted}`;
      } else if (formattedFromDate) {
        // If only from date is selected
        const fromDateObj = new Date(this.fromDate!);
        const fromDateFormatted = this.formatDateForFilename(fromDateObj);
        filename += ` on ${fromDateFormatted}`;
      }
      
      // Add generation timestamp
      const now = new Date();
      const generatedDate = this.formatDateForFilename(now, true);
      const generatedTime = this.datePipe.transform(now, 'hh:mm a') || 'Unknown Time';
      
      filename += ` Generated at ${generatedDate} ${generatedTime}`;
      
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

// Helper method to format dates for filename (04th August format)
private formatDateForFilename(date: Date, forGeneration: boolean = false): string {
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();
  
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

  const dayWithSuffix = `${day}${getOrdinalSuffix(day)}`;
  
  if (forGeneration) {
    // For generation timestamp, use MM/DD format (08/04)
    const monthNum = date.getMonth() + 1;
    const formattedMonth = monthNum.toString().padStart(2, '0');
    const formattedDay = date.getDate().toString().padStart(2, '0');
    return `${formattedMonth}/${formattedDay}`;
  } else {
    // For date ranges, use "04th August" format
    return `${dayWithSuffix} ${month}${year !== new Date().getFullYear() ? ' ' + year : ''}`;
  }
}

  // Method to handle from date selection
  onFromDateChange() {
    if (this.fromDate) {
      // Set minimum date for toDate as today (to disable previous dates)
      // This ensures only today and future dates can be selected in toDate
      this.minToDate = new Date();
      
      // If toDate exists and is before today, reset toDate
      if (this.toDate && this.toDate < this.minToDate) {
        this.toDate = null;
      }
    } else {
      // If fromDate is cleared, also clear toDate and reset minToDate
      this.toDate = null;
      this.minToDate = null;
    }
  }

  // Getter to check if from date is selected
  get isFromDateSelected(): boolean {
    return !!this.fromDate;
  }
}

class Centers {
  id!: string;
  centerName!: string;
  regCode!: string;
}