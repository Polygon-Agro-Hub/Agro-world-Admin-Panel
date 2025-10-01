import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from '../token/services/token.service';
import { environment } from '../../environment/environment.development';

export interface CertificateCompany {
  id?: number;
  companyName: string;
  regNumber: string;
  taxId: string;
  phoneCode1: string;
  phoneNumber1: string;
  phoneCode2?: string;
  phoneNumber2?: string;
  address: string;
  certificateCount?: number;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CertificateCompanyService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  // Create Certificate Company
  createCompany(
    company: CertificateCompany
  ): Observable<{ message: string; status: boolean; id?: number }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.post<{ message: string; status: boolean; id?: number }>(
      `${this.apiUrl}certificate-company`,
      company,
      { headers }
    );
  }

  // Get All Certificate Companies
  getAllCompaniesWithPagination(
    page: number,
    limit: number
  ): Observable<{ companies: CertificateCompany[]; total: number }> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
    return this.http.get<{ companies: CertificateCompany[]; total: number }>(
      `${this.apiUrl}certificate-company/all?page=${page}&limit=${limit}`,
      { headers }
    );
  }
}
