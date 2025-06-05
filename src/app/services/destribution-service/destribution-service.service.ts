import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from '../token/services/token.service';

export interface DistributionCentreRequest {
  name: string;
  company: number;
  officerInCharge: string;
  contact1: string;
  contact1Code: string;
  contact2: string;
  contact2Code: string;
  latitude: string;
  longitude: string;
  email: string;
  country: string;
  province: string;
  district: string;
  city: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DestributionService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  private getHeaders(): HttpHeaders {
    const token = this.tokenService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  createDistributionCentre(
    data: DistributionCentreRequest
  ): Observable<ApiResponse> {
    const url = `${this.apiUrl}distribution/create-distribution-center`;
    return this.http.post<ApiResponse>(url, data, {
      headers: this.getHeaders(),
    });
  }

  getAllDistributionCentre(
    page: number,
    limit: number,
    district: string = '',
    province: string = '',
    company: string = '',
    searchItem: string = ''
  ): Observable<any> {
    console.log(page, limit, searchItem);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}distribution/get-all-distribution-centre?page=${page}&limit=${limit}`;
    if (searchItem) {
      url += `&searchItem=${searchItem}`;
    }

    if (district) {
      url += `&district=${district}`;
    }

    if (province) {
      url += `&province=${province}`;
    }
    if (province) {
      url += `&company=${company}`;
    }

    return this.http.get<any>(url, { headers: headers });
  }

  getCompanies(): Observable<ApiResponse<{ companyNameEnglish: string }[]>> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}distribution/get-companies`;
    return this.http.get<ApiResponse<{ companyNameEnglish: string }[]>>(url, {
      headers,
    });
  }

  getAllCompanies(): Observable<ApiResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
  
    let url = `${this.apiUrl}distribution/get-company`;
    return this.http.get<ApiResponse>(url, {
      headers,
    });
  }
}
