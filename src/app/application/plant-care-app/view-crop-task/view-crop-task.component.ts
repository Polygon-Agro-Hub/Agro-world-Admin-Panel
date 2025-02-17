import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { CropCalendarService } from '../../../services/plant-care/crop-calendar.service';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";


class CropTask {
  'cropId':string;
  'taskIndex': string;
  'days': string;
  'taskEnglish': string;
  'imageLink' : string;
  'videoLinkEnglish': string;
  'videoLinkSinhala': string;
  'videoLinkTamil': string;
  'id': string;
}

@Component({
  selector: 'app-view-crop-task',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './view-crop-task.component.html',
  styleUrl: './view-crop-task.component.css',
})
export class ViewCropTaskComponent implements OnInit {
  cropTask!: CropTask[];
  cropId!: string;
  isLoading = true;

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  hasData: boolean = true;  

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cropCalService: CropCalendarService
  ) {}

  ngOnInit(): void {
    this.cropId = this.route.snapshot.params['cropId'];
    this.fetchAllCropTask();
  }


  fetchAllCropTask(page: number = 1, limit: number = this.itemsPerPage) {
    this.isLoading = true;
    this.page = page;
    this.cropCalService.getAllCropTaskBycropId(this.cropId, page, limit)
      .subscribe(
        (res) => {
          this.cropTask = res.results;
          this.isLoading = false;
          this.hasData = this.cropTask.length > 0;
          this.totalItems = res.total;
        },
        (error) => {
          console.error('Error fetching news:', error);
          this.isLoading = false;
          // Handle error...
        }
      );
  }

  deleteCroptask(id: string, cropId:string, indexId:string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this crop Task item? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.cropCalService.deleteCropTask(id, cropId, indexId).subscribe(
          (data: any) => {
            if (data) {
              Swal.fire(
                'Deleted!',
                'The crop calendar item has been deleted.',
                'success'
              );
              this.fetchAllCropTask();
            }
          },
          (error) => {
            console.log('Error', error);
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

  editCropTask(id: string) {
    this.router.navigate([`admin/plant-care/action/edit-crop-task/${id}`]);
  }

  addNewTask(cropId:string, indexId:string){
    // console.log("New task",cropId,indexId);
    
    Swal.fire({
      text: 'Are you sure you want to add a new task?',
      showCancelButton: true,
      confirmButtonColor: '#8AC440',
      cancelButtonColor: '#ECECEC',
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
    }).then((result)=>{
      if (result.isConfirmed) {
        const uid = null;
        this.router.navigate([`admin/plant-care/action/add-new-crop-task/${cropId}/${indexId}/${uid}/${uid}`])
      }
    })

  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllCropTask(this.page, this.itemsPerPage); // Include itemsPerPage
  }

  
  

}
