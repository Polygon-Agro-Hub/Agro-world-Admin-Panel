import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OngoingCultivationService } from '../../../services/plant-care/ongoing-cultivation.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

interface TaskList {
  id: any;
  slavecropcalendardaysId: any;
  taskIndex : any;
  days: string;
  taskEnglish: string;
  status: string;
}

@Component({
  selector: 'app-user-crop-calendar',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './user-crop-calendar.component.html',
  styleUrl: './user-crop-calendar.component.css'
})
export class UserCropCalendarComponent {
  cropCalendarId: any | null = null;
  userId: any | null = null;
  taskList: TaskList[] = [];

  constructor(private ongoingCultivationService: OngoingCultivationService, private http: HttpClient, private router: Router,  private route: ActivatedRoute,) {}

  
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.cropCalendarId = params['cropCalendarId'] ? +params['cropCalendarId'] : null; 
      this.userId = params['userId'] ? +params['userId'] : null;     
      console.log("This is the crop calendar Id : ", this.cropCalendarId);
      console.log("This is the user Id : ", this.userId);
    });
    console.log(this.cropCalendarId);
    
    this.getchUserTaskList(this.cropCalendarId, this.userId);
    
  }

  getchUserTaskList(cropId: number, userId : number) {
    this.ongoingCultivationService.getUserTasks(cropId, userId)
      .subscribe(
        (data) => {
          this.taskList = data;
          console.log(this.taskList);
        },
        (error) => {
          console.error('Error fetching ongoing cultivations:', error);
          if (error.status === 401) {
            // Handle unauthorized access (e.g., redirect to login)
          }
        }
      );
  }

  deleteCroptask(id: string): void {
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
        this.ongoingCultivationService.deleteUserCropTask(id).subscribe(
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
    this.router.navigate(['plant-care/view-crop-task-by-user/user-task-list/edit-user-task'], { 
      queryParams: { id } 
    });
    console.log(id);
  }


  addNewTask(cropId: string, indexId: string, userId: string) {
    const cancelButtonStyles = `
      .custom-cancel-button {
        color: #8b8989 !important;
        transition: color 0.3s ease;
      }
      .custom-cancel-button:hover {
        color: #ffffff !important; /* Change this to your desired hover color */
      }
    `;
  
    Swal.fire({
      text: 'Are you sure you want to add a new task?',
      showCancelButton: true,
      confirmButtonColor: '#8AC440',
      cancelButtonColor: '#ECECEC',
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
      customClass: {
        cancelButton: 'custom-cancel-button'
      },
      didOpen: (popup) => {
        // Add custom styles to the document
        const styleElement = document.createElement('style');
        styleElement.textContent = cancelButtonStyles;
        document.head.appendChild(styleElement);
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
        this.router.navigate([`plant-care/add-new-crop-task/${cropId}/${indexId}/${userId}`]);
      }
    });
  }

}
