import { HttpClient, HttpHeaders, HttpParams, } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { TokenService } from '../token/services/token.service';

export interface PensionRequest {
  No: number;
  Request_ID: number;
  Farmer_Name: string;
  NIC: string;
  dob: string;
  Successor_Name: string;
  Successor_Type: string;
  Successor_NIC: string;
  Successor_DOB: string;
  defaultPension: any;
  reqStatus: string;
  isFirstTime: any;
  NIC_Front_Image: string;
  NIC_Back_Image: string;
  Successor_NIC_Front_Image: string;
  Successor_NIC_Back_Image: string;
  Status: string;
  Approved_By_Name: string;
  Approver_ID: string;
  Request_Date_Time: string;
  Requested_On: string;
  Approved_Date_Time: string;
}

export interface PensionRequestDetail {
  No: number;
  Request_ID: number;
  Farmer_Name: string;
  NIC: string;
  dob: string;
  Successor_Name: string;
  Successor_Type: string;
  Successor_NIC: string;
  Successor_DOB: string;
  defaultPension: any;
  reqStatus: string;
  isFirstTime: any;
  NIC_Front_Image: string;
  NIC_Back_Image: string;
  Successor_NIC_Front_Image: string;
  Successor_NIC_Back_Image: string;
  Status: string;
  Approved_By_Name: string;
  Approver_ID: string;
  Request_Date_Time: string;
  Requested_On: string;
  Approved_Date_Time: string;
  Phone_Number: string;
}

export interface PensionRequestResponse {
  count: number;
  data: PensionRequest[];
}

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

  getAllPensionRequests(
    status?: string,
    search?: string,
  ): Observable<PensionRequestResponse> {
    let params = new HttpParams();

    if (status && status.trim()) {
      params = params.set('status', status.trim());
    }

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    const headers = this.getHeaders();
    const url = `${this.apiUrl}auth/pension-requests`;

    return this.http.get<PensionRequestResponse>(url, {
      headers: headers,
      params: params,
    });
  }

  // Get pension request by ID
  getPensionRequestById(id: string): Observable<any> {
    const headers = this.getHeaders();
    const url = `${this.apiUrl}auth/pension-request/${id}`;

    return this.http.get<any>(url, { headers });
  }

  updatePensionRequestStatus(id: string, status: string, userId: string, notes: string = ''): Observable<any> {
  const headers = this.getHeaders();
  const url = `${this.apiUrl}auth/update-pension-request/${id}`;

  const body = {
    reqStatus: status,
    approvedBy: userId,  
    approveTime: new Date().toISOString()
  };

  return this.http.put<any>(url, body, { headers });
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

  getFarmers5YearsPlus(
    page: number = 1,
    limit: number = 10,
    searchText?: string,
  ): Observable<{ total: number; items: any[] }> {
    const headers = this.getHeaders();

    let url = `${this.apiUrl}auth/farmer-pension-5-years-plus-details?page=${page}&limit=${limit}`;

    if (searchText) {
      url += `&searchText=${encodeURIComponent(searchText)}`;
    }

    return this.http.get<{ total: number; items: any[] }>(url, { headers });
  }
}
