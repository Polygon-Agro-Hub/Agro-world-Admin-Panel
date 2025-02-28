import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environment/environment";
import { TokenService } from "../token/services/token.service";

interface Admin {
  id: number;
  email: string;
  name: string;
  role: string;
}

@Injectable({
  providedIn: "root",
})
export class AdminUsersService {
  private apiUrl = `${environment.API_URL}`;
  private Token = this.tokenService.getToken();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) {}

  getAdminUser(): Observable<Admin[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.Token}`,
    });
    return this.http.get<Admin[]>(`${this.apiUrl}auth/get-me`, { headers });
  }

  updateAdminUser(adminData: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.Token}`,
      "Content-Type": "application/json",
    });
    return this.http.post(
      `${this.apiUrl}auth/edit-admin-user-without-id`,
      adminData,
      {
        headers,
      },
    );
  }

  createAdminUser(adminData: Admin): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.Token}`,
      "Content-Type": "application/json",
    });
    return this.http.post(`${this.apiUrl}auth/create-admin`, adminData, {
      headers,
    });
  }
}
