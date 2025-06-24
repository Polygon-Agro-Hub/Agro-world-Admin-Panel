import { Injectable } from "@angular/core";
import { environment } from "../../environment/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { TokenService } from "../token/services/token.service";

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
  ) {}

  

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
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    });
    return this.http.post(
      `${this.apiUrl}complain/add-new-application/${applicationName}`,
      {
        headers,
      },
    );
  }

  editApplication(
    systemAppId: number,
    applicationName: string,
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    });
    return this.http.post(
      `${this.apiUrl}complain/edit-application/?systemAppId=${systemAppId}&applicationName=${applicationName}`,
      {
        headers,
      },
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

  

}


