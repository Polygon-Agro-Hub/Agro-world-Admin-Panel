import { Injectable } from "@angular/core";
import { environment } from "../../environment/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { TokenService } from "../token/services/token.service";

@Injectable({
  providedIn: "root",
})
export class ViewProductListService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) {}

  getProductList(
  page: number,
  limit: number,
  search: string = "",
  displayTypeValue: string = "",
  categoryValue: string = "",
  discountFilter: string = "" // Add new parameter
): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
  });

  let url = `${this.apiUrl}market-place/get-market-items?page=${page}&limit=${limit}`;
  
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }

  if (displayTypeValue) {
    url += `&displayTypeValue=${encodeURIComponent(displayTypeValue)}`;
  }

  if (categoryValue) {
    url += `&categoryValue=${encodeURIComponent(categoryValue)}`;
  }
  
  // Add discount filter parameter
  if (discountFilter) {
    url += `&discountFilter=${encodeURIComponent(discountFilter)}`;
  }
  
  return this.http.get<any>(url, { headers });
}
}
