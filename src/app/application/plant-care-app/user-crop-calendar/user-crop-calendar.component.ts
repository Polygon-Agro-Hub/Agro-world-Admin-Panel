import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OngoingCultivationService } from '../../../services/plant-care/ongoing-cultivation.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";

interface TaskList {
  id: any;
  slavecropcalendardaysId: any;
  taskIndex: any;
  startingDate: string;
  taskEnglish: string;
  imageLink: string;
  imageUpload: string;
  images: string[];
  videoLinkEnglish: string;
  videoLinkSinhala: string;
  videoLinkTamil: string;
  status: string;
  cropCalendarId: any;
}

@Component({
  selector: 'app-user-crop-calendar',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, NgxPaginationModule, LoadingSpinnerComponent],
  templateUrl: './user-crop-calendar.component.html',
  styleUrl: './user-crop-calendar.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UserCropCalendarComponent {
  cropCalendarId: any | null = null;
  userId: any | null = null;
  onCulscropID: any | null = null;
  taskList: TaskList[] = [];
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  isLoading = true;
  swiper: any;

  isModalOpen = false;
  selectedImages: string[] = [];

  constructor(private ongoingCultivationService: OngoingCultivationService, private http: HttpClient, private router: Router, private route: ActivatedRoute,) { }


  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.cropCalendarId = params['cropCalendarId'] ? +params['cropCalendarId'] : null;
      this.userId = params['userId'] ? +params['userId'] : null;
      this.onCulscropID = params['onCulscropID'] ? +params['onCulscropID'] : null;
      console.log("This is the crop calendar Id : ", this.cropCalendarId);
      console.log("This is the user Id : ", this.userId);
    });
    console.log(this.cropCalendarId);

    this.getchUserTaskList(this.cropCalendarId, this.userId);
    

  }

  

  getchUserTaskList(cropId: number, userId: number, page: number = 1, limit: number = this.itemsPerPage) {
    this.isLoading = true;
    console.log('Fetching tasks for page:', page);
    this.page = page;
    this.ongoingCultivationService.getUserTasks(cropId, userId, page, limit)
      .subscribe(
        (data) => {
          
          this.isLoading = false;
          this.taskList = data.items;
          console.log(this.taskList);

          this.totalItems = data.total;
        },
        (error) => {
          console.error('Error fetching tasks:', error);
          this.isLoading = false;
        }
      );
  }

  onPageChange(event: number) {
    this.page = event; // Set the current page to the event value
    this.getchUserTaskList(this.cropCalendarId, this.userId, this.page, this.itemsPerPage); // Fetch the data for the selected page
  }


  deleteCroptask(id: string, cropId: any, index: any): void {
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
        this.ongoingCultivationService.deleteUserCropTask(id, cropId, index, this.userId).subscribe(
          (data: any) => {
            if (data) {
              Swal.fire(
                'Deleted!',
                'The crop calendar item has been deleted.',
                'success'
              );
              this.getchUserTaskList(this.cropCalendarId, this.userId);
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

  updateStatus(id: number) {
    this.ongoingCultivationService.updateUserTaskStatus(id).subscribe(
      () => {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Status updated successfully!',
        });
        this.getchUserTaskList(this.cropCalendarId, this.userId);
      },
      (error) => {
        console.error('Error updating status', error);
        Swal.fire({
          icon: 'error',
          title: 'Unsuccess',
          text: 'Error updating status',
        });
      }
    );
  }


  editCropTask(id: any) {
    this.router.navigate(['/plant-care/action/view-crop-task-by-user/user-task-list/edit-user-task'], {
      queryParams: { id }
    });
    console.log(id);
  }


  addNewTask(cropId: string, indexId: string, userId: string) {
    // const cancelButtonStyles = `
    //   .custom-cancel-button {
    //     color: #8b8989 
    //     transition: color 0.3s ease, background-color 0.3s ease 
    //   }
    //   .custom-cancel-button:hover {
    //     color: #ffffff 
    //   }
      
      
    //   .dark .custom-cancel-button {
    //     background-color: #74788D 
    //     color: #e2e8f0  
    //   }
    //   .dark .custom-cancel-button:hover {
    //     background-color: #4a5568 
    //     color: #ffffff 
    //   }
    // `;
  
    Swal.fire({
      text: 'Are you sure you want to add a new task?',
      showCancelButton: true,
      // confirmButtonColor: '#8AC440',
      // cancelButtonColor: '#ECECEC',
      confirmButtonText: ' Yes ',
      cancelButtonText: 'Cancel',
      
      customClass: {
        popup: 'dark:bg-tileBlack dark:text-textDark',
        cancelButton: 'bg-[#ECECEC] text-[gray] dark:bg-[#74788D] dark:text-white dark:hover:bg-slate-600 dark:hover:text-white',
        actions: 'dark:bg-tileBlack',
        confirmButton: 'dark:focus:ring-offset-tileBlack dark:bg-[#8AC440] bg-[#8AC440]'
      },
      didOpen: (popup) => {
        // Add custom styles to the document
        const styleElement = document.createElement('style');
        // styleElement.textContent = cancelButtonStyles;
        document.head.appendChild(styleElement);
        
        // Check if dark mode is active and add class to body if needed
        const isDarkMode = document.documentElement.classList.contains('dark');
        if (isDarkMode) {
          document.body.classList.add('dark');
        }
      },
      willClose: () => {
        // Remove the custom styles when the dialog closes
        const styleElement = document.querySelector('style:last-of-type');
        if (styleElement) {
          styleElement.remove();
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate([`/plant-care/action/add-new-crop-task/${cropId}/${indexId}/${userId}/${this.onCulscropID}`]);
      }
    });
  }

  openImageSlider(images: string[]) {
    this.selectedImages = images;
    this.isModalOpen = true;
  }

  closeImageSlider() {
    this.isModalOpen = false;
  }

}
