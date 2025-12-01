import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { TokenService } from '../token/services/token.service';

// Agent Commission Interfaces
export interface AgentCommission {
  id: number;
  slot: number;
  minRange: number;
  maxRange: number;
  value: number;
  modifyDate?: string;
  modifyByName?: string;
  modifyByEmail?: string;
  modifyBy?: number;
  createdAt?: string;
}

export interface AgentCommissionResponse {
  status: boolean;
  message: string;
  data: {
    items: AgentCommission[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SingleAgentCommissionResponse {
  status: boolean;
  message: string;
  data: AgentCommission;
}

export interface CreateAgentCommissionRequest {
  minRange: number;
  maxRange: number;
  value: number;
  modifyBy?: number;
}

export interface UpdateAgentCommissionRequest {
  minRange?: number;
  maxRange?: number;
  value?: number;
  modifyBy?: number;
}

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

// Certificate Payments interfaces
export interface CertificatePayment {
  transactionId: string;
  farmerName: string;
  amount: string;
  dateTime: string;
  expireDate: string;
  validityPeriod: string;
  sortDate: string;
}

export interface CertificatePaymentsResponse {
  items: CertificatePayment[];
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

export interface PaymentHistory {
  id: number;
  receivers: string;
  amount: number;
  payRef: string;
  xlLink: string;
  issueBy: number;
  issueDate: string;
  issuerName?: string;
  issuerEmail?: string;
}

export interface PaymentHistoryResponse {
  items: PaymentHistory[];
  total: number;
}

export interface CreatePaymentHistoryResponse {
  message: string;
  id: number;
  xlLink: string;
}

export interface UpdatePaymentHistoryResponse {
  message: string;
  xlLink: string;
}

export interface PaymentHistoryDetail {
  id: number;
  receivers: string;
  amount: number;
  payRef: string;
  xlLink: string;
  issueBy: number;
  modifyBy?: number;
  createdAt: string;
  issuerName?: string;
  modifierName?: string;
}

export interface PaymentHistoryListItem {
  id: number;
  receivers: string;
  amount: number;
  payRef: string;
  xlLink: string;
  issueBy: number;
  modifyBy?: number;
  createdAt: string;
  issuerName?: string;
  modifierName?: string;
}

export interface PaymentHistoryListResponse {
  count: number;
  data: PaymentHistoryListItem[];
}



export interface GoviCareRequest {
  No: number;
  Request_ID: string;
  Farmer_Name: string;
  Phone_number: string;
  Status: string;
  Officer_ID: string;
  NIC_Front_Image: string;
  NIC_Back_Image: string;
  Requested_On: string;
  Assigned_By: string;
  district: string;
  empId: string;
  publishStatus: string;
  Request_Date_Time: string;
}

export interface GoviCareRequestsResponse {
  count: number;
  data: GoviCareRequest[];
}

export interface GoviCareRequestDetail {
  Request_ID: string;
  Farmer_Name: string;
  NIC_Number: string;
  Phone_number: string;
  Crop: string;
  Variety: string;
  Certificate: string;
  Extent: string;
  Expected_Investment: number;
  Expected_Yield: string;
  Expected_Start_Date: string;
  Request_Date_Time: string;

}

export interface GoviCareRequestDetailResponse {
  status: boolean;
  data: GoviCareRequestDetail;
}

export interface InvestmentOfficer {
  id: number;
  empId: string;
  firstName: string;
  lastName: string;
  JobRole: string;
  district: string;
  jobCount: number;
  displayName?: string;
  activeJobCount?: number;
  distrct?: any;
}

export interface ApprovedGoviCareRequest extends GoviCareRequest {
  publishStatus: string;
}

export interface ApprovedGoviCareRequestsResponse {
  count: number;
  data: ApprovedGoviCareRequest[];
}

export interface UpdatePublishStatusResponse {
  status: boolean;
  message: string;
}


@Injectable({
  providedIn: 'root',
})
export class FinanceService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(private http: HttpClient, private tokenService: TokenService) { }

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

  // Package Payments
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

  // Certificate Payments
  getAllCertificatePayments(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    fromDate: string = '',
    toDate: string = ''
  ): Observable<CertificatePaymentsResponse> {
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

    const url = `${this.apiUrl}finance/certificate-payments`;
    return this.http.get<CertificatePaymentsResponse>(url, {
      headers: this.getHeaders(),
      params: params,
    });
  }

  // Certificate Dashboard
  getCertificateDashboardData(): Observable<CertificateDashboardResponse> {
    const url = `${this.apiUrl}finance/certificate-dashboard`;
    return this.http.get<CertificateDashboardResponse>(url, {
      headers: this.getHeaders(),
    });
  }

  // Govi Job Dashboard
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

  // Agent Commission CRUD Operations
  getAllAgentCommissions(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Observable<AgentCommissionResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    const url = `${this.apiUrl}finance/get-all-agent-commissions`;
    return this.http.get<AgentCommissionResponse>(url, {
      headers: this.getHeaders(),
      params: params,
    });
  }

  getAgentCommissionById(
    id: number
  ): Observable<SingleAgentCommissionResponse> {
    const url = `${this.apiUrl}finance/get-agent-commission/${id}`;
    return this.http.get<SingleAgentCommissionResponse>(url, {
      headers: this.getHeaders(),
    });
  }

  createAgentCommission(
    data: CreateAgentCommissionRequest
  ): Observable<SingleAgentCommissionResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });
    const url = `${this.apiUrl}finance/create-agent-commission`;
    return this.http.post<SingleAgentCommissionResponse>(url, data, {
      headers,
    });
  }

