import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FarmerListReportService {
  private apiUrl = `${environment.API_BASE_URL}`;
  private token = `${environment.TOKEN}`;

  constructor(private http: HttpClient) {}

  getFarmerListReport(famerID: number, userId: number): Observable<any> {
    console.log('famer Id success', famerID);

    return this.http.get<any[]>(
      `${this.apiUrl}/farmer-list-report/${famerID}/${userId}`
    );
  }
}
