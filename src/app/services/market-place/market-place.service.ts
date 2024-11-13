import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarketPlaceService {
  private apiUrl = `${environment.API_URL}`;
  private token = `${environment.TOKEN}`;

  constructor(private http: HttpClient) { }

  getCropVerity(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });

    let url = `${this.apiUrl}market-place/get-crop-category`;
    return this.http.get<any>(url, { headers });
  }


  createProduct(Data: any): Observable<any> {
    console.log("add marketttttt");
    
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.post(`${this.apiUrl}market-place/add-market-product`, Data, {
      headers,
    });
  }
}
