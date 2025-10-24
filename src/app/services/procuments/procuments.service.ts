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
    statusFilter: string = '',
    dateFilter: string = '',
    dateFilter1: string = '',
    searchText: string = ''
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}procument/orders-process-info?page=${page}&limit=${limit}`;

    if (statusFilter) {
      url += `&statusFilter=${statusFilter}`;
    }

    if (dateFilter) {
      url += `&dateFilter=${dateFilter}`;
    }

    if (dateFilter1) {
      url += `&dateFilter1=${dateFilter1}`;
    }

    if (searchText) {
      url += `&searchText=${searchText}`;
    }

    // if (search) {
    //   url += `&search=${encodeURIComponent(search)}`;
    // }

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

  getOrderDetailsById(
    id: string
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });


    let url = `${this.apiUrl}procument/get-order-details/${id}`;

    return this.http.get<any>(url, { headers });
  }

  // getOrderDetailsById(id: string): Observable<{
  //   invNo: string;
  //   packages: Array<{
  //     packageId: number;
  //     displayName: string;
  //     productPrice: string;
  //     productTypes: Array<{
  //       id: number;
  //       typeName: string;
  //       shortCode: string;
  //     }>;
  //   }>;
  //   additionalItems?: Array<{
  //     id: number;
  //     qty: number;
  //     unit: string;
  //     displayName: string;
  //   }>;
  // }> {
  //   const headers = new HttpHeaders({
  //     Authorization: `Bearer ${this.token}`,
  //     'Content-Type': 'application/json',
  //   });

  //   const url = `${this.apiUrl}procument/get-order-details/${id}`;

  //   return this.http
  //     .get<{
  //       success: boolean;
  //       data: {
  //         invNo: string;
  //         packages: Array<{
  //           packageId: number;
  //           displayName: string;
  //           productPrice: string;
  //           productTypes: Array<{
  //             id: number;
  //             typeName: string;
  //             shortCode: string;
  //           }>;
  //         }>;
  //       };
  //       additionalItems?: Array<{
  //         id: number;
  //         qty: number;
  //         unit: string;
  //         displayName: string;
  //       }>;
  //       message?: string;
  //     }>(url, { headers })
  //     .pipe(
  //       map((response) => {
  //         if (response.success) {
  //           return {
  //             invNo: response.data.invNo,
  //             packages: response.data.packages.map((pkg) => ({
  //               packageId: pkg.packageId,
  //               displayName: pkg.displayName,
  //               productPrice: pkg.productPrice,
  //               productTypes: pkg.productTypes || [],
  //             })),
  //             additionalItems: response.additionalItems || [],
  //           };
  //         } else {
  //           throw new Error(
  //             response.message || 'Failed to fetch order details'
  //           );
  //         }
  //       }),
  //       catchError((error) => {
  //         console.error('Error fetching order details:', error);

  //         let errorMessage = 'An error occurred while fetching order details';
  //         if (error.error?.message) {
  //           errorMessage = error.error.message;
  //         } else if (error.message) {
  //           errorMessage = error.message;
  //         }

  //         return throwError(() => new Error(errorMessage));
  //       })
  //     );
  // }

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
    dateFilter: string = '',
    searchTerm: string = '',
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    console.log('dateFilter', dateFilter, 'searchTerm', searchTerm)

    let url = `${this.apiUrl}procument/orders-process-info-completed?page=${page}&limit=${limit}`;

    if (dateFilter) {
      url += `&dateFilter=${dateFilter}`;
    }

    if (searchTerm) {
      url += `&searchTerm=${searchTerm}`;
    }

    return this.http.get<any>(url, { headers });
  }

  // In your procurement service
  updateOrderPackagePackingStatus(
    orderPackageId: number,
    orderId: number,
    status: string
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .put(
        `${this.apiUrl}procument/update-order-package-status`, // Remove the ID from URL
        { orderPackageId, orderId, status }, // Send both fields in body
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
    console.log('sending oid', orderId)
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    const url = `${this.apiUrl}procument/order-packages/${orderId}`;

    return this.http.get<any>(url, { headers }).pipe(
      map((response) => {
        console.log('response', response)
        if (response.success) {
          return {
            invNo: response.data.invNo,
            packages: response.data.packages,
            additionalItems:response.additionalItems
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
    dateFilter: string = '',
    searchTerm: string = ''
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    console.log('datefilte', dateFilter, 'searchTerm', searchTerm)

    let url = `${this.apiUrl}procument/orders-process-info-dispatched?page=${page}&limit=${limit}`;

    if (dateFilter) {
      url += `&dateFilter=${dateFilter}`;
    }

    if (searchTerm) {
      url += `&searchTerm=${searchTerm}`;
    }

    return this.http.get<any>(url, { headers });
  }

  updateDefinePackageItemData(array: any, id:number): Observable<any> {
    console.log('array', array)
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
  
    const url = `${this.apiUrl}procument/update-define-package-data`;
  
    // Send the array as a named field in the body
    return this.http.post<any>(url, { definePackageItems: array, orderId:id}, { headers });
  }

  getExcludedItems(orderId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
  
  
    let url = `${this.apiUrl}procument/get-excluded-items/${orderId}`;
  
    return this.http.get<any>(url, { headers });
  }
  
  getDistributionOrders(
  page: number,
  limit: number,
  centerId: string = '',
  deliveryDate: string = '',
  search: string = ''
): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
    'Content-Type': 'application/json',
  });

  console.log('centerId', centerId, 'deliveryDate', deliveryDate, 'search', search);

  let url = `${this.apiUrl}procument/get-distribution-orders?page=${page}&limit=${limit}`;

  if (centerId) {
    url += `&centerId=${centerId}`;
  }

  if (deliveryDate) {
    url += `&deliveryDate=${deliveryDate}`;
  }

  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }

  return this.http.get<any>(url, { headers });
}

getAllCenters(): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
    'Content-Type': 'application/json',
  });

  const url = `${this.apiUrl}procument/get-all-distribution-centers`;

  return this.http.get<any>(url, { headers });
}
  
}


