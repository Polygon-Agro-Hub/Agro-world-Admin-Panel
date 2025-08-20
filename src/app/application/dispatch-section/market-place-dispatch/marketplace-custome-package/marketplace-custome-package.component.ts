import { Component } from '@angular/core';
import { DispatchService } from '../../../../services/dispatch/dispatch.service';
import { Router } from '@angular/router';
import { TokenService } from '../../../../services/token/services/token.service';
import { PermissionService } from '../../../../services/roles-permission/permission.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-marketplace-custome-package',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarModule,
    NgxPaginationModule,
    DropdownModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './marketplace-custome-package.component.html',
  styleUrl: './marketplace-custome-package.component.css'
})
export class MarketplaceCustomePackageComponent {
  premadePackages: PremadePackages[] = [];
  search: string = '';

  isLoading: boolean = false;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  page: number = 1;

  selectedStatus: any = '';
  date: Date = new Date();
  status = ['Pending', 'Completed', 'Opened'];
  hasData = false;
  hasDataCustom = false;

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
      .getMarketPlaceCustomePackages(
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

          this.hasData = response.items && response.items.length > 0;
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
    // Format as YYYY-MM-DD (ISO date string format)
    return date.toISOString().split('T')[0];
  }

  applysearch() {
    this.getPreMadePackages();

  }
  clearSearch() {
    this.search = '';
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

 navigateDispatchAdditionalItems(id: number) {
    this.router.navigate([`/dispatch/dispatch-additional-items/${id}`])
  }
}

interface PremadePackages {
  id: number;
  processOrderId: number;
  invNo: string;
  sheduleDate: string;
  additionalItemPrice: number
  totalAdditionalItems: number
  packedAdditionalItems: number
  additionalItemsStatus: string
}
