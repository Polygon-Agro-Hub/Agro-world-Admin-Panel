import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TokenService } from '../token/services/token.service';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environment/environment';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

interface OrderPackageResponse {
  invNo: string;
  packages: Package[];
}

interface Package {
  packageId: number;
  displayName: string;
  productPrice: number;
  productTypes: ProductType[];
}

interface ProductType {
  id: number;
  typeName: string;
  productId: number;
  qty: number;
  price: number;
  displayName: string;
  shortCode: string;
}

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
    additionalItems?: Array<{
      id: number;
      qty: number;
      unit: string;
      displayName: string;
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
        additionalItems?: Array<{
          id: number;
          qty: number;
          unit: string;
          displayName: string;
        }>;
        message?: string;
      }>(url, { headers })
      .pipe(
        map((response) => {
          if (response.success) {
            return {
              invNo: response.data.invNo,
              packages: response.data.packages.map((pkg) => ({
                packageId: pkg.packageId,
                displayName: pkg.displayName,
                productPrice: pkg.productPrice,
                productTypes: pkg.productTypes || [],
              })),
              additionalItems: response.additionalItems || [],
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

  // In your procurement service
  updateOrderPackagePackingStatus(
    orderPackageId: number,
    status: string
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .put(
        `${this.apiUrl}procument/update-order-package-status`, // Remove the ID from URL
        { orderPackageId, status }, // Send both fields in body
        { headers }
      )
      .pipe(
        catchError((error) => {
          console.error('Error in updateOrderPackagePackingStatus:', error);
          return throwError(() => error);
        })
      );
  }

  getOrderPackagesByOrderId(orderId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    const url = `${this.apiUrl}procument/order-packages/${orderId}`;

    return this.http.get<any>(url, { headers }).pipe(
      map((response) => {
        if (response.success) {
          return {
            invNo: response.data.invNo,
            packages: response.data.packages,
          };
        } else {
          throw new Error(response.message);
        }
      }),
      catchError((error) => {
        console.error('Error fetching order packages:', error);
        return throwError(
          () =>
            new Error(
              error.error?.message ||
                'An error occurred while fetching order packages'
            )
        );
      })
    );
  }

  updateOrderPackageItems(
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
    console.log('Updating package items:', requestData);

    return this.http
      .put(`${this.apiUrl}procument/update-order-package-items`, requestData, {
        headers,
      })
      .pipe(
        catchError((error) => {
          console.error('Error in updateOrderPackageItems:', error);
          return throwError(() => new Error(error));
        })
      );
  }

  getAllOrdersWithProcessInfoDispatched(
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

    let url = `${this.apiUrl}procument/orders-process-info-dispatched?page=${page}&limit=${limit}`;

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
