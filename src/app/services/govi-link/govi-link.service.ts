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
  private authUrl = `${environment.API_URL}auth/`;
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
    const token = localStorage.getItem('AdminLoginToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    const modifyBy = localStorage.getItem('AdminUserId');
    const payload = { ...data, modifyBy };

    console.log('Payload being sent:', payload);

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

  getOfficersByJobRole(jobRole: string, scheduleDate: string, jobId: number) {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    let params = new HttpParams()
      .set('jobRole', jobRole)
      .set('scheduleDate', scheduleDate)
      .set('jobId', jobId.toString());

    return this.http.get<any>(`${this.apiUrl}get-officers-by-jobrole`, {
      headers,
      params,
    });
  }

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

  getFieldAuditHistory(filters: any = {}): Observable<any> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    let params = new HttpParams();

    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.district) {
      params = params.set('district', filters.district);
    }
    if (filters.completedDateFrom) {
      params = params.set('completedDateFrom', filters.completedDateFrom);
    }
    if (filters.completedDateTo) {
      params = params.set('completedDateTo', filters.completedDateTo);
    }
    if (filters.searchJobId) {
      params = params.set('searchJobId', filters.searchJobId);
    }
    if (filters.searchFarmId) {
      params = params.set('searchFarmId', filters.searchFarmId);
    }
    if (filters.searchNic) {
      params = params.set('searchNic', filters.searchNic);
    }

    return this.http.get<any>(`${this.apiUrl}get-field-audit-history`, {
      headers,
      params,
    });
  }

  /**
   * Get field officer complain by ID
   */
  getFieldOfficerComplainById(id: string | number): Observable<any> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<any>(`${this.apiUrl}get-complain-details/${id}`, {
      headers,
    });
  }

  /**
   * Reply to field officer complain
   */
  replyFieldOfficerComplain(
    id: string | number,
    reply: string
  ): Observable<any> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    const body = { reply };

    return this.http.put<any>(
      `${this.apiUrl}reply-field-officer-complain/${id}`,
      body,
      { headers }
    );
  }

  getDriverComplainById(id: string | number): Observable<any> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<any>(`${this.apiUrl}get-driver-complain/${id}`, {
      headers,
    });
  }

  replyDriverComplain(id: string | number, reply: string): Observable<any> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    const body = { reply };

    return this.http.put<any>(
      `${this.apiUrl}reply-driver-complain/${id}`,
      body,
      { headers }
    );
  }

  getFieldAudit(jobId: string) {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<any>(
      `${this.apiUrl}get-field-audit-history-response/${jobId}`,
      { headers }
    );
  }

  getServiceRequestResponse(jobId: string): Observable<any> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    console.log('fetchiing')

    return this.http.get<any>(`${this.apiUrl}get-service-request-response/${jobId}`, {
      headers
    });
  }

  getFarmerClusterAudith(jobId: string){
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<any>(
      `${this.apiUrl}get-field-audit-history-cluster-response/${jobId}`,
      {headers}
    );
  }

}
