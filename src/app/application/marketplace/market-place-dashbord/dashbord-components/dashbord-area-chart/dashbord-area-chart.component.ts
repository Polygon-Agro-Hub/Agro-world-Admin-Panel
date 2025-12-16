import { Component, AfterViewInit, Input } from '@angular/core';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashbord-area-chart',
  standalone: true,
  templateUrl: './dashbord-area-chart.component.html',
  styleUrls: ['./dashbord-area-chart.component.css']
})
export class DashbordAreaChartComponent implements AfterViewInit {
  @Input() areaData!: AreaData
  chart: any;
  // isDark:boolean = 


  ngAfterViewInit() {
    this.createChart();
  }

  createChart() {
    this.chart = new Chart("MyChart", {
      type: 'line',
      data: {
        labels: this.areaData.months,
        datasets: [
          {
            label: "Sales",
            data: this.areaData.salesCount,
            borderColor: "#4E97FD",
            backgroundColor: "rgba(78, 151, 253, 0.3)",
            fill: false,
            tension: 0.4
          },
          {
            label: "Orders",
            data: this.areaData.total,
            borderColor: "#3DE188",
            backgroundColor: "rgba(61, 225, 136, 0.3)",
            fill: true,
            tension: 0.4
          },
          {
            label: "Visitors",
            data: [3000, 2000, 4000, 3000, 2000, 3000, 4000, 3000, 4000, 2000, 3000, 4000],
            borderColor: "#FF9263",
            backgroundColor: "rgba(255, 146, 99, 0.3)",
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: 'white'
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: 'white'
            },
            grid: {
              display: false
            }
          },
          y: {
            ticks: {
              color: 'white'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        }
      }
    });
  }
}


interface AreaData {
  months: string[];
  salesCount: number[];
  total: any[]
}