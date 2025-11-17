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
  fromDate: string = '';
  toDate: string = '';
  maxDate: string = '';

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
  ) {}

  ngOnInit() {
    this.getAllCenters();
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
    
  }

  get hasData(): boolean {
  return this.purchaseReport && this.purchaseReport.length > 0;
}

preventLeadingSpace(event: KeyboardEvent): void {
  if (event.key === ' ' && this.search.length === 0) {
    event.preventDefault();
  }
}

  // fetchAllPurchaseReport(page: number = 1, limit: number = this.itemsPerPage) {
  //   this.isLoading = true;

  //   const centerId = this.selectedCenter?.id || '';
  //   const monthNumber = this.selectedMonth?.id || '';

  //   if (this.createdDate === '' && this.selectedMonth == null) {
  //     this.createdDate = new Date().toISOString().split('T')[0];
  //   }

  //   this.collectionoOfficer
  //     .fetchAllPurchaseReport(
  //       page,
  //       limit,
  //       centerId,
  //       this.fromDate,
  //       this.toDate,
  //       this.search
  //     )
  //     .subscribe(
  //       (response) => {
  //         this.purchaseReport = response.items;
  //         this.totalItems = response.total;
  //         this.grandTotal = response.grandTotal;
  //         this.purchaseReport.forEach((head) => {
  //           head.createdAtFormatted = this.datePipe.transform(
  //             head.createdAt,
  //             "yyyy/MM/dd 'at' hh.mm a"
  //           );
  //         });
  //         this.isLoading = false;
  //       },
  //       (error) => {
  //         if (error.status === 401) {
  //         }
  //         this.isLoading = false;
  //       }
  //     );
  // }

  fetchAllPurchaseReport(page: number = 1, limit: number = this.itemsPerPage) {
  this.isLoading = true;
  const centerId = this.selectedCenter?.id || '';
  const formattedFromDate = this.fromDate ? this.datePipe.transform(this.fromDate, 'yyyy-MM-dd') : '';
  const formattedToDate = this.toDate ? this.datePipe.transform(this.toDate, 'yyyy-MM-dd') : '';

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
          // Handle unauthorized
        }
        this.isLoading = false;
      }
    );
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

  downloadTemplate1() {
    this.isDownloading = true;

    let queryParams = [];

    if (this.selectedCenter) {
      queryParams.push(`centerId=${this.selectedCenter.id}`);
    }

    if (this.fromDate) {
      queryParams.push(`startDate=${this.fromDate}`);
    }

    if (this.toDate) {
      queryParams.push(`endDate=${this.toDate}`);
    }

    if (this.search) {
      queryParams.push(`search=${this.search}`);
    }

    const queryString =
      queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

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

        let filename = 'Purchase_Report';
        if (this.fromDate) {
          filename += `_${this.fromDate}`;
        }
        if (this.toDate) {
          filename += `_${this.toDate}`;
        }
        if (this.selectedCenter) {
          filename += `_${this.selectedCenter.regCode}`;
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

  navigateToFamerListReport(id: number, userId: number, QRcode: string) {
    this.router.navigate(['/reports/farmer-list-report'], {
      queryParams: { id, userId, QRcode },
    });
  }

  onFromDateSelect() {
  // This method will be called when a from date is selected
  // The template will automatically enable/disable based on the fromDate value
  console.log('From date selected:', this.fromDate);
  
  // Optional: If you want to automatically clear the toDate when fromDate is cleared
  if (!this.fromDate) {
    this.toDate = '';
  }
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
