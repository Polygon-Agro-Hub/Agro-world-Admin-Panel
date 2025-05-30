import { Component } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CollectionService } from '../../../services/collection.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';

interface OngoingCultivationItem {
  id: number;
  empId: string;
  firstNameEnglish: string;
  lastNameEnglish: string;
  lastName: string;
  companyNameEnglish: string;
  phoneNumber01: string;
  nic: string;
  status: string;
  district: string;
  centerName: string;
  QRcode: string;
}

@Component({
  selector: 'app-collection-officer-report',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    NgxPaginationModule,
    DropdownModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './collection-officer-report.component.html',
  styleUrl: './collection-officer-report.component.css',
})
export class CollectionOfficerReportComponent {
  ongoingCultivation: OngoingCultivationItem[] = [];
  isPopupVisible = false;
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  searchNIC: string = '';
  isLoading = false;

  constructor(
    private collectionoOfficer: CollectionService,
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) {}

  ngOnInit() {
    this.fetchAllNews(this.page, this.itemsPerPage);
  }

  fetchAllNews(page: number = 1, limit: number = this.itemsPerPage) {
    this.isLoading = true;
    this.collectionoOfficer
      .fetchAllCollectionOfficerStatus(page, limit, this.searchNIC, '')
      .subscribe(
        (response) => {
          this.ongoingCultivation = response.items;
          this.totalItems = response.total;
          this.isLoading = false;
        },
        (error) => {
          if (error.status === 401) {
          }
          this.isLoading = false;
        }
      );
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllNews(this.page, this.itemsPerPage);
  }

  searchCultivations() {
    this.page = 1;
    this.fetchAllNews(this.page, this.itemsPerPage);
  }

  clearSearch(): void {
    this.searchNIC = '';
    this.fetchAllNews(this.page, this.itemsPerPage);
  }

  navigateToReport(id: number, name: string) {
    this.router.navigate([
      `/reports/collective-officer-report/view/${id}/${name}`,
    ]);
  }

  navigateToPaymentSlipReport(
    id: number,
    firstName: string,
    lastName: string,
    QRcode: string,
    empId: string,
  ) {
    this.router.navigate([`/reports/payment-slip-report/${id}`], {
      queryParams: { firstName, lastName, QRcode, empId },
    });
  }

  navigateToMonthlyReport(id: number) {
    this.router.navigate([
      `/reports/collective-officer-report/monthly-report/${id}`,
    ]);
  }

  back(): void {
    this.router.navigate(['/reports']);
  }
}
