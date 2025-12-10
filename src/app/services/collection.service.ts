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

  constructor(private http: HttpClient, private tokenService: TokenService) { }

  fetchAllCollectionOfficercenter(
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


    let url = `${this.apiUrl}auth/collection-officer/get-all-collection-officers?page=${page}&limit=${limit}`;
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

  fetchAllCollectionOfficerProfile(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}auth/collection-officer/get-collection-officer/${id}`;

    return this.http.get<any>(url, { headers });
  } fetchAllCollectionOfficerStatus(
    page: number,
    limit: number,
    nic: string = '',
    centerName: string = ''
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    console.log('Center name sent to API:', centerName);

    let url = `${this.apiUrl}auth/collection-officer/get-all-collection-officers-status?page=${page}&limit=${limit}`;

    if (centerName) {
      url += `&centerName=${centerName}`; // ✅ Fixed typo and added trim
    }

    if (nic) {
      url += `&nic=${nic}`; // Changed from searchNIC to nic
    }
    console.log('API URL:', url);
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

  getCollectionCenterManagerNames(centerId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}auth/collection-officer/get-all-collection-manager-names/${centerId}`;
    return this.http.get<any>(url, { headers });
  }



  getCollectionCenter(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}auth/collection-officer/centers`;
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
    return this.http.get<any>(`${this.apiUrl}auth/get-centers-for-purchase-report`, { headers });
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

  getFarmerReportInvoice(invNo: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}auth/get-farmer-report-invoice-details/${invNo}`

    return this.http.get(url, {
      headers,
    });
  }

  getAllDrivers(
    page: number,
    limit: number,
    centerStatus: string = '',
    status: string = '',
    searchNIC: string = '',
    centerId: number | null = null,
  ): Observable<any> {
    console.log('centerId', centerId)
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    
    let url = `${this.apiUrl}auth/driver/view-all-drivers?page=${page}&limit=${limit}`;
    if (centerId) {
      url += `&centerId=${centerId}`;
    }

    if (centerStatus) {
      url += `&centerStatus=${centerStatus}`
    }

    if (status) {
      url += `&status=${status}`
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

    let url = `${this.apiUrl}auth/driver/get-all-distribution-center-names`;
    return this.http.get<any>(url, { headers });
  }


  getDistributionCenterManagerNames(centerId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}auth/driver/get-all-Distribution-manager-names/${centerId}`;
    return this.http.get<any>(url, { headers });
  }

  claimDriver(id: number, payload: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
  
    return this.http.put(
      `${this.apiUrl}auth/driver/claim-driver/${id}`,
      payload, // Include the payload in the request body
      { headers }
    );
  }
  
  disclaimOfficer(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.put(
      `${this.apiUrl}auth/driver/disclaim-driver/${id}`,
      {},
      {
        headers,
      }
    );
  }

}
