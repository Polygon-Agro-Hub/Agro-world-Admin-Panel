import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TokenService } from '../token/services/token.service';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(private http:HttpClient, private tokenService:TokenService) { }

   getCustomers(
    page: number        = 1,
    limit: number       = 10,
    searchText: string  = '',
    ratingFilter: string = '',
  ): Observable<any> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
 
    let url = `${this.apiUrl}dash/get-all-customers?page=${page}&limit=${limit}`;
 
    if (searchText)   url += `&searchText=${searchText}`;
    if (ratingFilter) url += `&ratingFilter=${ratingFilter}`;
 
    return this.http.get<any>(url, { headers });
  }
 
  updateDashCustomerRating(id: number, rateofCus: string): Observable<any> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
    const url     = `${this.apiUrl}dash/update-dash-customer-rating/${id}`;
 
    return this.http.patch<any>(url, { rateofCus }, { headers }).pipe(
      catchError((error) => {
        console.error('Error updating dash customer rating:', error);
        return throwError(error);
      }),
    );
  }


  fetchUserOrders(
      userId: string,
      statusFilter: string = 'Ordered'
    ): Observable<any> {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      const url = `${this.apiUrl}dash/get-dash-user-orders/${userId}?status=${statusFilter}`;
  
      return this.http.get<any>(url, { headers }).pipe(
        catchError((error) => {
          console.error('Error fetching user orders:', error);
          return throwError(error);
        })
      );
    }
}
