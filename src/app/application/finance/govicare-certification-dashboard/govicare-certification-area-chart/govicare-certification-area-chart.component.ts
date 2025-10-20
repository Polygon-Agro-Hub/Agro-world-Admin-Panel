import { Component, AfterViewInit, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-govicare-certification-area-chart',
  standalone: true,
  imports: [],
  templateUrl: './govicare-certification-area-chart.component.html',
  styleUrl: './govicare-certification-area-chart.component.css'
})
export class GovicareCertificationAreaChartComponent implements AfterViewInit, OnChanges {
  @Input() monthlyStats: any[] = [];
  @ViewChild('myChart') myChart!: ElementRef<HTMLCanvasElement>;
  
  chart!: Chart;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createAreaChart();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['monthlyStats'] && this.chart) {
      this.updateChart();
    }
  }

  private createAreaChart(): void {
    const data = this.prepareChartData();

    const ctx = this.myChart.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2D context');
      return;
    }

    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Income',
            data: data.values,
            fill: true,
            borderColor: '#1c425c',
            backgroundColor: this.createGradient(ctx),
            pointRadius: 4,
            pointBackgroundColor: '#1c425c',
            pointBorderColor: '#1E293B',
            pointBorderWidth: 2,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#FFFFFF',
            pointHoverBorderColor: '#1c425c',
            pointHoverBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { top: 20, bottom: 20, left: 10, right: 10 },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100000,
            ticks: {
              stepSize: 25000,
              color: '#CBD5E1',
              font: {
                size: 12,
              },
              callback: function (value) {
                return value.toLocaleString();
              },
            },
            grid: {
              color: '#334155',
            },
            border: {
              display: false
            }
          },
          x: {
            ticks: {
              color: '#CBD5E1',
              font: {
                size: 12,
              },
            },
            grid: {
              color: '#334155',
            },
            border: {
              display: false
            }
          },
        },
        plugins: {
          legend: { 
            display: false 
          },
          tooltip: {
            backgroundColor: '#1c425c',
            titleColor: '#FFFFFF',
            bodyColor: '#FFFFFF',
            borderColor: '#1c425c',
            borderWidth: 1,
            cornerRadius: 6,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return `Income: Rs ${context.parsed.y.toLocaleString()}`;
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
      },
    });
  }

  private createGradient(ctx: CanvasRenderingContext2D): CanvasGradient {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(65, 113, 145, 0.25)');
    gradient.addColorStop(1, 'rgba(65, 113, 145, 0.05)');
    return gradient;
  }

  private prepareChartData(): { labels: string[], values: number[] } {
    // Use provided monthlyStats or fallback to default data
    if (this.monthlyStats && this.monthlyStats.length > 0) {
      const labels = this.monthlyStats.map(stat => stat.monthName);
      const values = this.monthlyStats.map(stat => Number(stat.revenue) || 0);
      return { labels, values };
    }

    // Fallback to sample data that matches the image
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      values: [45000, 68000, 82000, 58000, 45000, 12000, 45000, 14000, 16000, 35000, 68000, 15000]
    };
  }

  private updateChart(): void {
    if (!this.chart) return;

    const data = this.prepareChartData();
    
    this.chart.data.labels = data.labels;
    this.chart.data.datasets[0].data = data.values;
    this.chart.update();
  }

  // Public method to refresh chart if needed
  refreshChart(): void {
    this.createAreaChart();
  }

  // Clean up chart when component is destroyed
  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}