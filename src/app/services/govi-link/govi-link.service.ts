import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment.development';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TokenService } from '../token/services/token.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GoviLinkService {
  private apiUrl = `${environment.API_URL}govi-link/`;
  private token = this.tokenService.getToken();
  constructor(private http: HttpClient, private tokenService: TokenService) {}

  saveOfficerService(data: {
    englishName: string;
    tamilName: string;
    sinhalaName: string;
    srvFee?: number;
  }): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.post(this.apiUrl + 'save-officer-service', data, {
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

    return this.http.put(
      this.apiUrl + `update-officer-service/${id}`,
      payload,
      {
        headers,
      }
    );
  }

  getOfficerServiceById(id: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.get(this.apiUrl + `get-officer-service-by-id/${id}`, {
      headers,
    });
  }
  getAllOfficerServices(): Observable<any[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get<any[]>(`${this.apiUrl}get-all-officer-service`, {
      headers,
    });
  }
  deleteOfficerService(id: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.delete<any>(`${this.apiUrl}/officer-service/${id}`, {
      headers,
    });
  }

  getAllGoviLinkJobs(filters: any = {}) {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    // Create params object from filters
    let params = new HttpParams();

    if (filters.searchTerm) {
      params = params.set('search', filters.searchTerm);
    }
    if (filters.district) {
      params = params.set('district', filters.district);
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.assignStatus) {
      params = params.set('assignStatus', filters.assignStatus);
    }
    if (filters.date) {
      params = params.set('date', filters.date);
    }

    return this.http.get<any>(`${this.apiUrl}get-all-govi-link-jobs`, {
      headers,
      params,
    });
  }

  // Get officers by job role
  getOfficersByJobRole(jobRole: string, scheduleDate: string) {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    let params = new HttpParams()
      .set('jobRole', jobRole)
      .set('scheduleDate', scheduleDate);

    return this.http.get<any>(`${this.apiUrl}get-officers-by-jobrole`, {
      headers,
      params,
    });
  }

  // Assign officer to job
  assignOfficerToJob(assignmentData: { jobId: number; officerId: number }) {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<any>(
      `${this.apiUrl}assign-officer-to-job`,
      assignmentData,
      {
        headers,
      }
    );
  }

  // Get basic job details by ID
  getJobBasicDetailsById(jobId: number) {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<any>(`${this.apiUrl}get-job-basic-details/${jobId}`, {
      headers,
    });
  }
}
