import { Component, Input, OnInit } from '@angular/core';
import { PlantcareDashbordService } from '../../../../../services/plant-care/plantcare-dashbord.service';
import { CommonModule } from '@angular/common';


interface DashboardData {
  active_users: any;
  new_users: number;
  vegCultivation: number;
  grainCultivation: number;
  fruitCultivation: number;
  mushCultivation: number;
  allusers: number;
  qrUsers: number;
}

@Component({
  selector: 'app-dashbord-first-row',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashbord-first-row.component.html',
  styleUrl: './dashbord-first-row.component.css',
})
export class DashbordFirstRowComponent {
  @Input() dashboardData: DashboardData = {} as DashboardData;

  constructor(private dashbordService: PlantcareDashbordService, ) {
    
  }

  ngOnInit(): void {
    this.dashboardData;
  }

  // fetchDashboardData(): void {
  //   this.dashbordService.getDashboardData().subscribe(
  //     (data: any) => {
  //       if (data && data.data) {
  //         this.dashboardData = data.data;
  //         console.log(this.dashboardData);
  //       } else {
  //         console.warn('No data received from API.');
  //       }
  //     },
  //     (error) => {
  //       console.error('Error fetching dashboard data:', error);
  //     }
  //   );
  // }
}
