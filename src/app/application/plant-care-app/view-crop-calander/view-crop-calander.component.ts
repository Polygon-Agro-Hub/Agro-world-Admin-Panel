import { Component, OnInit } from '@angular/core';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { response } from 'express';
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
  selectedCategory: any = null;
  isLoading = false;
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  hasData: boolean = true;
  searchText: string = '';
  category = [
    { name: 'Vegetables', value: 'Vegetables' },
    { name: 'Fruit', value: 'Fruit' },
    { name: 'Grain', value: 'Grain' },
    { name: 'Mushrooms', value: 'Mushrooms' },
  ];

  constructor(
    private cropCalendarService: CropCalendarService,
    private http: HttpClient,
    private router: Router,
    public permissionService: PermissionService, public tokenService: TokenService,
  ) {}

  ngOnInit() {
    this.fetchAllCropCalenders();
  }

  regStatusFil() {
    this.fetchAllCropCalenders();
  }

  fetchAllCropCalenders(
    page: number = 1,
    limit: number = this.itemsPerPage,
    search: string = this.searchText,
    category: string = this.selectedCategory
  ) {
    console.log('Fetching market prices for page:', page); // Debug log
    this.page = page;
    this.isLoading = true;
    this.cropCalendarService
      .fetchAllCropCalenders(page, limit, search, category)
      .subscribe(
        (data) => {
          this.isLoading = false;
          this.newCropCalender = data.items;
          this.hasData = this.newCropCalender.length > 0;
          this.totalItems = data.total;
        },
        (error) => {
          console.error('Error fetch news:', error);
          if (error.status === 401) {
            this.isLoading = false;
          }
        }
      );
  }

  deleteCropCalender(id: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this crop calendar item? This action cannot be undone.',
      icon: 'warning',
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
              Swal.fire(
                'Deleted!',
                'The crop calendar item has been deleted.',
                'success'
              );
              this.fetchAllCropCalenders();
            }
          },
          (error) => {
            Swal.fire(
              'Error!',
              'There was an error deleting the crop calendar.',
              'error'
            );
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
    this.fetchAllCropCalenders(this.page, this.itemsPerPage, this.searchText);
  }

  offSearch() {
    this.searchText = '';
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
