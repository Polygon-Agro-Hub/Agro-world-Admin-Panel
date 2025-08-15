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
  styleUrl: './salesdash-custome-package.component.css'
})
export class SalesdashCustomePackageComponent implements OnInit {

  totalItemssl: number = 0;
  pagesl: number = 1;
  statussl = ['Pending', 'Completed', 'Opened'];
  selectedStatussl: any = '';
  datesl: Date = new Date();
  searchsl: string = '';
  hasDataCustom = false;
  selectdPackage: SelectdPackage[] = [];
  itemsPerPagesl: number = 10;
  isLoading: boolean = false;




  ngOnInit(): void {
    this.getSelectedPackages();
  }

  constructor(
    private dispatchService: DispatchService,
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService,
  ) { }

  getSelectedPackages(pagesl: number = 1, limitsl: number = this.itemsPerPagesl) {
    this.isLoading = true;

    this.dispatchService
      .getSelectedPackages(
        pagesl,
        limitsl,
        this.selectedStatussl,
        this.formatDateForAPI(this.datesl), // Convert Date to string
        this.searchsl.trim()
      )
      .subscribe(
        (response) => {
          console.log('response', response);

          this.selectdPackage = response.items.map((item: { scheduleDate: string; }) => {
            return {
              ...item,
              scheduleDateFormattedSL: this.formatDate(item.scheduleDate)
            };
          });
          this.totalItemssl = response.total;

          // Add hasData logic for custom packages
          this.hasDataCustom = response.items && response.items.length > 0;

          console.log(this.selectdPackage)
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching ongoing cultivations:', error);
          if (error.status === 401) {
          }
          this.hasDataCustom = false; // Set to false on error
          this.isLoading = false;
        }
      );
  }

  private formatDateForAPI(date: Date | null): string {
    if (!date) return '';
    // Format as YYYY-MM-DD (ISO date string format)
    return date.toISOString().split('T')[0];
  }


  applyStatussl() {
    this.getSelectedPackages();
  }

  applysearchsl() {
    this.getSelectedPackages();

  }

  clearSearchsl(): void {
    this.searchsl = '';
    this.getSelectedPackages();
  }

  onPageChangesl(event: number) {
    this.pagesl = event;
    this.getSelectedPackages(this.pagesl, this.itemsPerPagesl);

  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new DatePipe('en-US').transform(date, 'd MMM, yyyy') || '';
  }

  navigateToCustomAdditionalItemView(id: number, invNo: string, total: number, fullTotal: number | string) {
    this.router.navigate(['/dispatch/custom-additional-items'], {
      queryParams: { id, invNo, total, fullTotal },
    });
  }


}


interface SelectdPackage {
  id: number;
  orderId: number;
  processOrderId: number;
  invNo: string;
  sheduleDate: Date;
  orderAdditionalCount: number;
  additionalPrice: number;
  totalAdditionalItems: number;
  packedAdditionalItems: number;
  additionalItemsStatus: string;
}