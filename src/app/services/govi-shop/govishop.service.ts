import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from '../token/services/token.service';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class GovishopService {
  private apiUrl = `${environment.API_URL}shop/`;
  private token = this.tokenService.getToken();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) {}

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
      searchItem?: string,
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
        { headers: this.getHeaders(), params },
      );
    }

  toggleShopActiveStatus(shopId: number, isActive: number): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}toggle-shop-status/${shopId}`,
      { isActive },
      { headers: this.getHeaders() },
    );
  }

  getGoviShopById(shopId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}get-shop/${shopId}`, {
      headers: this.getHeaders(),
    });
  }

  getGoviShopForUpdate(shopId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}get-shop-for-update/${shopId}`, {
      headers: this.getHeaders(),
    });
  }

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

  approveGoviShop(shopId: number): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}approve-shop/${shopId}`,
      {},
      { headers: this.getHeaders() },
    );
  }

  rejectGoviShop(shopId: number, text: string): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}reject-shop/${shopId}`,
      { text },
      { headers: this.getHeaders() },
    );
  }

  deleteGoviShop(shopId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}delete-shop/${shopId}`, {
      headers: this.getHeaders(),
    });
  }

  getAllShopRequests(
    
    filters: {
        page?: number;
        limit?: number;
        approval?: string;
        bussinessType?: string;
        searchItem?: string;
      } = {},
  
  ): Observable<{ results: any[]; total: number }> {
    let params = new HttpParams();
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.approval) params = params.set('approval', filters.approval);
    if (filters.bussinessType)
      params = params.set('bussinessType', filters.bussinessType);
    if (filters.searchItem)
      params = params.set('searchItem', filters.searchItem);

    return this.http.get<{ results: any[]; total: number }>(
      `${this.apiUrl}get-all-shop-requests`,
      { headers: this.getHeaders(), params },
    );
  }

  getBranchesByShopId(
    shopId: number | null,
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

  getAllDeletedSuppliers(
    page: number,
    limit: number,
    searchItem: string,
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}get-all-deleted-suppliers?page=${page}&limit=${limit}`;

    if (searchItem) {
      url += `&searchItem=${searchItem}`;
    }

    return this.http.get<any>(url, { headers });
  }

  getBranchDetailsById(id: number): Observable<BranchDetailsByIdResponse> {
    const url = `${this.apiUrl}view-branch-by-id/${id}`;
    return this.http.get<BranchDetailsByIdResponse>(url, {
      headers: this.getHeaders(),
    });
  }

  // Update the method signature in your service
getProductsByBranchId(
  branchId: number,
  categoryId?: string,
  searchItem?: string
): Observable<any> {
  let params = new HttpParams();

  if (categoryId && categoryId !== 'all') params = params.set('categoryId', categoryId);
  if (searchItem) params = params.set('searchItem', searchItem);

  console.log('API Request URL:', `${this.apiUrl}get-products/${branchId}`);
  console.log('API Request Params:', params.toString());

  return this.http.get<any>(
    `${this.apiUrl}get-products/${branchId}`,
    { headers: this.getHeaders(), params }
  );
}

getBranchForUpdate(id: number) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get<any>(`${this.apiUrl}get-branch-for-update/${id}`, {
      headers,
    });
  }


// updateBranchData(shopData: any): Observable<any> {

//     const headers = new HttpHeaders({
//       Authorization: `Bearer ${this.token}`,
//       'Content-Type': 'application/json'
//     });

//     return this.http.post(`${this.apiUrl}shop/update-govi-shop`,
//     shopData,
//       {
//         headers
//       });
// }


}

export interface BranchDetailsShopInfo {
  logo: string;
  email: string;
  phone: string;
  address: string;
  shopName: string;
  shopType: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: number;
}

export interface BranchDetailsBranchInfo {
  address: string;
  district: string;
  latitude: number;
  province: string;
  createdAt: string;
  longitude: number;
  branchName: string;
  mobilePhone: string;
  landPhone: string;
}

export interface BranchDetailsOwnerInfo {
  nic: string;
  email: string;
  ownerName: string;
  shopPhone: string;
}

export interface BranchDetailsResult {
  shopInfo: BranchDetailsShopInfo;
  branchInfo: BranchDetailsBranchInfo;
  ownerInfo: BranchDetailsOwnerInfo;
}

export interface BranchDetailsByIdResponse {
  result: BranchDetailsResult;
}
