import { Component, OnInit } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { TokenService } from '../../../../services/token/services/token.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { StakeholderService } from '../../../../services/stakeholder/stakeholder.service';
import { Chart, registerables } from 'chart.js';

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
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.fetchPlantCareUserData();
  }

  fetchPlantCareUserData(): void {
    console.log('Fetching user data...');
    
    this.stakeholderSrv.getPlantCareUserData().subscribe(
      (res) => {
        console.log('API Response:', res);

        this.plantCareUsersWithOutQr = res.plantCareUserByQrRegistration[1]?.user_count ?? 0;
        this.plantCareUsersWithQr = res.plantCareUserByQrRegistration[0]?.user_count ?? 0;

        this.createChart(); // Call chart function after data is fetched
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  createChart(): void {
    if (this.chart) {
      this.chart.destroy(); // Destroy previous chart before creating a new one
    }

    this.chart = new Chart('barChart', {
      type: 'bar',
      data: {
        labels: ['With QR', 'Without QR'],
        datasets: [{
          label: '',
          data: [this.plantCareUsersWithQr, this.plantCareUsersWithOutQr],
          backgroundColor: ['green', 'yellow'],
          borderColor: ['rgba(75, 192, 192, 1)', 'rgba(54, 162, 235, 1)'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}
