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

  constructor(private router: Router) {}

  closeAllPopups() {
    this.popupVisibleCategories = false;
    this.popupVisiblePlantCare = false;
    this.popupVisibleCollectionCenters = false;
    this.popupVisibleSalesAgents = false;
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

  navigationPath(path: string) {
    this.router.navigate([path]);
  }
}
