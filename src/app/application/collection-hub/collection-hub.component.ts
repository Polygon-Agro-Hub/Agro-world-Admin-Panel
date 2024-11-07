import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

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
  popupVisibleMarketPrice = false
  private token = `${environment.TOKEN}`;


  constructor(private http: HttpClient) { }

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

  togglePopupMarketPrice() {
    this.popupVisibleMarketPrice = !this.popupVisibleMarketPrice
  }

  downloadTemplate1() {
    const apiUrl = 'http://localhost:3000/api/market-price/download/market_price_format.xlsx';
    window.location.href = apiUrl;
    Swal.fire({
      icon: 'success',
      title: 'Downloaded',
      text: 'Please check the download folder',
    });
  }
}
