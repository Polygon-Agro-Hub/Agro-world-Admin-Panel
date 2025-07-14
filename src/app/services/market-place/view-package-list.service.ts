import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TokenService } from '../token/services/token.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ViewPackageListService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  // getAllMarketplacePackages(
  //   searchText: string = '',
  //   date: string
  // ): Observable<any> {
  //   const headers = new HttpHeaders({
  //     Authorization: `Bearer ${this.token}`,
  //   });

  //   let url = `${this.apiUrl}market-place/get-all-package-list`;
  //   if (searchText) {
  //     url += `?searchText=${searchText}`;
  //   }

  //   if (date) {
  //     url += `&date=${date}`;
  //   }
  //   return this.http.get<any>(url, { headers });
  // }

  getAllMarketplacePackages(
    searchText: string = '',
    date?: string
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let params = new HttpParams();
    if (searchText) {
      params = params.append('searchText', searchText);
    }
    if (date) {
      params = params.append('date', date);
    }

    return this.http.get<any>(
      `${this.apiUrl}market-place/get-all-package-list`,
      {
        headers,
        params,
      }
    );
  }
}
