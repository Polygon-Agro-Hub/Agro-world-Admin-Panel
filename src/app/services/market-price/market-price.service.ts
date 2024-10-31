import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarketPriceService {
  private apiUrl = `${environment.API_URL}`;
  private token = `${environment.TOKEN}`;

  constructor(private http: HttpClient) { }

  getAllMarketPrice(page:number, limit:number, crop:any, grade:any):Observable<any>{
    console.log(crop);
    
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });

    let url = `${this.apiUrl}market-price/get-market-prices?page=${page}&limit=${limit}`

    if(crop){
      url+=`&crop=${crop}`
    }

    if(grade){
      url+=`&grade=${grade}`
    }

    return this.http.get<any>(url,{headers})
  }

  getAllCropName():Observable<any>{
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    return this.http.get<any>(`${this.apiUrl}market-price/get-all-crop-name`)

  }


  bulkUploadingMarketPrice(formData: FormData): Observable<any> {
    console.log(formData);
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.post(`${environment.API_BASE_URL}market-price/upload-market-price-xlsx`, formData, {
      headers,
    });
    
  }
}
