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

  createCompany(companyData: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    const url = `${this.apiUrl}create-company`;

    return this.http.post(url, companyData, {
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
  }
): Observable<any> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${this.token}`,
  });

  return this.http.put(this.apiUrl + `update-officer-service/${id}`, data, {
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


}


