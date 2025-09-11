import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'; // Import ActivatedRoute
import Swal from 'sweetalert2';
import { OngoingCultivationService } from '../../../services/plant-care/ongoing-cultivation.service';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Location } from '@angular/common';

interface FarmItem {
  no: number;
  farmId: number;
  farmName: string;
  area: string | number;
  district: string;
  staffCount: number;
  cultivationCount: number;
  createdDate: string;
}

interface OngoingCultivationItem {
  cultivationId: number;
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  NICnumber: string;
  CropCount: string;
  FarmCount: string;
}
@Component({
  selector: 'app-farmer-farms',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, LoadingSpinnerComponent],
  templateUrl: './farmer-farms.component.html',
  styleUrls: ['./farmer-farms.component.css'],
})
export class FarmerFarmsComponent implements OnInit {
  farms: FarmItem[] = [];
  userFullName: string = '';
  isLoading = true;
  hasData = true;

  constructor(
    private ongoingCultivationService: OngoingCultivationService,
    private router: Router,

  private location: Location,
    private route: ActivatedRoute // Inject ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Retrieve userId from query parameters
    this.route.queryParams.subscribe((params) => {
      const userId = params['userId'] ? +params['userId'] : null; // Convert to number
      const userName = params['userName'] || '';
      if (userId) {
        this.userFullName = userName; // Set userFullName if provided
        this.fetchFarms(userId);
      } else {
        console.error('No userId provided in query parameters');
        this.isLoading = false;
        this.hasData = false;
      }
    });
  }

  navigateToSlaveCropCalendar(cultivationId: number, userId: number) {
    this.router.navigate(['/plant-care/action/slave-crop-calendar'], {
      queryParams: {
        cultivationId,
        userId
      }
    });
  }
  goBack() {
  this.location.back(); // This goes back in browser history
}


  fetchFarms(userId: number) {
    this.isLoading = true;
    this.ongoingCultivationService.getFarmsByUser(userId).subscribe({
      next: (res) => {
        if (res.items && res.items.length > 0) {
          const user = res.items[0];
          this.userFullName = this.userFullName || `${user.firstName} ${user.lastName}`; // Fallback to response if userName not provided
          this.farms = user.farms.map((farm: any, index: number) => ({
            no: index + 1,
            farmId: farm.farmId,
            farmName: farm.farmName,
            area: farm.farmIndex ?? '-',
            district: farm.farmDistrict,
            staffCount: farm.staffCount ?? 0,
            cultivationCount: farm.cultivationCount,
            createdDate: new Date(farm.farmCreatedAt).toLocaleDateString(),
          }));
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

viewCultivations(farm: any, cultivation: any) {
  const userId = this.route.snapshot.queryParams['userId'];
  if (!userId) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'User ID is missing. Please try again.',
    });
    return;
  }

  this.router.navigate(
    ['/plant-care/action/view-crop-task-by-user/user-task-list'],
    {
      queryParams: {
        cropCalendarId: cultivation.cropCalendarId,
        userId,
        onCulscropID: cultivation.onCulscropID,
        cultivationId: cultivation.cultivationId,
        cropName: cultivation.cropName,
      },
    }
  );
}


viewTaskByUser(cultivationId: any, userId: any, userName: any) {
  if (!cultivationId) return;
  this.router.navigate(['/plant-care/action/view-crop-task-by-user'], {
    queryParams: { cultivationId, userId, userName },
  });
}


deleteFarm(farmId: number) {
  Swal.fire({
    title: 'Are you sure?',
    text: ``,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
  }).then((result) => {
    if (result.isConfirmed) {
      // Call the DELETE API via FarmService
      this.ongoingCultivationService.deleteFarm(farmId).subscribe({
        next: (res: any) => {
          Swal.fire('Deleted!', res.message, 'success');
          // Remove the farm from the list instantly (optional)
          this.farms = this.farms.filter(f => f.farmId !== farmId);
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error!', 'Failed to delete the farm.', 'error');
        },
      });
    }
  });
}



}