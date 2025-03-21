import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { BarChartComponent } from '../bar-chart/bar-chart.component';
import { LoadingSpinnerComponent } from "../../../../components/loading-spinner/loading-spinner.component";

@Component({
  selector: "app-plantcare-users-row",
  standalone: true,
  imports: [CommonModule, DropdownModule, BarChartComponent],
  templateUrl: "./plantcare-users-row.component.html",
  styleUrl: "./plantcare-users-row.component.css",
})
export class PlantcareUsersRowComponent implements OnChanges {
  @Input() secondRow: any = {};
  @Input() plantCareUsersWithOutQr: number = 0;
  @Input() plantCareUsersWithQr: number = 0;
  @Output() plantCareDataEmitted = new EventEmitter<any>();

  newPlantCareUsers: number = 0;
  allPlantCareUsers: number = 0;
  activePlantCareUsers: number = 0;
  plantCareUsersWithOutQrForOutput: number = 0;
  plantCareUsersWithQrForOutput: number = 0;

  notQrCodeCount: number = 0;
  qrCodeCount: number = 0;

  QRpresentageForOutput: any = 0;
  nonQRpresentageForOutput: any = 0;

  ngOnChanges(): void {
    this.fetchPlantCareUserData(this.secondRow);
    // this.calculatePercentages();
  }

  fetchPlantCareUserData(data: any) {
    // Check if QRfarmers exists in the data
    const qrFarmers = data?.QRfarmers || { notQrCode: { count: 0 }, QrCode: { count: 0 } };

    this.plantCareUsersWithOutQr = qrFarmers?.notQrCode?.count || 0;
    this.plantCareUsersWithQr = qrFarmers?.QrCode?.count || 0;
    this.newPlantCareUsers = data?.TodayFarmers || 0;
    this.activePlantCareUsers = data?.activeFarmers || 0;

    this.allPlantCareUsers = this.totCount(this.plantCareUsersWithOutQr, this.plantCareUsersWithQr);

    const total = this.plantCareUsersWithQr + this.plantCareUsersWithOutQr;

    // Calculate the percentage of QR and non-QR users and limit to one decimal place
    this.QRpresentageForOutput = total > 0 ? ((this.plantCareUsersWithQr / total) * 100).toFixed(1) : '0.0';
    this.nonQRpresentageForOutput = total > 0 ? ((this.plantCareUsersWithOutQr / total) * 100).toFixed(1) : '0.0';

    // Emit the data including percentages
    this.plantCareDataEmitted.emit({
      newPlantCareUsers: this.newPlantCareUsers,
      allPlantCareUsers: this.allPlantCareUsers,
      activePlantCareUsers: this.activePlantCareUsers,
      plantCareUsersWithQrForOutput: this.plantCareUsersWithQr,
      plantCareUsersWithOutQrForOutput: this.plantCareUsersWithOutQr,
      QRpresentageForOutput: this.QRpresentageForOutput, // Include QR percentage
      nonQRpresentageForOutput: this.nonQRpresentageForOutput // Include non-QR percentage
    });
  }

  // calculatePercentages(): void {
  //   const total = this.plantCareUsersWithQr + this.plantCareUsersWithOutQr;

  //   // Calculate the percentage of QR and non-QR users and limit to one decimal place
  //   this.QRpresentage = total > 0 ? ((this.plantCareUsersWithQr / total) * 100).toFixed(1) : '0.0';
  //   this.nonQRpresentage = total > 0 ? ((this.plantCareUsersWithOutQr / total) * 100).toFixed(1) : '0.0';
  // }

  totCount(x1: number, x2: number): number {
    return (x1 + x2);
  }
}