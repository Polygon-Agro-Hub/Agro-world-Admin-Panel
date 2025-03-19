import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TokenService } from '../token/services/token.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlantcareDashbordService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  getDashboardData(district?: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    // Create HttpParams object and add the district parameter if provided
    let params = new HttpParams();
    if (district) {
      params = params.set('district', district);
    }

    return this.http.get(`${this.apiUrl}auth/plantcare-dashboard`, {
      headers,
      params,
    });
  }
}
