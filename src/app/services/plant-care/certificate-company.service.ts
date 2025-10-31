import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from '../token/services/token.service';
import { environment } from '../../environment/environment.development';

export interface CertificateCompany {
  id?: number;
  companyName: string;
  regNumber: string;
  taxId: string;
  phoneCode1: string;
  phoneNumber1: string;
  phoneCode2?: string;
  phoneNumber2?: string;
  address: string;
  certificateCount?: number;
  createdAt?: string;
  modifyDate?: string | null;
  modifiedByUser?: string | null;
  logo?: string;
}

export interface CertificatePayload {
  srtcomapnyId: number;
  srtName: string;
  srtNumber: string;
  applicable: string;
  accreditation: string;
  serviceAreas: string[];
  price: number;
  timeLine: number;
  commission: number;
  tearms: string;
  scope: string;
  cropIds: number[];
}

export interface Questionnaire {
  id?: number;
  companyId: number;
  questionNo: number;
  type: string;
  questionEnglish: string;
  questionSinhala: string;
  questionTamil: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FarmerCluster {
  clusterId?: number;
  clusterName: string;
  district: string;
  certificateId: number;
  certificateName?: string;
  memberCount?: number;
  status?: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
  lastModifiedOn?: string;
  farmers: FarmerDetail[];
  farmersAdded?: number;
  totalFarmers?: number;
  missingNICs?: string[];
  existingNICs?: string[];
  details?: string;
  message?: string;
  members?: ClusterMember[];
}

export interface FarmerDetail {
  farmerNIC: string;
  regCode: string;
}

export interface ClusterMember {
  no: string;
  id: number;
  farmerId: number;
  farmerName: string;
  farmName: string;
  farmId: string;
  firstName: string;
  lastName: string;
  nic: string;
  phoneNumber: string;
  addedDate?: string;
}

export interface Certificate {
  id: number;
  srtName: string;
  srtNumber: string;
  applicable: string;
}
export interface FieldAudit {
  auditNo: number;
  status: string;
  farmerFirstName: string;
  farmerLastName: string;
  farmerDistrict: string;
  farmerPhoneNumber: string;
  certificateApplicable: string;
  certificateName: string;
  officerFirstName?: string;
  officerLastName?: string;
  assignBy?: string;
  sheduleDate?: Date;
  officerEmpId: string;
  officerJobRole: string;
}
export interface FieldAuditResponse {
  message: string;
  status: boolean;
  data: FieldAudit[];
}
export interface Crop {
  cropId: number;
  cropNameEnglish: string;
}
export interface CropsResponse {
  message: string;
  status: boolean;
  data: {
    certificate: {
      certificateId: number;
      certificateName: string;
      applicable: string;
    };
    crops: Crop[];
  };
}
export interface FarmerClusterAudit {
  auditNo: number;
  status: string;
  clusterName: string;
  clusterDistrict: string;
  certificateName: string;
  officerFirstName: string | null;
  officerLastName: string | null;
  sheduleDate?: Date | null;
  officerJobRole: string;
  officerEmpId: string;
}
export interface FarmerClusterAuditResponse {
  message: string;
  status: boolean;
  data: FarmerClusterAudit[];
}
export interface FieldOfficer {
  id: number;
  empId: string;
  firstName: string;
  lastName: string;
  JobRole: string;
  district: string;
  phoneCode1?: string;
  phoneNumber1?: string;
  email?: string;
  language?: string;
  status?: string;
  jobCount?: number;
  displayName?: string;
  activeJobCount?: number;
}
export interface FieldOfficerResponse {
  message: string;
  status: boolean;
  data: FieldOfficer[];
  total: number;
}
@Injectable({
  providedIn: 'root',
})
export class CertificateCompanyService {
  private apiUrl = `${environment.API_URL}`;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  // Create Certificate Company
  createCompany(
    company: FormData
  ): Observable<{ message: string; status: boolean; id?: number }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });

    return this.http.post<{ message: string; status: boolean; id?: number }>(
      `${this.apiUrl}certificate-company/create-certificate-company`,
      company,
      { headers }
    );
  }

  // Get single company by ID
  getCompanyById(id: number): Observable<{ company: CertificateCompany }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });
    return this.http.get<{ company: CertificateCompany }>(
      `${this.apiUrl}certificate-company/get-certificate-company-by-id/${id}`,
      { headers }
    );
  }

  // Update company
  updateCompany(
    id: number,
    company: FormData
  ): Observable<{ message: string; status: boolean }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });
    return this.http.put<{ message: string; status: boolean }>(
      `${this.apiUrl}certificate-company/update-certificate-company/${id}`,
      company,
      { headers }
    );
  }

  // Get All Certificate Companies with search
  getAllCompanies(
    search: string = ''
  ): Observable<{ companies: CertificateCompany[]; total: number }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });
    return this.http.get<{ companies: CertificateCompany[]; total: number }>(
      `${this.apiUrl}certificate-company/get-all-certificate-companies?search=${search}`,
      { headers }
    );
  }

  // Delete Certificate Company
  deleteCompany(id: number): Observable<{ message: string; status: boolean }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });
    return this.http.delete<{ message: string; status: boolean }>(
      `${this.apiUrl}certificate-company/delete-certificate-company/${id}`,
      { headers }
    );
  }

  // Get only id and companyName
  getAllCompaniesNamesOnly(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });
    return this.http.get<any>(
      `${this.apiUrl}certificate-company/get-all-certificate-companies-names-only`,
      { headers }
    );
  }

  // Create Certificate
  createCertificate(
    formData: FormData
  ): Observable<{ message: string; status: boolean; certificateId?: number }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });

    return this.http.post<{
      message: string;
      status: boolean;
      certificateId?: number;
    }>(`${this.apiUrl}certificate-company/create-certificate`, formData, {
      headers,
    });
  }

  // Get certificate by Id
  getCertificateDetailsById(
    id: number
  ): Observable<{ message: string; status: boolean; data?: any }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });

    return this.http.get<{ message: string; status: boolean; data?: any }>(
      `${this.apiUrl}certificate-company/get-certificate-details/${id}`,
      { headers }
    );
  }

  // Update certificate
  updateCertificate(
    id: number,
    formData: FormData
  ): Observable<{ message: string; status: boolean }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });

    return this.http.put<{ message: string; status: boolean }>(
      `${this.apiUrl}certificate-company/update-certificate/${id}`,
      formData,
      { headers }
    );
  }

  // Delete certificate
  deleteCertificate(
    id: number
  ): Observable<{ message: string; status: boolean }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });

    return this.http.delete<{ message: string; status: boolean }>(
      `${this.apiUrl}certificate-company/delete-certificate/${id}`,
      { headers }
    );
  }

  // Create questionnaire
  createQuestionnaire(payload: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
      'Content-Type': 'application/json',
    });
    return this.http.post(
      `${this.apiUrl}certificate-company/create-questionnaire`,
      payload,
      { headers }
    );
  }

  getAllCertificates(
    filterQuction: string = '',
    selectArea: string = '',
    comapny: string = '',
    searchText: string = ''
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });
    let url = `${this.apiUrl}certificate-company/get-all-certificates?page=1`;

    if (filterQuction) {
      url += `&quaction=${filterQuction}`;
    }

    if (selectArea) {
      url += `&area=${selectArea}`;
    }

    if (searchText) {
      url += `&searchText=${searchText}`;
    }

    if (comapny) {
      url += `&company=${comapny}`;
    }
    return this.http.get<any>(url, { headers });
  }

  // Get questionnaires by certificate ID
  getQuestionnaireList(certificateId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });
    return this.http.get(
      `${this.apiUrl}certificate-company/get-qestionnaire-list/${certificateId}`,
      { headers }
    );
  }

  // Update questionnaire by ID
  updateQuestionnaire(id: number, payload: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
      'Content-Type': 'application/json',
    });
    return this.http.put(
      `${this.apiUrl}certificate-company/update-questionnaire/${id}`,
      payload,
      { headers }
    );
  }

  // Delete questionnaire by ID
  deleteQuestionnaire(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });
    return this.http.delete(
      `${this.apiUrl}certificate-company/delete-questionnaire/${id}`,
      { headers }
    );
  }

  // Create farmer cluster with bulk farmers
  createFarmerCluster(payload: FarmerCluster): Observable<FarmerCluster> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
      'Content-Type': 'application/json',
    });

    return this.http.post<FarmerCluster>(
      `${this.apiUrl}certificate-company/create-farmer-cluster`,
      payload,
      { headers }
    );
  }

  // Add single farmer to existing cluster
  addFarmerToCluster(
    clusterId: number,
    data: { nic: string; farmId: string }
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
      'Content-Type': 'application/json',
    });

    const payload = {
      nic: data.nic,
      farmId: data.farmId,
    };

    return this.http.post<any>(
      `${this.apiUrl}certificate-company/add-single-farmer-to-cluster/${clusterId}`,
      payload,
      { headers }
    );
  }

  // Get all farmer clusters
  getAllFarmerClusters(searchTerm?: string): Observable<{
    status: boolean;
    message: string;
    data: FarmerCluster[];
  }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });

    let params = new HttpParams();
    if (searchTerm) {
      params = params.set('search', searchTerm);
    }

    return this.http.get<{
      status: boolean;
      message: string;
      data: FarmerCluster[];
    }>(`${this.apiUrl}certificate-company/get-farmer-clusters`, {
      headers,
      params,
    });
  }

  // Remove user from cluster
  removeUserFromCluster(clusterId: number, userId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });

    return this.http.delete(
      `${this.apiUrl}certificate-company/delete-farmer-clusters/${clusterId}/users/${userId}`,
      { headers }
    );
  }

  // Get cluster members by clusterId
  getClusterMembers(
    clusterId: number,
    searchTerm: string = ''
  ): Observable<FarmerCluster> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });

    let params = new HttpParams();
    if (searchTerm) {
      params = params.set('search', searchTerm);
    }

    return this.http.get<FarmerCluster>(
      `${this.apiUrl}certificate-company/get-cluster-users/${clusterId}`,
      { headers, params }
    );
  }

  // Delete farmer cluster
  deleteFarmerCluster(clusterId: number): Observable<FarmerCluster> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });

    return this.http.delete<FarmerCluster>(
      `${this.apiUrl}certificate-company/delete-farmer-cluster/${clusterId}`,
      { headers }
    );
  }

  // Update cluster
  updateFarmerCluster(
    clusterId: number,
    updateData: { clusterName: string; district: string; certificateId: number }
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
      'Content-Type': 'application/json',
    });

    return this.http.put<any>(
      `${this.apiUrl}certificate-company/update-farmer-cluster/${clusterId}`,
      updateData,
      { headers }
    );
  }

  // Get all certificates for farmer clusters
  getFarmerClusterCertificates(): Observable<{
    status: boolean;
    message: string;
    data: any[];
  }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });

    return this.http.get<{
      status: boolean;
      message: string;
      data: any[];
    }>(`${this.apiUrl}certificate-company/get-farmer-cluster-certificates`, {
      headers,
    });
  }

  // Update cluster status
  updateClusterStatus(clusterId: number, status: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
      'Content-Type': 'application/json',
    });

    return this.http.patch(
      `${this.apiUrl}certificate-company/update-cluster-status`,
      { clusterId, status },
      { headers }
    );
  }

  // Add this method to get field audits with search
  getFieldAudits(searchTerm?: string): Observable<FieldAuditResponse> {
    let params = new HttpParams();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
      'Content-Type': 'application/json',
    });

    if (searchTerm && searchTerm.trim() !== '') {
      params = params.set('search', searchTerm.trim());
    }

    return this.http.get<FieldAuditResponse>(
      `${this.apiUrl}certificate-company/get-field-audits`,
      { headers, params }
    );
  }

  // New method to get crops by field audit ID
  getCropsByFieldAuditId(fieldAuditId: number): Observable<CropsResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
      'Content-Type': 'application/json',
    });
    return this.http.get<CropsResponse>(
      `${this.apiUrl}certificate-company/crops-by-field-audit/${fieldAuditId}`,
      { headers }
    );
  }

  // Add this method to the service
  getFarmerClustersAudits(
    searchTerm?: string
  ): Observable<FarmerClusterAuditResponse> {
    let params = new HttpParams();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
      'Content-Type': 'application/json',
    });
    if (searchTerm && searchTerm.trim() !== '') {
      params = params.set('search', searchTerm.trim());
    }

    return this.http.get<FarmerClusterAuditResponse>(
      `${this.apiUrl}certificate-company/get-farmer-clusters-audits`,
      { headers, params }
    );
  }

  // Add this method to the service
  getOfficersByDistrictAndRole(
    district: string,
    jobRole: string,
    scheduleDate: string
  ): Observable<FieldOfficerResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
      'Content-Type': 'application/json',
    });

    const params = new HttpParams()
      .set('district', district)
      .set('jobRole', jobRole)
      .set('scheduleDate', scheduleDate);

    return this.http.get<FieldOfficerResponse>(
      `${this.apiUrl}certificate-company/get-officers-by-district-role`,
      { headers, params }
    );
  }

  // Assign officer to field audit
  assignOfficerToFieldAudit(
    auditId: number,
    officerId: number,
    scheduleDate?: Date
  ): Observable<any> {
    const data: any = {
      auditId,
      officerId,
    };

    // Add schedule date to the request if provided
    if (scheduleDate) {
      data.scheduleDate = scheduleDate;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
      'Content-Type': 'application/json',
    });

    return this.http.put<any>(
      `${this.apiUrl}certificate-company/assign-officer-to-audit`,
      data,
      { headers }
    );
  }
}
