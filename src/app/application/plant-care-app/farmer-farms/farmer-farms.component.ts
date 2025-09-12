// import { Component, OnInit } from '@angular/core';
// import { Router, ActivatedRoute } from '@angular/router'; // Import ActivatedRoute
// import Swal from 'sweetalert2';
// import { OngoingCultivationService } from '../../../services/plant-care/ongoing-cultivation.service';
// import { CommonModule, NgIf, NgFor } from '@angular/common';
// import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
// import { Location } from '@angular/common';

// interface FarmItem {
//   no: number;
//   farmId: number;
//   farmName: string;
//   area: string | number;
//   district: string;
//   staffCount: number;
//   cultivationCount: number;
//   createdDate: string;
// }

// interface OngoingCultivationItem {
//   cultivationId: number;
//   id: number;
//   userId: number;
//   firstName: string;
//   lastName: string;
//   NICnumber: string;
//   CropCount: string;
//   FarmCount: string;
// }
// @Component({
//   selector: 'app-farmer-farms',
//   standalone: true,
//   imports: [CommonModule, NgIf, NgFor, LoadingSpinnerComponent],
//   templateUrl: './farmer-farms.component.html',
//   styleUrls: ['./farmer-farms.component.css'],
// })
// export class FarmerFarmsComponent implements OnInit {
//   farms: FarmItem[] = [];
//   userFullName: string = '';
//   isLoading = true;
//   hasData = true;

//   constructor(
//     private ongoingCultivationService: OngoingCultivationService,
//     private router: Router,

//   private location: Location,
//     private route: ActivatedRoute // Inject ActivatedRoute
//   ) {}

//   ngOnInit(): void {
//     // Retrieve userId from query parameters
//     this.route.queryParams.subscribe((params) => {
//       const userId = params['userId'] ? +params['userId'] : null; // Convert to number
//       const userName = params['userName'] || '';
//       if (userId) {
//         this.userFullName = userName; // Set userFullName if provided
//         this.fetchFarms(userId);
//       } else {
//         console.error('No userId provided in query parameters');
//         this.isLoading = false;
//         this.hasData = false;
//       }
//     });
//   }

//   navigateToSlaveCropCalendar(cultivationId: number, userId: number) {
//     this.router.navigate(['/plant-care/action/slave-crop-calendar'], {
//       queryParams: {
//         cultivationId,
//         userId
//       }
//     });
//   }
//   goBack() {
//   this.location.back(); // This goes back in browser history
// }


//   fetchFarms(userId: number) {
//     this.isLoading = true;
//     this.ongoingCultivationService.getFarmsByUser(userId).subscribe({
//       next: (res) => {
//         if (res.items && res.items.length > 0) {
//           const user = res.items[0];
//           this.userFullName = this.userFullName || `${user.firstName} ${user.lastName}`; // Fallback to response if userName not provided
//           this.farms = user.farms.map((farm: any, index: number) => ({
//             no: index + 1,
//             farmId: farm.farmId,
//             farmName: farm.farmName,
//             area: farm.farmIndex ?? '-',
//             district: farm.farmDistrict,
//             staffCount: farm.staffCount ?? 0,
//             cultivationCount: farm.cultivationCount,
//             createdDate: new Date(farm.farmCreatedAt).toLocaleDateString(),
//           }));
//         }
//         this.hasData = this.farms.length > 0;
//         this.isLoading = false;
//       },
//       error: (err) => {
//         console.error('Error fetching farms', err);
//         this.isLoading = false;
//         this.hasData = false;
//       },
//     });
//   }



// viewCultivations(farm: any, cultivation: any) {
//   const userId = this.route.snapshot.queryParams['userId'];
//   if (!userId) {
//     Swal.fire({
//       icon: 'error',
//       title: 'Error',
//       text: 'User ID is missing. Please try again.',
//     });
//     return;
//   }

//   this.router.navigate(
//     ['/plant-care/action/view-crop-task-by-user/user-task-list'],
//     {
//       queryParams: {
//         cropCalendarId: cultivation.cropCalendarId,
//         userId,
//         onCulscropID: cultivation.onCulscropID,
//         cultivationId: cultivation.cultivationId,
//         cropName: cultivation.cropName,
//       },
//     }
//   );
// }


