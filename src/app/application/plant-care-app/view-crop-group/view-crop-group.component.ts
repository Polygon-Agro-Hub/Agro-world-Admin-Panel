import { Component } from '@angular/core';
import { CropCalendarService } from '../../../services/plant-care/crop-calendar.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';


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
  category: string;
  varietyCount: number;
  varietyList: string[];
}


@Component({
  selector: 'app-view-crop-group',
  standalone: true,
  imports: [HttpClientModule,
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,],
  templateUrl: './view-crop-group.component.html',
  styleUrl: './view-crop-group.component.css'
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


  constructor(private cropCalendarService: CropCalendarService, private http: HttpClient, private router: Router) {}


  ngOnInit() {
    this.fetchAllCropGroups();
  }



  fetchAllCropGroups(page: number = 1, limit: number = this.itemsPerPage) {
    console.log('Fetching market prices for page:', page); // Debug log
    this.page = page;
    this.cropCalendarService.fetchAllCropGroups(page, limit)
      .subscribe(
        (data) => {
          this.isLoading = false;
          this.newCropGroup = data.items;
          console.log(this.newCropGroup);
          this.hasData = this.newCropGroup.length > 0;
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

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllCropGroups(this.page, this.itemsPerPage); // Include itemsPerPage
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
       
        this.cropCalendarService.deleteCropGroup(id)
          .subscribe(
            (data: any) => {
              if(data){
                Swal.fire(
                  'Deleted!',
                  'The crop group item has been deleted.',
                  'success'
                  
                );
                this.fetchAllCropGroups();
              }
             
            },
            (error) => {
              console.error('Error deleting crop group:', error);
              Swal.fire(
                'Error!',
                'There was an error deleting the crop group.',
                'error'
              );
            }
          );
      }
    });
  }
  
}
