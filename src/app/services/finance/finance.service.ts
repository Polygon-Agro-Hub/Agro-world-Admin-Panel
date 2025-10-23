import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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

// Package Payments interfaces
export interface PackagePayment {
  transactionId: number;
  farmerName: string;
  phoneNumber: string;
  packagePeriod: string;
  amount: string;
  dateTime: string;
  sortDate: string;
}

export interface PackagePaymentsResponse {
  items: PackagePayment[];
  total: number;
}

export interface ServicePaymentsResponse {
  items: ServicePayment[];
  total: number;
}

export interface GoviJobDashboardStatistics {
  totalIncome: number;
  relativeIncomeValue: number;
  incomeStatus: string;
  serviceRequestsThisMonth: number;
  serviceRequestsToday: number;
}

export interface GoviJobRecentPayment {
  transactionId: string;
  farmerName: string;
  serviceName: string;
  amount: string;
  dateTime: string;
}

export interface GoviJobMonthlyStatistic {
  month: string;
  monthName: string;
  payments: number;
  revenue: number;
}

export interface GoviJobAreaChartData {
  labels: string[];
  values: number[];
}

export interface GoviJobDashboardData {
  statistics: GoviJobDashboardStatistics;
  recentPayments: GoviJobRecentPayment[];
  monthlyStatistics: GoviJobMonthlyStatistic[];
  areaChartData: GoviJobAreaChartData;
}

export interface GoviJobDashboardResponse {
  status: boolean;
  data: GoviJobDashboardData;
}

// Certificate Dashboard interfaces
export interface CertificateStatistics {
  totalCertificates: number;
  activeEnrollments: number;
  expiredEnrollments: number;
  monthlyIncome: number;
  relativeIncomeValue: number;
  incomeStatus: string;
}

export interface CertificatePayment {
  transactionId: string;
  farmerName: string;
  certificateName: string;
  payType: string;
  amount: string;
  dateTime: string;
  expiryDate: string;
  validityPeriod: string;
}

export interface CertificateEnrollmentBreakdown {
  forCrop: number;
  forFarm: number;
  forFarmCluster: number;
}

export interface CertificateDashboardData {
  statistics: CertificateStatistics;
  recentPayments: CertificatePayment[];
  enrollmentBreakdown: CertificateEnrollmentBreakdown;
  monthlyStatistics: MonthlyStatistic[];
  areaChartData: AreaChartData;
  dashboardData: any;
}

export interface CertificateDashboardResponse {
  status: boolean;
  data: CertificateDashboardData;
}

export interface ServicePayment {
  transactionId: number;
  farmerName: string;
  phoneNumber: string;
  serviceName: string;
  amount: string;
  dateTime: string;
  sortDate: string;
}

@Injectable({
  providedIn: 'root',
})
export class FinanceService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
  }

  // Plant Care Package Dashboard
  getDashboardData(): Observable<DashboardResponse> {
    const url = `${this.apiUrl}finance/dashboard`;
    return this.http.get<DashboardResponse>(url, {
      headers: this.getHeaders(),
    });
  }

  getAllPackagePayments(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    fromDate: string = '',
    toDate: string = ''
  ): Observable<PackagePaymentsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }

    if (toDate) {
      params = params.set('toDate', toDate);
    }

    const url = `${this.apiUrl}finance/package-payments`;
    return this.http.get<PackagePaymentsResponse>(url, {
      headers: this.getHeaders(),
      params: params,
    });
  }

  getCertificateDashboardData(): Observable<CertificateDashboardResponse> {
    const url = `${this.apiUrl}finance/certificate-dashboard`;
    return this.http.get<CertificateDashboardResponse>(url, {
      headers: this.getHeaders(),
    });
  }

  // Get govi job dashboard data
  getGoviJobDashboardData(): Observable<GoviJobDashboardResponse> {
    const url = `${this.apiUrl}finance/govi-job-dashboard-data`;
    return this.http.get<GoviJobDashboardResponse>(url, {
      headers: this.getHeaders(),
    });
  }

  getAllServicePayments(
  page: number = 1,
  limit: number = 10,
  search: string = '',
  fromDate: string = '',
  toDate: string = ''
): Observable<ServicePaymentsResponse> {
  let params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString());

  if (search && search.trim()) {
    params = params.set('search', search.trim());
  }

  if (fromDate) {
    params = params.set('fromDate', fromDate);
  }

  if (toDate) {
    params = params.set('toDate', toDate);
  }

  const url = `${this.apiUrl}finance/service-payments`;
  return this.http.get<ServicePaymentsResponse>(url, {
    headers: this.getHeaders(),
    params: params,
  });
}
}
