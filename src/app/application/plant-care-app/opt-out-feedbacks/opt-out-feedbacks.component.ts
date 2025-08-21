import { CommonModule } from '@angular/common';
import { Component, OnDestroy, PLATFORM_ID, Inject, ViewChild } from '@angular/core';
import { OptOutFeedbacksService } from '../../../services/plant-care/opt-out-feedbacks.service';
import { HttpClient } from '@angular/common/http';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router } from '@angular/router';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';
import { isPlatformBrowser } from '@angular/common';
import { CanvasJSChart } from '@canvasjs/angular-charts';
import { ThemeService } from '../../../services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-opt-out-feedbacks',
  standalone: true,
  imports: [
    CommonModule,
    CanvasJSAngularChartsModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
  ],
  templateUrl: './opt-out-feedbacks.component.html',
  styleUrl: './opt-out-feedbacks.component.css',
})
export class OptOutFeedbacksComponent implements OnDestroy {
  isDarkMode = false;
  private themeSubscription!: Subscription;
  private storageEventSubscription!: Subscription;

  feedbacks: FeedbacksData[] = [];
  total!: number;
  deleteCount!: number;
  previousDeleteCount: number = 0;
  percentageChange: number = 0;
  feedbackData: FeedbacksDataChart[] = [];
  isLoading = true;
  MAX_COUNT: number = 2000;
  maxFeedbackCount: number = 0;
  chart: any;
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  hasData: boolean = true;
  @ViewChild('chartContainer') chartContainer!: CanvasJSChart;

  constructor(
    private plantcareService: OptOutFeedbacksService,
    private router: Router,
    public permissionService: PermissionService,
    public tokenService: TokenService,
    @Inject(PLATFORM_ID) private platformId: any,
    private themeService: ThemeService
  ) {}

  fetchAllFeedbacks(page: number = 1, limit: number = this.itemsPerPage) {
    this.page = page;
    this.plantcareService.getUserFeedbackDetails(page, limit).subscribe(
      (response: any) => {
        this.feedbacks = response.feedbackDetails;
        this.total = response.feedbackCount.Total;
        this.deleteCount = response.deletedUserCount.Total;
        this.isLoading = false;
        if (response.length > 0) {
          this.hasData = false;
        }
        this.calculatePercentageChange();
      },
      (error) => {
        this.isLoading = false;
      }
    );
  }

  calculatePercentageChange() {
    if (this.previousDeleteCount > 0) {
      this.percentageChange =
        ((this.deleteCount - this.previousDeleteCount) /
          this.previousDeleteCount) *
        100;
    } else {
      this.percentageChange = 0;
    }
  }

  ngOnInit() {
    this.setupThemeDetection();
    this.setupLocalStorageListener();
    this.fetchAllFeedbacks();
    this.loadFeedbackData();
  }

  private setupThemeDetection() {
    if (isPlatformBrowser(this.platformId)) {
      // Subscribe to theme changes from ThemeService
      this.themeSubscription = this.themeService.themeChanged$.subscribe((theme: string) => {
        this.isDarkMode = theme === 'dark';
        this.updateChartTheme();
      });

      // Initialize with current theme
      this.isDarkMode = this.themeService.isDarkTheme();
      console.log(this.isDarkMode,'------dark mode status------');
      
      this.updateChartTheme();
    }
  }

  private setupLocalStorageListener() {
    if (isPlatformBrowser(this.platformId)) {
      // Listen for storage events (changes to localStorage from other tabs/windows)
      this.storageEventSubscription = new Subscription(() => {
        window.removeEventListener('storage', this.storageEventListener);
      });
      
      window.addEventListener('storage', this.storageEventListener);
    }
  }

  private storageEventListener = (event: StorageEvent) => {
    if (event.key === 'theme' || event.key === 'isDarkMode') {
      // Check if the theme was changed in localStorage
      this.checkDarkModeFromLocalStorage();
    }
  };

  private checkDarkModeFromLocalStorage() {
    if (isPlatformBrowser(this.platformId)) {
      // Check localStorage directly for theme preference
      const storedTheme = localStorage.getItem('theme');
      const storedDarkMode = localStorage.getItem('isDarkMode');
      
      // Determine if dark mode is enabled
      const newDarkMode = storedTheme === 'dark' || storedDarkMode === 'true';
      
      // Only update if the value has changed
      if (newDarkMode !== this.isDarkMode) {
        this.isDarkMode = newDarkMode;
        this.updateChartTheme();
      }
    }
  }

  private updateChartTheme() {
    const isDark = this.isDarkMode;
    
    this.chartOptions = {
      ...this.chartOptions,
      theme: isDark ? 'dark2' : 'light1',
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
      axisX: {
        labelFontColor: isDark ? '#ffffff' : '#666666',
        lineColor: isDark ? '#444444' : '#d3d3d3',
        tickColor: isDark ? '#444444' : '#d3d3d3',
        titleFontColor: isDark ? '#ffffff' : '#333333'
      },
      axisY: {
        labelFontColor: isDark ? '#ffffff' : '#666666',
        lineColor: isDark ? '#444444' : '#d3d3d3',
        tickColor: isDark ? '#444444' : '#d3d3d3',
        gridColor: isDark ? '#444444' : '#f0f0f0',
        titleFontColor: isDark ? '#ffffff' : '#333333',
        includeZero: true,
      },
      toolTip: {
        backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
        borderColor: isDark ? '#444444' : '#d3d3d3',
        fontColor: isDark ? '#ffffff' : '#333333'
      },
      legend: {
        fontColor: isDark ? '#ffffff' : '#333333'
      }
    };

    // Force chart re-render
    this.renderChart();
  }

