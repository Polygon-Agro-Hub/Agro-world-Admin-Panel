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
        this.formatDateForAPI(this.date), 
        this.search.trim()
      )
      .subscribe(
        (response) => {
          this.premadePackages = response.items
          this.totalItems = response.total;

          this.hasData = response.total > 0;
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching ongoing cultivations:', error);
          if (error.status === 401) {
          }
          this.hasData = false; 
          this.isLoading = false;
        }
      );
  }

  private formatDateForAPI(date: Date | null): string {
    if (!date) return '';

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`; 
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

  navigateDispatchAdditionalItems(id: number) {
    this.router.navigate([`/dispatch/dispatch-additional-items/${id}`], {
      queryParams: { status: true }
    })
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
  additionalItemsStatus: string,
  adminPackBy: string | null;
  packBy: string | null;
}
