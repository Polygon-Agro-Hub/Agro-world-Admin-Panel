import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { TokenService } from '../token/services/token.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class PermissionManagerService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  createCategory(feature: any, selectedCategory: any, newCategory: any) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    const data = {
      feature: feature, // Pass the feature data
      categoryId: selectedCategory, // Pass the selected category ID
      newCategory: newCategory, // Pass the new category (if any)
    };

    return this.http.post<any>(
      `${environment.API_URL}permission/create-categories`,
      data,
      { headers }
    );
  }



     getFeatureCategories(): Observable<any> {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      return this.http.get<any>(`${this.apiUrl}permission/get-all-feture-categories`, { headers });
    }
}
