import { CommonModule } from '@angular/common';
import { Component, OnDestroy, PLATFORM_ID,Inject, ViewChild } from '@angular/core';
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
  private darkModeMediaQuery!: MediaQueryList;
  private darkModeListener!: (e: MediaQueryListEvent) => void;

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
         @Inject(PLATFORM_ID) private platformId: any
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
    this.setupDarkModeDetection();
    this.fetchAllFeedbacks();
    this.loadFeedbackData();
  }

  private setupDarkModeDetection() {
    if (isPlatformBrowser(this.platformId)) {
      this.darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.isDarkMode = this.darkModeMediaQuery.matches;
      
      this.darkModeListener = (e: MediaQueryListEvent) => {
        this.isDarkMode = e.matches;
        this.updateChartTheme();
      };
      
      this.darkModeMediaQuery.addEventListener('change', this.darkModeListener);
    }
  }

  private updateChartTheme() {
  this.chartOptions = {
    ...this.chartOptions,
    theme: this.isDarkMode ? 'dark2' : 'light1',
    backgroundColor: this.isDarkMode ? '#1e1e1e' : '#ffffff',
    axisX: {
      labelFontColor: this.isDarkMode ? '#ffffff' : '#666666',
      lineColor: this.isDarkMode ? '#444444' : '#d3d3d3',
      tickColor: this.isDarkMode ? '#444444' : '#d3d3d3'
    },
    axisY: {
      labelFontColor: this.isDarkMode ? '#ffffff' : '#666666',
      lineColor: this.isDarkMode ? '#444444' : '#d3d3d3',
      tickColor: this.isDarkMode ? '#444444' : '#d3d3d3',
      gridColor: this.isDarkMode ? '#444444' : '#f0f0f0',
      includeZero: true,
    },
    toolTip: {
      backgroundColor: this.isDarkMode ? '#2d2d2d' : '#ffffff',
      borderColor: this.isDarkMode ? '#444444' : '#d3d3d3',
      fontColor: this.isDarkMode ? '#ffffff' : '#333333'
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
    if (isPlatformBrowser(this.platformId) && this.darkModeMediaQuery && this.darkModeListener) {
      this.darkModeMediaQuery.removeEventListener('change', this.darkModeListener);
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
  this.chartOptions = {
    ...this.chartOptions,
    theme: this.isDarkMode ? 'dark2' : 'light1',
    backgroundColor: this.isDarkMode ? '#1e1e1e' : '#ffffff',
    axisX: {
      labelFontColor: this.isDarkMode ? '#ffffff' : '#666666',
      lineColor: this.isDarkMode ? '#444444' : '#d3d3d3',
      tickColor: this.isDarkMode ? '#444444' : '#d3d3d3'
    },
    axisY: {
      labelFontColor: this.isDarkMode ? '#ffffff' : '#666666',
      lineColor: this.isDarkMode ? '#444444' : '#d3d3d3',
      tickColor: this.isDarkMode ? '#444444' : '#d3d3d3',
      gridColor: this.isDarkMode ? '#444444' : '#f0f0f0',
      includeZero: true,
    },
    toolTip: {
      backgroundColor: this.isDarkMode ? '#2d2d2d' : '#ffffff',
      borderColor: this.isDarkMode ? '#444444' : '#d3d3d3',
      fontColor: this.isDarkMode ? '#ffffff' : '#333333'
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
    axisY: {
      includeZero: true,
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
