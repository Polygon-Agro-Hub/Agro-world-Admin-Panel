import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { TokenService } from '../token/services/token.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TargetService {
  private apiUrl = `${environment.API_URL}target`;
  private token = this.tokenService.getToken();

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  getSavedCenterCrops(
    id: number,
    date: string,
    searchText: string = ''
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}/get-saved-center-crops/${id}/${date}`;
    if (searchText) {
      url += `?searchText=${searchText}`;
    }

    return this.http.get<any>(url, { headers });
  }

  updateTargetQty(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}/update-target-crop-qty`;
    return this.http.patch<any>(url, data, { headers });
  }

  addNewCenterTarget(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}/add-new-center-target`;
    return this.http.post<any>(url, data, { headers });
  }

  getCenterCrops(
    id: number,
    page: number = 1,
    limit: number = 10,
    searchText: string = ''
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}/get-center-crops/${id}?page=${page}&limit=${limit}`;
    if (searchText) {
      url += `&searchText=${searchText}`;
    }

    return this.http.get<any>(url, { headers });
  }

  addORremoveCenterCrops(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}/add-center-crops`;
    return this.http.post<any>(url, data, { headers });
  }
}
