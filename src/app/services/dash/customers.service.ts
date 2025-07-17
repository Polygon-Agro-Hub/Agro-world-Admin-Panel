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

  getCustomers(page: number = 1, limit: number = 10,searchText:string = ''):Observable<any>{
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });

    let url = `${this.apiUrl}dash/get-all-customers?page=${page}&limit=${limit}`

    if(searchText){
      url+=`&searchText=${searchText}`
    }
    return this.http.get<any>(url, { headers: headers } );
  }


  fetchUserOrders(
      userId: string,
      statusFilter: string = 'Ordered'
    ): Observable<any> {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
      console.log('userId:', userId);
  
      const url = `${this.apiUrl}dash/get-dash-user-orders/${userId}?status=${statusFilter}`;
  
      return this.http.get<any>(url, { headers }).pipe(
        catchError((error) => {
          // You can handle specific error cases here if needed
          console.error('Error fetching user orders:', error);
          return throwError(error);
        })
      );
    }
}
