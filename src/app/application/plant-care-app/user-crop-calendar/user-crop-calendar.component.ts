import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OngoingCultivationService } from '../../../services/plant-care/ongoing-cultivation.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';

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
  onCulscropID:number
}

@Component({
  selector: 'app-user-crop-calendar',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    NgxPaginationModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './user-crop-calendar.component.html',
  styleUrl: './user-crop-calendar.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UserCropCalendarComponent {
  cropCalendarId: any | null = null;
  cultivationId: any | null = null;
  userName: string = '';
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
  firstStartingDate: string | null = null;
  cropName: string = '';

  constructor(
    private ongoingCultivationService: OngoingCultivationService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    public permissionService: PermissionService,
    public tokenService: TokenService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.cropCalendarId = params['cropCalendarId']
        ? +params['cropCalendarId']
        : null;
      this.userId = params['userId'] ? +params['userId'] : null;
      this.onCulscropID = params['onCulscropID']
        ? +params['onCulscropID']
        : null;
      this.cultivationId = params['cultivationId']
        ? +params['cultivationId']
        : null;
      this.cropName = params['cropName'] ? params['cropName'] : ''; // Changed from userName to cropName
    });

    console.log('onCulscropID', this.onCulscropID, 'cropName', this.cropName); // Updated log
    this.getchUserTaskList(this.cropCalendarId, this.userId);
  }

  getchUserTaskList(
    cropId: number,
    userId: number,
    page: number = 1,
    limit: number = this.itemsPerPage
  ) {
    this.isLoading = true;
    this.page = page;
    this.ongoingCultivationService
      .getUserTasks(cropId, userId, page, limit)
      .subscribe(
        (data) => {
          console.log('User Task List Data:', data);

          this.isLoading = false;
          this.taskList = data.items;
          this.totalItems = data.total;
          this.firstStartingDate = data.firstStartingDate;
        },
        (error) => {
          this.isLoading = false;
        }
      );
  }

  onPageChange(event: number) {
    this.page = event;
    this.getchUserTaskList(
      this.cropCalendarId,
      this.userId,
      this.page,
      this.itemsPerPage
    );
  }

  deleteCroptask(id: string, cropId: any, index: any): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this  Crop Task? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.ongoingCultivationService
          .deleteUserCropTask(id, cropId, index, this.userId)
          .subscribe(
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
        Swal.fire({
          icon: 'error',
          title: 'Unsuccess',
          text: 'Error updating status',
        });
      }
    );
  }

  editCropTask(id: any) {
    this.router.navigate(
      [
        '/plant-care/action/view-crop-task-by-user/user-task-list/edit-user-task',
      ],
      {
        queryParams: { id },
      }
    );
  }

  addNewTask(
    cropId: string,
    indexId: string,
    userId: string,
    cultivationId: any,
    cropName: string // Changed from userName to cropName
  ) {
    Swal.fire({
      text: 'Are you sure you want to add a new task?',
      showCancelButton: true,
      confirmButtonText: ' Yes ',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'dark:bg-tileBlack dark:text-textDark',
        cancelButton:
          'bg-[#ECECEC] text-[gray] dark:bg-[#74788D] dark:text-white dark:hover:bg-slate-600 dark:hover:text-white',
        actions: 'dark:bg-tileBlack',
        confirmButton:
          'dark:focus:ring-offset-tileBlack dark:bg-[#3980C0] bg-[#3980C0]',
      },
    }).then((result) => {
      console.log('this.onCulscropID', this.onCulscropID);
      if (result.isConfirmed) {
        this.router.navigate(
          [
            `/plant-care/action/add-new-crop-task/${cropId}/${indexId}/${userId}/${this.onCulscropID}`,
          ],
          { queryParams: { cultivationId, cropName } } // Changed from userName to cropName
        );
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
