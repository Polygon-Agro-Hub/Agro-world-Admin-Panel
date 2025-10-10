import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CropCalendarService } from '../../../services/plant-care/crop-calendar.service';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';

interface NewCropCalender {
  id: number;
  cropNameEnglish: string;
  varietyNameEnglish: string;
  category: string;
  method: string;
  natOfCul: string;
  cropDuration: string;
  createdAt: string;
}

@Component({
  selector: 'app-view-crop-calander',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
    FormsModule,
    DropdownModule,
  ],
  templateUrl: './view-crop-calander.component.html',
  styleUrl: './view-crop-calander.component.css',
})
export class ViewCropCalanderComponent implements OnInit {
  newCropCalender: NewCropCalender[] = [];
  selectedCrop: any = null;
  selectedCategory: string | null = null; // Keep as string | null for p-dropdown
  isLoading = false;
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  hasData: boolean = true;
  searchText: string = '';
  category = [
    { name: 'Vegetables', value: 'Vegetables' },
    { name: 'Fruits', value: 'Fruit' },
    // { name: 'Grains', value: 'Grain' },
    { name: 'Cereals', value: 'Cereals' },
    { name: 'Spices', value: 'Spices' },
    { name: 'Mushrooms', value: 'Mushrooms' },
    { name: 'Legumes', value: 'Legumes' },

  ];

  constructor(
    private cropCalendarService: CropCalendarService,
    private http: HttpClient,
    private router: Router,
    public permissionService: PermissionService,
    public tokenService: TokenService
  ) { }

  ngOnInit() {
    this.fetchAllCropCalenders();
  }

  regStatusFil() {
    this.page = 1; // Reset to first page on filter change
    this.fetchAllCropCalenders();
  }

  fetchAllCropCalenders(
    page: number = 1,
    limit: number = this.itemsPerPage,
    search: string = this.searchText,
    category: string | null = this.selectedCategory
  ) {
    this.page = page;
    this.isLoading = true;
    const trimmedSearch = search.trim();
    // If category is null or empty string, pass empty string to service
    const categoryParam = category ? category : '';
    this.cropCalendarService
      .fetchAllCropCalenders(page, limit, trimmedSearch, categoryParam)
      .subscribe(
        (data) => {
          this.isLoading = false;
          this.newCropCalender = data.items;
          this.hasData = this.newCropCalender.length > 0;
          this.totalItems = data.total;
        },
        (error) => {
          console.error('Error fetching crop calendars:', error);
          this.isLoading = false;
          if (error.status === 401) {
            Swal.fire('Unauthorized', 'Please log in again.', 'error');
          } else {
            Swal.fire('Error', 'Failed to fetch crop calendars.', 'error');
          }
        }
      );
  }
deleteCropCalender(id: any) {
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you really want to delete this crop calendar item? This action cannot be undone.',
    icon: 'warning',
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold text-lg',
      htmlContainer: 'text-left',
    },
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
  }).then((result) => {
    if (result.isConfirmed) {
      this.cropCalendarService.deleteCropCalender(id).subscribe(
        (data: any) => {
          if (data) {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Crop calendar has been deleted successfully.',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            });
            this.fetchAllCropCalenders();
          }
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'There was an error deleting the crop calendar.',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
        }
      );
    }
  });
}

  editCropCalender(id: number) {
    this.router.navigate(['/plant-care/action/edit-crop-calender'], {
      queryParams: { id },
    });
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllCropCalenders(this.page, this.itemsPerPage, this.searchText);
  }

  onSearch() {
    console.log('Search triggered with text:', this.searchText);
    this.searchText = this.searchText.trim(); // Trim leading and trailing spaces
    this.page = 1; // Reset to first page on search
    this.fetchAllCropCalenders(this.page, this.itemsPerPage, this.searchText);
  }

  offSearch() {
    this.searchText = '';
    this.page = 1; // Reset to first page on clear
    this.fetchAllCropCalenders(this.page, this.itemsPerPage, this.searchText);
  }

  ViewCroptask(id: number) {
    this.router.navigate([`plant-care/action/view-crop-task/${id}`]);
  }

  Back(): void {
    this.router.navigate(['/plant-care/action']);
  }

  addNew(): void {
    this.router.navigate(['/plant-care/action/create-crop-calender']);
  }
}