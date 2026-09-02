import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Calendar, CalendarModule } from 'primeng/calendar';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';

@Component({
  selector: 'app-center-collection-expence',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    LoadingSpinnerComponent,
    CalendarModule,
  ],
  templateUrl: './center-collection-expence.component.html',
  styleUrl: './center-collection-expence.component.css',
})
export class CenterCollectionExpenceComponent implements OnInit {
  @ViewChild('toDateCalendar') toDateCalendar!: Calendar;
  farmerPaymentsArr!: FarmerPayments[];
  centerArr: Center[] = [];
  totalPaymentsAmount: number = 0;

  centerId!: number;

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  hasData: boolean = true;

  searchText: string = '';

  fromDate: Date | null = null;
  toDate: Date | null = null;

  isPopupVisible: boolean = false;
  logingRole: string | null = null;
  isLoading: boolean = false;
  isDateFilterSet: boolean = false;
  isDownloading = false;

  constructor(
    private router: Router,
    private TargetSrv: CollectionCenterService,
    private route: ActivatedRoute,
    private location: Location,
    public tokenService: TokenService,
    public permissionService: PermissionService,
  ) {}

  ngOnInit(): void {
    this.centerId = this.route.snapshot.params['id'];
  }

  navigate(path: string) {
    this.router.navigate([`${path}`]);
  }

  fetchFilteredPayments(page: number = 1, limit: number = this.itemsPerPage) {
    this.isLoading = true;
    const fromDateStr = this.formatDateForAPI(this.fromDate);
    const toDateStr = this.formatDateForAPI(this.toDate);

    // Step 1: fetch the current page for the table
    this.TargetSrv.getAllCenterPayments(
      page,
      limit,
      fromDateStr,
      toDateStr,
      this.centerId,
      this.searchText,
    ).subscribe(
      (res) => {
        this.farmerPaymentsArr = res.items;
        this.totalItems = res.total;
        this.hasData = res.items.length > 0;
        this.isLoading = false;

        // Step 2: now that we know totalItems, fetch ALL records for the total amount
        // Skip the second call if there are no records at all
        if (this.totalItems === 0) {
          this.totalPaymentsAmount = 0;
          return;
        }

        this.TargetSrv.getAllCenterPayments(
          1,
          this.totalItems,
          fromDateStr,
          toDateStr,
          this.centerId,
          this.searchText,
        ).subscribe((allRes) => {
          this.totalPaymentsAmount = this.formatNumberToTwoDecimals(
            allRes.items.reduce((sum: number, p: FarmerPayments) => {
              return (
                sum + (isNaN(Number(p.totalAmount)) ? 0 : Number(p.totalAmount))
              );
            }, 0),
          );
        });
      },
      (error) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch payments data',
          customClass: {
            popup: 'bg-white dark:bg-[#363636] text-gray-800 dark:text-white',
            title: 'dark:text-white',
          },
        });
      },
    );
  }

  private formatNumberToTwoDecimals(value: any): number {
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    return parseFloat(num.toFixed(2));
  }

  onSearch() {
    if (this.searchText) {
      this.searchText = this.searchText.trimStart();
    }
    this.fetchFilteredPayments();
  }

  offSearch() {
    this.searchText = '';
    this.fetchFilteredPayments();
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchFilteredPayments(this.page, this.itemsPerPage);
  }

  validateToDate() {
    if (!this.fromDate) {
      this.toDate = null;
      if (this.toDateCalendar) {
        this.toDateCalendar.updateModel(null);
        this.toDateCalendar.updateInputfield();
      }
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: "Please select the 'From' date first",
        customClass: {
          popup: 'bg-white dark:bg-[#363636] text-gray-800 dark:text-white',
          title: 'dark:text-white',
        },
      });
    }
  }

  validateFromDate() {
    if (!this.toDate) {
      return;
    }

    if (this.toDate) {
      const from = new Date(this.fromDate as Date);
      const to = new Date(this.toDate);

      if (to <= from) {
        this.fromDate = null;
        setTimeout(() => (this.fromDate = null));
        Swal.fire({
          icon: 'warning',
          title: 'Warning',
          text: "The 'From' date cannot be later than or same to the 'To' date",
          customClass: {
            popup: 'bg-white dark:bg-[#363636] text-gray-800 dark:text-white',
            title: 'dark:text-white',
          },
        });
      }
    }
  }

  goBtn() {
    if (!this.fromDate || !this.toDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'Please fill in all date fields',
        customClass: {
          popup: 'bg-white dark:bg-[#363636] text-gray-800 dark:text-white',
          title: 'dark:text-white',
        },
      });
      return;
    }
    this.isDateFilterSet = true;
    this.fetchFilteredPayments();
  }

  downloadTemplate1() {
    this.isDownloading = true;

    const fromDateStr = this.formatDateForAPI(this.fromDate);
    const toDateStr = this.formatDateForAPI(this.toDate);

    this.TargetSrv.downloadCenterPaymentReportFile(
      fromDateStr,
      toDateStr,
      this.centerId,
      this.searchText,
    ).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Expenses Report From ${fromDateStr} To ${toDateStr}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);

        Swal.fire({
          icon: 'success',
          title: 'Downloaded',
          text: 'Please check your downloads folder',
          customClass: {
            popup: 'bg-white dark:bg-[#363636] text-gray-800 dark:text-white',
            title: 'dark:text-white',
          },
        });
        this.isDownloading = false;
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Download Failed',
          text: error.message,
          customClass: {
            popup: 'bg-white dark:bg-[#363636] text-gray-800 dark:text-white',
            title: 'dark:text-white',
          },
        });
        this.isDownloading = false;
      },
    });
  }

  private formatDateForAPI(date: Date | null): string {
    if (!date) return '';

    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);

    return `${year}-${month}-${day}`;
  }

  navigateToFarmerReport(invNo: string) {
    this.router.navigate([`/collection-hub/farmer-report-invoice/${invNo}`]);
  }

  navigateToCenterTarget() {
    this.router.navigate(['/centers']);
  }

  goBack() {
    this.location.back();
  }
}

class FarmerPayments {
  invNo!: string;
  totalAmount!: number;
  centerCode!: string;
  centerName!: string;
  nic!: string;
  firstNameEnglish!: string;
  gradeAprice!: number;
  gradeBprice!: number;
  gradeCprice!: number;
  gradeAquan!: number;
  gradeBquan!: number;
  gradeCquan!: number;
  status!: string;
  createdAt!: string | Date;
  companyId!: number;
}

class Center {
  id!: number;
  centerName!: string;
  regCode!: string;
}
