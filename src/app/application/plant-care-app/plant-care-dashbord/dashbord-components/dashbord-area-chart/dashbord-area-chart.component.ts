import { Component, AfterViewInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-dashbord-area-chart',
  standalone: true,
  imports: [ChartModule, DropdownModule],
  templateUrl: './dashbord-area-chart.component.html',
  styleUrls: ['./dashbord-area-chart.component.css'],
})
export class DashbordAreaChartComponent {
  data: any;
  options: any;

  constructor() {
    this.data = {
      labels: ['QR Registered', 'Unregistered'],
      datasets: [
        {
          label: 'Count',
          data: [220, 900],
          backgroundColor: [
            'rgba(144, 238, 144, 0.5)',
            'rgba(173, 216, 230, 0.5)',
          ],
          borderColor: ['rgba(34, 139, 34, 1)', 'rgba(70, 130, 180, 1)'],
          borderWidth: 1,
        },
      ],
    };

    this.options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 1000,
        },
      },
      plugins: {
        legend: {
          display: false, // Hides legend
        },
        tooltip: {
          enabled: true,
        },
      },
    };
  }
}
