import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule, DropdownModule],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.css',
})
export class BarChartComponent implements OnChanges {
  @Input() plantCareUsersWithOutQr: any;
  @Input() plantCareUsersWithQr: any;

  QRpresentage: any = 0;
  nonQRpresentage: any = 0;
  chart: any;

  constructor() {
    Chart.register(...registerables, ChartDataLabels);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.calculatePercentages();
    this.createChart();
  }

  calculatePercentages(): void {
    const total = this.plantCareUsersWithQr + this.plantCareUsersWithOutQr;
    this.QRpresentage =
      total > 0
        ? ((this.plantCareUsersWithQr / total) * 100).toFixed(1)
        : '0.0';
    this.nonQRpresentage =
      total > 0
        ? ((this.plantCareUsersWithOutQr / total) * 100).toFixed(1)
        : '0.0';
  }

  createChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = document.getElementById('barChart') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Registered', 'Unregistered'],
        datasets: [
          {
            label: '',
            data: [this.QRpresentage, this.nonQRpresentage],
            backgroundColor: ['#008080', '#76B7B2'],
            borderColor: ['#008080', '#76B7B2'],
            borderWidth: 2,
            borderRadius: 0, // This removes the rounded corners
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: {
              display: false,
              lineWidth: 1,
              color: '#000',
            },
            ticks: {
              display: false,
            },
            border: {
              color: '#000',
              width: 1,
            },
          },
          x: {
            grid: {
              display: false,
              lineWidth: 1,
              color: '#000',
            },
            ticks: {
              color: '#000',
              font: {
                weight: 'normal',
                size: 10,
              },
            },
            border: {
              color: '#000',
              width: 1,
            },
          },
        },
        plugins: {
          datalabels: {
            anchor: 'end',
            align: 'top',
            formatter: (value) => value + '%',
            color: '#000',
            font: {
              weight: 'normal',
              size: 10,
            },
          },
          legend: {
            display: false, // This hides the legend if not needed
          },
        },
      },
    });
  }
}
