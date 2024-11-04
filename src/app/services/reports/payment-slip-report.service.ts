import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentSlipReportService {
  private apiUrl = `${environment.API_BASE_URL}`;
  private token = `${environment.TOKEN}`;

  constructor(private http: HttpClient) {}

  getPaymentSlipReport(officerID: number): Observable<any> {
    console.log('officerId success', officerID);

    // Update the URL to use the /farmer-payments endpoint
    return this.http.get<any[]>(
      `${this.apiUrl}/farmer-payments?officerId=${officerID}`
    );
  }
}
