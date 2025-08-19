import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TokenService } from '../token/services/token.service';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class DispatchService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(private http: HttpClient, private tokenService: TokenService) { }




  getPreMadePackages(
    page: number,
    limit: number,
    selectedStatus: string = '',
    date: string,
    search: string
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    console.log('selectedStatus', selectedStatus, 'date', date, 'search', search)


    let url = `${this.apiUrl}dispatch/get-premade-packages?page=${page}&limit=${limit}`;

    if (selectedStatus) {
      url += `&selectedStatus=${selectedStatus}`;
    }


    if (date) {
      url += `&date=${date}`;
    }


    if (search) {
      url += `&search=${search}`;
    }
    return this.http.get<any>(url, { headers });
  }





  getSelectedPackages(
    page: number,
    limit: number,
    selectedStatus: string = '',
    date: string,
    search: string
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    console.log("date", date, "selectedStatus", selectedStatus, "search", search,)


    let url = `${this.apiUrl}dispatch/get-selected-packages?page=${page}&limit=${limit}`;

    if (selectedStatus) {
      url += `&selectedStatus=${selectedStatus}`;
    }



    if (date) {
      url += `&date=${date}`;
    }


    if (search) {
      url += `&search=${search}`;
    }
    return this.http.get<any>(url, { headers });
  }

  getPackageItems(
    id: number
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });


    let url = `${this.apiUrl}dispatch/get-package-items?id=${id}`;

    return this.http.get<any>(url, { headers });
  }

  updatePackageItemData(array: any, id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    const url = `${this.apiUrl}dispatch/update-package-data`;

    // Send the array as a named field in the body
    return this.http.post<any>(url, { packedItems: array, id }, { headers });
  }

  getAllProducts(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });


    let url = `${this.apiUrl}dispatch/get-all-products`;

    return this.http.get<any>(url, { headers });
  }

  replaceProductData(productId: number, quantity: number, totalPrice: number | null = null, id: number, previousProductId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    const url = `${this.apiUrl}dispatch/replace-product-data`;

    // Send the array as a named field in the body
    return this.http.post<any>(url, { productId, quantity, totalPrice, id, previousProductId }, { headers });
  }

  updateAdditionalItemData(array: any, id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    const url = `${this.apiUrl}dispatch/update-additional-item-data`;

    // Send the array as a named field in the body
    return this.http.post<any>(url, { additionalItems: array, id }, { headers });
  }

  getAdditionalItems(
    id: number
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });


    let url = `${this.apiUrl}dispatch/get-additional-items?id=${id}`;

    return this.http.get<any>(url, { headers });
  }





  getCustomPackItems(invoiceId: number) {

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.get<any[]>(`${this.apiUrl}dispatch/get-custom-pack-items/${invoiceId}`, { headers });
  }






  updateCustomPackItems(invoiceId: number, updatedItems: { id: number, isPacked: number }[]) {
    const token = this.token; // Ensure token is accessible or injected here

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    const url = `${this.apiUrl}dispatch/update-custom-pack-items`;

    const body = {
      invoiceId,
      updatedItems,
    };

    return this.http.post(url, body, { headers });
  }

  getCustomAdditionalItems(
    id: number
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });


    let url = `${this.apiUrl}dispatch/get-custom-additional-items?id=${id}`;

    return this.http.get<any>(url, { headers });
  }

  updateCustomAdditionalItemData(array: any, id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    const url = `${this.apiUrl}dispatch/update-custom-additional-item-data`;

    // Send the array as a named field in the body
    return this.http.post<any>(url, { customAdditionalItems: array, id }, { headers });
  }






  getPackageOrderDetailsById(id: number) {

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.get<any[]>(`${this.apiUrl}dispatch/get-additional-pack-items/${id}`, { headers });
  }




  updatePackItemsAdditional(invoiceId: number, updatedItems: { id: number, isPacked: number }[]) {
    const token = this.token; // Make sure `token` is initialized and valid

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    const url = `${this.apiUrl}dispatch/update-pack-additiona-items`;

    const body = {
      invoiceId,
      updatedItems,
    };

    return this.http.post(url, body, { headers });
  }


  getMarketPlacePreMadePackages(page: number, limit: number, selectedStatus: string = '', date: string, search: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    console.log('selectedStatus', selectedStatus, 'date', date, 'search', search)


    let url = `${this.apiUrl}dispatch/marketplace-premade-package?page=${page}&limit=${limit}`;

    if (selectedStatus) {
      url += `&selectedStatus=${selectedStatus}`;
    }


    if (date) {
      url += `&date=${date}`;
    }


    if (search) {
      url += `&search=${search}`;
    }
    return this.http.get<any>(url, { headers });
  }

  getMarketPlacePreMadePackagesItems(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}dispatch/marketplace-premade-package-items/${id}`;

    return this.http.get<any>(url, { headers });
  }

  getMarketPlaceCustomePackages(page: number, limit: number, selectedStatus: string = '', date: string, search: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    console.log('selectedStatus', selectedStatus, 'date', date, 'search', search)


    let url = `${this.apiUrl}dispatch/marketplace-custome-package?page=${page}&limit=${limit}`;

    if (selectedStatus) {
      url += `&selectedStatus=${selectedStatus}`;
    }


    if (date) {
      url += `&date=${date}`;
    }


    if (search) {
      url += `&search=${search}`;
    }
    return this.http.get<any>(url, { headers });
  }

    getPackageItemsForDispatch(id: number, orderId:number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}dispatch/get-package-for-dispatch/${id}/${orderId}`;

    return this.http.get<any>(url, { headers });
  }

    dispatchPackageItemData(array: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    const url = `${this.apiUrl}dispatch/dispatch-package`;

    // Send the array as a named field in the body
    return this.http.patch<any>(url, array, { headers });
  }

}
