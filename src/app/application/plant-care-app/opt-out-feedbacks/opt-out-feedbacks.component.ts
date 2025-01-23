import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { OptOutFeedbacksService } from '../../../services/plant-care/opt-out-feedbacks.service';
import { HttpClient } from '@angular/common/http';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';

@Component({
  selector: 'app-opt-out-feedbacks',
  standalone: true,
  imports: [CommonModule, CanvasJSAngularChartsModule],
  templateUrl: './opt-out-feedbacks.component.html',
  styleUrl: './opt-out-feedbacks.component.css',
})
export class OptOutFeedbacksComponent {
  feedbacks: FeedbacksData[] = [];
  total!: number;
  deleteCount!: number;
  previousDeleteCount: number = 0;
  percentageChange: number = 0;
  feedbackData : FeedbacksDataChart[] = [];
  MAX_COUNT : number = 2000;
  maxFeedbackCount: number = 0;
  chart: any;

  constructor(
    private plantcareService: OptOutFeedbacksService,
    private http: HttpClient
  ) {}

  fetchAllFeedbacks() {
    this.plantcareService.getUserFeedbackDetails().subscribe(
      (response) => {
        console.log(response);
        this.feedbacks = response.feedbackDetails;
        this.total = response.feedbackCount.Total;
        this.deleteCount = response.deletedUserCount.Total;

        this.calculatePercentageChange();
      },
      (error) => {
        console.error(error);
        if (error.ststus === 401) {
        }
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
    this.fetchAllFeedbacks();
    this.loadFeedbackData();
  }


  getColor(orderNumber: number): string {
    const colors = [
      "#FFF399", "#FFD462", "#FF8F61", "#FE7200", "#FF3B33",
      "#CD0800", "#850002", "#51000B", "#3B0214", "#777777",
    ];
    return colors[(orderNumber - 1) % colors.length];
  }

  loadFeedbackData() {
    this.plantcareService.getAllFeedbackListForBarChart().subscribe({
      next: (response) => {
        if (response && response.feedbacks && response.feedbacks.length > 0) {
          this.feedbackData = response.feedbacks;
          
          this.maxFeedbackCount = Math.max(...this.feedbackData.map(f => f.feedbackCount));
  
          const dataPoints = this.feedbackData
              .slice()
              .reverse()
              .map((feedback) => ({
                label: `${feedback.orderNumber}`,
                y: feedback.feedbackCount,
                color: this.getColor(feedback.orderNumber)
            }));

          this.chartOptions = {
            ...this.chartOptions,
            data: [{
              type: "bar",
              indexLabel: "{y}",
              yValueFormatString: "#,###",
              dataPoints: dataPoints
            }]
          };
        } else {
          console.warn('No feedback data received');
        }
      },
      error: (error) => {
        console.error('Error loading feedback data:', error);
      }
    });
  }
  
  
  

  getBarWidth(feedbackCount: number): number {
    return (feedbackCount / this.maxFeedbackCount) * 100;
  }

  chartOptions: any = {
    license: true,
    animationEnabled: true,
    axisY: {
      includeZero: true,
      
    },
    data: [
      {
        type: "bar",
        indexLabel: "{y}", // Show values on the bars
        yValueFormatString: "#,###", // Format for bar values
        maxBarWidth: 10, // Reduce bar width
        barThickness: 5, // Reduce bar thickness
        dataPoints: [], // Initialized as empty, will be updated dynamically
      },
    ],
  };
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
