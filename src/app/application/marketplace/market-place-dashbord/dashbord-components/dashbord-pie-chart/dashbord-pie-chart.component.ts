import { Component, AfterViewInit, Input } from '@angular/core';
import { Chart, ChartType } from 'chart.js/auto';

@Component({
  selector: 'app-dashbord-pie-chart',
  standalone: true,
  templateUrl: './dashbord-pie-chart.component.html',
  styleUrls: ['./dashbord-pie-chart.component.css']
})
export class DashbordPieChartComponent implements AfterViewInit {
    @Input() pieData!: PieData
  
  ngAfterViewInit() {
    this.initializeChart();
  }

  initializeChart() {
    new Chart('pieChart', {
      type: 'doughnut' as ChartType,
      data: {
        labels: this.pieData.category,
        datasets: [
          {
            data: this.pieData.count,
            backgroundColor: ['#0D9488', '#A54D00', '#3B82F6', '#FB923C', '#648885', '#A05CA6'], 
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

interface PieData{
    category:string[];
    count:number[];
  }
