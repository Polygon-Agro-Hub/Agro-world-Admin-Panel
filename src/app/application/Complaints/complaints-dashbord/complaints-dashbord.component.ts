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
  popupVisiblePlantCare: boolean = false;
  popupVisibleCollectionCenters: boolean = false;
  popupVisibleCategories: boolean = false;

  constructor(private router: Router) { }
  togglePlantCare() {
    this.popupVisiblePlantCare = !this.popupVisiblePlantCare;
  }

  toggleCollectionCenters() {
    this.popupVisibleCollectionCenters = !this.popupVisibleCollectionCenters;
  }

  toggleCategories() {
    this.popupVisibleCategories = !this.popupVisibleCategories;
  }

  navigationPath(path: string) {
    this.router.navigate([path])
  }
}
