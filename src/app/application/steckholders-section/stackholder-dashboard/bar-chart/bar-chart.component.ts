import { Component, OnInit } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { TokenService } from '../../../../services/token/services/token.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { StakeholderService } from '../../../../services/stakeholder/stakeholder.service';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // Import plugin

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule, DropdownModule],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.css'
})
export class BarChartComponent implements OnInit {
  plantCareUsersWithOutQr!: number;
  plantCareUsersWithQr!: number;
  chart: any;

  constructor(
    private router: Router,
    private http: HttpClient,
    private tokenService: TokenService,
    private stakeholderSrv: StakeholderService
  ) {
    Chart.register(...registerables, ChartDataLabels); // Register plugin
  }

  ngOnInit(): void {
    this.fetchPlantCareUserData();
  }

  fetchPlantCareUserData(): void {
    this.stakeholderSrv.getPlantCareUserData().subscribe(
      (res) => {
        console.log('API Response:', res);

        // Get values
        const withQr = res.plantCareUserByQrRegistration[0]?.user_count ?? 0;
        const withoutQr = res.plantCareUserByQrRegistration[1]?.user_count ?? 0;
        const total = withQr + withoutQr;

        // Calculate percentages
        this.plantCareUsersWithQr = total > 0 ? Math.round((withQr / total) * 100) : 0;
        this.plantCareUsersWithOutQr = total > 0 ? Math.round((withoutQr / total) * 100) : 0;

        this.createChart();
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
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
          data: [this.plantCareUsersWithQr, this.plantCareUsersWithOutQr],
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
                size: 14
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
              size: 14
            }
          }
        }
      }
    });
  }
  
}
