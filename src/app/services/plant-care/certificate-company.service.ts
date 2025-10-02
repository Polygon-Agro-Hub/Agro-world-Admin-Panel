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

// Payload for creating a certificate
export interface CertificatePayload {
  srtcomapnyId: number;
  srtName: string;
  srtNumber: string;
  applicable: string;
  accreditation: string;
  serviceAreas: string[];
  price: number;
  timeLine: number;
  commission: number;
  tearms: string; // dummy value for now
  scope: string;
  cropIds: number[];
}

@Injectable({
  providedIn: 'root',
})
export class CertificateCompanyService {
  private apiUrl = `${environment.API_URL}`;

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

  // Get only id and companyName
  getAllCompaniesNamesOnly(): Observable<CertificateCompany[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });

    return this.http.get<CertificateCompany[]>(
      `${this.apiUrl}certificate-company/all/names-only`,
      { headers }
    );
  }

  // Create Certificate
  createCertificate(
    formData: FormData
  ): Observable<{ message: string; status: boolean; certificateId?: number }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
      // DO NOT set Content-Type, browser will set it automatically for FormData
    });

    return this.http.post<{
      message: string;
      status: boolean;
      certificateId?: number;
    }>(`${this.apiUrl}certificate-company/certificate/create`, formData, {
      headers,
    });
  }
}
