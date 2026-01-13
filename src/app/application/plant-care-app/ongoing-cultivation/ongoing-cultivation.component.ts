import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { OngoingCultivationService } from '../../../services/plant-care/ongoing-cultivation.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';

interface OngoingCultivationItem {
  cultivationId: number;
  ongCultivationId: number;
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  NICnumber: string;
  phoneNumber: string;
  CropCount: string;
  FarmCount: string;
}

interface NewsItem {
  cropName: string;
  variety: string;
  CultivationMethod: string;
  NatureOfCultivation: string;
  CropDuration: string;
}

@Component({
  selector: 'app-ongoing-cultivation',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    NgxPaginationModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './ongoing-cultivation.component.html',
  styleUrl: './ongoing-cultivation.component.css',
})
export class OngoingCultivationComponent {
  ongoingCultivation: OngoingCultivationItem[] = [];
  newsItems: NewsItem[] = [];
  isPopupVisible = false;
  page: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  searchNIC: string = '';
  hasData: boolean = true;
  isLoading = true;

  constructor(
    private ongoingCultivationService: OngoingCultivationService,
    private http: HttpClient,
    private router: Router,
    public permissionService: PermissionService,
    public tokenService: TokenService
  ) {}

  ngOnInit() {
    this.fetchAllNews(this.page, this.itemsPerPage);
  }

  fetchAllNews(page: number = 1, limit: number = this.itemsPerPage) {
    this.isLoading = true;
    this.ongoingCultivationService
      .fetchAllOngoingCultivations(page, limit, this.searchNIC)
      .subscribe({
        next: (response) => {
          console.log('response', response);
          this.ongoingCultivation = response.items || [];
          // Check if array has items
          this.hasData = this.ongoingCultivation && this.ongoingCultivation.length > 0;
          this.totalItems = response.total || 0;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.ongoingCultivation = [];
          this.hasData = false;
          this.totalItems = 0;
          this.isLoading = false;
        },
      });
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllNews(this.page, this.itemsPerPage);
  }

  searchCultivations() {
    this.page = 1;
    this.searchNIC = this.searchNIC.trim();
    this.fetchAllNews(this.page, this.itemsPerPage);
  }

  clearSearch(): void {
    this.searchNIC = '';
    this.fetchAllNews(this.page, this.itemsPerPage);
  }

  // ✅ Updated openPopup to accept full item
  openPopup(item: OngoingCultivationItem) {
    if (!item.userId) {
      console.error('User ID is missing');
      return;
    }

    this.isPopupVisible = true;

    this.ongoingCultivationService
      .getOngoingCultivationById(item.cultivationId, item.userId)
      .subscribe({
        next: (data) => {
          this.newsItems = data;

          let tableHtml = `
            <table border="1" style="width: 100%; text-align: center; border-collapse: collapse; font-family: Arial, sans-serif;">
              <thead>
                <tr>
                  <th>Crop Name</th>
                  <th>Variety</th>
                  <th>Cultivation Method</th>
                  <th>Nature Of Cultivation</th>
                  <th>Crop Duration</th>
                </tr>
              </thead>
              <tbody>
          `;

          for (const item of this.newsItems) {
            tableHtml += `
              <tr>
                <td>${item.cropName}</td>
                <td>${item.variety}</td>
                <td>${item.CultivationMethod}</td>
                <td>${item.NatureOfCultivation}</td>
                <td>${item.CropDuration}</td>
              </tr>
            `;
          }

          tableHtml += `</tbody></table>`;

          Swal.fire({
            title: 'Ongoing Cultivation',
            html: tableHtml,
            confirmButtonText: 'Close',
            confirmButtonColor: '#4CAF50',
            width: 'auto',
            customClass: {
              popup: 'custom-swal-popup',
              confirmButton: 'custom-confirm-button',
            },
          });
        },
        error: (err) => console.error(err),
      });
  }

  viewTaskByUsers(
    cultivationId: any,
    userId: any,
    userName: any,
    ongCultivationId: number
  ) {
    if (cultivationId) {
      this.router.navigate(['/plant-care/action/view-crop-task-by-user'], {
        queryParams: { cultivationId, userId, userName },
      });
    }
  }

  viewTaskByUser(
    cultivationId: any,
    userId: any,
    userName: any,
    ongCultivationId: number
  ) {
    if (userId) {
      this.router.navigate(['/plant-care/action/farmers-farm'], {
        queryParams: { userId, userName, ongCultivationId },
      });
    }
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  viewCultivations(farmId: number, userId: number) {
    Swal.fire({
      title: 'Cultivations',
      text: `View cultivations for farm ID: ${farmId}`,
      icon: 'info',
      confirmButtonText: 'Proceed',
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/plant-care/ongoing-cultivations'], {
          queryParams: { farmId, userId },
        });
      }
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (
      (event.code === 'Space' || event.key === ' ') &&
      this.searchNIC.length === 0
    ) {
      event.preventDefault();
    }
  }
}