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
  cropNameSinhala?: string; // Add if exists in service
  cropNameTamil?: string; // Add if exists in service
  category: string;
  varietyCount: number;
  varietyList: string[];
  image?: string; // Make optional if not always present
  bgColor?: string; // Make optional if not always present
  createdAt?: string; // Add if exists in service
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
  ],
  templateUrl: './view-crop-group.component.html',
  styleUrl: './view-crop-group.component.css',
})
export class ViewCropGroupComponent {
  newCropCalender: NewCropCalender[] = [];
  newCropGroup: NewCropGroup[] = [];
  selectedCrop: any = null;
  isLoading = true;

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  hasData: boolean = true;

  searchTerm: string = '';

  constructor(
    private cropCalendarService: CropCalendarService,
    private http: HttpClient,
    private router: Router,
    public permissionService: PermissionService,
    public tokenService: TokenService
  ) {}

  ngOnInit() {
    this.fetchAllCropGroups();
  }

  fetchAllCropGroups(
    page: number = 1,
    limit: number = this.itemsPerPage,
    searchTerm: string = this.searchTerm
  ) {
    this.page = page;
    this.isLoading = true;

    this.cropCalendarService
      .fetchAllCropGroups(page, limit, searchTerm)
      .subscribe(
        (data) => {
          this.isLoading = false;
          this.newCropGroup = data.items;
          this.hasData = this.newCropGroup.length > 0;
          this.totalItems = data.total;
        },
        (error) => {
          this.isLoading = false;
        }
      );
  }

  clearSearch() {
    this.searchTerm = '';
    this.fetchAllCropGroups(1, this.itemsPerPage);
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllCropGroups(this.page, this.itemsPerPage);
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
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.cropCalendarService.deleteCropGroup(id).subscribe(
          (data: any) => {
            if (data) {
              Swal.fire(
                'Deleted!',
                'The crop group item has been deleted.',
                'success'
              );
              this.isLoading = false;
              this.fetchAllCropGroups();
            }
          },
          (error) => {
            Swal.fire(
              'Error!',
              'There was an error deleting the crop group.',
              'error'
            );
            this.isLoading = false;
          }
        );
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
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/plant-care/action']);
    }
  }

  add(): void {
    this.router.navigate(['/plant-care/action/create-crop-group']);
  }
}
