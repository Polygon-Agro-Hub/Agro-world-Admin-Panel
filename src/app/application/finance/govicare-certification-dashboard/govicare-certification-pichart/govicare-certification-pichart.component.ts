import {
  Component,
  AfterViewInit,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-govicare-certification-pichart',
  standalone: true,
  imports: [],
  templateUrl: './govicare-certification-pichart.component.html',
  styleUrl: './govicare-certification-pichart.component.css',
})
export class GovicareCertificationPichartComponent
  implements AfterViewInit, OnChanges
{
  @Input() enrollments: any = null;
  private chart: Chart | null = null;

  // Dummy data for the pie chart
  private dummyEnrollments = {
    forCrop: 45,
    forFarm: 28,
    forFarmCluster: 17,
  };

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createPieChart();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['enrollments'] && !changes['enrollments'].firstChange) {
      setTimeout(() => {
        this.createPieChart();
      });
    }
  }

  private createPieChart(): void {
    const ctx = document.getElementById('pieChart') as HTMLCanvasElement;

    if (!ctx) return;

    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    // Use input data if available, otherwise use dummy data
    const enrollmentsData = this.enrollments || this.dummyEnrollments;

    const cropCount = enrollmentsData.forCrop || 0;
    const farmCount = enrollmentsData.forFarm || 0;
    const farmClusterCount = enrollmentsData.forFarmCluster || 0;

    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['For Crop', 'For Farm', 'For Farm Cluster'],
        datasets: [
          {
            data: [cropCount, farmCount, farmClusterCount],
            backgroundColor: ['#0D9488', '#A05CA6', '#FF9263'],
            borderColor: '#061E2C',
            borderWidth: 4,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce(
                  (a: number, b: number) => a + b,
                  0
                );
                const percentage =
                  total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                return `${label}: ${value} (${percentage}%)`;
              },
            },
            backgroundColor: '#1E293B',
            titleColor: '#F1F5F9',
            bodyColor: '#F1F5F9',
            borderColor: '#000000',
            borderWidth: 1,
          },
        },
        layout: {
          padding: {
            top: 10,
            bottom: 10,
          },
        },
      },
    });
  }

  // Get total enrollments for percentage calculation
  getTotalEnrollments(): number {
    const enrollmentsData = this.enrollments || this.dummyEnrollments;
    return (
      (enrollmentsData.forCrop || 0) +
      (enrollmentsData.forFarm || 0) +
      (enrollmentsData.forFarmCluster || 0)
    );
  }

  // Get percentage for each type
  getPercentage(value: number): string {
    const total = this.getTotalEnrollments();
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
  }

  // Get the enrollment data to display (uses input if available, otherwise dummy data)
  getDisplayEnrollments(): any {
    return this.enrollments || this.dummyEnrollments;
  }
}
