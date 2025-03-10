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
}
