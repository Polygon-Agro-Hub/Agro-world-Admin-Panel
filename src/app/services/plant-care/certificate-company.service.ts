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
  modifyDate?: string | null;
  modifiedByUser?: string | null;
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
      Authorization: `Bearer ${this.tokenService.getToken()}`,
      'Content-Type': 'application/json',
    });
    return this.http.post<{ message: string; status: boolean; id?: number }>(
      `${this.apiUrl}certificate-company`,
      company,
      { headers }
    );
  }

  // Get single company by ID
  getCompanyById(id: number): Observable<{ company: CertificateCompany }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });
    return this.http.get<{ company: CertificateCompany }>(
      `${this.apiUrl}certificate-company/${id}`,
      { headers }
    );
  }

  // Update company
  updateCompany(
    id: number,
    company: CertificateCompany
  ): Observable<{ message: string; status: boolean }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
      'Content-Type': 'application/json',
    });
    return this.http.put<{ message: string; status: boolean }>(
      `${this.apiUrl}certificate-company/${id}`,
      company,
      { headers }
    );
  }

  // Get All Certificate Companies with search
  getAllCompanies(
    search: string = ''
  ): Observable<{ companies: CertificateCompany[]; total: number }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });
    return this.http.get<{ companies: CertificateCompany[]; total: number }>(
      `${this.apiUrl}certificate-company/all?search=${search}`,
      { headers }
    );
  }

  // Delete Certificate Company
  deleteCompany(id: number): Observable<{ message: string; status: boolean }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });
    return this.http.delete<{ message: string; status: boolean }>(
      `${this.apiUrl}certificate-company/${id}`,
      { headers }
    );
  }
}
