import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
  togglePlantCare() {
    this.popupVisiblePlantCare = !this.popupVisiblePlantCare;
  }

  toggleCollectionCenters() {
    this.popupVisibleCollectionCenters = !this.popupVisibleCollectionCenters;
  }
}
