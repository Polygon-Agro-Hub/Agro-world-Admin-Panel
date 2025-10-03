import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from '../token/services/token.service';

@Injectable({
  providedIn: 'root',
})
export class StakeholderService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(private http: HttpClient, private tokenService: TokenService) { }

  getAdminUserData(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.apiUrl}stakeholder/get-admin-user-data`, {
      headers,
    });
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
    formData.append("officerData", JSON.stringify(person));

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

    return this.http.post(
      `${this.apiUrl}auth/create-field-officer`,
      formData,
      { headers }
    );
  }
}
