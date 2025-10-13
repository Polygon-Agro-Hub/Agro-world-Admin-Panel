import { W } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-complaints-dashbord',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './complaints-dashbord.component.html',
  styleUrl: './complaints-dashbord.component.css',
})
export class ComplaintsDashbordComponent {
  popupVisiblePlantCare = false;
  popupVisibleCollectionCenters = false;
  popupVisibleCategories = false;
  popupVisibleSalesAgents = false;
  popupVisibleMPRetail = false;
  popupVisibleMPWholesale = false;
  popupVisibleDistributedcenter = false

  constructor(private router: Router) { }

  closeAllPopups() {
    this.popupVisibleCategories = false;
    this.popupVisiblePlantCare = false;
    this.popupVisibleCollectionCenters = false;
    this.popupVisibleSalesAgents = false;
    this.popupVisibleMPRetail = false;
    this.popupVisibleMPWholesale = false;
    this.popupVisibleDistributedcenter = false


  }

  togglePopupCategories() {
    this.closeAllPopups();
    this.popupVisibleCategories = !this.popupVisibleCategories;
  }

  togglePopupPlantCare() {
    this.closeAllPopups();
    this.popupVisiblePlantCare = !this.popupVisiblePlantCare;
  }

  togglePopupCollectionCenters() {
    this.closeAllPopups();
    this.popupVisibleCollectionCenters = !this.popupVisibleCollectionCenters;
  }

  togglePopupSalesAgents() {
    this.closeAllPopups();
    this.popupVisibleSalesAgents = !this.popupVisibleSalesAgents;
  }

  togglepopupVisibleMPRetail(): void {
    this.closeAllPopups();
    this.popupVisibleMPRetail = !this.popupVisibleMPRetail;
  }

  togglepopupVisibleMPWholesale(): void {
    this.closeAllPopups();
    this.popupVisibleMPWholesale = !this.popupVisibleMPWholesale;
  }

  togglePopupDistributedCenters(){
    this.closeAllPopups();
    this.popupVisibleDistributedcenter = !this.popupVisibleDistributedcenter;
  }


  navigationPath(path: string) {
    this.router.navigate([path]);
  }
}
