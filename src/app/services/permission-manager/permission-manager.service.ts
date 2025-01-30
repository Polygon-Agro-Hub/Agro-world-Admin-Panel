import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { TokenService } from '../token/services/token.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class PermissionManagerService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  createCategory(data: any) {
    const token = this.tokenService.getToken();

    if (!token) {
      console.error('No token found');
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<any>(
      `${environment.API_URL}permission/create-categories`,
      data,
      { headers }
    );
  }
}
