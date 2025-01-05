import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CollectionOfficerService {
  patchValue(arg0: { language: string[]; }) {
    throw new Error('Method not implemented.');
  }
  private apiUrl = `${environment.API_BASE_URL}`;
  private token = `${environment.TOKEN}`;

  constructor(private http: HttpClient) {}

  createCollectiveOfficer(person:any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.post(`${this.apiUrl}collection-officer/create-collection-officer`, {officerData:person}, {
      headers,
    });
  }


  editCollectiveOfficer(person:any, id:number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.put(`${this.apiUrl}update-officer-details/${id}`, {officerData:person}, {
      headers,
    });
  }
}
