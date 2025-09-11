
import { Component, OnInit } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CollectionService } from '../../../services/collection.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';

interface Center {
  id: string;
  name: string;
}

interface OngoingCultivationItem {
  id: number;
  empId: string;
  firstNameEnglish: string;
  lastNameEnglish: string;
  lastName: string;
  companyNameEnglish: string;
  phoneCode01: string;
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
  styleUrls: ['./collection-officer-report.component.css'],
})
export class CollectionOfficerReportComponent implements OnInit {
  ongoingCultivation: OngoingCultivationItem[] = [];
  centers: Center[] = [];
  selectedCenter: string = '';
  isPopupVisible = false;
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  searchNIC: string = '';
  isLoading = false;

  constructor(
    private collectionOfficer: CollectionService,
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) { }

  ngOnInit(): void {
    this.fetchCenters();
    this.fetchAllNews(this.page, this.itemsPerPage);
  }

  fetchCenters(): void {
    this.isLoading = true;
    this.collectionOfficer.getCollectionCenter().subscribe({
      next: (response: any) => {

        this.centers = response.data

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching centers:', error);
        this.centers = [];
        this.isLoading = false;
      },
    });
  }

  fetchAllNews(page: number = 1, limit: number = this.itemsPerPage): void {
    this.isLoading = true;
    // const centerName = this.selectedCenter?.name.trim() || '';
    // const trimmedSearchNIC = this.searchNIC.trim();



    // console.log('Fetching with centerName:', centerName, 'searchNIC:', trimmedSearchNIC);
    this.collectionOfficer
      .fetchAllCollectionOfficerStatus(page, limit, this.searchNIC, this.selectedCenter)
      .subscribe({
        next: (response) => {
          this.ongoingCultivation = response.items || [];
          this.totalItems = response.total || 0;
          this.isLoading = false;
          console.log('Fetched data:', this.ongoingCultivation);
        },
        error: (error) => {
          console.error('Error fetching collection officers:', error);
          this.ongoingCultivation = [];
          this.totalItems = 0;
          this.isLoading = false;
        },
      });
  }

  applyFilters(): void {
    this.page = 1;
    this.fetchAllNews(this.page, this.itemsPerPage);
  }

  searchCultivations(): void {
    this.page = 1;
    this.fetchAllNews(this.page, this.itemsPerPage);
  }

  clearSearch(): void {
    this.searchNIC = '';
    this.selectedCenter = '';
    this.page = 1;
    this.fetchAllNews(this.page, this.itemsPerPage);
  }

  onPageChange(event: number): void {
    this.page = event;
    this.fetchAllNews(this.page, this.itemsPerPage);
  }

  navigateToReport(id: number, name: string): void {
    this.router.navigate([
      `/reports/collective-officer-report/view/${id}/${name}`,
    ]);
  }

  navigateToPaymentSlipReport(
    id: number,
    firstName: string,
    lastName: string,
    QRcode: string,
    empId: string
  ): void {
    this.router.navigate([`/reports/payment-slip-report/${id}`], {
      queryParams: { firstName, lastName, QRcode, empId },
    });
  }

  navigateToMonthlyReport(id: number): void {
    this.router.navigate([
      `/reports/collective-officer-report/monthly-report/${id}`,
    ]);
  }

  back(): void {
    this.router.navigate(['/reports']);
  }
}