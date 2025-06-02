import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TokenService } from '../token/services/token.service';
import { environment } from '../../environment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DistributionHubService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();
  constructor(private http: HttpClient, private tokenService: TokenService) {}

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
}