  updateAgentCommission(
    id: number,
    data: any
  ): Observable<SingleAgentCommissionResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });
    const url = `${this.apiUrl}finance/update-agent-commission/${id}`;
    return this.http.put<SingleAgentCommissionResponse>(url, data, {
      headers,
    });
  }

  deleteAgentCommission(id: number): Observable<any> {
    const url = `${this.apiUrl}finance/delete-agent-commission/${id}`;
    return this.http.delete(url, {
      headers: this.getHeaders(),
    });
  }

  getAllFarmerPayments(date?: string, bank?: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}finance/get-all-farmer-payments`;

    // Add query parameters if provided
    const params = new URLSearchParams();

    if (date) {
      params.append('date', date);
    }

    if (bank) {
      params.append('bank', bank);
    }

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    return this.http.get<any>(url, { headers: headers });
  }


  createPaymentHistory(
    receivers: string,
    amount: string,
    paymentReference: string,
    file: File
  ): Observable<CreatePaymentHistoryResponse> {
    const formData = new FormData();
    formData.append('receivers', receivers);
    formData.append('amount', amount);
    formData.append('paymentReference', paymentReference);
    formData.append('file', file);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });

    const url = `${this.apiUrl}finance/payment-history`;
    return this.http.post<CreatePaymentHistoryResponse>(url, formData, {
      headers,
    });
  }

  getPaymentHistoryById(id: number): Observable<any> {
    const url = `${this.apiUrl}finance/payment-history/${id}`;
    return this.http.get<any>(url, {
      headers: this.getHeaders(),
    });
  }

  updatePaymentHistory(
    id: number,
    receivers: string,
    amount: string,
    paymentReference: string,
    file?: File
  ): Observable<UpdatePaymentHistoryResponse> {
    const formData = new FormData();
    formData.append('receivers', receivers);
    formData.append('amount', amount);
    formData.append('paymentReference', paymentReference);

    if (file) {
      formData.append('file', file);
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });

    const url = `${this.apiUrl}finance/payment-history/${id}`;
    return this.http.put<UpdatePaymentHistoryResponse>(url, formData, {
      headers,
    });
  }

  getAllPaymentHistory(
    receivers?: string,
    issuedDate?: string,
    search?: string
  ): Observable<PaymentHistoryListResponse> {
    let params = new HttpParams();

    if (receivers && receivers.trim()) {
      params = params.set('receivers', receivers.trim());
    }

    if (issuedDate) {
      params = params.set('issuedDate', issuedDate);
    }

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    const url = `${this.apiUrl}finance/payment-history`;
    return this.http.get<PaymentHistoryListResponse>(url, {
      headers: this.getHeaders(),
      params: params,
    });
  }

  deletePaymentHistory(id: number): Observable<any> {
    const url = `${this.apiUrl}finance/payment-history/${id}`;
    return this.http.delete(url, {
      headers: this.getHeaders(),
    });
  }


  getAllGoviCareRequests(
    status?: string,
    search?: string
  ): Observable<GoviCareRequestsResponse> {
    let params = new HttpParams();

    if (status && status.trim()) {
      params = params.set('status', status.trim());
    }

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });

    const url = `${this.apiUrl}finance/govicare-requests`;
    return this.http.get<GoviCareRequestsResponse>(url, {
      headers: headers,
      params: params,
    });
  }

  getGoviCareRequestById(requestId: string): Observable<GoviCareRequestDetailResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });

    const url = `${this.apiUrl}finance/govicare-requests/${requestId}`;
    return this.http.get<GoviCareRequestDetailResponse>(url, {
      headers: headers,
    });
  }

  getAllApprovedGoviCareRequests(
    status?: string,
    search?: string
  ): Observable<ApprovedGoviCareRequestsResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });

    let params = new HttpParams();

    if (status && status.trim()) {
      params = params.set('status', status.trim());
    }

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    const url = `${this.apiUrl}finance/approved-govicare-requests`;
    return this.http.get<ApprovedGoviCareRequestsResponse>(url, {
      headers: headers,
      params: params,
    });
  }



  getOfficersByDistrictAndRoleForInvestment(
    distrct: string,
    role: string
  ): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}finance/officers`,
      {
        params: {
          district: distrct,
          jobRole: role
        }
      }
    );
  }


  assignOfficerToInvestmentRequest(
    requestId: number,
    officerId: number
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });

    return this.http.post<any>(
      `${this.apiUrl}finance/assign-officer`,
      {
        requestId: requestId,
        officerId: officerId
      },
      {
        headers
      }
    );
  }

  getOfficerDetailsById(empId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}finance/officer-details/${empId}`);
  }

  updateGoviCareRequestPublishStatus(
    requestId: number
  ): Observable<UpdatePublishStatusResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });

    const url = `${this.apiUrl}finance/govicare-requests/${requestId}/publish`;
    return this.http.put<UpdatePublishStatusResponse>(url, {}, {
      headers,
    });
  }


  getAllPublishedProjects(
    searchText: string = '',

  ): Observable<any> {
    console.log('searchText', searchText)

    let url = `${this.apiUrl}finance/get-all-published-projects?page=${1}`;

    if (searchText) {
      url += `&searchText=${searchText}`;
    }

    return this.http.get<any>(url, {
      headers: this.getHeaders(),
    });
  }



  getAllRejectedInvestmentRequests(
    search?: string
  ): Observable<any> {
    let params = new HttpParams();

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    const url = `${this.apiUrl}finance/rejected-investment-requests`;
    return this.http.get<any>(url, {
      headers: this.getHeaders(),
      params: params,
    });
  }
}
