import { Component, OnInit } from '@angular/core';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environment/environment';
import { PlantcareUsersService } from '../../../services/plant-care/plantcare-users.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';
import { DropdownModule } from 'primeng/dropdown';

interface PlantCareUser {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  NICnumber: string;
  district: string;
  farmerQr: string;
  activeStatus: string;
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

@Component({
  selector: 'app-view-plantcare-users',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    NgxPaginationModule,
    FormsModule,
    LoadingSpinnerComponent,
    DropdownModule,
  ],
  templateUrl: './view-plantcare-users.component.html',
  styleUrl: './view-plantcare-users.component.css',
  template: `
    <pagination-controls
      (pageChange)="onPageChange($event)"
      [totalItems]="totalItems"
      [itemsPerPage]="10"
    >
    </pagination-controls>
  `,
})
export class ViewPlantcareUsersComponent implements OnInit {
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
  hasData: boolean = true;
  regStatus: string = '';
  district: string = '';

  registerStatusFilter = [
    { status: 'Registered', value: 'Registered' },
    { status: 'Unregistered', value: 'Unregistered' },
  ];

  districtFilter = [
    { status: 'Colombo', value: 'Colombo' },
    { status: 'Kalutara', value: 'Kalutara' },
    { status: 'Gampaha', value: 'Gampaha' },
    { status: 'Kandy', value: 'Kandy' },
    { status: 'Matale', value: 'Matale' },
    { status: 'Nuwara Eliya', value: 'Nuwara Eliya' },
    { status: 'Galle', value: 'Galle' },
    { status: 'Matara', value: 'Matara' },
    { status: 'Hambantota', value: 'Hambantota' },
    { status: 'Jaffna', value: 'Jaffna' },
    { status: 'Mannar', value: 'Mannar' },
    { status: 'Vavuniya', value: 'Vavuniya' },
    { status: 'Kilinochchi', value: 'Kilinochchi' },
    { status: 'Mullaitivu', value: 'Mullaitivu' },
    { status: 'Batticaloa', value: 'Batticaloa' },
    { status: 'Ampara', value: 'Ampara' },
    { status: 'Trincomalee', value: 'Trincomalee' },
    { status: 'Badulla', value: 'Badulla' },
    { status: 'Moneragala', value: 'Moneragala' },
    { status: 'Kurunegala', value: 'Kurunegala' },
    { status: 'Puttalam', value: 'Puttalam' },
    { status: 'Anuradhapura', value: 'Anuradhapura' },
    { status: 'Polonnaruwa', value: 'Polonnaruwa' },
    { status: 'Rathnapura', value: 'Rathnapura' },
    { status: 'Kegalle', value: 'Kegalle' },
  ];

  constructor(
    public tokenService: TokenService,
    private plantcareService: PlantcareUsersService,
    private http: HttpClient,
    private router: Router,
    public permissionService: PermissionService
  ) { }

  ngOnInit() {
    this.fetchAllPlantCareUsers(this.page, this.itemsPerPage);
  }

  fetchAllPlantCareUsers(
    page: number = 1,
    limit: number = this.itemsPerPage,
    search: string = this.searchNIC,
    regStatus: string = this.regStatus,
    district: string = this.district
  ) {
    this.isLoading = true;
    // Trim the search string to remove leading/trailing spaces
    const trimmedSearch = search.trim();
    this.plantcareService
      .getAllPlantCareUsers(page, limit, trimmedSearch, regStatus, district)
      .subscribe(
        (response) => {
          this.isLoading = false;
          this.plantCareUser = response.items;
          this.hasData = this.plantCareUser.length > 0;
          this.totalItems = response.total;
        },
        (error) => {
          this.isLoading = false;
          if (error.status === 401) {
            Swal.fire('Unauthorized', 'Please log in again.', 'error');
          } else {
            Swal.fire('Error', 'Failed to fetch plant care users.', 'error');
          }
        }
      );
  }

  regStatusFil() {
    this.fetchAllPlantCareUsers(this.page, this.itemsPerPage);
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllPlantCareUsers(this.page, this.itemsPerPage);
  }

  searchPlantCareUsers() {
    this.searchNIC = this.searchNIC.trim(); // Trim leading/trailing spaces
    if (!this.searchNIC) {
      Swal.fire('Info', 'Please enter a valid NIC number.', 'info');
      return;
    }
    this.page = 1;
    this.fetchAllPlantCareUsers(this.page, this.itemsPerPage);
  }

  clearSearch(): void {
    this.searchNIC = '';
    this.fetchAllPlantCareUsers(this.page, this.itemsPerPage);
  }

  deletePlantCareUser(id: any) {
    const token = this.tokenService.getToken();
    if (!token) {
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this plant care user? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.http
          .delete(`${environment.API_URL}auth/delete-plant-care-user/${id}`, {
            headers,
          })
          .subscribe(
            (data: any) => {
              if (data) {
                Swal.fire(
                  'Deleted!',
                  'The plant care user has been deleted.',
                  'success'
                );
                this.fetchAllPlantCareUsers();
              }
            },
            (error) => {
              Swal.fire(
                'Error',
                'There was a problem deleting the plant care user.',
                'error'
              );
            }
          );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Your plant care user is safe', 'info');
      }
    });
  }

  editPlantCareUser(id: number) {
    this.router.navigate(
      ['/steckholders/action/farmers/edit-plantcare-users'],
      { queryParams: { id } }
    );
  }

  addPlantCareUser(id: number) {
    this.router.navigate(['/plant-care/edit-plantcare-users']);
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

  viewFarmer(id: number, isView: boolean) {
    this.router.navigate(
      ['/steckholders/action/farmers/view-plantcare-users'],
      {
        queryParams: { id, isView },
      }
    );
  }

  navigateToBack(): void {
    this.router.navigate(['/steckholders/action']);
  }

  navigateToAddUser(): void {
    this.router.navigate([
      '/steckholders/action/farmers/create-plantcare-users',
    ]);
  }

  bulkUpload(): void {
    this.router.navigate(['/steckholders/action/farmers/upload-farmers']);
  }

  downloadTemplate(): void {
    // Define the headers for the CSV
    const headers = ['First Name', 'Last Name', 'Phone Number', 'NIC Number', 'Membership', 'District'];

    // Create CSV content with headers only
    const csvContent = headers.map(header => `"${header}"`).join(',') + '\n';

    // Create a Blob object with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create a download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    // Set the link attributes
    link.setAttribute('href', url);
    link.setAttribute('download', 'bulk_onboarding_template.csv');
    link.style.visibility = 'hidden';

    // Append link to the body, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Revoke the object URL to free up memory
    URL.revokeObjectURL(url);
  }
}
