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
import * as XLSX from 'xlsx';


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
  membership: string;
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
  selectPlan: string = '';

  registerStatusFilter = [
    { status: 'Registered', value: 'Registered' },
    { status: 'Unregistered', value: 'Unregistered' },
  ];

  planStatusFilter = [
    { label: 'PRO', value: 'Pro' },
    { label: 'BASIC', value: 'Basic' },
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
    district: string = this.district,
    plan: string = this.selectPlan
  ) {
    this.isLoading = true;
    // Trim the search string to remove leading/trailing spaces
    const trimmedSearch = search.trim();
    this.plantcareService
      .getAllPlantCareUsers(page, limit, trimmedSearch, regStatus, district, plan)
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
            Swal.fire({
              title: 'Unauthorized',
              text: 'Please log in again.',
              icon: 'error',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold',
              },
            });
          } else {
            Swal.fire({
              title: 'Error',
              text: 'Failed to fetch Govi Care users.',
              icon: 'error',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold',
              },
            });
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
      Swal.fire({
        title: 'Info',
        text: 'Please enter a valid NIC number.',
        icon: 'info',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        },
      });
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
      text: 'Do you really want to delete this GoviCare user? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.http
          .delete(`${environment.API_URL}auth/delete-plant-care-user/${id}`, {
            headers,
          })
          .subscribe(
            (data: any) => {
              if (data) {
                Swal.fire({
                  title: 'Deleted!',
                  text: 'GoviCare user has been deleted.',
                  icon: 'success',
                  customClass: {
                    popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                    title: 'font-semibold',
                  }
                });
                this.fetchAllPlantCareUsers();
              }
            },
            (error) => {
              Swal.fire({
                title: 'Error',
                text: 'There was a problem deleting the GoVi Care user.',
                icon: 'error',
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold',
                },
              });
            }
          );
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

  // downloadTemplate(): void {
  //   // Define the headers for the CSV
  //   const headers = ['First Name', 'Last Name', 'Phone Number', 'NIC Number', 'Membership', 'District'];

  //   // Create CSV content with headers only
  //   const csvContent = headers.map(header => `"${header}"`).join(',') + '\n';

  //   // Create a Blob object with the CSV content
  //   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  //   // Create a download link
  //   const link = document.createElement('a');
  //   const url = URL.createObjectURL(blob);

  //   // Set the link attributes
  //   link.setAttribute('href', url);
  //   link.setAttribute('download', 'bulk_onboarding_template.csv');
  //   link.style.visibility = 'hidden';

  //   // Append link to the body, click it, and remove it
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);

  //   // Revoke the object URL to free up memory
  //   URL.revokeObjectURL(url);
  // }
  downloadTemplate(): void {
  this.isLoading = true;

  // Define the header row
  const header = ['First Name', 'Last Name', 'Phone Number', 'NIC Number', 'Membership', 'District'];

  // Define sample empty data rows
  const numberOfRowsToGenerate = 10000;
  const emptyRows = Array.from({ length: numberOfRowsToGenerate }, () => [
    '', // First Name
    '', // Last Name
    '', // Phone Number
    '', // NIC Number
    '', // Membership
    '', // District
  ]);

  // Combine header and data rows
  const worksheetData = [header, ...emptyRows];
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Force all columns to be treated as TEXT
  const range = XLSX.utils.decode_range(ws['!ref']!);
  
  // Iterate over all cells in all columns and set them as text
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = 0; C <= 5; ++C) { // All 6 columns
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      
      // For phone number column (index 2) and NIC column (index 3)
      if (C === 2 || C === 3) {
        // Create or update cell with text format
        if (!ws[cellAddress]) {
          ws[cellAddress] = { v: '', t: 's' };
        } else {
          ws[cellAddress].t = 's'; // 's' for string type
        }
        // Set Excel format to @ which means "text"
        ws[cellAddress].z = '@';
      } else {
        // For other columns, also set as text to be safe
        if (!ws[cellAddress]) {
          ws[cellAddress] = { v: '', t: 's' };
        } else {
          ws[cellAddress].t = 's';
        }
      }
    }
  }

  // Set column widths
  ws['!cols'] = [
    { wch: 25 }, // First Name
    { wch: 20 }, // Last Name
    { wch: 20 }, // Phone Number (needs space for +94 prefix)
    { wch: 20 }, // NIC Number
    { wch: 20 }, // Membership
    { wch: 20 }, // District
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');

  // Write to XLSX file
  XLSX.writeFile(wb, 'bulk_onboarding_template.xlsx');

  this.isLoading = false;
}

  viewFarmerStaff(id: number, name: string = '', phone: string = '') {
    this.router.navigate([`/steckholders/action/farmers/view-farmer-staff/${id}`], {
      queryParams: { fname: name, phone: phone }
    })
  }

  onSearchKeydown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;

    // Prevent space at the beginning of input
    if (event.key === ' ' &&
      (input.selectionStart === 0 || this.searchNIC === '')) {
      event.preventDefault();
    }
  }
}
