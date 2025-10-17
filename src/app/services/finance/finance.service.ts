import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { TokenService } from '../token/services/token.service';

// Dashboard interfaces
export interface DashboardStatistics {
  totalUsers: number;
  proUsers: number;
  freeUsers: number;
  monthlyIncome: number;
  relativeIncomeValue: number;
  incomeStatus: string;
}

export interface RecentPayment {
  transactionId: string;
  farmerName: string;
  packagePeriod: string;
  amount: string;
  dateTime: string;
}

export interface PackageEnrollments {
  free: number;
  pro: number;
}

export interface MonthlyStatistic {
  month: string;
  monthName: string;
  payments: number;
  revenue: number;
}

export interface AreaChartData {
  labels: string[];
  values: number[];
}

export interface DashboardData {
  statistics: DashboardStatistics;
  recentPayments: RecentPayment[];
  packageEnrollments: PackageEnrollments;
  monthlyStatistics: MonthlyStatistic[];
  areaChartData: AreaChartData;
}

export interface DashboardResponse {
  status: boolean;
  data: DashboardData;
}

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {}

  getDashboardData(): Observable<DashboardResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });

    const url = `${this.apiUrl}finance/dashboard`;
    return this.http.get<DashboardResponse>(url, { headers });
  }
}