import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
import { environment } from '../../environment/environment';
import { TokenService } from '../token/services/token.service';
import { DashboardQuery, DashboardResponse } from '../../models/call-center.model';

export type IvrCallStatus = 'ANSWERED' | 'MISSED' | 'ONGOING';

export interface IvrLiveCallItem {
  id: number;
  flow: string;
  fromMain: string;
  fromSub: string;
  toMain: string;
  toSub: string;
  time: string | null;
  type: string;
  status: IvrCallStatus;
  description: string;
  feedback?: string;
}

export interface IvrLiveCallsResponse {
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  syncedAt: string | null;
  nextSyncAfter: string | null;
  items: IvrLiveCallItem[];
}

export interface IvrLiveCallsQuery {
  page: number;
  size: number;
  status?: string[];  
  search?: string;
  from?: string;       
  to?: string;         
}


export type IvrSummaryType = 'ALL_DIAL_CALLS' | 'OUT_DIAL_CALLS' | 'DIRECT_CALL_MAPPING' | 'CONNECT_AGENT_CALLS' | 'TRANSFER_CALLS' | 'CONFERENCE_CALLS' | 'IVR_UPLOAD_CALLS';
export interface IvrSummaryQuery {
  flowId: number; type: IvrSummaryType; from: string; to: string; page: number; size: number;
}
export interface IvrSummaryItem {
  id?: number; campaignId?: string; callId?: number;
  scheduledTime?: string | null; executedTime?: string | null; result?: string | null; callerNumber?: string; agentCli?: string | null;
  customerNumber?: string; fromNumber?: string; toNumber?: string;
  dialStartTime?: string; dialEndTime?: string | null;
  startTime?: string | null; endTime?: string | null; status?: string; details?: string;
}
export interface IvrSummaryPage {
  page: number; size: number; totalItems: number; totalPages: number; items: IvrSummaryItem[];
}

@Injectable({ providedIn: 'root' })
export class CallCenterService {
  private readonly url = `${environment.API_URL}call-center/dashboard`;
  // First request after a server start can be slow (spec section 7)
  private readonly TIMEOUT_MS = 60000;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  getIvrCallSummary(query: IvrSummaryQuery): Observable<IvrSummaryPage> {
    return this.http.get<IvrSummaryPage>(`${environment.API_URL}call-center/ivr/call-summary`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.tokenService.getToken()}` }),
      params: { ...query },
    });
  }

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

  getIvrLiveCalls(query: IvrLiveCallsQuery): Observable<IvrLiveCallsResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });

    let params = new HttpParams()
      .set('page', query.page)
      .set('size', query.size);

    if (query.status?.length) params = params.set('status', query.status.join(','));
    if (query.search) params = params.set('search', query.search);
    if (query.from) params = params.set('from', query.from);
    if (query.to) params = params.set('to', query.to);

    return this.http.get<IvrLiveCallsResponse>(`${environment.API_URL}call-center/ivr-live-calls`, { headers, params });
  }
}