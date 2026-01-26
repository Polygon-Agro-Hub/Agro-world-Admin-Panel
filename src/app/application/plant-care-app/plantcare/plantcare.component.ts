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
  popupVisibleAuditFarmers = false;
  popupVisibleFarmerPension = false;

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

  // Toggle function for Audit Farmers popup
  togglePopupAuditFarmers() {
    this.popupVisibleAuditFarmers = !this.popupVisibleAuditFarmers;
    if (this.popupVisibleNews) this.popupVisibleNews = false;
    if (this.popupVisibleMarketPrice) this.popupVisibleMarketPrice = false;
    if (this.popupVisibleCropCalender) this.popupVisibleCropCalender = false;
    if (this.popupVisibleCertification) this.popupVisibleCertification = false;
    if (this.popupVisibleFarmerClusters)
      this.popupVisibleFarmerClusters = false;
  }

  togglePopupFarmerPension() {
    this.popupVisibleFarmerPension = !this.popupVisibleFarmerPension;
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
    this.router.navigate(['/plant-care/action/view-farmer-clusters']);
  }

  downloadFarmerClusterTemplate(): void {
    this.isLoading = true;

    // 1. Define the header row with two columns
    const header = ['Farm ID', 'NIC'];

    // 2. Define sample empty data rows
    const numberOfRowsToGenerate = 10000;

    const emptyRows = Array.from({ length: numberOfRowsToGenerate }, () => [
      '', // RegCode (empty)
      '', // NIC (empty)
    ]);

    // Combine header and data rows
    const worksheetData = [header, ...emptyRows];

    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // 3. Force both columns to be treated as TEXT
    const range = XLSX.utils.decode_range(ws['!ref']!);

    // Iterate over all cells in both columns
    for (let R = range.s.r; R <= range.e.r; ++R) {
      // Column A: RegCode
      const cellAddressA = XLSX.utils.encode_cell({ r: R, c: 0 });
      if (!ws[cellAddressA]) {
        ws[cellAddressA] = { v: '', t: 's' };
      } else {
        ws[cellAddressA].t = 's';
      }
      ws[cellAddressA].z = '@';

      // Column B: NIC
      const cellAddressB = XLSX.utils.encode_cell({ r: R, c: 1 });
      if (!ws[cellAddressB]) {
        ws[cellAddressB] = { v: '', t: 's' };
      } else {
        ws[cellAddressB].t = 's';
      }
      ws[cellAddressB].z = '@';
    }

    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, // RegCode column width
      { wch: 20 }, // NIC column width
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'FarmerClusterTemplate');

    // Write to XLSX file
    XLSX.writeFile(wb, 'Farmer_cluster_template.xlsx');

    this.isLoading = false;
  }

  viewIndividualFarmers(): void {
    this.router.navigate(['/plant-care/action/individual-farmers-list']);
  }

  // Navigation function for Farmer Clusters
  viewFarmerClusters(): void {
    this.router.navigate(['/plant-care/action/farmers-clusters-list']);
  }

  viewUnder5YearsFarmersPension(): void {
    this.router.navigate(['/plant-care/action/farmer-pension-under-5-years']);
  }
}
