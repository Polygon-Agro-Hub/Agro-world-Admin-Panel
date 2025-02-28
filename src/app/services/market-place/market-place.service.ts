import { Injectable } from "@angular/core";
import { environment } from "../../environment/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { TokenService } from "../token/services/token.service";

@Injectable({
  providedIn: "root",
})
export class MarketPlaceService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) {}

  getCropVerity(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}market-place/get-crop-category`;
    return this.http.get<any>(url, { headers });
  }

  createProduct(Data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    });
    return this.http.post(
      `${this.apiUrl}market-place/add-market-product`,
      Data,
      {
        headers,
      },
    );
  }

  createCoupen(Data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    });
    return this.http.post(`${this.apiUrl}market-place/create-coupen`, Data, {
      headers,
    });
  }

  getAllCoupen(
    page: number = 1,
    limit: number = 10,
    status: any,
    types: any,
    search: string,
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    let url = `${this.apiUrl}market-place/get-all-coupen?page=${page}&limit=${limit}`;

    if (status) {
      url += `&status=${status}`;
    }

    if (types) {
      url += `&types=${types}`;
    }

    if (search) {
      url += `&searchText=${search}`;
    }
    return this.http.get<any>(url, { headers });
  }

  deleteCoupenById(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}market-place/delete-coupen/${id}`;
    return this.http.delete(url, { headers });
  }

  deleteAllCoupen(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}market-place/delete-all-coupen`;
    return this.http.delete(url, { headers });
  }

  getProuctCropVerity(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}market-place/get-product-category`;
    return this.http.get<any>(url, { headers });
  }

  createPackage(Data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    });
    return this.http.post(`${this.apiUrl}market-place/add-product`, Data, {
      headers,
    });
  }


  getProductById(id:number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });

    let url = `${this.apiUrl}market-place/get-product-by-id/${id}`;
    return this.http.get<any>(url, { headers });
  }


  updateProduct(Data: any, id:number): Observable<any> {

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.patch(`${this.apiUrl}market-place/edit-market-product/${id}`, Data, {
      headers,
    });
  }
}
