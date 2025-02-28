import { Injectable } from "@angular/core";
import { environment } from "../../environment/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { TokenService } from "../token/services/token.service";

@Injectable({
  providedIn: "root",
})
export class RoleSelectionService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) {}

  getAllRoles() {
    const token = this.tokenService.getToken();

    if (!token) {
      console.error("No token found");
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<any>(`${environment.API_URL}auth/get-all-roles`, {
      headers,
    });
  }

  createRoles(data: any) {
    const token = this.tokenService.getToken();

    if (!token) {
      console.error("No token found");
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<any>(
      `${environment.API_URL}permission/create-admin-roles`,
      data,
      { headers },
    );
  }

  updateRole(data: any) {
    const token = this.tokenService.getToken();

    if (!token) {
      console.error("No token found");
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.put<any>(
      `${environment.API_URL}auth/update-role-permission`,
      data,
      { headers },
    );
  }
}
