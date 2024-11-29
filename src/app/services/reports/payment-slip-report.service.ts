import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentSlipReportService {
  private apiUrl = `${environment.API_BASE_URL}`;
  private token = `${environment.TOKEN}`;

  constructor(private http: HttpClient) {}

  getPaymentSlipReport(page: number, limit: number, officerID: number, date?: string, searchNIC: string = ''): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}/farmer-payments/${officerID}?page=${page}&limit=${limit}&date=${date}`;
    if (searchNIC) {
      url += `&search=${searchNIC}`;
    }

    return this.http.get<any>(url, { headers });
  }
}
