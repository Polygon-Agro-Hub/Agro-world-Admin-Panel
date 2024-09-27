import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AssetsService {
  constructor(private http: HttpClient) {}

  private apiUrl = `${environment.API_BASE_URL}`;
  private token = `${environment.TOKEN}`;

  getAllBuildingFixedAsset(itemId: number, category: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}get-fixed-assets/${itemId}/${category}`;

    return this.http.get<any>(url, { headers });
  }

  getCurrentAssertById(userId:string): Observable<any>{
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });

    return this.http.get<any>(`${this.apiUrl}/get-current-assert/${userId}`,{headers})
  }

  getAllCurrentAsset(userId: number, category: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    let url = `${this.apiUrl}get-current-assets-view/${userId}/${category}`;
    let res = this.http.get<any>(url, { headers })
    console.log(res);
    
    return res;
  }

  getAllCurrentAssetRecord(id: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    let url = `${this.apiUrl}get-current-asset-report/${id}`;
    let res = this.http.get<any>(url, { headers })
    console.log(res);
    
    return res;
  }
}
