import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TokenService } from '../token/services/token.service';
import { environment } from '../../environment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DistributionHubService {
  resetPassword(itemId: number, arg1: { currentPassword: string; newPassword: string; }) {
    throw new Error('Method not implemented.');
  }
  checkDuplicates(payload: { nic: string; email: string; phoneNumber01: string; phoneNumber02: string; excludeId: number; }) {
    throw new Error('Method not implemented.');
  }
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();
  constructor(private http: HttpClient, private tokenService: TokenService) { }

  getAllCompanyDetails(search: string = ''): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}distribution/get-all-companies`;
    if (search) {
      url += `?search=${search}`;
    }

    return this.http.get<any>(url, { headers });
  }

  deleteCompany(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    console.log('DELETE ITEM', id);
    return this.http.delete(`${this.apiUrl}distribution/delete-company/${id}`, {
      headers,
    });
  }

  getAllDistributionCompanyHeads(
    companyId: number,
    page: number,
    limit: number,
    searchText: string
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    let url = `${this.apiUrl}distribution/get-distributioncompany-head?companyId=${companyId}&page=${page}&limit=${limit}`;
    if (searchText) {
      url += `&searchText=${searchText}`;
    }

    return this.http.get(url, {
      headers,
    });
  }

  createDistributionHead(person: any, selectedImage: any): Observable<any> {
    const formData = new FormData();
    formData.append('officerData', JSON.stringify(person)); // Attach officer data as a string

    if (selectedImage) {
      formData.append('file', selectedImage); // Attach the file (ensure the key matches the expected field name on the backend)
    }

    // No need to set Content-Type headers manually; Angular will handle it for FormData
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.post(
      `${this.apiUrl}distribution/create-distribution-head`,
      formData,
      {
        headers,
      }
    );
  }

  getAllCompanyList(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.apiUrl}distribution/get-all-company-list`, {
      headers,
    });
  }

  getAllDistributedCentersByCompany(companyId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(
      `${this.apiUrl}distribution/get-all-centers-by-company/${companyId}`,
      {
        headers,
      }
    );
  }

  deleteDistributionHead(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}distribution/delete-officer/${id}`;
    return this.http.delete<any>(url, { headers });
  }

  getDistributionHeadDetailsById(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.get(
      `${this.apiUrl}distribution/get-distribution-head/${id}`,
      { headers }
    );
  }

  updateDistributionHeadDetails(id: number, updateData: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.put(
      `${this.apiUrl}distribution/update-collection-officer/${id}`,
      updateData,
      { headers }
    );
  }

  getAllDistributionCenterByCompany(companyId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(
      `${this.apiUrl}distribution/get-all-distribution-center-by-company/${companyId}`,
      {
        headers,
      }
    );
  }

  fetchAllDistributionOfficers(
    page: number,
    limit: number,
    centerStatus: string = '',
    status: string = '',
    searchNIC: string = '',
    company: string,
    role: string
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    console.log(company);


    let url = `${this.apiUrl}distribution/get-all-distribution-officers?page=${page}&limit=${limit}`;

    if (company) {
      url += `&company=${company}`;
    }

    if (centerStatus) {
      url += `&centerStatus=${centerStatus}`
    }

    if (status) {
      url += `&status=${status}`
    }

    if (role) {
      url += `&role=${role}`;
    }

    if (searchNIC) {
      url += `&nic=${searchNIC}`;
    }
    return this.http.get<any>(url, { headers });
  }

  fetchAllDistributionOfficercenter(
    page: number,
    limit: number,
    centerStatus: string = '',
    status: string = '',
    searchNIC: string = '',
    company: string,
    role: string,
    centerId: any = ''
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    console.log(company);


    let url = `${this.apiUrl}distribution/get-all-distribution-officers?page=${page}&limit=${limit}`;
    if (centerId) {
      url += `&centerId=${centerId}`;
    }
    if (company) {
      url += `&company=${company}`;
    }

    if (centerStatus) {
      url += `&centerStatus=${centerStatus}`
    }

    if (status) {
      url += `&status=${status}`
    }



    if (role) {
      url += `&role=${role}`;
    }

    if (searchNIC) {
      url += `&nic=${searchNIC}`;
    }
    return this.http.get<any>(url, { headers });
  }

  getDistributionCenterNames(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}distribution/get-all-distributed-center-names`;
    return this.http.get<any>(url, { headers });
  }

  getDistributionCenterManagerNames(id: string | null): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}distribution/get-all-distribution-manager-names/${id}`;
    return this.http.get<any>(url, { headers });
  }

  deleteDistributionOfficer(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}distribution/delete-distribution-officer/${id}`;
    return this.http.delete<any>(url, { headers });
  }

  ChangeStatus(id: number, status: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}distribution/update-status/${id}/${status}`;
    return this.http.get<any>(url, { headers });
  }

  getCompanyNames(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}distribution/get-all-company-names`;
    return this.http.get<any>(url, { headers });
  }

  createDistributionOfficer(person: any, selectedImage: any): Observable<any> {
    const formData = new FormData();
    formData.append("officerData", JSON.stringify(person)); // Attach officer data as a string

    if (selectedImage) {
      formData.append('file', selectedImage); // Attach the file (ensure the key matches the expected field name on the backend)
    }


    // No need to set Content-Type headers manually; Angular will handle it for FormData
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.post(
      `${this.apiUrl}distribution/create-distribution-officer`,
      formData,
      {
        headers,
      }
    );
  }

  getAllManagerList(companyId: any, centerId: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    console.log('This is company Id', companyId);
    return this.http.get(
      `${this.apiUrl}distribution/get-all-distribution-manager-list/${companyId}/${centerId}`,
      {
        headers,
      }
    );
  }

  getForCreateId(role: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.apiUrl}distribution/get-last-emp-id/${role}`, {
      headers,
    });
  }

  getAssignForCityes(province: string, district: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.apiUrl}distribution/get-all-assigning-cities/${province}/${district}`, {
      headers,
    });
  }

  AssigCityToDistributedCenter(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.post(`${this.apiUrl}distribution/assign-city-to-distributed-center`, data, {
      headers,
    });
  }

  removeAssigCityToDistributedCenter(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.post(`${this.apiUrl}distribution/remove-assign-city-to-distributed-center`, data, {
      headers,
    });
  }

  getOfficerReportById(id: number) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get(`${this.apiUrl}distribution/officer-details-monthly/${id}`, {
      headers,
    });
  }

  editDistributionOfficer(
    person: any,
    id: number,
    selectedImage: any
  ): Observable<any> {
    const formData = new FormData();
    formData.append('officerData', JSON.stringify(person)); // Attach officer data as a string
    if (selectedImage) {
      formData.append('file', selectedImage); // Attach the file (ensure the key matches the expected field name on the backend)
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.put(
      `${this.apiUrl}distribution/update-distribution-officer-details/${id}`,
      formData,
      {
        headers,
      }
    );
  }

   claimDistributedOfficer(data:any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.patch(`${this.apiUrl}distribution/claim-distributed-Officer`, data, {
      headers,
    });
  }

}
