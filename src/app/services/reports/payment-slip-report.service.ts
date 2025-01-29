import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from '../token/services/token.service';

@Injectable({
  providedIn: 'root',
})
export class PaymentSlipReportService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  getPaymentSlipReport(page: number, limit: number, officerID: number, date?: string, searchNIC: string = ''): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}auth/farmer-payments/${officerID}?page=${page}&limit=${limit}&date=${date}`;
    if (searchNIC) {
      url += `&search=${searchNIC}`;
    }

    return this.http.get<any>(url, { headers });
  }
}
