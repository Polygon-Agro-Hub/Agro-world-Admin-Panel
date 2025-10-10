import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-govilink',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './govilink.component.html',
  styleUrl: './govilink.component.css',
})
export class GovilinkComponent {
  popupVisibleCollectionCenter = false;
  popupVisibleComplains = false;
  popupVisibleMarketPrice = false;
  popupVisibleCompanys = false;
  popupVisibleAG = false;

  constructor(private router: Router) {}

  togglePopupCollectionCenter() {
    this.popupVisibleCollectionCenter = !this.popupVisibleCollectionCenter;
    this.popupVisibleMarketPrice = false;
    this.popupVisibleCompanys = false;
    this.popupVisibleAG = false;
    if ((this.popupVisibleComplains = true)) {
      this.popupVisibleComplains = !this.popupVisibleComplains;
    }
  }

  togglePopupCompanys() {
    this.popupVisibleCompanys = !this.popupVisibleCompanys;
    this.popupVisibleMarketPrice = false;
    this.popupVisibleCollectionCenter = false;
    this.popupVisibleAG = false;
  }

  togglePopupComplains() {
    this.popupVisibleComplains = !this.popupVisibleComplains;
    this.popupVisibleMarketPrice = false;
    this.popupVisibleCompanys = false;
    this.popupVisibleAG = false;
    if ((this.popupVisibleCollectionCenter = true)) {
      this.popupVisibleCollectionCenter = !this.popupVisibleCollectionCenter;
    }
  }

  togglePopupMarketPrice() {
    this.popupVisibleMarketPrice = !this.popupVisibleMarketPrice;
    this.popupVisibleCompanys = false;
    this.popupVisibleComplains = false;
    this.popupVisibleCollectionCenter = false;
    this.popupVisibleAG = false;
  }

  togglePopupAG() {
    this.popupVisibleAG = !this.popupVisibleAG;
    this.popupVisibleCollectionCenter = false;
    this.popupVisibleMarketPrice = false;
    this.popupVisibleCompanys = false;
  }

  addCompany(): void {
    this.router.navigate(['/govi-link/action/add-a-company']);
  }

  addService(): void {
    this.router.navigate(['/govi-link/action/add-services']);
  }

  addviewService(): void {
    this.router.navigate(['/govi-link/action/view-services-list']);
  }
  viewCompanyList(): void {
    this.router.navigate(['/govi-link/action/view-company-list']);
  }

  assignGoViLinkJobs(): void {
    this.router.navigate(['/govi-link/action/view-govi-link-jobs']);
  }
}
