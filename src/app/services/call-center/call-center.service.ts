import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
import { environment } from '../../environment/environment';
import { TokenService } from '../token/services/token.service';
import { DashboardQuery, DashboardResponse } from '../../models/call-center.model';

@Injectable({ providedIn: 'root' })
export class CallCenterService {
  private readonly url = `${environment.API_URL}call-center/dashboard`;
  // First request after a server start can be slow (spec section 7)
  private readonly TIMEOUT_MS = 60000;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  // Read the token on every call so a refreshed token is always used
  private headers(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
      'Content-Type': 'application/json',
    });
  }

  private buildParams(q: DashboardQuery): HttpParams {
    let params = new HttpParams();
    (Object.keys(q) as (keyof DashboardQuery)[]).forEach((k) => {
      const v = q[k];
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return params;
  }

  getDashboardData(query: DashboardQuery): Observable<DashboardResponse> {
    return this.http
      .get<DashboardResponse>(this.url, { headers: this.headers(), params: this.buildParams(query) })
      .pipe(timeout(this.TIMEOUT_MS));
  }

  /** CSV of all rows matching `search` (ignores page/limit) */
  exportCsv(search: string): Observable<Blob> {
    let params = new HttpParams().set('export', 'csv');
    if (search) params = params.set('search', search);
    return this.http.get(this.url, { headers: this.headers(), params, responseType: 'blob' });
  }
}