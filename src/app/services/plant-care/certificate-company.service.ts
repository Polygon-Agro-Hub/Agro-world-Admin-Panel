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
  tearms: string;
  scope: string;
  cropIds: number[];
}

export interface Questionnaire {
  id?: number;
  companyId: number;
  questionNo: number;
  type: string;
  questionEnglish: string;
  questionSinhala: string;
  questionTamil: string;
  createdAt?: string;
  updatedAt?: string;
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
      `${this.apiUrl}certificate-company//company`,
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
      `${this.apiUrl}certificate-company/company/${id}`,
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
      `${this.apiUrl}certificate-company/company/${id}`,
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
      `${this.apiUrl}certificate-company/company/all?search=${search}`,
      { headers }
    );
  }

  // Delete Certificate Company
  deleteCompany(id: number): Observable<{ message: string; status: boolean }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });
    return this.http.delete<{ message: string; status: boolean }>(
      `${this.apiUrl}certificate-company/company/${id}`,
      { headers }
    );
  }

  // Get only id and companyName
  getAllCompaniesNamesOnly(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });
    return this.http.get<any>(
      `${this.apiUrl}certificate-company/company/all/names-only`,
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

  // Create questionnaire
  createQuestionnaire(payload: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
      'Content-Type': 'application/json',
    });
    return this.http.post(
      `${this.apiUrl}certificate-company/questionnaire/create`,
      payload,
      { headers }
    );
  }

  getAllCertificates(
    filterQuction: string = '',
    selectArea: string = '',
    comapny: string = '',
    searchText: string = ''
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });
    let url = `${this.apiUrl}certificate-company/certificates/all-certificates?page=1`;

    if (filterQuction) {
      url += `&quaction=${filterQuction}`;
    }

    if (selectArea) {
      url += `&area=${selectArea}`;
    }

    if (searchText) {
      url += `&searchText=${searchText}`;
    }

    if (comapny) {
      url += `&company=${comapny}`;
    }
    return this.http.get<any>(url, { headers });
  }

  // Get questionnaires by certificate ID
  getQuestionnaireList(certificateId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });
    return this.http.get(
      `${this.apiUrl}certificate-company/questionnaire/${certificateId}`,
      { headers }
    );
  }

  // Update questionnaire by ID
  updateQuestionnaire(id: number, payload: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
      'Content-Type': 'application/json',
    });
    return this.http.put(
      `${this.apiUrl}certificate-company/questionnaire/${id}`,
      payload,
      { headers }
    );
  }

  // Delete questionnaire by ID
  deleteQuestionnaire(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });
    return this.http.delete(
      `${this.apiUrl}certificate-company/questionnaire/${id}`,
      { headers }
    );
  }
}
