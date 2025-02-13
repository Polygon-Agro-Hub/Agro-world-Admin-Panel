// import { Component, OnInit } from '@angular/core';
// import { ChartModule } from 'primeng/chart';
// import { DropdownModule } from 'primeng/dropdown';
// import { PlantcareDashbordService } from '../../../../../services/plant-care/plantcare-dashbord.service';

// interface DashboardData {
//   active_users: any;
//   new_users: number;
//   vegCultivation: number;
//   grainCultivation: number;
//   fruitCultivation: number;
//   mushCultivation: number;
//   allusers: number;
//   qrUsers: number;
// }

// @Component({
//   selector: 'app-dashbord-area-chart',
//   standalone: true,
//   imports: [ChartModule, DropdownModule],
//   templateUrl: './dashbord-area-chart.component.html',
//   styleUrls: ['./dashbord-area-chart.component.css'],
// })
// export class DashbordAreaChartComponent implements OnInit {
//   totalRegisterdQr = 0;
//   dashboardData: DashboardData = {} as DashboardData;
//   data: any;
//   options: any;

//   constructor(private dashboardService: PlantcareDashbordService) {}

//   ngOnInit(): void {
//     this.dashboardService.getDashboardData().subscribe((data) => {
//       this.initializeChart(data.data.qrUsers, data.data.allusers);
//     });
//   }

//   getDashboardData() {
//     this.dashboardService.getDashboardData().subscribe(
//       (data) => {
//         console.log('This is second row ', data.data);

//         this.dashboardData = data.data;
//         this.initializeChart;
//       },
//       (error) => {
//         console.error('Error fetching dashboard data:', error);
//       }
//     );
//   }

//   initializeChart(qrUsers: number, allusers: number): void {
//     const unregisteredUsers = allusers - qrUsers;
//     console.log('jfjaiosdfaijf', unregisteredUsers);
//     const maxYValue = Math.ceil(Math.max(qrUsers, unregisteredUsers) * 1.2); // Adding 20% buffer

//     this.data = {
//       labels: ['QR Registered', 'Unregistered'],
//       datasets: [
//         {
//           label: 'Count',
//           data: [qrUsers, unregisteredUsers],
//           backgroundColor: [
//             'rgba(144, 238, 144, 0.5)',
//             'rgba(173, 216, 230, 0.5)',
//           ],
//           borderColor: ['rgba(34, 139, 34, 1)', 'rgba(70, 130, 180, 1)'],
//           borderWidth: 1,
//         },
//       ],
//     };

//     this.options = {
//       responsive: true,
//       maintainAspectRatio: false,
//       scales: {
//         y: {
//           beginAtZero: true,
//           max: maxYValue, // Dynamic max value
//         },
//       },
//       plugins: {
//         legend: {
//           display: false,
//         },
//         tooltip: {
//           enabled: true,
//         },
//       },
//     };
//   }
// }

import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-dashbord-area-chart',
  standalone: true,
  imports: [ChartModule, DropdownModule],
  templateUrl: './dashbord-area-chart.component.html',
  styleUrls: ['./dashbord-area-chart.component.css'],
})
export class DashbordAreaChartComponent implements OnChanges {
  @Input() qrUsers: number = 0;
  @Input() allusers: number = 0;

  data: any;
  options: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['qrUsers'] && changes['qrUsers'].currentValue !== undefined) ||
      (changes['allusers'] && changes['allusers'].currentValue !== undefined)
    ) {
      this.initializeChart(this.qrUsers, this.allusers);
    }
  }

  initializeChart(qrUsers: number, allusers: number): void {
    const unregisteredUsers = allusers - qrUsers;
    const maxYValue = Math.ceil(Math.max(qrUsers, unregisteredUsers) * 1.2);

    this.data = {
      labels: ['QR Registered', 'Unregistered'],
      datasets: [
        {
          label: 'Count',
          data: [qrUsers, unregisteredUsers],
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
          max: maxYValue,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
        },
      },
    };
  }
}
