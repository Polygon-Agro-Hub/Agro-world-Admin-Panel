
import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { DispatchService } from '../../../../services/dispatch/dispatch.service';
import { Router } from '@angular/router';
import { TokenService } from '../../../../services/token/services/token.service';
import { PermissionService } from '../../../../services/roles-permission/permission.service';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-salesdash-custome-package',
  standalone: true,
  imports: [
    CommonModule,
    NgxPaginationModule,
    DropdownModule,
    FormsModule,
    DatePipe,
    CalendarModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './salesdash-custome-package.component.html',
  styleUrls: ['./salesdash-custome-package.component.css']
})
export class SalesdashCustomePackageComponent implements OnInit {
  totalItemssl: number = 0;
  pagesl: number = 1;
  statussl = ['Pending', 'Completed', 'Opened'];
  selectedStatussl: string = '';
  dateFilter: Date | null = new Date(); // Initialize with current date
  searchsl: string = '';
  hasDataCustom = false;
  selectdPackage: SelectdPackage[] = [];
  itemsPerPagesl: number = 10;
  isLoading: boolean = false;

  constructor(
    private dispatchService: DispatchService,
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    console.log('Initializing with date:', this.dateFilter);
    this.getSelectedPackages();
  }
back(): void {
  Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: 'You may lose the added data after going back!',
    showCancelButton: true,
    confirmButtonText: 'Yes, Go Back',
    cancelButtonText: 'No, Stay Here',
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
    },
    // keep default button styling
    buttonsStyling: true,
  }).then((result) => {
    if (result.isConfirmed) {
     this.router.navigate(["/dispatch/salesdash-orders"]);
    }
  });
}
  getSelectedPackages(pagesl: number = 1, limitsl: number = this.itemsPerPagesl) {
    this.isLoading = true;
    const formattedDate = this.formatDateForAPI(this.dateFilter);
    console.log('Fetching packages with:', { pagesl, limitsl, status: this.selectedStatussl, date: this.dateFilter, formattedDate, search: this.searchsl.trim() });

    this.dispatchService
      .getSelectedPackages(
        pagesl,
        limitsl,
        this.selectedStatussl,
        formattedDate,
        this.searchsl.trim()
      )
      .subscribe({
        next: (response) => {
          console.log('API Response:', response);

          if (response && response.items) {
            this.selectdPackage = response.items.map((item: any) => ({
              id: item.id,
              orderId: item.orderId,
              processOrderId: item.processOrderId,
              invNo: item.invNo,
              sheduleDate: item.sheduleDate, // backend field
              orderAdditionalCount: item.orderAdditionalCount,
              additionalPrice: item.additionalPrice,
              totalAdditionalItems: item.totalAdditionalItems,
              packedAdditionalItems: item.packedAdditionalItems,
              additionalItemsStatus: item.additionalItemsStatus,
              scheduleDateFormattedSL: this.formatDate(item.sheduleDate) // formatted for UI
            }));
            this.totalItemssl = response.total || response.totalCount || 0;
            this.hasDataCustom = this.totalItemssl > 0;
          } else {
            const allPackages = Array.isArray(response) ? response : [];
            this.selectdPackage = allPackages.map((item: any) => ({
              id: item.id,
              orderId: item.orderId,
              processOrderId: item.processOrderId,
              invNo: item.invNo,
              sheduleDate: item.sheduleDate,
              orderAdditionalCount: item.orderAdditionalCount,
              additionalPrice: item.additionalPrice,
              totalAdditionalItems: item.totalAdditionalItems,
              packedAdditionalItems: item.packedAdditionalItems,
              additionalItemsStatus: item.additionalItemsStatus,
              scheduleDateFormattedSL: this.formatDate(item.sheduleDate)
            }));
            this.totalItemssl = this.selectdPackage.length;
            this.hasDataCustom = this.totalItemssl > 0;
          }

          console.log('Processed Packages:', this.selectdPackage);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching packages:', error);
          this.selectdPackage = [];
          this.totalItemssl = 0;
          this.hasDataCustom = false;
          this.isLoading = false;
        }
      });
  }

  private formatDateForAPI(date: Date | null): string {
    if (!date || isNaN(date.getTime())) {
      console.log('Invalid or null date, returning empty string');
      return ''; // Return empty string to fetch all packages
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;
    console.log('Formatted date for API:', formatted);
    return formatted;
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new DatePipe('en-US').transform(date, 'd MMM, yyyy') || '';
  }

  onDateFilterClear(): void {
    console.log('Date filter cleared');
    this.dateFilter = null;
    this.pagesl = 1;
    this.getSelectedPackages();
  }

  onFilterChange(): void {
    console.log('Date filter changed:', this.dateFilter, 'Event:', event);
    this.pagesl = 1;
    this.getSelectedPackages();
  }

  applyStatussl(): void {
    console.log('Applying status:', this.selectedStatussl);
    this.pagesl = 1;
    this.getSelectedPackages();
  }

  applySearchsl(): void {
    console.log('Applying search:', this.searchsl);
    this.pagesl = 1;
    this.getSelectedPackages();
  }

  clearSearchsl(): void {
    console.log('Clearing search');
    this.searchsl = '';
    this.pagesl = 1;
    this.getSelectedPackages();
  }

  onPageChangesl(event: number): void {
    console.log('Page changed:', event);
    this.pagesl = event;
    this.getSelectedPackages(this.pagesl, this.itemsPerPagesl);
  }

  navigateToCustomAdditionalItemView(id: number): void {
    // console.log('Navigating to custom additional items:', { id, invNo, total, fullTotal });
    // this.router.navigate(['/dispatch/custom-additional-items'], {
    //   queryParams: { id, invNo, total, fullTotal }
    // });
    this.router.navigate([`/dispatch/dispatch-additional-items/${id}`], {
      queryParams: { status: true}
    });
  }
}

interface SelectdPackage {
  id: number;
  orderId: number;
  processOrderId: number;
  invNo: string;
  sheduleDate: string; // backend spelling
  orderAdditionalCount: number;
  additionalPrice: number;
  totalAdditionalItems: number;
  packedAdditionalItems: number;
  additionalItemsStatus: string;
  scheduleDateFormattedSL?: string; // for UI
}
