
import { Component } from '@angular/core';
import { CropCalendarService } from '../../../services/plant-care/crop-calendar.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';
import { DropdownModule } from 'primeng/dropdown';

interface NewCropCalender {
  id: number;
  cropNameEnglish: string;
  varietyEnglish: string;
  category: string;
  methodEnglish: string;
  natOfCulEnglish: string;
  cropDuration: string;
  createdAt: string;
}

interface NewCropGroup {
  id: number;
  cropNameEnglish: string;
  cropNameSinhala?: string;
  cropNameTamil?: string;
  category: string;
  varietyCount: number;
  varietyList: string[];
  costFeild?: string;
  incomeFeild?: string;
  image?: string;
  bgColor?: string;
  createdAt?: string;
}

interface CategoryOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-view-crop-group',
  standalone: true,
  imports: [
    FormsModule,
    HttpClientModule,
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
    DropdownModule,
  ],
  templateUrl: './view-crop-group.component.html',
  styleUrl: './view-crop-group.component.css',
})
export class ViewCropGroupComponent {
  // Properties for input fields
  cropNameEnglish: string = '';
  cropNameTamil: string = '';
  cropNameSinhala: string = '';

  // Allow only English letters
  allowOnlyEnglish(event: KeyboardEvent): void {
    const char = event.key;
    if (!/^[a-zA-Z\s]$/.test(char) && event.key.length === 1) {
      event.preventDefault();
    }
  }

  // Allow only Tamil letters (Unicode range: 0B80–0BFF)
  allowOnlyTamil(event: KeyboardEvent): void {
    const char = event.key;
    if (!/^[\u0B80-\u0BFF\s]$/.test(char) && event.key.length === 1) {
      event.preventDefault();
    }
  }

  // Allow only Sinhala letters (Unicode range: 0D80–0DFF)
  allowOnlySinhala(event: KeyboardEvent): void {
    const char = event.key;
    if (!/^[\u0D80-\u0DFF\s]$/.test(char) && event.key.length === 1) {
      event.preventDefault();
    }
  }
  newCropCalender: NewCropCalender[] = [];
  newCropGroup: NewCropGroup[] = [];
  selectedCrop: any = null;
  isLoading = true;

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  hasData: boolean = true;

  searchTerm: string = '';
  selectedCategory: string = '';
  categoryOptions: CategoryOption[] = [];

  constructor(
    private cropCalendarService: CropCalendarService,
    private http: HttpClient,
    private router: Router,
    public permissionService: PermissionService,
    public tokenService: TokenService
  ) { }

  ngOnInit() {
    this.initializeCategories();
    this.fetchAllCropGroups();
  }

  initializeCategories() {
    // Start with default options
    this.categoryOptions = [
      { label: 'Vegetables', value: 'Vegetables' },
      { label: 'Fruits', value: 'Fruit' },
      // { label: 'Grains', value: 'Grain' },
      { label: 'Cereals', value: 'Cereals' },
      { label: 'Spices', value: 'Spices' },
      { label: 'Mushrooms', value: 'Mushrooms' },
      { label: 'Legumes', value: 'Legumes' },
    ];

    // Fetch additional categories from backend
    this.cropCalendarService.fetchAllCropGroups(1, 1000).subscribe({
      next: (response) => {
        const backendCategories = [
          ...new Set(response.items.map((item) => item.category)),
        ];

        backendCategories.forEach((category) => {
          if (
            category &&
            !this.categoryOptions.some((opt) => opt.value === category)
          ) {
            this.categoryOptions.push({
              label: category,
              value: category,
            });
          }
        });

        console.log('Final category options:', this.categoryOptions);
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        // Still use the default options even if backend fails
      },
    });
  }

  fetchAllCropGroups(
    page: number = 1,
    limit: number = this.itemsPerPage,
    searchTerm: string = this.searchTerm,
    category: string = this.selectedCategory || ''
  ) {
    this.page = page;
    this.isLoading = true;

    this.cropCalendarService
      .fetchAllCropGroups(page, limit, searchTerm, category)
      .subscribe({
        next: (data) => {
          this.isLoading = false;
          this.newCropGroup = data.items;
          this.hasData = this.newCropGroup.length > 0;
          this.totalItems = data.total;
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error fetching crop groups:', error);
        },
      });
  }

  onCategoryChange() {
    this.page = 1;
    this.fetchAllCropGroups(
      this.page,
      this.itemsPerPage,
      this.searchTerm,
      this.selectedCategory
    );
  }

  onSearch() {
    // Reset to first page when search term changes
    this.page = 1;
    this.fetchAllCropGroups();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.page = 1;
    this.fetchAllCropGroups();
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllCropGroups(this.page);
  }


  preventLeadingSpace(event: KeyboardEvent, fieldName: string): void {
    const input = event.target as HTMLInputElement;
    if (event.key === ' ' && (input.selectionStart === 0 || !input.value.trim())) {
      event.preventDefault();
    }
  }

  formatSearchInput(): void {
    if (this.searchTerm) {
      this.searchTerm = this.searchTerm.replace(/^\s+/, '');
    }
  }

  deleteCropCalender(id: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this crop group item? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-white dark:bg-[#363636] text-gray-800 dark:text-white',
        title: 'dark:text-white',
        icon: '!border-gray-200 dark:!border-gray-500',
        confirmButton: 'hover:!bg-[#3085d6] dark:hover:!bg[#3085d6]',
        cancelButton: '',
        actions: 'gap-2'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.cropCalendarService.deleteCropGroup(id).subscribe({
          next: (data: any) => {
            Swal.fire({
              title: 'Deleted',
              text: 'Crop group has been deleted successfully.',
              icon: 'success',
              customClass: {
                popup: 'bg-white dark:bg-[#363636] text-gray-800 dark:text-white',
                title: 'dark:text-white',
              }
            });
            this.isLoading = false;
            this.fetchAllCropGroups();
          },
          error: (error) => {
            Swal.fire({
              title: 'Error',
              text: 'There was a problem deleting the crop group item.',
              icon: 'error',
              customClass: {
                popup: 'bg-white dark:bg-[#363636] text-gray-800 dark:text-white',
                title: 'dark:text-white',
              }
            });
            this.isLoading = false;
          },
        });
      }
    });
  }

  addVarietie(cid: number) {
    this.router.navigate(['/plant-care/action/create-crop-variety'], {
      queryParams: { cid },
    });
  }

  Varieties(id: number, name: any) {
    this.router.navigate(['/plant-care/action/view-crop-variety'], {
      queryParams: { id, name },
    });
  }

  editCropGroup(id: number) {
    this.router.navigate(['/plant-care/action/edit-crop-group'], {
      queryParams: { id },
    });
  }

  backCreate(): void {
    this.router.navigate(['/plant-care/action']);
  }

  add(): void {
    this.router.navigate(['/plant-care/action/create-crop-group']);
  }

  // In your TypeScript component
formatNumberWithCommas(value: any): string {
  if (value === null || value === undefined || value === 'N/A') {
    return 'N/A';
  }
  
  // Convert to string and remove any existing commas
  const numStr = value.toString().replace(/,/g, '');
  
  // Check if it's a valid number
  const num = parseFloat(numStr);
  if (isNaN(num)) {
    return 'N/A';
  }
  
  // Format with commas and 2 decimal places
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
}
