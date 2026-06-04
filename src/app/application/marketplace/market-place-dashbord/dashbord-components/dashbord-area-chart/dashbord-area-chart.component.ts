import { Component, AfterViewInit, Input } from '@angular/core';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashbord-area-chart',
  standalone: true,
  templateUrl: './dashbord-area-chart.component.html',
  styleUrls: ['./dashbord-area-chart.component.css'],
})
export class DashbordAreaChartComponent implements AfterViewInit {
  @Input() areaData!: AreaData;
  chart: any;
  // isDark:boolean =

  ngAfterViewInit() {
    this.createChart();
  }

  createChart() {
    this.chart = new Chart('MyChart', {
      type: 'line',
      data: {
        labels: this.areaData.months,
        datasets: [
          {
            label: 'Sales',
            data: this.areaData.salesCount,
            borderColor: '#2C78DC',
            backgroundColor: 'rgba(173, 213, 224, 0.3)', // ADDED OPACITY (0.3 = 30% opacity)
            fill: false,
            tension: 0.4,
          },
          {
            label: 'Orders',
            data: this.areaData.total,
            borderColor: '#04D182',
            backgroundColor: 'rgba(205, 246, 230, 0.3)', // ADDED OPACITY (0.3 = 30% opacity)
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Visitors',
            data: [
              3000, 2000, 4000, 3000, 2000, 3000, 4000, 3000, 4000, 2000, 3000,
              4000,
            ],
            borderColor: '#FF9DD2',
            backgroundColor: 'rgba(255, 157, 210, 0.3)', // ADDED OPACITY (0.3 = 30% opacity)
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#888888',
            },
          },
          datalabels: {
            display: false, // ← Removes data labels from the chart
          },
        },
        scales: {
          x: {
            ticks: {
              color: '#888888', // ← x-axis labels
            },
            grid: {
              display: true,
            },
          },
          y: {
            ticks: {
              color: '#888888', // ← y-axis labels
            },
            grid: {
              display: true,
            },
          },
        },
      },
    });
  }
}

interface AreaData {
  months: string[];
  salesCount: number[];
  total: any[];
}
