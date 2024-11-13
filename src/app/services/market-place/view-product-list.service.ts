import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ViewProductListService {
  private apiUrl = `${environment.API_URL}`;
  private token = `${environment.TOKEN}`;

  constructor(private http: HttpClient) {}

  getProductList(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}market-place/get-market-items`;
    return this.http.get<any>(url, { headers });
  }
}
