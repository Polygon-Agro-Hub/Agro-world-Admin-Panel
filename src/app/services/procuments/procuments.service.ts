import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TokenService } from '../token/services/token.service';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class ProcumentsService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  getRecievedOrdersQuantity(
    page: number,
    limit: number,
    filterType: string = '',
    date: string,
    search: string
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}procument/get-received-orders?page=${page}&limit=${limit}`;

    if (filterType) {
      url += `&filterType=${filterType}`;
    }

    if (date) {
      url += `&date=${date}`;
    }

    if (search) {
      url += `&search=${search}`;
    }
    return this.http.get<any>(url, { headers });
  }

  getAllOrdersWithProcessInfo(
    page: number,
    limit: number,
    filterType: string = '',
    date: string = '',
    search: string = ''
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}procument/orders-process-info?page=${page}&limit=${limit}`;

    if (filterType) {
      url += `&filterType=${filterType}`;
    }

    if (date) {
      url += `&date=${date}`;
    }

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    return this.http.get<any>(url, { headers });
  }
}
