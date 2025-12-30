import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { OptOutFeedbacksService } from '../../../services/plant-care/opt-out-feedbacks.service';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router } from '@angular/router';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';
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
export class OptOutFeedbacksComponent {
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
    public tokenService: TokenService
  ) { }

  ngOnInit() {
    this.fetchAllFeedbacks();
    this.loadFeedbackData();
  }

  fetchAllFeedbacks(page: number = 1, limit: number = this.itemsPerPage) {
    this.page = page;
    this.isLoading = true;

    this.plantcareService.getUserFeedbackDetails(page, limit).subscribe(
      (response: any) => {
        this.feedbacks = response.feedbackDetails;
        this.total = response.feedbackCount.Total;
        this.deleteCount = response.deletedUserCount.Total;
        this.totalItems = response.feedbackCount.Total;

        this.hasData = this.feedbacks.length === 0;

        this.isLoading = false;
        this.calculatePercentageChange();
      },
      () => {
        this.isLoading = false;
        this.hasData = true;
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

          this.updateChartData();
        }
      },
      error: () => { },
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
          indexLabelFontColor: '#333333',
          dataPoints: dataPoints,
        },
      ],
    };

    this.renderChart();
  }

  private renderChart() {
    setTimeout(() => {
      if (this.chartContainer && this.chartContainer.chart) {
        this.chartContainer.chart.render();
      }
    });
  }

  getBarWidth(feedbackCount: number): number {
    return (feedbackCount / this.maxFeedbackCount) * 100;
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllFeedbacks(this.page, this.itemsPerPage);
  }

  chartOptions: any = {
    license: false,
    animationEnabled: true,
    // theme: 'light1',
    backgroundColor: 'transparent',
    axisY: {
      includeZero: true,
      labelFontColor: '#666666',
      lineColor: '#d3d3d3',
      tickColor: '#d3d3d3',
      gridColor: '#f0f0f0',
    },
    axisX: {
      labelFontColor: '#666666',
      lineColor: '#d3d3d3',
      tickColor: '#d3d3d3',
    },
    toolTip: {
      backgroundColor: '#ffffff',
      borderColor: '#d3d3d3',
      fontColor: '#333333'
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