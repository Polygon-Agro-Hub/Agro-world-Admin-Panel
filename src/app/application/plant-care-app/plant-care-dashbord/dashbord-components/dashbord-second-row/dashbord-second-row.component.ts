import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Output } from '@angular/core';
import { PlantcareDashbordService } from '../../../../../services/plant-care/plantcare-dashbord.service';

interface DashboardData {
  active_users: any;
  new_users: number;
  vegCultivation: number;
  grainCultivation: number;
  fruitCultivation: number;
  mushCultivation: number;
  allusersTillPreviousMonth: number;
  user_increase_percentage: number;
  qr_user_increase_percentage: number;
  allusers: number;
  qrUsers: number;
  total_cultivation_till_previous_month: number;
  cultivation_increase_percentage: number;
  
}
@Component({
  selector: 'app-dashbord-second-row',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashbord-second-row.component.html',
  styleUrl: './dashbord-second-row.component.css',
})
export class DashbordSecondRowComponent implements OnInit {
  @Input() dashboardData: DashboardData = {} as DashboardData;
  @Input() totalCultivationCount: number = 0;
  userIncreasePercentage: number = 0;
  

  constructor(private dashbordService: PlantcareDashbordService) {}

 

  ngOnInit(): void {
    // this.calculateTotalCultivation();
  }

  // calculateTotalCultivation(): void {
  //   console.log('Calculating total');

  //   if (this.dashboardData) {
  //     this.totalCultivationCount =
  //       this.dashboardData.vegCultivation +
  //       this.dashboardData.grainCultivation +
  //       this.dashboardData.fruitCultivation +
  //       this.dashboardData.mushCultivation;
  //   }
  //   console.log(this.totalCultivationCount);
  // }
}
