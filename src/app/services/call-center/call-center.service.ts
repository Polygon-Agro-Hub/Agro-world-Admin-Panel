import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TokenService } from '../token/services/token.service';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class CallCenterService {

  private apiUrl = `${environment.API_URL}call-center/`;
  private token = this.tokenService.getToken();
  constructor(private http: HttpClient, private tokenService: TokenService) { }

  getIvrCallSummary(query: IvrSummaryQuery): Observable<IvrSummaryPage> {
    return this.http.get<IvrSummaryPage>(`${this.apiUrl}ivr/call-summary`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.tokenService.getToken()}` }),
      params: { ...query },
    });
  }

  getDashbordData(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.get(`${this.apiUrl}call-center-dashbord`, {
      headers,
    });
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

    return this.http.get<IvrLiveCallsResponse>(`${this.apiUrl}ivr-live-calls`, { headers, params });
  }
}