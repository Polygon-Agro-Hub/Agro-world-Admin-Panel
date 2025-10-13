import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-plantcare',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './plantcare.component.html',
  styleUrl: './plantcare.component.css',
})
export class PlantcareComponent {
  isLoading = false;
  popupVisibleNews = false;
  popupVisibleMarketPrice = false;
  popupVisibleCropCalender = false;
  popupVisibleCertification = false;
  popupVisibleFarmerClusters = false;

  constructor(
    private router: Router,
    public permissionService: PermissionService,
    public tokenService: TokenService
  ) {}

  // Update existing toggle methods to include farmer clusters
  togglePopupNews() {
    this.popupVisibleNews = !this.popupVisibleNews;
    if ((this.popupVisibleMarketPrice = true)) {
      this.popupVisibleMarketPrice = !this.popupVisibleMarketPrice;
    }
    if ((this.popupVisibleCropCalender = true)) {
      this.popupVisibleCropCalender = !this.popupVisibleCropCalender;
    }
  }

  togglePopupMarketPrice() {
    this.popupVisibleMarketPrice = !this.popupVisibleMarketPrice;
    if ((this.popupVisibleNews = true)) {
      this.popupVisibleNews = !this.popupVisibleNews;
    }
    if ((this.popupVisibleCropCalender = true)) {
      this.popupVisibleCropCalender = !this.popupVisibleCropCalender;
    }
  }

  togglePopupCropCalender() {
    this.popupVisibleCropCalender = !this.popupVisibleCropCalender;
    if ((this.popupVisibleNews = true)) {
      this.popupVisibleNews = !this.popupVisibleNews;
    }
    if ((this.popupVisibleMarketPrice = true)) {
      this.popupVisibleMarketPrice = !this.popupVisibleMarketPrice;
    }
  }

  togglePopupCertification() {
    this.popupVisibleCertification = !this.popupVisibleCertification;
    if (this.popupVisibleNews) this.popupVisibleNews = false;
    if (this.popupVisibleMarketPrice) this.popupVisibleMarketPrice = false;
    if (this.popupVisibleCropCalender) this.popupVisibleCropCalender = false;
  }

  // Add the new toggle method for Farmer Clusters
  togglePopupFarmerClusters() {
    this.popupVisibleFarmerClusters = !this.popupVisibleFarmerClusters;
    if (this.popupVisibleNews) this.popupVisibleNews = false;
    if (this.popupVisibleMarketPrice) this.popupVisibleMarketPrice = false;
    if (this.popupVisibleCropCalender) this.popupVisibleCropCalender = false;
    if (this.popupVisibleCertification) this.popupVisibleCertification = false;
  }

  navigateToCreateNews(): void {
    this.isLoading = true;
    this.router.navigate(['/plant-care/action/create-news']).then(() => {
      this.isLoading = false;
    });
  }

  navigateToManageNews(): void {
    this.isLoading = true;
    this.router.navigate(['/plant-care/action/manage-content']).then(() => {
      this.isLoading = false;
    });
  }

  createCalendar(): void {
    this.router.navigate(['/plant-care/action/create-crop-calender']);
  }

  manageCalendar(): void {
    this.router.navigate(['/plant-care/action/view-crop-calender']);
  }

  createCropGroup(): void {
    this.router.navigate(['/plant-care/action/create-crop-group']);
  }

  viewCropGroup(): void {
    this.router.navigate(['/plant-care/action/view-crop-group']);
  }

  createVariety(): void {
    this.router.navigate(['/plant-care/action/create-crop-variety']);
  }

  publicForum(): void {
    this.router.navigate(['/plant-care/action/public-forum']);
  }

  ongoingCultivation(): void {
    this.router.navigate(['/plant-care/action/ongoing-cultivation']);
  }

  assets(): void {
    this.router.navigate(['/plant-care/action/report-farmer-list']);
  }

  feedBack(): void {
    this.router.navigate(['/plant-care/action/opt-out-feedbacks']);
  }

  addCompany(): void {
    this.router.navigate(['/plant-care/action/add-company-details']);
  }

  viewCompanyList(): void {
    this.router.navigate(['/plant-care/action/view-company-list']);
  }

  addCertificate(): void {
    this.router.navigate(['/plant-care/action/add-certificate-details']);
  }

  viewCertificateList(): void {
    this.router.navigate(['/plant-care/action/view-certificate-list']);
  }

  // Add new methods for Farmer Clusters
  addFarmerCluster(): void {
    this.router.navigate(['/plant-care/action/add-farmer-clusters']);
  }

  manageFarmerClusters(): void {
    this.router.navigate(['/plant-care/action/manage-farmer-clusters']);
  }

  downloadFarmerClusterTemplate(): void {
    this.isLoading = true;

    // 1. Define the header row first
    const header = ['NIC'];

    // 2. Define sample empty data rows (e.g., 100 rows)
    const numberOfRowsToGenerate = 10000;
    // Creates an array like [[''], [''], ... 100 times]
    const emptyRows = Array.from({ length: numberOfRowsToGenerate }, () => [
      '',
    ]);

    // Combine header and data rows
    const worksheetData = [header, ...emptyRows];

    // Create a worksheet
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // 3. Force the NIC column (Column A, index 0) to be treated as TEXT
    const range = XLSX.utils.decode_range(ws['!ref']!);

    // Iterate over all cells in column A from the second row onwards (data rows)
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: 0 });

      // Ensure the cell exists before modifying
      if (!ws[cellAddress]) {
        ws[cellAddress] = { v: '', t: 's' };
      } else {
        ws[cellAddress].t = 's';
      }

      ws[cellAddress].z = '@';
    }

    ws['!cols'] = [{ wch: 20 }];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'FarmerClusterTemplate');

    // Write to XLSX file
    XLSX.writeFile(wb, 'farmer_cluster_template.xlsx');

    this.isLoading = false;
  }
}
