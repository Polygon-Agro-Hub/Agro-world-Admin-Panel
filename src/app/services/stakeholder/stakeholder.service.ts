import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from '../token/services/token.service';
import { catchError, map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class StakeholderService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) { }

  getAdminUserData(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.apiUrl}stakeholder/get-admin-user-data`, {
      headers,
    });
  }

  getAllFieldInspectors(filters?: any): Observable<any[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    // Build query parameters
    let params = new HttpParams();

    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.language) params = params.set('language', filters.language);
      if (filters.district) params = params.set('district', filters.district);
      if (filters.role) params = params.set('role', filters.role);
      if (filters.search) params = params.set('search', filters.search);
    }

    return this.http
      .get<any>(`${this.apiUrl}stakeholder/get-all-field-officers`, {
        headers,
        params,
      })
      .pipe(
        map((res) => {
          if (!res.status) {
            throw new Error(res.error || 'Failed to fetch field officers');
          }
          return res.data.map((item: any) => ({
            id: item.id,
            empId: item.empId,
            firstName: item.firstName,
            lastName: item.lastName,
            role: item.JobRole?.trim() || 'N/A',
            district: item.distrct || 'N/A',
            language: this.mapLanguage(item.language),
            status: item.status || 'Not Approved',
            phone: item.phoneNumber1
              ? `${item.phoneCode1} ${item.phoneNumber1}`
              : 'N/A',
            nic: item.nic || 'N/A',
            modifyBy: item.modifyBy || '--',
            assignDistrict: item.assignDistrict
              ? item.assignDistrict.split(',')
              : ['--'],
          }));
        }),
        catchError((error) => {
          console.error('API Error:', error);
          throw error;
        }),
      );
  }

  private mapLanguage(langString: string): string {
    if (!langString) return 'N/A';

    return langString
      .split(',')
      .map((lang: string) => {
        switch (lang.trim()) {
          case 'Eng':
            return 'English';
          case 'Sin':
            return 'Sinhala';
          case 'Tam':
            return 'Tamil';
          default:
            return lang.trim();
        }
      })
      .join(', ');
  }

  getAllCompanies(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.get(`${this.apiUrl}auth/get-all-companies`, {
      headers,
    });
  }

  getAllManagerList(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.get(`${this.apiUrl}auth/get-all-manager-list`, {
      headers,
    });
  }

  getForCreateId(role: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.apiUrl}auth/get-last-emp-id/${role}`, {
      headers,
    });
  }

  createFieldOfficer(
    person: any,
    profileImage?: File | null,
    nicFront?: File | null,
    nicBack?: File | null,
    passbook?: File | null,
    contract?: File | null,
  ): Observable<any> {
    const formData = new FormData();
    formData.append('officerData', JSON.stringify(person));

    // Append files only if they are not null
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }
    if (nicFront) {
      formData.append('nicFront', nicFront);
    }
    if (nicBack) {
      formData.append('nicBack', nicBack);
    }
    if (passbook) {
      formData.append('passbook', passbook);
    }
    if (contract) {
      formData.append('contract', contract);
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.post(`${this.apiUrl}auth/create-field-officer`, formData, {
      headers,
    });
  }

  getFiealdOfficerById(id: number) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get(`${this.apiUrl}auth/get-field-officer/${id}`, {
      headers,
    });
  }

  editFieldOfficer(
    officerData: any,
    id: number,
    profileImage?: File,
    nicFront?: File,
    nicBack?: File,
    passbook?: File,
    contract?: File,
  ): Observable<any> {
    const formData = new FormData();

    // Append officer data as JSON string
    formData.append('officerData', JSON.stringify(officerData));

    // Append files only if they are provided
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }
    if (nicFront) {
      formData.append('nicFront', nicFront);
    }
    if (nicBack) {
      formData.append('nicBack', nicBack);
    }
    if (passbook) {
      formData.append('passbook', passbook);
    }
    if (contract) {
      formData.append('contract', contract);
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.put(
      `${this.apiUrl}auth/update-field-officers/${id}`,
      formData,
      { headers },
    );
  }

  // Change inspector status
  changeInspectorStatus(id: number, status: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    const url = `${this.apiUrl}stakeholder/update-status-send-password/${id}/${status}`;
    return this.http.put<any>(url, {}, { headers });
  }

  getAllGoviShopUsers(
    search?: string,
    currentPlan: string = '',
    page: number = 1,
    limit: number = 10
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let params = new HttpParams();

    // Add pagination parameters
    params = params.set('page', page.toString());
    params = params.set('limit', limit.toString());

    // Add filter parameters if provided
    if (search) {
      params = params.set('search', search);
    }

    if (currentPlan) {
      params = params.set('currentPlan', currentPlan);
    }

    return this.http
      .get(`${this.apiUrl}shop/view-govi-shop-users`, {
        headers,
        params,
      })
  }

  deleteGoviShopUser(id: number, reason: string | null): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.delete(`${this.apiUrl}shop/delete-govi-shop-user/${id}`, {
      headers,
      body: { reason }
    });
  }

  checkPhone(mobileNumber: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(
      `${this.apiUrl}shop/check-phone`,
      { mobileNumber },
      { headers }
    );
  }

  sendOtp(mobileNumber: string): Observable<any> {
    const apiUrl = "https://api.getshoutout.com/otpservice/send";

    const formattedNumber = `+94${mobileNumber.replace(/^0/, '')}`;

    const headers = new HttpHeaders({
      Authorization: `Apikey ${environment.SHOUTOUT_API_KEY}`,
      'Content-Type': 'application/json',
    });

    const body = JSON.stringify({
      source: "PolygonAgro",
      transport: "sms",
      content: {
        sms: 'Your OTP for verification is: {{code}}',
      },
      destination: formattedNumber,
    });

    return this.http.post(apiUrl, body, { headers });
  }

  verifyOtp(referenceId: string, otp: string): Observable<any> {
    const apiUrl = "https://api.getshoutout.com/otpservice/verify";

    const headers = new HttpHeaders({
      Authorization: `Apikey ${environment.SHOUTOUT_API_KEY}`,
      'Content-Type': 'application/json',
    });

    const body = JSON.stringify({
      referenceId: referenceId,
      code: otp,
    });

    return this.http.post(apiUrl, body, { headers });
  }

  // checkPhone(mobileNumber: string): Observable<any> {
  //   const headers = new HttpHeaders({
  //     Authorization: `Bearer ${this.token}`,
  //     'Content-Type': 'application/json',
  //   });

  //   return this.http.post(`${this.apiUrl}shop/check-phone`, 
  //    {
  //     headers,
  //     body: { mobileNumber }
  //    });
  // }

  createGoviShopUser(fullName: string, mobileNumber: string, email: string, selectedSubscription: string, nic: string, selectedFile: File | null): Observable<any> {

    const supplierData = { fullName, mobileNumber, email, selectedSubscription, nic }
    const formData = new FormData();

    formData.append("supplierData", JSON.stringify(supplierData));
    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });

    return this.http.post(`${this.apiUrl}shop/create-govi-shop-user`,
      formData,
      {
        headers
      });
  }

  viewGoviShopSupplierById(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    const url = `${this.apiUrl}shop/view-govi-shop-supplier/${id}`;
    return this.http.get<any>(url, { headers });
  }

  getAllShopsbyOwnerId(
    id: number,
    page: number,
    limit: number,
    accessStatus: string,
    approval: string,
    bussinessType: string,
    searchItem: string,
    
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}shop/get-all-shops-by-owner?id=${id}&page=${page}&limit=${limit}`;

    if (accessStatus) {
      url += `&accessStatus=${accessStatus}`;
    }

    if (approval) {
      url += `&approval=${approval}`;
    }

    if (bussinessType) {
      url += `&bussinessType=${bussinessType}`;
    }

    if (searchItem) {
      url += `&searchItem=${searchItem}`;
    }

    return this.http.get<any>(url, { headers });
  }

  getSupplierById(id: number) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get<any>(`${this.apiUrl}shop/get-supplier-by-id/${id}`, {
      headers,
    });
  }

  updateGoviShopUser(supplierData: any): Observable<any> {

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.apiUrl}shop/update-govi-shop-user`,
    supplierData,
      {
        headers
      });
  }
  
  getAllShopsRequests(
    page: number,
    limit: number,
    approval: string,
    bussinessType: string,
    searchItem: string,
    
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}shop/get-all-shop-requests?page=${page}&limit=${limit}`;

    if (approval) {
      url += `&approval=${approval}`;
    }

    if (bussinessType) {
      url += `&bussinessType=${bussinessType}`;
    }

    if (searchItem) {
      url += `&searchItem=${searchItem}`;
    }

    return this.http.get<any>(url, { headers });
  }

  getGoViShopById(id: number) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get<any>(`${this.apiUrl}shop/get-govi-shop-by-id/${id}`, {
      headers,
    });
  }

  getGoViShopForUpdate(id: number) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get<any>(`${this.apiUrl}shop/get-govi-shop-for-update/${id}`, {
      headers,
    });
  }

  updateGoviShop(shopData: any): Observable<any> {

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.apiUrl}shop/update-govi-shop`,
    shopData,
      {
        headers
      });
  }

  getShopById(id: number) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get<any>(`${this.apiUrl}shop/get-shop-by-id/${id}`, {
      headers,
    });
  }

  getUsers(
  search?: string,
  role?: string
): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
    'Content-Type': 'application/json',
  });

  let params = new HttpParams();

  // Add filter parameters if provided
  if (search) {
    params = params.set('search', search);
  }

  if (role) {
    params = params.set('role', role);
  }

  return this.http
    .get(`${this.apiUrl}shop/users`, {
      headers,
      params,
    });
}

  getPosUserById(id: number) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get<any>(`${this.apiUrl}shop/get-pos-user-by-id/${id}`, {
      headers,
    });
  }

  updatePOSUser(userData: any): Observable<any> {

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.apiUrl}shop/update-pos-user`,
    userData,
      {
        headers
      });
  }

  resetPassword(userData: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(`${this.apiUrl}shop/reset-govi-shop-user-password`,
    userData,
      {
        headers
      });

  }

  getBranchesList(shopId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    
    return this.http.get(
      `${this.apiUrl}shop/get-govi-shop-branches/${shopId}`,
      {
        headers,
      }
    );
  }

  approveGoviShop(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
  
    const url = `${this.apiUrl}shop/approve-govi-shop/${id}`;
    return this.http.put<any>(url, {}, { headers });
  }

  rejectGoviShop(id: number, text: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    const url = `${this.apiUrl}shop/reject-govi-shop/${id}`;
    return this.http.post<any>(url, {text}, { headers });
  }

  toggleShopActiveStatus(shopId: number, isActive: number): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
    'Content-Type': 'application/json',
  });

  const url = `${this.apiUrl}shop/toggle-shop-status/${shopId}`;
  return this.http.put<any>(url, { isActive }, { headers });
}

deleteGoviShop(id: number, reason: string | null): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.delete(`${this.apiUrl}shop/delete-govi-shop/${id}`, {
      headers,
      body: { reason }
    });
  }


}

