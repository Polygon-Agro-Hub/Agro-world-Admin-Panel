import { Component } from '@angular/core';
import { PlantcareUsersService } from '../../../services/plant-care/plantcare-users.service';
import Swal from 'sweetalert2';
import { environment } from '../../../environment/environment';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

interface PlantCareUser {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  NICnumber: string;
  profileImage: string;
  created_at: string;
}

interface NewsItem {
  tool: string;
  toolType: string;
  brandName: string;
  purchaseDate: Date;
  unit: number;
  price: any;
  warranty: any;
  expireDate: any;
}

interface CurrentAsset {
  id: any;
  tool: string;
  toolType: string;
  cultivationMethod: string;
  nature: Date;
  duration: number;
  createdAt: any;
}

interface TotalFixed {
  total_price: any;
}

@Component({
  selector: 'app-reports-farmer-list',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    NgxPaginationModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './reports-farmer-list.component.html',
  styleUrl: './reports-farmer-list.component.css',
  template: `
    <pagination-controls
      (pageChange)="onPageChange($event)"
      [totalItems]="totalItems"
      [itemsPerPage]="10"
    >
    </pagination-controls>
  `,
})
export class ReportsFarmerListComponent {
  plantCareUser: PlantCareUser[] = [];
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  isPopupVisible = false;
  newsItems: NewsItem[] = [];
  currentAsset: CurrentAsset[] = [];
  fixedAssetTotal: number = 0;
  totalFixed: any;
  searchNIC: string = '';
  isLoading = false;

  constructor(
    private plantcareService: PlantcareUsersService,
    private router: Router,
    private http: HttpClient
  ) {}

  fetchAllPlantCareUsers(page: number = 1, limit: number = this.itemsPerPage) {
    this.isLoading = true;
    this.plantcareService
      .getAllPlantCareUsers(page, limit, this.searchNIC)
      .subscribe(
        (response) => {
          this.isLoading = false;
          this.plantCareUser = response.items;
          this.totalItems = response.total;
        },
        (error) => {
          if (error.status === 401) {
          }
        }
      );
  }

  ngOnInit() {
    this.fetchAllPlantCareUsers(this.page, this.itemsPerPage);
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllPlantCareUsers(this.page, this.itemsPerPage);
  }

  searchPlantCareUsers() {
    this.page = 1;
    this.fetchAllPlantCareUsers(this.page, this.itemsPerPage);
  }

  clearSearch(): void {
    this.searchNIC = '';
    this.fetchAllPlantCareUsers(this.page, this.itemsPerPage);
  }

  getTotalFixedAssets(id: number) {
    this.plantcareService.getTotalFixedAssets(id).subscribe(
      (response) => {
        if (Array.isArray(response) && response.length > 0) {
          const totalFixedAssetData = response[0];
          if (totalFixedAssetData && totalFixedAssetData.total_price) {
            this.fixedAssetTotal = parseFloat(totalFixedAssetData.total_price);
          }
        }
      },
      (error) => {
        if (error.status === 401) {
        }
      }
    );
  }

  viewFixedAsset(id: number, firstName: string, lastName: string) {
    this.router.navigate(['/plant-care/action/assets/fixed-asset-category'], {
      queryParams: { id, firstName, lastName },
    });
  }

  viewCurrentAsset(id: number, fname: string, lname: string) {
    let userName = fname + ' ' + lname;
    this.navigatePath(
      `/plant-care/action/report-farmer-current-assert/${id}/${userName}`
    );
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }
}
