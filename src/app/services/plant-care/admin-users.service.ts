import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Admin {
  id: number;
  email: string;
  name: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminUsersService {
  private apiUrl = `${environment.API_BASE_URL}`;
  private Token = `${environment.TOKEN}`;

  

  constructor(private http: HttpClient) {
    
   }

   getAdminUser(): Observable<Admin[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.Token}`,
    });
    return this.http.get<Admin[]>(`${this.apiUrl}get-me`, { headers });
  }


  updateAdminUser(adminData: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.Token}`,
      'Content-Type': 'application/json',
    });
    return this.http.post(`${this.apiUrl}edit-admin-user-without-id`, adminData, {
      headers,
    });
  }


  createAdminUser(adminData: Admin): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.Token}`,
      'Content-Type': 'application/json',
    });
    return this.http.post(`${this.apiUrl}create-admin`, adminData, {
      headers,
    });
  }


}
