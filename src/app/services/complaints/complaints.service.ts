import { Injectable } from "@angular/core";
import { environment } from "../../environment/environment";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { TokenService } from "../token/services/token.service";
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';

interface ApiResponse {
  status: boolean;
  data: any[];
  total?: number;
}

@Injectable({
  providedIn: "root",
})
export class ComplaintsService {
  replyToComplaint(complainId: string, messageContent: string) {
    throw new Error("Method not implemented.");
  }
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();
  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) { }

  private getHeaders(): HttpHeaders | null {
    const token = this.tokenService.getToken();
    if (!token) {
      console.error('No token found');
      Swal.fire({
        icon: 'error',
        title: 'Authentication Error',
        text: 'No authentication token found. Please log in again.',
      });
      return null;
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  fetchWholesaleComplaints(): Observable<ApiResponse> {
    const headers = this.getHeaders();
    if (!headers) {
      return throwError(() => new Error('No authentication token found'));
    }

    return this.http
      .get<ApiResponse>(
        `${this.apiUrl}complain/get-marketplace-complaintWholesale`,
        { headers }
      )
      .pipe(
        catchError(err => {
          return throwError(() => err);
        })
      );
  }

  fetchComplain(complainId: string): Observable<any> {
    const headers = this.getHeaders();
    if (!headers) {
      return throwError(() => new Error('No authentication token found'));
    }

    const url = `${this.apiUrl}complain/get-marketplace-complaint/${complainId}`;
    console.log('Fetching complaint from:', url);
    return this.http.get(url, { headers });
  }

  submitComplaint(complainId: string, reply: string): Observable<any> {
    const headers = this.getHeaders();
    if (!headers) {
      return throwError(() => new Error('No authentication token found'));
    }

    const body = { reply };
    return this.http.put(
      `${environment.API_URL}complain/complaints/${complainId}/reply`,
      body,
      { headers }
    );
  }

  fetchComplaints(): Observable<ApiResponse> {
    const headers = this.getHeaders();
    if (!headers) {
      return throwError(() => new Error('No authentication token found'));
    }

    return this.http
      .get<ApiResponse>(
        `${this.apiUrl}complain/get-marketplace-complaint`,
        { headers }
      )
      .pipe(
        catchError(err => {
          return throwError(() => err);
        })
      );


  }
  fetchComplaintCategories(): Observable<any> {
    const headers = this.getHeaders();
    if (!headers) {
      return throwError(() => new Error('No authentication token found'));
    }

    return this.http
      .get<any>(
        `${this.apiUrl}complain/complaint-categories/3`,
        { headers }
      )
      .pipe(
        catchError(err => {
          console.error('Category fetch error', err);
          return throwError(() => err);
        })
      );
  }

  getAllSystemApplications(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    });
    return this.http.get(`${this.apiUrl}complain/get-all-system-applications`, {
      headers,
    });
  }

  getComplainCategoriesByAppId(systemAppId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    });
    return this.http.get(
      `${this.apiUrl}complain/get-complain-categories/${systemAppId}`,
      {
        headers,
      },
    );
  }

  getAdminComplainCategoryForCreate(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    });
    return this.http.get(`${this.apiUrl}complain/get-admin-complain-category`, {
      headers,
    });
  }

  AddNewComplainCategory(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    });
    return this.http.post(
      `${this.apiUrl}complain/add-new-complaint-category`,
      data,
      {
        headers,
      },
    );
  }

  addNewApplication(applicationName: string): Observable<any> {
    const headers = this.getHeaders();
    if (!headers) {
      return throwError(() => new Error('No authentication token found'));
    }
    return this.http.post(
      `${this.apiUrl}complain/add-new-application/${applicationName}`,
      {},       // Empty body, or add body if needed
      { headers }  // Pass headers here properly
    );
  }
  getApplicationNameById(appId: number) {
    const headers = this.getHeaders(); // Your method to get auth token headers
    if (!headers) {
      return throwError(() => new Error('No authentication token found'));
    }
    return this.http.get<{ appName: string }>(
      `${this.apiUrl}complain/get-application-name/${appId}`,
      { headers }
    );
  }




  editApplication(systemAppId: number, applicationName: string): Observable<any> {
    const headers = this.getHeaders();
    if (!headers) {
      return throwError(() => new Error('No authentication token found'));
    }

    const params = new HttpParams()
      .set('systemAppId', systemAppId.toString())
      .set('applicationName', applicationName);

    return this.http.post(
      `${this.apiUrl}complain/edit-application/`,
      {}, // If your backend uses POST, keep empty body
      { headers, params }
    );
  }


  deleteApplicationById(systemAppId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    });
    return this.http.post(
      `${this.apiUrl}complain/delete-application/${systemAppId}`,
      {
        headers,
      },
    );
  }

  getCategoieDetailsById(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    });
    return this.http.get(
      `${this.apiUrl}complain/get-categori-details-by-id/${id}`,
      {
        headers,
      },
    );
  }

  EditComplainCategory(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    });
    return this.http.patch(
      `${this.apiUrl}complain/edit-complaint-category`,
      data,
      {
        headers,
      },
    );
  }

  getAllSalesComplain(
    page: number,
    limit: number,
    status: String,
    category: String,
    replyStatus: string = '',
    comCategory: String,
    searchText: string,
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    });

    let url = `${this.apiUrl}complain/get-all-sales-agent-complains?page=${page}&limit=${limit}`;

    if (status) {
      url += `&status=${status}`;
    }

    if (category) {
      url += `&category=${category}`;
    }

    if (comCategory) {
      url += `&comCategory=${comCategory}`;
    }

    if (replyStatus) {
      url += `&replyStatus=${replyStatus}`;
    }

    if (searchText) {
      url += `&searchText=${searchText}`;
    }

    return this.http.get(url, {
      headers,
    });
  }

  getComplainById(id: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    });
    return this.http.get(`${this.apiUrl}complain/get-complain-by-id/${id}`, {
      headers,
    });
  }

  getAllCenterComplain(
    page: number,
    limit: number,
    status: String,
    category: String,
    comCategory: String,
    filterCompany: String,
    searchText: string,
    rpstatus: string
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    console.log('searchText', searchText);

    let url = `${this.apiUrl}complain/get-all-distributed-complains?page=${page}&limit=${limit}`;

    if (status) {
      url += `&status=${status}`;
    }

    if (category) {
      url += `&category=${category}`;
    }

    if (comCategory) {
      url += `&comCategory=${comCategory}`;
    }

    if (filterCompany) {
      url += `&filterCompany=${filterCompany}`;
    }

    if (searchText) {
      url += `&searchText=${searchText}`;
    }

    if (rpstatus) {
      url += `&rpstatus=${rpstatus}`;
    }

    return this.http.get(url, {
      headers,
    });
  }

  getDistributionComplainById(id: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.apiUrl}complain/get-distributed-complain-by-id/${id}`, {
      headers,
    });
  }

  getAllFiealdofficerComplains(
    page: number,
    limit: number,
    status: string,
    category: string,
    comCategory: string,
    searchText: string,
    rpstatus: string
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    console.log('searchText', searchText);

    let url = `${this.apiUrl}auth/field-officer-complains?page=${page}&limit=${limit}`;

    console.log('Final url', url);
    

    if (status) {
      url += `&status=${status}`;
    }

    if (category) {
      url += `&category=${category}`;
    }

    if (comCategory) {
      url += `&comCategory=${comCategory}`;
    }

    if (searchText) {
      url += `&searchText=${searchText}`;
    }

    if (rpstatus) {
      url += `&rpstatus=${rpstatus}`;
    }

    return this.http.get(url, {
      headers,
    });
  }

  getFieldOfficerComplainById(id: string): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
    'Content-Type': 'application/json',
  });
  return this.http.get(`${this.apiUrl}auth/field-officer-complains-by-id/${id}`, {
    headers,
  });
}

getAllDriverComplain(

  page: number,
  limit: number,
  status: String,
  category: String,
  comCategory: String,
  filterCompany: String,
  searchText: string,
  rpstatus: string
  
): Observable<any> {

  console.log('rpstatus', rpstatus, 'status', status)
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
    'Content-Type': 'application/json',
  });

  console.log('searchText', searchText);

  let url = `${this.apiUrl}complain/get-all-driver-complains?page=${page}&limit=${limit}`;

  if (status) {
    url += `&status=${status}`;
  }

  if (category) {
    url += `&category=${category}`;
  }

  if (comCategory) {
    url += `&comCategory=${comCategory}`;
  }

  if (filterCompany) {
    url += `&filterCompany=${filterCompany}`;
  }

  if (searchText) {
    url += `&searchText=${searchText}`;
  }

  if (rpstatus) {
    url += `&rpstatus=${rpstatus}`;
  }

  return this.http.get(url, {
    headers,
  });
}
}


