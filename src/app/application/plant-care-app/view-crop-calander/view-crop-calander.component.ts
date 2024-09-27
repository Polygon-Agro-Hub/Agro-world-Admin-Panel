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


interface NewCropCalender {
  id: number;
  cropName: string;
  variety: string;
  CultivationMethod: string;
  NatureOfCultivation: string;
  CropDuration: string;
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
  ],
  templateUrl: './view-crop-calander.component.html',
  styleUrl: './view-crop-calander.component.css',
})
export class ViewCropCalanderComponent implements OnInit {
  newCropCalender: NewCropCalender[] = [];
  selectedCrop: any = null;
  isLoading = true;

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  hasData: boolean = true;  

  constructor(private cropCalendarService: CropCalendarService, private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.fetchAllCropCalenders();
  }

  fetchAllCropCalenders(page: number = 1, limit: number = this.itemsPerPage) {
    console.log('Fetching market prices for page:', page); // Debug log
    this.page = page;
    this.cropCalendarService.fetchAllCropCalenders(page, limit)
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
       
        this.cropCalendarService.deleteCropCalender(id)
          .subscribe(
            (data: any) => {
              if(data){
                Swal.fire(
                  'Deleted!',
                  'The crop calendar item has been deleted.',
                  'success'
                  
                );
                this.fetchAllCropCalenders();
              }
             
            },
            (error) => {
              console.error('Error deleting crop calendar:', error);
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
    this.router.navigate(['/plant-care/create-crop-calender'], {
      queryParams: { id },
    });
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllCropCalenders(this.page, this.itemsPerPage); // Include itemsPerPage
  }

  ViewCroptask(id:number){
    this.router.navigate([`plant-care/view-crop-task/${id}`])
  }
}
