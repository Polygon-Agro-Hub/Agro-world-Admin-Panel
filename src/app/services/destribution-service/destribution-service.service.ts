import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from '../token/services/token.service';

export interface DistributionCentreRequest {
  name: string;
  company: number;
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
  regCode: string;
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

  // createDistributionCentre(
  //   data: DistributionCentreRequest
  // ): Observable<ApiResponse> {
  //   console.log('data', data);
  //   const url = `${this.apiUrl}distribution/create-distribution-center`;
  //   return this.http.post<ApiResponse>(url, data, {
  //     headers: this.getHeaders(),
  //   });
  // }

  createDistributionCentre(
    data: any
  ): Observable<ApiResponse> {
    console.log('data', data);
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
    searchItem: string = '',
    centerType: string = ''
  ): Observable<any> {
    console.log('district', district, 'province', province, 'company', company, 'searchItem', searchItem, 'centerType', centerType)
    // console.log('Request params:', {
    //   page,
    //   limit,
    //   district,
    //   province,
    //   company,
    //   searchItem,
    // });

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    // Base URL with required params
    let url = `${this.apiUrl}distribution/get-all-distribution-centre?page=${page}&limit=${limit}`;

    // Add optional params with proper encoding
    if (searchItem) {
      console.log('has search')
      url += `&searchItem=${encodeURIComponent(searchItem)}`; // Changed to 'search' to match API
    }

    if (district) {
      url += `&district=${encodeURIComponent(district)}`;
    }

    if (province) {
      url += `&province=${encodeURIComponent(province)}`;
    }

    if (company) {
      // Fixed: separate condition for company
      url += `&company=${encodeURIComponent(company)}`;
    }
    if (centerType) {
      url += `&centerType=${centerType}`;
    }
    // if (centerType) {
    //   url += `&centerType=${centerType}`;
    // }

    console.log('Final URL:', url);
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

  deleteDistributedCenter(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}distribution/delete-distributed-center/${id}`;
    return this.http.delete<any>(url, {
      headers,
    });
  }

  getDistributionCentreById(id: number): Observable<any> {
    console.log('Request ID:', id);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    const url = `${this.apiUrl}distribution/get-distribution-centre/${id}`;

    console.log('Final URL:', url);
    return this.http.get<any>(url, { headers: headers });
  }

  updateDistributionCentreDetails(
    id: number,
    updateData: any
  ): Observable<any> {
    console.log('updateData', updateData)
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.put(
      `${this.apiUrl}distribution/update-distribution-centre/${id}`,
      updateData,
      { headers }
    );
  }

  deleteDistributionCenter(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    const url = `${this.apiUrl}distribution/delete-distribution-centre/${id}`;
    return this.http.delete<any>(url, { headers });
  }

  generateRegCode(
    province: string,
    district: string,
    city: string
  ): Observable<{ regCode: string }> {
    return this.http.post<{ regCode: string }>(
      `${this.apiUrl}distribution/generate-regcode`,
      { province, district, city }
    );
  }
}
