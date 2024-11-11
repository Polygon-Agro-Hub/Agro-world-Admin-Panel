import { Component, AfterViewInit } from '@angular/core';
import { Chart, ChartType } from 'chart.js/auto';

@Component({
  selector: 'app-dashbord-pie-chart',
  standalone: true,
  templateUrl: './dashbord-pie-chart.component.html',
  styleUrls: ['./dashbord-pie-chart.component.css']
})
export class DashbordPieChartComponent implements AfterViewInit {
  ngAfterViewInit() {
    this.initializeChart();
  }

  initializeChart() {
    new Chart('pieChart', {
      type: 'doughnut' as ChartType,
      data: {
        labels: ['Vegetables', 'Grains', 'Fruits', 'Mushrooms'],
        datasets: [
          {
            data: [30, 25, 20, 25],
            backgroundColor: ['#0DA87A', '#3B82F6', '#F59E0B', '#8B5CF6'], 
            borderWidth: 2,
            borderColor: '#1e2a38',
          }
        ]
      },
      options: {
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: '#fff'
            }
          }
        },
      }
    });
  }
}