// viewTaskByUser(cultivationId: any, userId: any, userName: any) {
//   if (!cultivationId) return;
//   this.router.navigate(['/plant-care/action/view-crop-task-by-user'], {
//     queryParams: { cultivationId, userId, userName },
//   });
// }


// deleteFarm(farmId: number) {
//   Swal.fire({
//     title: 'Are you sure?',
//     text: ``,
//     icon: 'warning',
//     showCancelButton: true,
//     confirmButtonColor: '#d33',
//     cancelButtonColor: '#3085d6',
//     confirmButtonText: 'Yes, delete it!',
//   }).then((result) => {
//     if (result.isConfirmed) {
//       // Call the DELETE API via FarmService
//       this.ongoingCultivationService.deleteFarm(farmId).subscribe({
//         next: (res: any) => {
//           Swal.fire('Deleted!', res.message, 'success');
//           // Remove the farm from the list instantly (optional)
//           this.farms = this.farms.filter(f => f.farmId !== farmId);
//         },
//         error: (err) => {
//           console.error(err);
//           Swal.fire('Error!', 'Failed to delete the farm.', 'error');
//         },
//       });
//     }
//   });
// }



// }

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
  cultivationId?: number;
  cropName?: string;
  cropCalendarId?: number;
  onCulscropID?: number;
  
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
  userId: number | null = null;
  isLoading = true;
  hasData = true;



  constructor(
    private ongoingCultivationService: OngoingCultivationService,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.userId = params['userId'] ? +params['userId'] : null;
      const userName = params['userName'] || '';
      if (this.userId) {
        this.userFullName = userName;
        this.fetchFarms(this.userId);
      } else {
        console.error('No userId provided in query parameters');
        this.isLoading = false;
        this.hasData = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'User ID is required.',
        });
      }
    });
  }

  fetchFarms(userId: number) {
    this.isLoading = true;
    this.ongoingCultivationService.getFarmsByUser(userId).subscribe({
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
            createdDate: new Date(farm.farmCreatedAt).toLocaleDateString(),
            cultivationId: null,
            cropName: null,
            cropCalendarId: null,
            onCulscropID: null,
          }));

          this.farms.forEach((farm) => {
            this.ongoingCultivationService.getUserTasks(farm.farmId, userId).subscribe({
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

  // viewTaskByUsers(
  //   cultivationId: number | undefined,
  //   userId: number | null,
  //   userName: string,
  //   cropCalendarId: number | undefined,
  //   onCulscropID: number | undefined,
  //   cropName: string | undefined
  // ) {
  //   if (
  //     typeof cultivationId === 'number' &&
  //     typeof userId === 'number' &&
  //     typeof cropCalendarId === 'number' &&
  //     typeof onCulscropID === 'number'
  //   ) {
  //     this.router.navigate(['/plant-care/action/view-crop-task-by-user'], {
  //       queryParams: {
  //         cultivationId,
  //         userId,
  //         userName,
  //         cropCalendarId,
  //         onCulscropID,
  //         cropName: cropName || '',
  //       },
  //     });
  //   } else {
  //     Swal.fire({
  //       icon: 'error',
  //       title: 'Error',
  //       text: 'Missing required parameters.',
  //     });
  //   }
  // }

  viewTaskByUser(cultivationId: number, userId: number | null, userName: string) {
    if (!cultivationId || !userId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Cultivation ID or User ID is missing. Please try again.',
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
  this.router.navigate(['/plant-care/action/view-crop-task-by-user'], {
    queryParams: { cultivationId, userId},
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
    }).then((result) => {
      if (result.isConfirmed) {
        this.ongoingCultivationService.deleteFarm(farmId).subscribe({
          next: (res: any) => {
            Swal.fire('Deleted!', res.message, 'success');
            this.farms = this.farms.filter((f) => f.farmId !== farmId);
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error!', 'Failed to delete the farm.', 'error');
          },
        });
      }
    });
  }

  goBack() {
    this.location.back();
  }
}