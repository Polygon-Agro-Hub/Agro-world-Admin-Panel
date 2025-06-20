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

    console.log('filter', filterType, 'date', date, 'search', search);

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

  // getOrderDetailsById(id: string): Observable<any> {
  //   const headers = new HttpHeaders({
  //     Authorization: `Bearer ${this.token}`,
  //     'Content-Type': 'application/json',
  //   });

  //   const url = `${this.apiUrl}procument/get-order-details/${id}`;

  //   return this.http.get<any>(url, { headers }).pipe(
  //     map((response) => {
  //       if (response.success) {
  //         return response.data;
  //       } else {
  //         throw new Error(response.message);
  //       }
  //     }),
  //     catchError((error) => {
  //       console.error('Error fetching order details:', error);
  //       return throwError(
  //         () =>
  //           new Error(
  //             error.error?.message ||
  //               'An error occurred while fetching order details'
  //           )
  //       );
  //     })
  //   );
  // }

  getOrderDetailsById(id: string): Observable<{
    invNo: string;
    packages: Array<{
      packageId: number;
      displayName: string;
      productPrice: string;
      productTypes: Array<{
        id: number;
        typeName: string;
        shortCode: string;
      }>;
    }>;
  }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    const url = `${this.apiUrl}procument/get-order-details/${id}`;

    return this.http
      .get<{
        success: boolean;
        data: {
          invNo: string;
          packages: Array<{
            packageId: number;
            displayName: string;
            productPrice: string;
            productTypes: Array<{
              id: number;
              typeName: string;
              shortCode: string;
            }>;
          }>;
        };
        message?: string;
      }>(url, { headers })
      .pipe(
        map((response) => {
          if (response.success) {
            // Transform the data if needed (though DAO now returns correct structure)
            return {
              invNo: response.data.invNo,
              packages: response.data.packages.map((pkg) => ({
                packageId: pkg.packageId,
                displayName: pkg.displayName,
                productPrice: pkg.productPrice,
                productTypes: pkg.productTypes || [], // Ensure productTypes is always an array
              })),
            };
          } else {
            throw new Error(
              response.message || 'Failed to fetch order details'
            );
          }
        }),
        catchError((error) => {
          console.error('Error fetching order details:', error);

          let errorMessage = 'An error occurred while fetching order details';
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          return throwError(() => new Error(errorMessage));
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

  createOrderPackageItems(
    orderPackageId: number,
    products: any[]
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    // Structure the data to match the endpoint's expected format
    const requestData = {
      orderPackageId: orderPackageId,
      products: products,
    };

    // Log the data being sent
    console.log('Sending package items:', requestData);

    return this.http
      .post(`${this.apiUrl}procument/add-order-package-item`, requestData, {
        headers,
      })
      .pipe(
        catchError((error) => {
          console.error('Error in createOrderPackageItems:', error);
          return throwError(() => new Error(error));
        })
      );
  }

  getAllOrdersWithProcessInfoCompleted(
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

    let url = `${this.apiUrl}procument/orders-process-info-completed?page=${page}&limit=${limit}`;

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
}
