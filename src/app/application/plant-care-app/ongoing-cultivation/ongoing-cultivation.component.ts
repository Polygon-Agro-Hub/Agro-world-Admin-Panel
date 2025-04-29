import { CommonModule } from '@angular/common';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { OngoingCultivationService } from '../../../services/plant-care/ongoing-cultivation.service';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";


interface OngoingCultivationItem {
  cultivationId: number;
  id: number;
  firstName: string;
  lastName: string;
  NICnumber: string;
  CropCount: string;
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
  imports: [CommonModule, HttpClientModule, NgxPaginationModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './ongoing-cultivation.component.html',
  styleUrl: './ongoing-cultivation.component.css',
  template: `
    <!-- Your existing table markup -->
    <pagination-controls
      (pageChange)="onPageChange($event)"
      [totalItems]="totalItems"
      [itemsPerPage]="10"
    >
    </pagination-controls>
  `,
})
export class OngoingCultivationComponent {
  ongoingCultivation: OngoingCultivationItem[] = [];
  isPopupVisible = false;
  newsItems: NewsItem[] = [];
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  searchNIC: string = '';
  hasData: boolean = true;
  isLoading = true;

  constructor(private ongoingCultivationService: OngoingCultivationService, private http: HttpClient, private router: Router) { }

  ngOnInit() {
    this.fetchAllNews(this.page, this.itemsPerPage);
  }

  fetchAllNews(page: number = 1, limit: number = this.itemsPerPage) {
    this.isLoading = true;
    this.ongoingCultivationService.fetchAllOngoingCultivations(page, limit, this.searchNIC)
      .subscribe(
        (response) => {
          console.log("____ONgoing Cultivation_____", response);

          this.ongoingCultivation = response.items;
          this.hasData = this.ongoingCultivation.length > 0;
          this.totalItems = response.total;
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching ongoing cultivations:', error);
          if (error.status === 401) {
            this.isLoading = false;
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

  openPopup(id: any) {
    this.isPopupVisible = true;
    this.ongoingCultivationService.getOngoingCultivationById(id)
      .subscribe(
        (data) => {
          this.newsItems = data;
          console.log(this.newsItems);

          // Generate the table HTML dynamically
          let tableHtml = `
          <table border="1" style="width: 100%; text-align: center; border-collapse: collapse; font-family: Arial, sans-serif;">
            <thead>
              <tr style="border-bottom: 1px solid #ddd;">
                <th style="padding: 12px; font-weight: normal; font-size: 16px;">Crop Name</th>
                <th style="padding: 12px; font-weight: normal; font-size: 16px;">Variety</th>
                <th style="padding: 12px; font-weight: normal; font-size: 16px;">Cultivation Method</th>
                <th style="padding: 12px; font-weight: normal; font-size: 16px;">Nature Of Cultivation</th>
                <th style="padding: 12px; font-weight: normal; font-size: 16px;">Crop Duration</th>
              </tr>
            </thead>
            <tbody>
        `;

          for (const item of this.newsItems) {
            tableHtml += `
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 12px; font-size: 12px; font-weight: bolt;">${item.cropName}</td>
              <td style="padding: 12px; font-size: 12px;">${item.variety}</td>
              <td style="padding: 12px; font-size: 12px;">${item.CultivationMethod}</td>
              <td style="padding: 12px; font-size: 12px;">${item.NatureOfCultivation}</td>
              <td style="padding: 12px; font-size: 12px;">${item.CropDuration}</td>
            </tr>
          `;
          }

          tableHtml += `
            </tbody>
          </table>
        `;

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
        (error) => {
          console.error('Error fetching news:', error);
          if (error.status === 401) {
            // Handle unauthorized access (e.g., redirect to login)
          }
        }
      );
  }



  viewTaskByUser(cultivationId: any, userId: any, userName : any) {
    if (cultivationId) {
      this.router.navigate(['/plant-care/action/view-crop-task-by-user'], {
        queryParams: { cultivationId, userId, userName }
      });
      console.log('Navigating with cultivationId:', cultivationId);
      console.log('Navigating with cultivationId:', userId);
    } else {
      console.error('cultivationId is not defined:', cultivationId);
    }
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }

}
