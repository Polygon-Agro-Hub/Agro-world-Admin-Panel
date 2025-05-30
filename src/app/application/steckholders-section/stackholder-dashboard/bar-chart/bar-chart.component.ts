import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // Import plugin

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule, DropdownModule],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.css'
})
export class BarChartComponent implements OnChanges {
  
  @Input() plantCareUsersWithOutQr: any;
  @Input() plantCareUsersWithQr: any;


  QRpresentage: any = 0;
  nonQRpresentage: any = 0;

 
  chart: any;

  constructor() {
    Chart.register(...registerables, ChartDataLabels); // Register plugin
  }
  ngOnChanges(): void {
    this.calculatePercentages();
    this.createChart();
    
  }


  

  calculatePercentages(): void {
    const total = this.plantCareUsersWithQr + this.plantCareUsersWithOutQr;
  
    // Calculate the percentage of QR and non-QR users and limit to one decimal place
    this.QRpresentage = total > 0 ? ((this.plantCareUsersWithQr / total) * 100).toFixed(1) : '0.0';
    this.nonQRpresentage = total > 0 ? ((this.plantCareUsersWithOutQr / total) * 100).toFixed(1) : '0.0';
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
        datasets: [{
          label: '',
          data: [this.QRpresentage, this.nonQRpresentage],
          backgroundColor: ['#008080', '#76B7B2'],
          borderColor: ['#008080', '#76B7B2'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100, // Ensure y-axis is limited to 100%
            grid: {
              display: false,
              lineWidth: 1, // Control the thickness of the grid lines
              color: '#000' // Color of the grid lines
            },
            ticks: {
              display: false // Hide vertical scale labels
            },
            // Axis line itself (the line that runs along the y-axis)
            border: {
              color: '#000', // Set color of the y-axis line
              width: 1 // Set the thickness of the y-axis line
            }
          },
          x: {
            grid: {
              display: false,
              lineWidth: 1, // Control the thickness of the grid lines
              color: '#000' // Color of the grid lines
            },
            ticks: {
              color: '#000', // Keep x-axis labels visible
              font: {
                weight: 'normal',
                size: 10
              }
            },
            // Axis line itself (the line that runs along the x-axis)
            border: {
              color: '#000', // Set color of the x-axis line
              width: 1 // Set the thickness of the x-axis line
            }
          }
        },
        plugins: {
          datalabels: {
            anchor: 'end',
            align: 'top',
            formatter: (value) => value + '%', // Show percentage with "%"
            color: '#000',
            font: {
              weight: 'normal',
              size: 10
            }
          }
        }
      }
    });
  }

}
