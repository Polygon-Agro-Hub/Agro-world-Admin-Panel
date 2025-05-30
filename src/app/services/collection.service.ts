import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../environment/environment";
import { TokenService } from "./token/services/token.service";

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();
 
  constructor(private http: HttpClient, private tokenService: TokenService) {}

  fetchAllCollectionOfficercenter(
    page: number,
    limit: number,
    centerStatus: string = '',
    status: string = '',
    searchNIC: string = '',
    company: string,
    role: string,
    centerId: number
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    console.log(company);


    let url = `${this.apiUrl}auth/collection-officer/get-all-collection-officers?page=${page}&limit=${limit}&centerId=${centerId}`;

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



  fetchAllCollectionOfficer(
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


    let url = `${this.apiUrl}auth/collection-officer/get-all-collection-officers?page=${page}&limit=${limit}`;

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

  fetchAllCollectionOfficerProfile(id:number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}auth/collection-officer/get-collection-officer/${id}`;

    return this.http.get<any>(url, { headers });
  }

  fetchAllCollectionOfficerStatus(
    page: number,
    limit: number,
    searchNIC: string = '',
    company: string
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    console.log(company);

    let url = `${this.apiUrl}auth/collection-officer/get-all-collection-officers-status?page=${page}&limit=${limit}`;

    if (company) {
      url += `&company=${company}`;
    }

    if (searchNIC) {
      url += `&nic=${searchNIC}`;
    }
    return this.http.get<any>(url, { headers });
  }

  getCompanyNames(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}auth/collection-officer/get-all-company-names`;
    return this.http.get<any>(url, { headers });
  }

  ChangeStatus(id: number, status: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}auth/collection-officer/update-status/${id}/${status}`;
    return this.http.get<any>(url, { headers });
  }

  deleteOfficer(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}auth/collection-officer/delete-officer/${id}`;
    return this.http.delete<any>(url, { headers });
  }

  getCenterNames(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}auth/collection-officer/get-all-center-names`;
    return this.http.get<any>(url, { headers });
  }

  getCollectionCenterManagerNames(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}auth/collection-officer/get-all-collection-manager-names`;
    return this.http.get<any>(url, { headers });
  }






  fetchAllPurchaseReport(
    page: number,
    limit: number,
    centerId: any,
    startDate: any,
    endDate: any,
    search: string
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    

    let url = `${this.apiUrl}auth/get-purchase-report?page=${page}&limit=${limit}`;

    if (centerId) {
      url += `&centerId=${centerId}`;
    }

    // if (monthNumber) {
    //   url += `&monthNumber=${monthNumber}`;
    // }

    if (startDate) {
      url += `&startDate=${startDate}`;
    }

    if (endDate) {
      url += `&endDate=${endDate}`;
    }

    if (search) {
      url += `&search=${search}`;
    }

    // if (searchNIC) {
    //   url += `&nic=${searchNIC}`;
    // }
    return this.http.get<any>(url, { headers });
  }


  getAllCenters(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get<any>(`${this.apiUrl}auth/get-centers-for-purchase-report`, {headers});
  }


  fetchAllCollectionReport(
    page: number,
    limit: number,
    centerId: any,
    startDate: any,
    endDate: any,
    search: string
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    

    let url = `${this.apiUrl}auth/get-collection-report?page=${page}&limit=${limit}`;

    if (centerId) {
      url += `&centerId=${centerId}`;
    }

    // if (monthNumber) {
    //   url += `&monthNumber=${monthNumber}`;
    // }

    if (startDate) {
      url += `&startDate=${startDate}`;
    }

    if (endDate) {
      url += `&endDate=${endDate}`;
    }

    if (search) {
      url += `&search=${search}`;
    }

    // if (searchNIC) {
    //   url += `&nic=${searchNIC}`;
    // }
    return this.http.get<any>(url, { headers });
  }


}
