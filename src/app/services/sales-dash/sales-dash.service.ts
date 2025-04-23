import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from '../token/services/token.service';

@Injectable({
  providedIn: 'root'
})
export class SalesDashService {

  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(private http: HttpClient, private tokenService: TokenService) { }

  getAllSalesAgents(page: number = 1, limit: number = 10,  searchText: string = '', status: string = '', date: string = ''): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}sales-agent-dash/get-all-sales-agents?page=${page}&limit=${limit}`;



    if (status) {
      url += `&status=${status}`
    }

    if (searchText) {
      url += `&searchText=${searchText}`
    }

    if (date) {
      url += `&date=${date}`
    }

    return this.http.get(url, {
      headers,
    });
  }

  saveTarget(targetValue: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
  
    const url = `${this.apiUrl}sales-agent-dash/save-target`;
  
    // Create request body
    const body = {targetValue };
  
    
    return this.http.post(url, body, { headers });
  }

  //not useg should remove
  // getDailyTarget(): Observable<any> {
  //   const headers = new HttpHeaders({
  //     Authorization: `Bearer ${this.token}`,
  //     'Content-Type': 'application/json',
  //   });
  
  //   const url = `${this.apiUrl}sales-agent-dash/get-daily-target`;
  
  //   return this.http.get(url, { headers });
  // }

  getAllOrders(
    page: number,
    limit: number,
    orderStatus: string,
    paymentMethod: string,
    paymentStatus: string,
    deliveryType: string,
    searchText: string = '',
    date: string
   
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    
    let url = `${this.apiUrl}dash/get-all-Orders?page=${page}&limit=${limit}`;

    if (orderStatus) {
      url += `&orderStatus=${orderStatus}`;
    }

    if (paymentMethod) {
      url += `&paymentMethod=${paymentMethod}`;
    }paymentStatus

    if (paymentStatus) {
      url += `&paymentStatus=${paymentStatus}`;
    }

    if (deliveryType) {
      url += `&deliveryType=${deliveryType}`;
    }

    if (searchText) {
      url += `&searchText=${searchText}`;
    }

    if (date) {
      url += `&date=${date}`;
    }
    return this.http.get<any>(url, { headers });
  }
}






