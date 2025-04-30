import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NewsService } from '../../../services/plant-care/news.service';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { OngoingCultivationService } from '../../../services/plant-care/ongoing-cultivation.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';

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
  totalTasks: number;
  completedTasks: number;
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
  styleUrl: './slave-crop-calendar.component.css',
})
export class SlaveCropCalendarComponent {
  itemId: number | null = null;
  cultivtionItems: CultivationItems[] = [];
  cultivationId: any | null = null;
  name: string = '';
  category: string = '';
  hasData: boolean = true;
  newsItems: NewsItem[] = [];
  userId: any | null = null;
  isLoading = true;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private newsService: NewsService,
    private ongoingCultivationService: OngoingCultivationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.cultivationId = params['cultivationId']
        ? +params['cultivationId']
        : null;
      this.userId = params['userId'] ? +params['userId'] : null;
    });
    this.fetchAllNews(this.cultivationId);
  }

  calculateProgressPercentage(
    totalTasks: number,
    completedTasks: number
  ): number {
    if (totalTasks === 0) return 0;
    return (completedTasks / totalTasks) * 100;
  }

  getCultivation(id: any) {
    this.isLoading = true;
    this.ongoingCultivationService.getOngoingCultivationById(id).subscribe(
      (data) => {
        this.cultivtionItems = data;
        this.isLoading = false;
      },
      (error) => {
        if (error.status === 401) {
          this.isLoading = false;
        }
      }
    );
  }

  fetchAllNews(id: number) {
    this.isLoading = true;
    this.ongoingCultivationService.getOngoingCultivationById(id).subscribe(
      (data) => {
        this.newsItems = data;
        this.isLoading = false;
      },
      (error) => {
        if (error.status === 401) {
          this.isLoading = false;
        }
      }
    );
  }

  viewTaskByUser(cropCalendarId: any, userId: any, onCulscropID: any) {
    if (cropCalendarId) {
      this.router.navigate(
        ['/plant-care/action/view-crop-task-by-user/user-task-list'],
        { queryParams: { cropCalendarId, userId, onCulscropID } }
      );
    }
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }
}
