import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment.development';
import { TokenService } from '../token/services/token.service';

@Injectable({
  providedIn: 'root',
})
export class GovishopService {
  private apiUrl = `${environment.API_URL}shop/`;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  private getHeaders(): HttpHeaders {
    const token = this.tokenService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  getAllShops(
    page: number = 1,
    limit: number = 10,
    accessStatus?: string,
    approval?: string,
    bussinessType?: string,
    searchItem?: string
  ): Observable<{ results: any[]; total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (accessStatus) params = params.set('accessStatus', accessStatus);
    if (approval) params = params.set('approval', approval);
    if (bussinessType) params = params.set('bussinessType', bussinessType);
    if (searchItem) params = params.set('searchItem', searchItem);

    return this.http.get<{ results: any[]; total: number }>(
      `${this.apiUrl}get-all-shops`,
      { headers: this.getHeaders(), params }
    );
  }

  /**
   * Toggle a shop's active status (isActive: 0 or 1)
   */
  toggleShopActiveStatus(shopId: number, isActive: number): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}toggle-shop-status/${shopId}`,
      { isActive },
      { headers: this.getHeaders() }
    );
  }

  /**
   * Get shop details by ID
   */
  getGoviShopById(shopId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}get-shop/${shopId}`, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Get shop data for edit form
   */
  getGoviShopForUpdate(shopId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}get-shop-for-update/${shopId}`, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Update shop details
   */
  updateGoviShop(shopData: {
    shopId: number;
    shopName: string;
    email: string;
    mobileNumber: string;
    address: string;
  }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}update-shop`, shopData, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Approve a shop
   */
  approveGoviShop(shopId: number): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}approve-shop/${shopId}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  /**
   * Reject a shop with reason
   */
  rejectGoviShop(shopId: number, text: string): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}reject-shop/${shopId}`,
      { text },
      { headers: this.getHeaders() }
    );
  }

  /**
   * Delete a shop (soft delete)
   */
  deleteGoviShop(shopId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}delete-shop/${shopId}`, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Get all shop requests (pending / rejected)
   */
  getAllShopRequests(
    filters: {
      page?: number;
      limit?: number;
      approval?: string;
      bussinessType?: string;
      searchItem?: string;
    } = {}
  ): Observable<{ results: any[]; total: number }> {
    let params = new HttpParams();
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.approval) params = params.set('approval', filters.approval);
    if (filters.bussinessType) params = params.set('bussinessType', filters.bussinessType);
    if (filters.searchItem) params = params.set('searchItem', filters.searchItem);

    return this.http.get<{ results: any[]; total: number }>(
      `${this.apiUrl}get-all-shop-requests`,
      { headers: this.getHeaders(), params }
    );
  }

  getBranchesByShopId(
    shopId: number,
    page: number = 1,
    limit: number = 10,
    province?: string,
    district?: string,
    searchItem?: string
  ): Observable<{ results: any[]; total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (province) params = params.set('province', province);
    if (district) params = params.set('district', district);
    if (searchItem) params = params.set('searchItem', searchItem);

    return this.http.get<{ results: any[]; total: number }>(
      `${this.apiUrl}get-branches/${shopId}`,
      { headers: this.getHeaders(), params }
    );
  }

  toggleBranchActiveStatus(branchId: number, isActive: number): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}toggle-branch-status/${branchId}`,
      { isActive },
      { headers: this.getHeaders() }
    );
  }
}