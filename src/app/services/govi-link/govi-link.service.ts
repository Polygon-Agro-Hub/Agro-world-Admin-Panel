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

    const url = `${this.apiUrl}auth/create-company`;

    return this.http.post(url, companyData, {
      headers,
    });
  }

  getCompanyById(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.apiUrl}auth/get-company-by-id/${id}`, {
      headers,
    });
  }
}
