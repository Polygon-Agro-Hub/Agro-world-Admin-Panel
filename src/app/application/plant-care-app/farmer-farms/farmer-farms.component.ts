import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { OngoingCultivationService } from '../../../services/plant-care/ongoing-cultivation.service';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';

interface FarmItem {
  no: number;
  farmId: number;
  farmName: string;
  area: string | number;
  district: string;
  staffCount: number;
  cultivationCount: number;
  createdDate: string;
  cultivationId?: number;
  cropName?: string;
  cropCalendarId?: number;
  onCulscropID?: number;
  regCode: string;

}

@Component({
  selector: 'app-farmer-farms',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, LoadingSpinnerComponent, FormsModule],
  templateUrl: './farmer-farms.component.html',
  styleUrls: ['./farmer-farms.component.css'],
})
export class FarmerFarmsComponent implements OnInit {
  farms: FarmItem[] = [];
  userFullName: string = '';
  userId: number | null = null;
  isLoading = true;
  hasData = true;
  ongCultivationId: number | null = null;
  searchText: string = '';


  constructor(
    private ongoingCultivationService: OngoingCultivationService,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute,
    public permissionService: PermissionService,
    public tokenService: TokenService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.userId = params['userId'] ? +params['userId'] : null;
      const userName = params['userName'] || '';
      this.ongCultivationId = params['ongCultivationId'] || null;
      if (this.userId) {
        this.userFullName = userName;
        this.fetchFarms();
      } else {
        console.error('No userId provided in query parameters');
        this.isLoading = false;
        this.hasData = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'User ID is required.',
          customClass: {
            popup: 'bg-white dark:bg-gray-800 text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
      }
    });
  }

  fetchFarms() {
    this.isLoading = true;
    this.searchText = this.searchText.trim();
    this.ongoingCultivationService.getFarmsByUser(this.userId, this.searchText).subscribe({
      next: (res) => {
        if (res.items && res.items.length > 0) {
          const user = res.items[0];
          this.userFullName = this.userFullName || `${user.firstName} ${user.lastName}`;
          this.farms = user.farms.map((farm: any, index: number) => ({
            no: index + 1,
            farmId: farm.farmId,
            farmName: farm.farmName,
            area: farm.farmIndex ?? '-',
            district: farm.farmDistrict,
            staffCount: farm.staffCount ?? 0,
            cultivationCount: farm.cultivationCount,
            regCode: farm.regCode ?? '-',
            createdDate: new Date(farm.farmCreatedAt).toLocaleDateString(),
            cultivationId: null,
            cropName: null,
            cropCalendarId: null,
            onCulscropID: null,
          }));

          this.farms.forEach((farm) => {
            this.ongoingCultivationService.getUserTasks(farm.farmId, this.userId).subscribe({
              next: (taskRes) => {
                if (taskRes.items && taskRes.items.length > 0) {
                  const firstTask = taskRes.items[0];
                  farm.cultivationId = firstTask.cultivationId;
                  farm.cropName = firstTask.cropName;
                  farm.cropCalendarId = firstTask.cropCalendarId;
                  farm.onCulscropID = firstTask.onCulscropID;
                }
              },
              error: (err) => {
                console.error(`Error fetching tasks for farm ${farm.farmId}`, err);
              },
            });
          });
        }
        this.hasData = this.farms.length > 0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching farms', err);
        this.isLoading = false;
        this.hasData = false;
      },
    });
  }


  viewTaskByUser(cultivationId: number, userId: number | null, userName: string) {
    if (!cultivationId || !userId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Cultivation ID or User ID is missing. Please try again.',
        customClass: {
          popup: 'bg-white dark:bg-gray-800 text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });
      return;
    }
    this.router.navigate(['/plant-care/action/view-crop-task-by-user'], {
      queryParams: { cultivationId, userId, userName },
    });
  }

  navigateToSlaveCropCalendar(cultivationId: number, userId: number) {
    this.router.navigate(['/plant-care/action/slave-crop-calendar'], {
      queryParams: { cultivationId, userId },
    });
  }

  viewCultivations(farm: any, cultivation: any) {
    if (!this.userId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'User ID is missing. Please try again.',
        customClass: {
          popup: 'bg-white dark:bg-gray-800 text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });
      return;
    }

    this.router.navigate(
      ['/plant-care/action/view-crop-task-by-user/user-task-list'],
      {
        queryParams: {
          cropCalendarId: cultivation.cropCalendarId,
          userId: this.userId,
          onCulscropID: cultivation.onCulscropID,
          cultivationId: cultivation.cultivationId,
          cropName: cultivation.cropName,
        },
      }
    );
  }

  viewTaskByUsers(cultivationId: number | null, userId: number | null) {
    if (!cultivationId || !userId) {
      console.warn('Missing IDs, cannot proceed');
      return;
    }
    const ongCultivationId = this.ongCultivationId
    this.router.navigate(['/plant-care/action/view-crop-task-by-user'], {
      queryParams: { cultivationId, userId, ongCultivationId },
    });
  }







  deleteFarm(farmId: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        popup: 'bg-white dark:bg-gray-800 text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.ongoingCultivationService.deleteFarm(farmId).subscribe({
          next: (res: any) => {
            Swal.fire({
              title: 'Deleted!',
              text: res.message,
              icon: 'success',
              customClass: {
                popup: 'bg-white dark:bg-gray-800 text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            });
            this.farms = this.farms.filter((f) => f.farmId !== farmId);
          },
          error: (err) => {
            console.error(err);
            Swal.fire({
              title: 'Error!',
              text: 'Failed to delete the farm.',
              icon: 'error',
              customClass: {
                popup: 'bg-white dark:bg-gray-800 text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            });
          },
        });
      }
    });
  }

  goBack() {
    this.location.back();
  }

  onSearch() {
    this.fetchFarms();
  }

  offSearch() {
    this.searchText = '';
    this.fetchFarms();
  }
}