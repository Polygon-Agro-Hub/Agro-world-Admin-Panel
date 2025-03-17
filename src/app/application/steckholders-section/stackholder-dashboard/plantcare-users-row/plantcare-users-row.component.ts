import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { BarChartComponent } from '../bar-chart/bar-chart.component'
import { LoadingSpinnerComponent } from "../../../../components/loading-spinner/loading-spinner.component";

@Component({
  selector: "app-plantcare-users-row",
  standalone: true,
  imports: [CommonModule, DropdownModule, BarChartComponent],
  templateUrl: "./plantcare-users-row.component.html",
  styleUrl: "./plantcare-users-row.component.css",
})
export class PlantcareUsersRowComponent implements OnChanges {
  @Input() secondRow: any = {}
  @Input() plantCareUsersWithOutQr: number = 0;
  @Input() plantCareUsersWithQr: number = 0;

  // plantCareUsersWithOutQr: number =0;
  // plantCareUsersWithQr: number = 0;
  newPlantCareUsers: number = 0;
  allPlantCareUsers: number = 0;
  activePlantCareUsers: number = 0;
  

  notQrCodeCount: number = 0;
  qrCodeCount: number = 0;

  ngOnChanges(): void {
    this.fetchPlantCareUserData(this.secondRow);
  }


  
  fetchPlantCareUserData(data: any) {
    // Check if QRfarmers exists in the data
    const qrFarmers = data?.QRfarmers || { notQrCode: { count: 0 }, QrCode: { count: 0 } };
  
    this.plantCareUsersWithOutQr = qrFarmers?.notQrCode?.count || 0;
    this.plantCareUsersWithQr = qrFarmers?.QrCode?.count || 0;
    this.newPlantCareUsers = data?.TodayFarmers || 0;
    this.activePlantCareUsers = data?.activeFarmers || 0;
  
    this.allPlantCareUsers = this.totCount(this.plantCareUsersWithOutQr, this.plantCareUsersWithQr);
  }
  
  
 



  totCount(x1: number, x2: number): number {
    return (x1 + x2)
  }
}
