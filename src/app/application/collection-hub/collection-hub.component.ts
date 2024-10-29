import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-collection-hub',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './collection-hub.component.html',
  styleUrl: './collection-hub.component.css',
})
export class CollectionHubComponent {
  popupVisibleCollectionCenter = false;
  popupVisibleComplains = false;

  togglePopupCollectionCenter() {
    this.popupVisibleCollectionCenter = !this.popupVisibleCollectionCenter;
    if(this.popupVisibleComplains=true){
      this.popupVisibleComplains = !this.popupVisibleComplains;
    }
  }

  togglePopupComplains(){
    this.popupVisibleComplains = !this.popupVisibleComplains;
    if(this.popupVisibleCollectionCenter = true){
      this.popupVisibleCollectionCenter = !this.popupVisibleCollectionCenter;
    }
  }
}
