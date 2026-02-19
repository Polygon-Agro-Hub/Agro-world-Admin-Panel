import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from '../token/services/token.service';
import { formatDate } from '@angular/common';

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

  createDistributionCentre(data: any): Observable<ApiResponse> {
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
    centerType: string = '',
    city: string = '' // Add city parameter
  ): Observable<any> {
    console.log('Parameters:', {
      district,
      province,
      company,
      searchItem,
      centerType,
      city,
    });

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    // Base URL with required params
    let url = `${this.apiUrl}distribution/get-all-distribution-centre?page=${page}&limit=${limit}`;

    // Add optional params with proper encoding
    if (searchItem) {
      console.log('has search');
      url += `&searchItem=${encodeURIComponent(searchItem)}`;
    }

    if (district) {
      url += `&district=${encodeURIComponent(district)}`;
    }

    if (province) {
      url += `&province=${encodeURIComponent(province)}`;
    }

    if (company) {
      url += `&company=${encodeURIComponent(company)}`;
    }

    if (centerType) {
      url += `&centerType=${centerType}`;
    }

    if (city) {
      // Add city parameter to URL
      url += `&city=${encodeURIComponent(city)}`;
    }

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
    console.log('updateData', updateData);
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

  checkDistributionCentreNameExists(
    name: string
  ): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(
      `${this.apiUrl}distribution/check-name-exists?name=${encodeURIComponent(
        name
      )}`,
      { headers: this.getHeaders() }
    );
  }

  getCenterTargetDetails(
    id: number,
    status: string = '',
    date: string = '',
    searchText: string = ''
  ): Observable<ApiResponse> {
    let url = `${this.apiUrl}distribution/get-center-target?id=${id}`;
    if (status) {
      url += `&status=${status}`;
    }

    if (date) {
      //  let dateParam = date ? formatDate(date, 'yyyy-MM-dd', 'en-US') :
      url += `&date=${date}`;
    }

    if (searchText) {
      url += `&searchText=${searchText}`;
    }

    return this.http.get<ApiResponse>(url, {
      headers: this.getHeaders(),
    });
  }

  getDistributedCenterOfficers(
    id: number,
    role: string = '',
    status: string = '',
    searchText: string = ''
  ): Observable<ApiResponse> {
    let url = `${this.apiUrl}distribution/get-distribution-officers?id=${id}`;
    if (status) {
      url += `&status=${status}`;
    }

    if (role) {
      url += `&role=${role}`;
    }

    if (searchText) {
      url += `&searchText=${searchText}`;
    }

    return this.http.get<any>(url, {
      headers: this.getHeaders(),
    });
  }

  getCenterOutForDlvryOrders(
    id: number,
    date: string = '',
    status: string = '',
    searchText: string = ''
  ): Observable<ApiResponse> {
    console.log('date', date)
    let url = `${this.apiUrl}distribution/get-center-out-for-dlvry-orders?id=${id}`;
    if (status) {
      url += `&status=${status}`;
    }

    if (date) {
      //  let dateParam = date ? formatDate(date, 'yyyy-MM-dd', 'en-US') :
      url += `&date=${date}`;
    }

    if (searchText) {
      url += `&searchText=${searchText}`;
    }

    return this.http.get<ApiResponse>(url, {
      headers: this.getHeaders(),
    });
  }

  getDailyOfficerDistributedTarget(
    id: number,
    selectDate: string
  ): Observable<any> {
    let url = `${this.apiUrl}distribution/officer-daily-distribution-target/${id}/${selectDate}`;

    return this.http.get<any>(url, {
      headers: this.getHeaders(),
    });
  }

  getSelectedOfficerTargets(
    officerId: number,
    searchText: string = '',
    status: string = '',
    completingStatus: string = ''
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}distribution/get-selected-officer-targets?targetId=${officerId}`;

    if (searchText) {
      url += `&searchText=${searchText}`;
    }

    if (status) {
      url += `&status=${status}`;
    }

    if (completingStatus) {
      url += `&completingStatus=${completingStatus}`;
    }

    return this.http.get<any>(url, { headers });
  }

  getTargetedCustomersOrders(
    page: number = 1,
    limit: number = 10,
    sheduleDate?: string,
    centerId?: number,
    status?: string,
    searchText?: string
  ): Observable<{ total: number; items: any[] }> {
    const headers = this.getHeaders();
    let url = `${this.apiUrl}distribution/get-targeted-customers-orders?page=${page}&limit=${limit}`;

    if (sheduleDate) {
      url += `&sheduleDate=${encodeURIComponent(sheduleDate)}`;
    }
    if (typeof centerId === 'number') {
      url += `&centerId=${centerId}`;
    }
    if (status) {
      url += `&status=${encodeURIComponent(status)}`;
    }
    if (searchText) {
      url += `&searchText=${encodeURIComponent(searchText)}`;
    }

    return this.http.get<{ total: number; items: any[] }>(url, { headers });
  }

  getDistributedVehicles(
    page: number = 1,
    limit: number = 10,
    centerName?: string,
    vehicleType?: string,
    searchText?: string
  ): Observable<{ total: number; items: any[] }> {
    const headers = this.getHeaders();
    let url = `${this.apiUrl}distribution/get-distributed-vehicles?page=${page}&limit=${limit}`;

    if (centerName) {
      url += `&centerName=${encodeURIComponent(centerName)}`;
    }
    if (vehicleType) {
      url += `&vehicleType=${encodeURIComponent(vehicleType)}`;
    }
    if (searchText) {
      url += `&searchText=${encodeURIComponent(searchText)}`;
    }

    return this.http.get<{ total: number; items: any[] }>(url, { headers });
  }

  getReturnRecievedData(
    receivedTime?: string,
    centerId?: number,
    searchText?: string
  ): Observable<{ total: number; items: any[]; grandTotal: number }> {
    const headers = this.getHeaders();
    console.log('data');
    let url = `${this.apiUrl}distribution/get-return-recieved-data`;

    if (receivedTime) {
      url += `?receivedTime=${receivedTime}`;
    } else {
      url += `?`;
    }

    if (typeof centerId === 'number') {
      url += `&centerId=${centerId}`;
    }
    if (searchText) {
      url += `&searchText=${encodeURIComponent(searchText)}`;
    }

    return this.http.get<{ total: number; items: any[]; grandTotal: number }>(
      url,
      { headers }
    );
  }

  // In your service file
// distribution.service.ts
getDistributedCenterPickupOrders(searchParams: {
  companycenterId: number;
  sheduleTime?: string;
  date?: string;
  searchText?: string;
  activeTab?: string;
}): Observable<ApiResponse> {
  // Build query parameters
  let params = new HttpParams()
    .set('companycenterId', searchParams.companycenterId.toString());
  
  // Add optional parameters if they exist
  if (searchParams.sheduleTime && searchParams.sheduleTime.trim() !== '') {
    params = params.set('time', searchParams.sheduleTime.trim());
  }
  
  if (searchParams.date && searchParams.date.trim() !== '') {
    params = params.set('date', searchParams.date.trim());
  }
  
  if (searchParams.searchText && searchParams.searchText.trim() !== '') {
    params = params.set('searchText', searchParams.searchText.trim());
  }
  
  // Send activeTab parameter to backend
  if (searchParams.activeTab) {
    params = params.set('activeTab', searchParams.activeTab.trim());
    
    console.log('Sending activeTab to backend:', searchParams.activeTab);
  }
  
  const url = `${this.apiUrl}distribution/get-distributed-center-pickup-orders`;
  
  console.log('Service call with params:', {
    url: url,
    params: params.toString(),
    activeTab: searchParams.activeTab
  });
  
  return this.http.get<ApiResponse>(url, {
    headers: this.getHeaders(),
    params: params
  });
}

getPickupOrderRecords(id: number): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
    'Content-Type': 'application/json',
  });
  return this.http.get<any>(
    `${this.apiUrl}distribution/get-pickup-order-records/${id}`,
    { headers }
  );
}
}
