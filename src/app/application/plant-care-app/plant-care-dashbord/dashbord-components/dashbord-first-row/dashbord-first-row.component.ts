import { Component, Input, OnInit } from '@angular/core';
import { PlantcareDashbordService } from '../../../../../services/plant-care/plantcare-dashbord.service';
import { CommonModule } from '@angular/common';


interface DashboardData {
  active_users: any;
  new_users: number;
  vegCultivation: number;
  cerealsCultivation: number;
  fruitCultivation: number;
  mushCultivation: number;
  leLegumesCultivation: number;
  spicesCultivation: number
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

  padNumber(value: number): string {
    if (value === null || value === undefined) return '00';
    return value < 10 ? `0${value}` : `${value}`;
  }
}
