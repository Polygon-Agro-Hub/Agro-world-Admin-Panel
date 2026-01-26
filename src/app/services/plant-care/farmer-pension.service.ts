import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { TokenService } from '../token/services/token.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FarmerPensionService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.tokenService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  getFarmersUnder5Years(
    page: number = 1,
    limit: number = 10,
    searchText?: string,
  ): Observable<{ total: number; items: any[] }> {
    const headers = this.getHeaders();

    let url = `${this.apiUrl}auth/farmer-pension-under-5-years-details?page=${page}&limit=${limit}`;

    if (searchText) {
      url += `&searchText=${encodeURIComponent(searchText)}`;
    }

    return this.http.get<{ total: number; items: any[] }>(url, { headers });
  }
}
