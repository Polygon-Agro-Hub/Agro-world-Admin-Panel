import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TokenService } from '../token/services/token.service';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class ProcumentsService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  getRecievedOrdersQuantity(
    page: number,
    limit: number,
    filterType: string = '',
    date: string,
    search: string
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    console.log('filter', filterType, 'date', date, 'search', search)

    let url = `${this.apiUrl}procument/get-received-orders?page=${page}&limit=${limit}`;

    if (filterType) {
      url += `&filterType=${filterType}`;
    }

    if (date) {
      url += `&date=${date}`;
    }

    if (search) {
      url += `&search=${search}`;
    }
    return this.http.get<any>(url, { headers });
  }

  getAllOrdersWithProcessInfo(
    page: number,
    limit: number,
    filterType: string = '',
    date: string = '',
    search: string = ''
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}procument/orders-process-info?page=${page}&limit=${limit}`;

    if (filterType) {
      url += `&filterType=${filterType}`;
    }

    if (date) {
      url += `&date=${date}`;
    }

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    return this.http.get<any>(url, { headers });
  }

  getOrderDetailsById(id: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    const url = `${this.apiUrl}procument/get-order-details/${id}`;

    return this.http.get<any>(url, { headers }).pipe(
      map((response) => {
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError((error) => {
        console.error('Error fetching order details:', error);
        return throwError(
          () =>
            new Error(
              error.error?.message ||
                'An error occurred while fetching order details'
            )
        );
      })
    );
  }

  getAllMarketplaceItems(orderId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    const url = `${this.apiUrl}procument/get-marketplace-item/${orderId}`;

    return this.http.get<any>(url, { headers }).pipe(
      map((response) => {
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError((error) => {
        console.error('Error fetching marketplace items:', error);
        return throwError(
          () =>
            new Error(
              error.error?.message ||
                'An error occurred while fetching marketplace items'
            )
        );
      })
    );
  }

  createOrderPackageItems(orderPackageItemsData: any[]): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    // Log the data being sent
    console.log('Sending package items:', orderPackageItemsData);

    return this.http
      .post(
        `${this.apiUrl}procument/add-order-package-item`,
        orderPackageItemsData, // Send array directly
        { headers }
      )
      .pipe(
        catchError((error) => {
          console.error('Error in createOrderPackageItems:', error);
          return throwError(error);
        })
      );
  }
}
