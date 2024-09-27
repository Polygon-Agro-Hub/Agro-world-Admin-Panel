import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

interface MarketPriceItem {
  id: number;
  titleEnglish: string;
  titleSinhala: string;
  titleTamil: string;
  descriptionEnglish: string;
  descriptionSinhala: string;
  descriptionTamil: string;
  image: string;
  status: string;
  price: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class MarketPriceService {
  private apiUrl = `${environment.API_BASE_URL}`;
  private token = `${environment.TOKEN}`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllMarketPrices(page: number, limit: number, statusFilter?: string, createdDateFilter?: string): Observable<{ items: MarketPriceItem[], total: number }> {
    let url = `${this.apiUrl}get-all-market-price?page=${page}&limit=${limit}`;

    if (statusFilter) {
      url += `&status=${statusFilter}`;
    }
    if (createdDateFilter) {
      url += `&createdAt=${createdDateFilter}`;
    }

    return this.http.get<{ items: MarketPriceItem[], total: number }>(url, { headers: this.getHeaders() });
  }

  deleteMarketPrice(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}delete-market-price/${id}`, { headers: this.getHeaders() });
  }

  getMarketPriceById(id: number): Observable<MarketPriceItem> {
    return this.http.get<MarketPriceItem>(`${this.apiUrl}get-market-price-by-id/${id}`, { headers: this.getHeaders() });
  }

  updateMarketPriceStatus(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}edit-market-price-status/${id}`, {}, { headers: this.getHeaders() });
  }

  
}



