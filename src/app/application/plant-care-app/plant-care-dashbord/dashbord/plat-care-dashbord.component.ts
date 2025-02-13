import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashbordFirstRowComponent } from '../dashbord-components/dashbord-first-row/dashbord-first-row.component';
import { DashbordSecondRowComponent } from '../dashbord-components/dashbord-second-row/dashbord-second-row.component';
import { DashbordAreaChartComponent } from '../dashbord-components/dashbord-area-chart/dashbord-area-chart.component';
import { DashbordPieChartComponent } from '../dashbord-components/dashbord-pie-chart/dashbord-pie-chart.component';
import { PlantcareDashbordService } from '../../../../services/plant-care/plantcare-dashbord.service';

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
  selector: 'app-plat-care-dashbord',
  standalone: true,
  imports: [
    DashbordFirstRowComponent,
    DashbordSecondRowComponent,
    DashbordAreaChartComponent,
    DashbordPieChartComponent,
    CommonModule,
  ],
  templateUrl: './plat-care-dashbord.component.html',
  styleUrl: './plat-care-dashbord.component.css',
})
export class PlatCareDashbordComponent implements OnInit {
  dashboardData: DashboardData = {} as DashboardData;
  totalCultivationCount: number = 0;

  constructor(private dashbordService: PlantcareDashbordService) {}

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData(): void {
    this.dashbordService.getDashboardData().subscribe(
      (data: any) => {
        if (data && data.data) {
          this.dashboardData = data.data;
          this.calculateTotalCultivation();
        } else {
          console.warn('No data received from API.');
        }
      },
      (error) => {
        console.error('Error fetching dashboard data:', error);
      }
    );
  }

  calculateTotalCultivation(): void {
    this.totalCultivationCount =
      this.dashboardData.vegCultivation +
      this.dashboardData.grainCultivation +
      this.dashboardData.fruitCultivation +
      this.dashboardData.mushCultivation;
  }
}
