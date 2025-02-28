import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { BarChartComponent } from '../bar-chart/bar-chart.component'

@Component({
  selector: "app-plantcare-users-row",
  standalone: true,
  imports: [CommonModule, DropdownModule, BarChartComponent],
  templateUrl: "./plantcare-users-row.component.html",
  styleUrl: "./plantcare-users-row.component.css",
})
export class PlantcareUsersRowComponent implements OnChanges {
  @Input() secondRow: any = {}

  plantCareUsersWithOutQr!: number;
  plantCareUsersWithQr!: number;
  newPlantCareUsers!: number;
  allPlantCareUsers!: number;
  activePlantCareUsers!: number;

  ngOnChanges(): void {
    this.fetchPlantCareUserData(this.secondRow);
  }


  fetchPlantCareUserData(data:any) {
    // console.log('Second Row -> ', data);
    this.plantCareUsersWithOutQr = data.QRfarmers.notQrCode.count ?? 0;
    this.plantCareUsersWithQr = data.QRfarmers.QrCode.count ?? 0;
    this.newPlantCareUsers = data.TodayFarmers ?? 0;
    this.allPlantCareUsers = this.totCount(this.plantCareUsersWithOutQr, this.plantCareUsersWithQr) ;
    this.activePlantCareUsers = data.activeFarmers ?? 0;

  }

  totCount(x1: number, x2: number): number {
    return (x1 + x2)
  }
}
