import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { environment } from '../../environment/environment';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './marketplace.component.html',
  styleUrl: './marketplace.component.css'
})
export class MarketplaceComponent {
  popupVisibleMarketPrice = false
  private token = `${environment.TOKEN}`;


  constructor(private http: HttpClient) { }


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
