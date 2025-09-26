import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NewsService } from '../../../services/plant-care/news.service';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { OngoingCultivationService } from '../../../services/plant-care/ongoing-cultivation.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';

interface CultivationItems {
  id: any;
  cropName: string;
  variety: string;
  cultivationMethod: string;
  natureOfCultivation: string;
  cropDuration: string;
}

interface NewsItem {
  ongoingCultivationId: any;
  cropName: string;
  cropCalendar: number;
  variety: string;
  cultivationMethod: string;
  natureOfCultivation: string;
  cropDuration: string;
  longitude: any;
  latitude: any;
  modifyBy: string;
  userLastName: string;
  userFirstName: string;
  totalTasks: number;
  completedTasks: number;
  extentac: number;
  startedAt: Date;
}

@Component({
  selector: 'app-slave-crop-calendar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    LoadingSpinnerComponent,
    MatProgressBarModule,
  ],
  templateUrl: './slave-crop-calendar.component.html',
  styleUrls: ['./slave-crop-calendar.component.css'],
})
export class SlaveCropCalendarComponent implements OnInit {
  itemId: number | null = null;
  cultivationItems: CultivationItems[] = []; // Fixed typo
  cultivationId: any | null = null;
  name: string = '';
  category: string = '';
  hasData: boolean = true;
  newsItems: NewsItem[] = [];
  userId: any | null = null;
  isLoading = true;
  userName: string = '';
  ongCultivationId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private newsService: NewsService,
    private ongoingCultivationService: OngoingCultivationService,
    private router: Router,
    private location: Location,
    public permissionService: PermissionService,
    public tokenService: TokenService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.cultivationId = params['cultivationId'] ? +params['cultivationId'] : null;
      this.userId = params['userId'] ? +params['userId'] : null;
      this.ongCultivationId = params['ongCultivationId'] === 'null' ? null : params['ongCultivationId'];

      console.log('This is the cultivation Id : ', this.cultivationId);
      console.log('This is the user Id : ', this.userId);

      if (this.cultivationId && this.userId) {
        this.fetchAllNews(this.cultivationId, this.userId);
        // TODO: Fetch userName (e.g., via userService.getUserById(this.userId))
        // Example:
        // this.userService.getUserById(this.userId).subscribe(user => {
        //   this.userName = user.name || 'Unknown User';
        // });
      } else {
        // Fallback for invalid params
        this.newsItems = [];
        this.hasData = false;
        this.isLoading = false;
      }
    });
  }

  calculateProgressPercentage(totalTasks: number, completedTasks: number): number {
    if (totalTasks === 0) return 0;
    return (completedTasks / totalTasks) * 100;
  }

  getCultivation(cultivationId: number, userId: number) {
    this.isLoading = true;
    this.ongoingCultivationService.getOngoingCultivationById(cultivationId, userId).subscribe(
      (data) => {
        this.cultivationItems = data || []; // Fixed typo and added default
        this.hasData = this.cultivationItems.length > 0;
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.hasData = false;
        console.error(error);
      }
    );
  }

  fetchAllNews(cultivationId: number, userId: number) {
    this.isLoading = true;
    this.ongoingCultivationService.getOngoingCultivationById(cultivationId, userId).subscribe(
      (data) => {
        console.log('Fetched data:', data);
        this.newsItems = data || [];
        this.hasData = this.newsItems.length > 0; // Update hasData

        // Set userName from first item (all items have same user)
        if (this.newsItems.length > 0) {
          const user = this.newsItems[0];
          this.userName = `${user.userFirstName || ''} ${user.userLastName || ''}`.trim();
        } else {
          this.userName = 'Unknown User';
        }

        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.hasData = false; // Show no-data on error
        this.newsItems = [];
        this.userName = 'Unknown User';
        console.error('Error fetching data:', error);
      }
    );
  }

  viewTaskByUser(
    cropCalendarId: any,
    userId: any,
    onCulscropID: any,
    cultivationId: any,
    cropName: any
  ) {
    let ongCultivationId = this.ongCultivationId;
    if (cropCalendarId) {
      this.router.navigate(
        ['/plant-care/action/view-crop-task-by-user/user-task-list'],
        {
          queryParams: {
            cropCalendarId,
            userId,
            onCulscropID,
            cultivationId,
            cropName,
            ongCultivationId
          },
        }
      );
    }
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  async deleteCultivation(id: number, index: number) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
    },
    });

    if (result.isConfirmed) {
      this.isLoading = true;
      this.ongoingCultivationService.deleteOngoingCultivation(id).subscribe({
        next: () => {
  this.newsItems.splice(index, 1);
  this.hasData = this.newsItems.length > 0; // Update hasData after deletion
  this.isLoading = false;
  Swal.fire({
    title: 'Deleted!',
    text: 'Cultivation has been deleted.',
    icon: 'success',
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
    },
  });
},
error: (err) => {
  this.isLoading = false;
  console.error('Error deleting cultivation:', err);
  Swal.fire({
    title: 'Error!',
    text: 'Failed to delete cultivation',
    icon: 'error',
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
    },
  });
},
      });
    }
  }

  goBack() {
    this.location.back();
  }

  formatDuration(duration: string): string {
    if (!duration) return '';

    const days = parseInt(duration, 10);

    if (days >= 365) {
      const years = Math.floor(days / 365);
      const remainingDays = days % 365;
      return `${years} year${years > 1 ? 's' : ''}${remainingDays > 0
        ? ` ${remainingDays} day${remainingDays > 1 ? 's' : ''}`
        : ''
        }`;
    } else if (days >= 30) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      return `${months} month${months > 1 ? 's' : ''}${remainingDays > 0
        ? ` ${remainingDays} day${remainingDays > 1 ? 's' : ''}`
        : ''
        }`;
    } else if (days >= 7) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      return `${weeks} week${weeks > 1 ? 's' : ''}${remainingDays > 0
        ? ` ${remainingDays} day${remainingDays > 1 ? 's' : ''}`
        : ''
        }`;
    } else {
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
  }
}