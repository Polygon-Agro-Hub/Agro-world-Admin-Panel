import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from '../token/services/token.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoviLinkService {
  private apiUrl = `${environment.API_URL}govi-link/`;
  private token = this.tokenService.getToken();
  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) { }

  createCompany(companyData: any, logoFile?: File): Observable<any> {
    const formData = new FormData();

    // Append each field individually
    formData.append('regNumber', companyData.regNumber);
    formData.append('companyName', companyData.companyName);
    formData.append('email', companyData.email);
    formData.append('financeOfficerName', companyData.financeOfficerName);
    formData.append('accName', companyData.accName);
    formData.append('accNumber', companyData.accNumber);
    formData.append('bank', companyData.bank);
    formData.append('branch', companyData.branch);
    formData.append('phoneCode1', companyData.phoneCode1);
    formData.append('phoneNumber1', companyData.phoneNumber1);
    formData.append('phoneCode2', companyData.phoneCode2);
    formData.append('phoneNumber2', companyData.phoneNumber2);
    formData.append('modifyBy', companyData.modifyBy);

    // Append logo file if provided
    if (logoFile) {
      console.log('Appending logo file:', logoFile.name, logoFile.size); // Debug log
      formData.append('logo', logoFile, logoFile.name);
    } else {
      console.log('No logo file to append'); // Debug log
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      // Remove Content-Type - let browser set it with boundary for multipart
    });

    const url = `${this.apiUrl}create-company`;

    return this.http.post(url, formData, {
      headers,
    });
  }

  getCompanyById(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.apiUrl}get-company-by-id/${id}`, {
      headers,
    });
  }



  saveOfficerService(data: {
    englishName: string;
    tamilName: string;
    sinhalaName: string;
    srvFee?: number;
  }): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`
    });

    return this.http.post(this.apiUrl + 'save-officer-service', data, { headers });
  }

  getAllCompanyDetails(search: string = ''): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}get-all-companies`;
    if (search) {
      url += `?search=${encodeURIComponent(search)}`;
    }

    return this.http.get<any>(url, { headers });
  }

  updateCompany(companyData: any, id: number): Observable<any> {
    console.log(companyData);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.patch(
      `${this.apiUrl}update-company/${id}`,
      companyData,
      {
        headers,
      }
    );
  }

  deleteCompany(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    console.log('DELETE ITEM', id);
    return this.http.delete(`${this.apiUrl}/delete-company/${id}`, {
      headers,
    });
  }

  updateOfficerService(
    id: number,
    data: {
      englishName: string;
      tamilName: string;
      sinhalaName: string;
      srvFee?: number;
      modifyBy?: string;
    }
  ): Observable<any> {
    const token = localStorage.getItem('AdminLoginToken'); // fetch token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    const modifyBy = localStorage.getItem('AdminUserId'); // <--- correct key
    const payload = { ...data, modifyBy };

    console.log('Payload being sent:', payload); // optional: check in console

    return this.http.put(this.apiUrl + `update-officer-service/${id}`, payload, {
      headers,
    });
  }


  getOfficerServiceById(id: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.get(this.apiUrl + `get-officer-service-by-id/${id}`, { headers });
  }
  getAllOfficerServices(): Observable<any[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get<any[]>(`${this.apiUrl}get-all-officer-service`, { headers });
  }
  deleteOfficerService(id: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.delete<any>(`${this.apiUrl}/officer-service/${id}`, { headers });
  }

}


