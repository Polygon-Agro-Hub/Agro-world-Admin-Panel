import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface IdistrictReport {
  cropName: string
  district: string
  qtyA: number
  qtyB: number
  qtyC: number
  priceA: number
  priceB: number
  priceC: number
}

interface IProvinceReport{
  cropName: string
  district: string
  qtyA: number
  qtyB: number
  qtyC: number
  priceA: number
  priceB: number
  priceC: number
}

@Injectable({
  providedIn: 'root'
})
export class CollectionOfficerReportService {
  private apiUrl = `${environment.API_BASE_URL}`;
  private token = `${environment.TOKEN}`;

  constructor(private http: HttpClient) { }


  getDistrictReport(district:any):Observable<IdistrictReport[]>{
    console.log("service District:",district);
    
    return this.http.get<IdistrictReport[]>(`${this.apiUrl}collection-officer/district-report/${district}`)
  }

  getProvinceReport(province:any):Observable<IProvinceReport[]>{
    console.log("service District:",province);
    
    return this.http.get<IProvinceReport[]>(`${this.apiUrl}collection-officer/province-report/${province}`)
  }
}
