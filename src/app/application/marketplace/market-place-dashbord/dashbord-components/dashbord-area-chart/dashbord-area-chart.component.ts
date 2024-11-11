import { Component, AfterViewInit } from '@angular/core';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashbord-area-chart',
  standalone: true,
  templateUrl: './dashbord-area-chart.component.html',
  styleUrls: ['./dashbord-area-chart.component.css']
})
export class DashbordAreaChartComponent implements AfterViewInit {
  chart: any;

  ngAfterViewInit() {
    this.createChart();
  }

  createChart() {
    this.chart = new Chart("MyChart", {
      type: 'line',
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
          {
            label: "Sales",
            data: [4000, 3000, 2000, 5000, 6000, 8000, 7000, 5000, 4000, 3000, 2000, 1000],
            borderColor: "#4E97FD",
            backgroundColor: "rgba(78, 151, 253, 0.3)",
            fill: true,
            tension: 0.4
          },
          {
            label: "Orders",
            data: [2000, 4000, 1000, 6000, 7000, 5000, 6000, 8000, 7000, 3000, 4000, 2000],
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