  private renderChart() {
    // Use setTimeout to ensure the chart re-renders in the next tick
    setTimeout(() => {
      if (this.chartContainer && this.chartContainer.chart) {
        this.chartContainer.chart.render();
      }
    });
  }

  ngOnDestroy() {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
    
    if (this.storageEventSubscription) {
      this.storageEventSubscription.unsubscribe();
    }
    
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('storage', this.storageEventListener);
    }
  }

  getColor(orderNumber: number): string {
    const colors = [
      '#FFF399',
      '#FFD462',
      '#FF8F61',
      '#FE7200',
      '#FF3B33',
      '#CD0800',
      '#850002',
      '#51000B',
      '#3B0214',
      '#777777',
    ];
    return colors[(orderNumber - 1) % colors.length];
  }

  loadFeedbackData() {
    this.plantcareService.getAllFeedbackListForBarChart().subscribe({
      next: (response) => {
        if (response && response.feedbacks && response.feedbacks.length > 0) {
          this.feedbackData = response.feedbacks;
          this.maxFeedbackCount = Math.max(
            ...this.feedbackData.map((f) => f.feedbackCount)
          );

          this.updateChartData(); // Separate method for updating chart data
        }
      },
      error: () => {},
    });
  }

  private updateChartData() {
    const dataPoints = this.feedbackData
      .slice()
      .reverse()
      .map((feedback) => ({
        label: `${feedback.orderNumber}`,
        y: feedback.feedbackCount,
        color: this.getColor(feedback.orderNumber),
      }));

    this.chartOptions = {
      ...this.chartOptions,
      data: [
        {
          type: 'bar',
          indexLabel: '{y}',
          yValueFormatString: '#,###',
          indexLabelFontColor: this.isDarkMode ? '#ffffff' : '#333333',
          dataPoints: dataPoints,
        },
      ],
    };

    this.applyCurrentTheme(); // Apply current theme settings
    this.renderChart();
  }

  private applyCurrentTheme() {
    const isDark = this.themeService.isDarkTheme();
    
    this.chartOptions = {
      ...this.chartOptions,
      theme: isDark ? 'dark2' : 'light1',
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
      axisX: {
        labelFontColor: isDark ? '#ffffff' : '#666666',
        lineColor: isDark ? '#444444' : '#d3d3d3',
        tickColor: isDark ? '#444444' : '#d3d3d3',
        titleFontColor: isDark ? '#ffffff' : '#333333'
      },
      axisY: {
        labelFontColor: isDark ? '#ffffff' : '#666666',
        lineColor: isDark ? '#444444' : '#d3d3d3',
        tickColor: isDark ? '#444444' : '#d3d3d3',
        gridColor: isDark ? '#444444' : '#f0f0f0',
        titleFontColor: isDark ? '#ffffff' : '#333333',
        includeZero: true,
      },
      toolTip: {
        backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
        borderColor: isDark ? '#444444' : '#d3d3d3',
        fontColor: isDark ? '#ffffff' : '#333333'
      },
      legend: {
        fontColor: isDark ? '#ffffff' : '#333333'
      }
    };
  }

  getBarWidth(feedbackCount: number): number {
    return (feedbackCount / this.maxFeedbackCount) * 100;
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllFeedbacks(this.page, this.itemsPerPage);
  }

  chartOptions: any = {
    license: true,
    animationEnabled: true,
    theme: 'light1', // Will be updated in ngOnInit
    backgroundColor: '#ffffff', // Will be updated in ngOnInit
    axisY: {
      includeZero: true,
      labelFontColor: '#666666', // Will be updated in ngOnInit
      lineColor: '#d3d3d3', // Will be updated in ngOnInit
      tickColor: '#d3d3d3', // Will be updated in ngOnInit
      gridColor: '#f0f0f0', // Will be updated in ngOnInit
    },
    axisX: {
      labelFontColor: '#666666', // Will be updated in ngOnInit
      lineColor: '#d3d3d3', // Will be updated in ngOnInit
      tickColor: '#d3d3d3', // Will be updated in ngOnInit
    },
    toolTip: {
      backgroundColor: '#ffffff', // Will be updated in ngOnInit
      borderColor: '#d3d3d3', // Will be updated in ngOnInit
      fontColor: '#333333' // Will be updated in ngOnInit
    },
    data: [
      {
        type: 'bar',
        indexLabel: '{y}',
        yValueFormatString: '#,###',
        maxBarWidth: 10,
        barThickness: 5,
        dataPoints: [],
      },
    ],
  };

  navigatePath(path: string) {
    this.router.navigate([path]);
  }
}

class FeedbacksData {
  firstName!: string;
  lastName!: string;
  userCreatedAt!: number;
  feedbacks!: string;
  deletedUserCreatedAt!: number;
  orderNumbers!: number;
}

class FeedbacksDataChart {
  orderNumber!: number;
  feedbackCount!: number;
}