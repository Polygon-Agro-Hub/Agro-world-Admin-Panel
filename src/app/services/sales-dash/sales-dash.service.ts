import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from '../token/services/token.service';

export interface SalesDashboardTotals {
  totalBuyers: number;
  newBuyers: number;
  existingBuyers: number;
  retailBuyers: number;
  wholesaleBuyers: number;
  wholesaleRequests: number;
  newBuyersValue: number;
  existingBuyersValue: number;
  totalOrdersPlaced: number;
}

export interface SalesDashboardData extends SalesDashboardTotals {
  periodLabel?: string;
  packages: { name: string; purchases: number }[];
}

export interface SalesDashboardResponse {
  status: boolean;
  data: SalesDashboardData | null;
}

export interface SalesAgentRatingRow {
  empId: string;
  name: string;
  target: number | null;
  completed: number | null;
  date: string | null;
}

export interface SalesAgentRatingsResponse {
  items: SalesAgentRatingRow[];
  agents: { empId: string; name: string }[];
}

// ---- Buyer approvals (wholesale applications) ----
export interface BuyerApplication {
  applicationId: number;
  userId: number;
  cusId: string;
  name: string;
  onboarded: string;
  company: string;
  createdAt: string;
  customerContact: string;
  companyContact: string;
  status: 'To Review' | 'Approved' | 'Rejected';
}

export interface BuyerApplicationsResponse {
  status: boolean;
  items: BuyerApplication[];
  total: number;
}

export interface OnboardedOption {
  label: string;
  value: string;
}

export interface OnboardedOptionsResponse {
  status: boolean;
  options: OnboardedOption[];
}

@Injectable({
  providedIn: 'root'
})
export class SalesDashService {

  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(private http: HttpClient, private tokenService: TokenService) { }

  getAllSalesAgents(page: number = 1, limit: number = 10, searchText: string = '', status: string = '', date: string = ''): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}sales-agent-dash/get-all-sales-agents?page=${page}&limit=${limit}`;

    if (status) {
      url += `&status=${status}`
    }

    if (searchText) {
      url += `&searchText=${searchText}`
    }

    if (date) {
      url += `&date=${date}`
    }

    return this.http.get(url, {
      headers,
    });
  }

  saveTarget(targetValue: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    const url = `${this.apiUrl}sales-agent-dash/save-target`;

    // Create request body
    const body = { targetValue };

    return this.http.post(url, body, { headers });
  }

  getAllOrders(
    page: number,
    limit: number,
    orderStatus: string,
    paymentMethod: string,
    paymentStatus: string,
    deliveryType: string,
    searchText: string = '',
    date: string,
    agentFilter: number | string = '',

  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}dash/get-all-Orders?page=${page}&limit=${limit}`;

    if (orderStatus) {
      url += `&orderStatus=${orderStatus}`;
    }

    if (paymentMethod) {
      url += `&paymentMethod=${paymentMethod}`;
    } 

    if (paymentStatus) {
      url += `&paymentStatus=${paymentStatus}`;
    }

    if (deliveryType) {
      url += `&deliveryType=${deliveryType}`;
    }

    if (searchText) {
      url += `&searchText=${searchText}`;
    }

    if (date) {
      url += `&date=${date}`;
    }

    if (agentFilter) {
      url += `&agentFilter=${agentFilter}`;
    }
    return this.http.get<any>(url, { headers });
  }

  getDashboard(): Observable<SalesDashboardResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });
    return this.http.get<SalesDashboardResponse>(
      `${environment.API_URL}dash/dashboard`, { headers },
    );
  }

  getSalesAgentRatings(
    formattedDate: string = '',
    agent: string | null = '',
  ): Observable<SalesAgentRatingsResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}dash/get-sales-agent-ratings?`;

    if (formattedDate) {
      url += `&formattedDate=${formattedDate}`;
    }

    if (agent) {
      url += `&agent=${encodeURIComponent(agent)}`;
    }

    return this.http.get<SalesAgentRatingsResponse>(url, { headers: headers });
  }

  // ---- Buyer approvals ----

  getPendingWholesaleBuyers(
    page: number = 1,
    limit: number = 10,
    searchText: string = '',
    onboarded: string = '',
    status: string = 'To Review'
  ): Observable<BuyerApplicationsResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });

    // HttpParams URL-encodes the values (search text can contain spaces/symbols)
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('status', status);

    if (searchText) params = params.set('searchText', searchText);
    if (onboarded) params = params.set('onboarded', onboarded);

    return this.http.get<BuyerApplicationsResponse>(
      `${this.apiUrl}sales-agent-dash/get-pending-wholesale-buyers`,
      { headers, params }
    );
  }

  getOnboardedOptions(): Observable<OnboardedOptionsResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });

    return this.http.get<OnboardedOptionsResponse>(
      `${this.apiUrl}sales-agent-dash/get-onboarded-options`,
      { headers }
    );
  }
}