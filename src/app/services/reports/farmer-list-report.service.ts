import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FarmerListReportService {

  private apiUrl = `${environment.API_BASE_URL}`;
  private token = `${environment.TOKEN}`;

  constructor(private http:HttpClient) { }

  getFarmerListReport(officerID: number):Observable<any>{
    console.log('officerId success', officerID);
    
    return this.http.get<any[]>(
      `${this.apiUrl}/farmer-list-report?officerID=${officerID}`
    )
  }
}
