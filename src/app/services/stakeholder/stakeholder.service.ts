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

  constructor(private http: HttpClient, private tokenService: TokenService) {}

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
            modifiedBy: item.modifyBy || 'System',
          }));
        }),
        catchError((error) => {
          console.error('API Error:', error);
          throw error;
        })
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

  getAllManagerList(companyId: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    console.log('This is company Id', companyId);
    return this.http.get(
      `${this.apiUrl}auth/get-all-manager-list/${companyId}`,
      {
        headers,
      }
    );
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
    contract?: File | null
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
    contract?: File
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
      { headers }
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
}
