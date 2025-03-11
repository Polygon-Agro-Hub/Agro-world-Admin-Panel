import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environment/environment";
import { TokenService } from "../token/services/token.service";

@Injectable({
  providedIn: 'root'
})
export class SalesAgentsService {

  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();
 
  constructor(private http: HttpClient, private tokenService: TokenService) {}

  getAllSalesAgents(
    page: number,
    limit: number,
    searchText: string = '',
    status: string = '',
    // company: string
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    
    let url = `${this.apiUrl}dash/get-all-sales-agents?page=${page}&limit=${limit}`;

    if (status) {
      url += `&status=${status}`;
    }

    if (searchText) {
      url += `&searchText=${searchText}`;
    }
    return this.http.get<any>(url, { headers });
  }

  deleteSalesAgent(id: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.delete(`${this.apiUrl}dash/delete-sales-agent/${id}`, {
      headers,
    });
  }

  getForCreateId(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    });
    return this.http.get(`${this.apiUrl}dash/get-last-sales-agent-id`, {
      headers,
    });
  }

  createSalesAgent(person: any, selectedImage: any): Observable<any> {
    const formData = new FormData();
    formData.append("officerData", JSON.stringify(person)); // Attach officer data as a string
    console.log(formData);

    if (selectedImage) {
      formData.append('file', selectedImage); // Attach the file (ensure the key matches the expected field name on the backend)
    }
    


    // No need to set Content-Type headers manually; Angular will handle it for FormData
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.post(
      `${this.apiUrl}dash/create-sales-agent`,
      formData,
      {
        headers,
      }
    );
  }

  getSalesAgentReportById(id: number) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get(`${this.apiUrl}dash/get-sales-agent-details/${id}`, {
      headers,
    });
  }

  editSalesAgent(
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
      `${this.apiUrl}dash/update-sales-agent-details/${id}`,
      formData,
      {
        headers,
      }
    );
  }

  ChangeStatus(id: number, status: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}dash/update-status/${id}/${status}`;
    return this.http.get<any>(url, { headers });
  }
}
