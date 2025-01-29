import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
import { TokenService } from './token/services/token.service';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {


  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();;

  constructor(private http: HttpClient, private tokenService: TokenService) { }

  fetchAllCollectionOfficer(page: number, limit: number, searchNIC: string = '', company:string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    console.log(company);
    
    let url = `${this.apiUrl}auth/collection-officer/get-all-collection-officers?page=${page}&limit=${limit}`;

    if (company) {
      url += `&company=${company}`;
    }

    if (searchNIC) {
      url += `&nic=${searchNIC}`;
    }
    return this.http.get<any>(url, { headers });
  }



  fetchAllCollectionOfficerStatus(page: number, limit: number, searchNIC: string = '', company:string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    console.log(company);
    
    let url = `${this.apiUrl}auth/collection-officer/get-all-collection-officers-status?page=${page}&limit=${limit}`;

    if (company) {
      url += `&company=${company}`;
    }

    if (searchNIC) {
      url += `&nic=${searchNIC}`;
    }
    return this.http.get<any>(url, { headers });
  }



  getCompanyNames(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });

    let url = `${this.apiUrl}auth/collection-officer/get-all-company-names`;
    return this.http.get<any>(url, { headers });
  }


  ChangeStatus(id:number, status:string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });

    let url = `${this.apiUrl}auth/collection-officer/update-status/${id}/${status}`;
    return this.http.get<any>(url, { headers });
  }


  deleteOfficer(id:number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });

    let url = `${this.apiUrl}auth/collection-officer/delete-officer/${id}`;
    return this.http.delete<any>(url, { headers });
  }
}
