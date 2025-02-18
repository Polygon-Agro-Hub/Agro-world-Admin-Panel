import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from '../token/services/token.service';

@Injectable({
  providedIn: 'root'
})
export class StakeholderService {

  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(private http: HttpClient, private tokenService: TokenService) { }

  getAdminUserData(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.apiUrl}stakeholder/get-admin-user-data`, {
      headers,
    });
  }

  getCollectionOfficerData(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.apiUrl}stakeholder/get-collection-officer-data`, {
      headers,
    });
  }

  getPlantCareUserData(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.apiUrl}stakeholder/get-plant-care-user-data`, {
      headers,
    });
  }

  getSalesAgentData(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.apiUrl}stakeholder/get-sales-agent-data`, {
      headers,
    });
  }
}











