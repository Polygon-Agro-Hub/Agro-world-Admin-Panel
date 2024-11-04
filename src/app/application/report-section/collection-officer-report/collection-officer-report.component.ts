import { Component } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CollectionService } from '../../../services/collection.service';

interface OngoingCultivationItem {
  id: number;
  firstName: string;
  lastName: string;
  companyName: string;
  phoneNumber01: string;
  nic: string;
  status: string;
  district: string;
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

  constructor(
    private collectionoOfficer: CollectionService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchAllNews(this.page, this.itemsPerPage);
  }

  fetchAllNews(page: number = 1, limit: number = this.itemsPerPage) {
    this.collectionoOfficer
      .fetchAllCollectionOfficer(page, limit, this.searchNIC)
      .subscribe(
        (response) => {
          this.ongoingCultivation = response.items;
          this.totalItems = response.total;
        },
        (error) => {
          console.error('Error fetching ongoing cultivations:', error);
          if (error.status === 401) {
            // Handle unauthorized access (e.g., redirect to login)
          }
        }
      );
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllNews(this.page, this.itemsPerPage); // Include itemsPerPage
  }

  searchCultivations() {
    this.page = 1; // Reset to first page when searching
    this.fetchAllNews(this.page, this.itemsPerPage);
  }

  clearSearch(): void {
    this.searchNIC = '';
    this.fetchAllNews(this.page, this.itemsPerPage);
  }

  navigateToReport(id: number, name: string) {
    if (id) {
      const url = this.router.serializeUrl(
        this.router.createUrlTree([
          '/reports/collective-officer-report/view',
          id,
          name,
        ])
      );
      window.open(url, '_blank'); // Opens the page in a new tab
    } else {
      console.error('ID is missing');
    }
  }

  navigateToPaymentSlipReport(id: number) {
    this.router.navigate([`/reports/payment-slip-report/${id}`]);
  }
}
