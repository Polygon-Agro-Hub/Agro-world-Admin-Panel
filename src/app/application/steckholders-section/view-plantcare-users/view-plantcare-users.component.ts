import { Component, OnInit } from '@angular/core';
import {
  HttpClient,
  HttpClientModule,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environment/environment';
import { PlantcareUsersService } from '../../../services/plant-care/plantcare-users.service';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";

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
  selector: 'app-view-plantcare-users',
  standalone: true,
  imports: [HttpClientModule, CommonModule, NgxPaginationModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './view-plantcare-users.component.html',
  styleUrl: './view-plantcare-users.component.css',
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
export class ViewPlantcareUsersComponent {
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

  constructor(private plantcareService: PlantcareUsersService, private http: HttpClient, private router: Router) { }

  

  fetchAllPlantCareUsers(page: number = 1, limit: number = this.itemsPerPage) {
    this.isLoading = true;
    this.plantcareService.getAllPlantCareUsers(page, limit, this.searchNIC)
      .subscribe(
        (response) => {
          this.isLoading = false;
          this.plantCareUser = response.items;
          console.log(this.plantCareUser);
          this.hasData = this.plantCareUser.length > 0;
          this.totalItems = response.total;
        },
        (error) => {
          console.error('Error fetching market prices:', error);
          if (error.status === 401) {
            // Handle unauthorized access (e.g., redirect to login)
          }
        }
      );
  }

  ngOnInit() {
    this.fetchAllPlantCareUsers(this.page, this.itemsPerPage);
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllPlantCareUsers(this.page, this.itemsPerPage); // Include itemsPerPage
  }

  searchPlantCareUsers() {
    this.page = 1;
    this.fetchAllPlantCareUsers(this.page, this.itemsPerPage);
  }

  clearSearch(): void {
    this.searchNIC = '';
    this.fetchAllPlantCareUsers(this.page, this.itemsPerPage);
  }


  deletePlantCareUser(id: any) {
    const token = localStorage.getItem('Login Token : ');
    
    if (!token) {
      console.error('No token found');
      return;
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    // Confirmation dialog using SweetAlert2
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
        this.http.delete(`${environment.API_BASE_URL}delete-plant-care-user/${id}`, { headers }).subscribe((data:any) => {
            if(data){
              Swal.fire('Deleted!', 'The plant care user has been deleted.', 'success');
              this.fetchAllPlantCareUsers();
            }
          },
          (error) => {
            console.error('Error deleting plant care user:', error);
            Swal.fire('Error', 'There was a problem deleting the plant care user.', 'error');
          }
        );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Your plant care user is safe', 'info');
      }
    });
  }
  

  


  




  // editPlantCareUser(id: number) {
  //   this.router.navigate(['/plant-care/edit-plantcare-users', id]);
  // }

  editPlantCareUser(id: number) {
    this.router.navigate(['/steckholders/farmers/edit-plantcare-users'], { queryParams: { id } });
  }


  addPlantCareUser(id: number) {
    this.router.navigate(['/plant-care/edit-plantcare-users']);
  }



  getTotalFixedAssets(id: number) {
    this.plantcareService.getTotalFixedAssets(id).subscribe(
      (response) => {
        console.log('API Response:', response); 
  
        if (Array.isArray(response) && response.length > 0) {
          const totalFixedAssetData = response[0];
  
          if (totalFixedAssetData && totalFixedAssetData.total_price) {
            
            this.fixedAssetTotal = parseFloat(totalFixedAssetData.total_price);
            console.log('Fixed Asset Total:', this.fixedAssetTotal); 
          } else {
            console.error('Error: total_price is missing or invalid in the response');
          }
        } else {
          console.error('Error: Response is not an array or is empty');
        }
      },
      (error) => {
        console.error('Error fetching total fixed assets:', error);
        if (error.status === 401) {
          // Handle unauthorized access (e.g., redirect to login)
        }
      }
    );
  }


  // openXlsxUploadDialog() {
  //   Swal.fire({
  //     title: 'Upload XLSX File',
  //     html: `
  //       <div class="upload-container">
  //       <input type="file" id="xlsx-file-input" accept=".xlsx, .xls" style="display: none;">
  //       <label for="xlsx-file-input" class="upload-box">
  //         <div class="upload-box-content" style="cursor: pointer;">
  //           <svg xmlns="http://www.w3.org/2000/svg" class="upload-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v8m0 0l-4-4m4 4l4-4M4 20h16" />
  //           </svg>
  //         </div>
  //           <p class="upload-text">Drag & drop your XLSX file here or click to select</p>
  //           <p id="selected-file-name" class="file-name">No file selected</p>
  //       </label>
  //     </div>
  //     `,
  //     showCancelButton: true,
  //     confirmButtonText: 'Upload',
  //     cancelButtonText: 'Cancel',
  //     allowOutsideClick: false,
  //     didOpen: () => {
  //       const fileInput = document.getElementById(
  //         'xlsx-file-input'
  //       ) as HTMLInputElement;
  //       const fileNameDisplay = document.getElementById('selected-file-name');
  //       fileInput.onchange = () => {
  //         if (fileInput.files && fileInput.files[0]) {
  //           fileNameDisplay!.textContent = `Selected file: ${fileInput.files[0].name}`;
  //         }
  //       };
  //     },
  //     preConfirm: () => {
  //       const fileInput = document.getElementById(
  //         'xlsx-file-input'
  //       ) as HTMLInputElement;
  //       if (fileInput.files && fileInput.files[0]) {
  //         return fileInput.files[0];
  //       }
  //       return null;
  //     },
  //   }).then((result) => {
  //     if (result.isConfirmed && result.value) {
  //       this.uploadXlsxFile(result.value);
  //     } else {
        
  //       console.log('XLSX upload skipped');
  //       // You can add any additional logic here for when the user skips the upload
  //     }
  //   });
  // }


  // uploadXlsxFile(file: File) {
  //   const formData = new FormData();
  //   formData.append('file', file); // Changed 'xlsxFile' to 'file' to match backend expectation

  //   this.plantcareService.uploadUserXlsxFile(file).subscribe(
  //     (res: any) => {
  //       // console.log('XLSX file uploaded successfully', res);
  //       Swal.fire(
  //         'Success',
  //         'XLSX file uploaded and data inserted successfully',
  //         'success'
  //       );
  //       //navigate table
  //       this.fetchAllPlantCareUsers(this.page, this.itemsPerPage);
  //     },
  //     (error: HttpErrorResponse) => {
  //       console.error('Error uploading XLSX file', error);
  //       let errorMessage = 'There was an error uploading the XLSX file. ';

       


  //       if (error.error && typeof error.error === 'string') {
  //         errorMessage = error.error;
  //       }
  //       Swal.fire('Error', errorMessage, 'error');
  //     }
  //   );
  // }
  
}
