import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { Observable } from 'rxjs';
import { TokenService } from '../token/services/token.service';

@Injectable({
  providedIn: 'root',
})
export class OfficerTargetService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  // getSelectedOfficerTargetData(officerId: number, status: string = '', search: string = ''): Observable<any> {
  //   const headers = new HttpHeaders({
  //     Authorization: `Bearer ${this.token}`,
  //     'Content-Type': 'application/json',
  //   });

  //   let url = `${this.apiUrl}/get-selected-officer-target-data?officerId=${officerId}`;

  //   if (status) {
  //     url += `&status=${status}`;
  //   }

  //   if (search) {
  //     url += `&search=${search}`
  //   }

  //   return this.http.get(url, {
  //     headers,
  //   });
  // }

  // getSelectedOfficerTargetData(officerId: number): Observable<any> {
  //   console.log("Officer ID:", officerId)
  //   const headers = new HttpHeaders({
  //     Authorization: `Bearer ${this.token}`,
  //     'Content-Type': 'application/json',
  //   });

  //   // Construct the URL with only the officerId parameter
  //   const url = `${this.apiUrl}target/get-selected-officer-target-data?officerId=${officerId}`;

  //   return this.http.get(url, { headers });
  // }

  getSelectedOfficerTargetData(
    officerId: number,
    searchQuery: string = ''
  ): Observable<any> {
    console.log('Officer ID:', officerId);
    console.log('Search Query:', searchQuery);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    // Construct the URL with officerId and optional searchQuery
    let url = `${this.apiUrl}target/get-selected-officer-target-data?officerId=${officerId}`;

    if (searchQuery) {
      url += `&searchQuery=${encodeURIComponent(searchQuery)}`;
    }

    return this.http.get(url, { headers });
  }
}
