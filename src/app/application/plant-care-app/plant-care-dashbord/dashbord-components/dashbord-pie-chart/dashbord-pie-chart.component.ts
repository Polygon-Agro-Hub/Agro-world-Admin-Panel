import { Component, AfterViewInit } from '@angular/core';
import { Chart, ChartType } from 'chart.js/auto';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-dashbord-pie-chart',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './dashbord-pie-chart.component.html',
  styleUrls: ['./dashbord-pie-chart.component.css'],
})
export class DashbordPieChartComponent {
  data: any;
  options: any;

  constructor() {
    this.data = {
      labels: ['Vegetables', 'Fruits', 'Grains', 'Mushrooms'],
      datasets: [
        {
          data: [40, 30, 20, 10], // Percentages
          backgroundColor: ['#4E9F78', '#E68A3D', '#3D75E6', '#9156A0'], // Custom colors
          hoverBackgroundColor: ['#4E9F78', '#E68A3D', '#3D75E6', '#9156A0'],
        },
      ],
    };

    this.options = {
      plugins: {
        legend: {
          position: 'bottom',
        },
        tooltip: {
          enabled: true,
        },
        datalabels: {
          color: '#000',
          font: {
            weight: 'bold',
          },
          formatter: (value: number) => `${value}%`, // Display values as percentages
        },
      },
      cutout: '60%', // Converts to Donut Chart
    };
  }
}
