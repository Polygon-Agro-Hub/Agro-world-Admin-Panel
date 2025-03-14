import { Injectable } from "@angular/core";
import { environment } from "../../environment/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { TokenService } from "../token/services/token.service";

@Injectable({
  providedIn: "root",
})
export class MarketPriceService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) {}

  getAllMarketPrice(crop: any, grade: any, searchNIC: any): Observable<any> {
    console.log(crop);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}market-price/get-market-prices?`;

    if (crop) {
      url += `crop=${crop}`;
    }

    if (grade) {
      url += `&grade=${grade}`;
    }

    if (searchNIC) {
      url += `&search=${searchNIC}`;
    }

    return this.http.get<any>(url, { headers: headers });
  }

  getAllCropName(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get<any>(`${this.apiUrl}market-price/get-all-crop-name`, {headers});
  }

  bulkUploadingMarketPrice(formData: FormData): Observable<any> {
    console.log(formData);
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.post(
      `${environment.API_URL}market-price/upload-market-price-xlsx`,
      formData,
      {
        headers,
      },
    );
  }



  getAllMarketPriceAgro(crop: any, grade: any, searchNIC: any, centerId : any, companyId : any): Observable<any> {
    console.log(centerId,companyId);


    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}market-price/get-market-prices-agroworld?`;

    if (crop) {
      url += `crop=${crop}`;
    }

    if (grade) {
      url += `&grade=${grade}`;
    }

    if (searchNIC) {
      url += `&search=${searchNIC}`;
    }

    if (centerId) {
      url += `&centerId=${centerId}`;
    }

    if (companyId) {
      url += `&companyId=${companyId}`;
    }

    return this.http.get<any>(url, { headers: headers });
  }
}
