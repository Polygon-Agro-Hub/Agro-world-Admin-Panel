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
import { CdkDragPlaceholder } from '@angular/cdk/drag-drop';

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
  onCulscropID: number;
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
    CdkDragPlaceholder,
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
  ongCultivationId: number | null = null;

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
      this.cropName = params['cropName'] ? params['cropName'] : '';
      this.ongCultivationId =
        params['ongCultivationId'] === 'null'
          ? null
          : params['ongCultivationId'];
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
      text: 'Do you really want to delete this Crop Task? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', // red-500
      cancelButtonColor: '#3b82f6', // blue-500
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.ongoingCultivationService
          .deleteUserCropTask(id, cropId, index, this.userId)
          .subscribe(
            (data: any) => {
              if (data) {
                this.getchUserTaskList(this.cropCalendarId, this.userId);

                // ✅ Success popup with auto close
                Swal.fire({
                  title: 'Deleted!',
                  text: 'The crop task has been deleted successfully.',
                  icon: 'success',
                  timer: 2000,
                  showConfirmButton: false,
                  customClass: {
                    popup:
                      'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                    title: 'font-semibold text-lg',
                  },
                });
              }
            },
            (error) => {
              Swal.fire({
                title: 'Error!',
                text: 'There was an error deleting the crop calendar.',
                icon: 'error',
                customClass: {
                  popup:
                    'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold text-lg',
                },
              });
            }
          );
      }
    });
  }

  updateStatus(id: number, currentStatus: string) {
    // Show confirmation popup
    Swal.fire({
      text: `Are you sure you want to update this task as "${
        currentStatus === 'pending' ? 'Completed' : 'Pending'
      }"?`,
      html: `<div class="px-4 py-4">
            <p class="mb-2 text-center">Are you sure you want to update this task as <strong>"${
              currentStatus === 'pending' ? 'Completed' : 'Pending'
            }"</strong>?</p>
            <p class="text-sm text-gray-600 italic text-center mt-3">Note: Past-due tasks will be marked as "Due".</p>
          </div>`,
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
      reverseButtons: true, // This will put "Cancel" on left and "Update" on right
      customClass: {
        popup:
          'bg-tileLight dark:bg-tileBlack text-black dark:text-white !py-4',
        title: 'font-semibold text-lg text-left',
        htmlContainer: 'text-left px-4 !mb-0',
        actions: 'mt-2 px-4 !justify-end gap-3', // Added gap between buttons
        confirmButton: 'px-6 py-2 text-sm font-medium rounded-md',
        cancelButton:
          'px-6 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // If user confirms, call the API
        this.ongoingCultivationService.updateUserTaskStatus(id).subscribe(
          () => {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Status updated successfully!',
              showConfirmButton: false,
              timer: 1500,
              customClass: {
                popup:
                  'bg-tileLight dark:bg-tileBlack text-black dark:text-white !py-4',
                title: 'font-semibold text-lg px-4',
                htmlContainer: 'px-4',
              },
            });
            this.getchUserTaskList(this.cropCalendarId, this.userId);
          },
          (error) => {
            Swal.fire({
              title: 'Error',
              text: 'Error updating status',
              customClass: {
                popup:
                  'bg-tileLight dark:bg-tileBlack text-black dark:text-white !py-4',
                title: 'font-semibold text-lg px-4',
                htmlContainer: 'px-4',
              },
            });
          }
        );
      }
    });
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
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    }).then((result) => {
      console.log('this.onCulscropID', this.onCulscropID);
      let ongCultivationId = this.ongCultivationId;
      if (result.isConfirmed) {
        this.router.navigate(
          [
            `/plant-care/action/add-new-crop-task/${cropId}/${indexId}/${userId}/${this.onCulscropID}`,
          ],
          { queryParams: { cultivationId, cropName, ongCultivationId } } // Changed from userName to cropName
        );
      }
    });
  }

  showStatusChangeError() {
  Swal.fire({
    title: 'Status Change Not Allowed!',
    text: 'The status of Pending or Due tasks cannot be changed!',
    confirmButtonColor: '#ECECEC',
    confirmButtonText: 'Close',
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white !py-4',
      title: 'font-semibold text-lg px-4',
      htmlContainer: 'px-4',
    },
  });
}

  openImageSlider(images: string[]) {
    this.selectedImages = images;
    this.isModalOpen = true;
  }

  closeImageSlider() {
    this.isModalOpen = false;
  }

  checkDueStatus(taskDate: string): boolean {
    const today = new Date();
    const taskDueDate = new Date(taskDate);
    return taskDueDate < today;
  }
}
