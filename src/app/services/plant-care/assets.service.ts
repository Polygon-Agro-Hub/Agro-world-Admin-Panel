import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { Observable } from 'rxjs';
import { TokenService } from '../token/services/token.service';

@Injectable({
  providedIn: 'root',
})
export class AssetsService {
  constructor(private http: HttpClient, private tokenService: TokenService) {}

  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();;

  getAllBuildingFixedAsset(itemId: number, category: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}auth/get-fixed-assets/${itemId}/${category}`;

    return this.http.get<any>(url, { headers });
  }

  getCurrentAssertById(userId:string): Observable<any>{
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });

    return this.http.get<any>(`${this.apiUrl}auth/get-current-assert/${userId}`,{headers})
  }

  getAllCurrentAsset(userId: number, category: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    let url = `${this.apiUrl}auth/get-current-assets-view/${userId}/${category}`;
    let res = this.http.get<any>(url, { headers })
    console.log(res);
    
    return res;
  }

  getAllCurrentAssetRecord(id: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    let url = `${this.apiUrl}auth/get-current-asset-report/${id}`;
    let res = this.http.get<any>(url, { headers })
    console.log(res);
    
    return res;
  }
}
