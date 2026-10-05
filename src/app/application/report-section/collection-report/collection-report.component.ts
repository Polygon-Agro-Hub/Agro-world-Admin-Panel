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
    private datePipe: DatePipe,
  ) {}

  ngOnInit() {
    this.getAllCenters();
    this.maxDate = new Date(); // Today's date
  }

  fetchAllCollectionReport(
    page: number = 1,
    limit: number = this.itemsPerPage,
  ) {
    // Both dates are required before fetching/displaying data
    if (!this.fromDate || !this.toDate) {
      this.clearData();
      return;
    }

    this.isLoading = true;
    this.page = page;
    const centerId = this.selectedCenter?.id || '';

    // Convert Date objects to formatted strings
    const formattedFromDate =
      this.datePipe.transform(this.fromDate, 'yyyy-MM-dd') || '';
    const formattedToDate =
      this.datePipe.transform(this.toDate, 'yyyy-MM-dd') || '';

    this.collectionoOfficer
      .fetchAllCollectionReport(
        page,
        limit,
        centerId,
        formattedFromDate,
        formattedToDate,
        this.search,
      )
      .subscribe(
        (response) => {
          this.purchaseReport = response.items;
          this.totalItems = response.total;
          this.purchaseReport.forEach((head) => {
            head.createdAtFormatted = this.datePipe.transform(
              head.createdAt,
              "yyyy/MM/dd 'at' hh.mm a",
            );
          });
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching report:', error);
          this.isLoading = false;
        },
      );
  }

  getAllCenters() {
    this.collectionoOfficer.getAllCenters().subscribe(
      (res) => {
        this.centers = res.map((center: Centers) => ({
          ...center,
          displayName: `${center.regCode} - ${center.centerName.trim()}`,
        }));
      },
      (error) => {
        Swal.fire('Error!', 'There was an error fetching centers.', 'error');
      },
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

  // Both dates must be selected
  get isDateRangeSelected(): boolean {
    return !!this.fromDate && !!this.toDate;
  }

  // Data is only shown when both dates are selected
  get hasData(): boolean {
    return (
      this.isDateRangeSelected &&
      !!this.purchaseReport &&
      this.purchaseReport.length > 0
    );
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
  // Both dates are required to download
  if (!this.fromDate || !this.toDate) {
    return;
  }

  this.isDownloading = true;

  let queryParams: string[] = [];

  if (this.selectedCenter) {
    queryParams.push(`centerId=${this.selectedCenter.id}`);
  }

  // Convert Date objects to formatted strings for download
  const formattedFromDate = this.datePipe.transform(
    this.fromDate,
    'yyyy-MM-dd',
  );
  const formattedToDate = this.datePipe.transform(this.toDate, 'yyyy-MM-dd');

  if (formattedFromDate) {
    queryParams.push(`startDate=${formattedFromDate}`);
  }

  if (formattedToDate) {
    queryParams.push(`endDate=${formattedToDate}`);
  }

  if (this.search) {
    queryParams.push(`search=${encodeURIComponent(this.search)}`);
  }

  const queryString =
    queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  const apiUrl = `${environment.API_URL}auth/download-collection-report${queryString}`;

  // Capture the selected center's code now, so the filename stays correct
  // even if the user changes the filter while the download is in progress
  const centerCode = this.selectedCenter?.regCode?.trim() || '';

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

      // Generate filename
      let filename = '';

      // Prefix with collection centre code when a center is selected
      if (centerCode) {
        filename += `${centerCode} `;
      }

      filename += 'Collection Report';

      const fromDateFormatted = this.formatDateForFilename(
        new Date(this.fromDate!),
      );
      const toDateFormatted = this.formatDateForFilename(
        new Date(this.toDate!),
      );
      filename += ` from ${fromDateFormatted} to ${toDateFormatted}`;

      // Add generation timestamp: YYYY-MM-DD HH.MM AM/PM
      const now = new Date();
      const generatedDate = this.formatDateForGeneration(now);
      const generatedTime = this.formatTimeForFilename(now);

      filename += ` Generated at ${generatedDate} ${generatedTime}`;

      filename += '.xlsx';

      // Remove characters that are invalid in file names
      a.download = filename.replace(/[\\/:*?"<>|]/g, '-');
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

  // Format date for filename (returns format like "10th February")
  private formatDateForFilename(date: Date): string {
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });

    // Add ordinal suffix to day
    const getOrdinalSuffix = (day: number): string => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    };

    const dayWithSuffix = `${day}${getOrdinalSuffix(day)}`;

    // Return format: "10th February"
    return `${dayWithSuffix} ${month}`;
  }

  // Format date for generation timestamp (YYYY-MM-DD format)
  private formatDateForGeneration(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // Format time for filename (HH.MM AM/PM format)
  private formatTimeForFilename(date: Date): string {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    return `${hours.toString().padStart(2, '0')}.${minutes} ${ampm}`;
  }

  // Method to handle from date selection
  onFromDateChange() {
  // Always reset To date and hide old data when From date changes
  this.toDate = null;
  this.minToDate = this.fromDate;
  this.clearData();
}

  // Getter to check if from date is selected
  get isFromDateSelected(): boolean {
    return !!this.fromDate;
  }

  // Clear data when either date is cleared
  clearData(): void {
    this.purchaseReport = [];
    this.totalItems = 0;
    this.page = 1;
  }

  // Handle when fromDate is cleared
  onFromDateClear(): void {
    this.fromDate = null;
    this.toDate = null; // toDate depends on fromDate
    this.minToDate = null;
    this.clearData();
  }

  // Handle when toDate is cleared
  onToDateClear(): void {
    this.toDate = null;
    this.clearData();
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllCollectionReport(this.page, this.itemsPerPage);
  }

  onFromDateModelChange(value: Date | null): void {
  this.toDate = null;
  this.minToDate = value;
  this.clearData();
}

onToDateModelChange(value: Date | null): void {
  if (!value) {
    this.clearData();
  }
}
}

class Centers {
  id!: string;
  centerName!: string;
  regCode!: string;
  displayName?: string;
}
