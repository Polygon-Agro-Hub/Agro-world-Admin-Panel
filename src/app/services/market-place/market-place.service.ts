import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { TokenService } from '../token/services/token.service';

@Injectable({
  providedIn: 'root',
})
export class MarketPlaceService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  getCropVerity(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}market-place/get-crop-category`;
    return this.http.get<any>(url, { headers });
  }

  createProduct(Data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.post(
      `${this.apiUrl}market-place/add-market-product`,
      Data,
      {
        headers,
      }
    );
  }

  createCoupen(Data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.post(`${this.apiUrl}market-place/create-coupen`, Data, {
      headers,
    });
  }

  getAllCoupen(
    page: number = 1,
    limit: number = 10,
    status: any,
    types: any,
    search: string
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    let url = `${this.apiUrl}market-place/get-all-coupen?page=${page}&limit=${limit}`;

    if (status) {
      url += `&status=${status}`;
    }

    if (types) {
      url += `&types=${types}`;
    }

    if (search) {
      url += `&searchText=${search}`;
    }
    return this.http.get<any>(url, { headers });
  }

  deleteCoupenById(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}market-place/delete-coupen/${id}`;
    return this.http.delete(url, { headers });
  }

  deleteAllCoupen(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}market-place/delete-all-coupen`;
    return this.http.delete(url, { headers });
  }

  getProuctCropVerity(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}market-place/get-product-category`;
    return this.http.get<any>(url, { headers });
  }

  createPackage(Data: any, selectedImage: any): Observable<any> {
    console.log('this is data', Data);
    const formData = new FormData();
    console.log(selectedImage);
    formData.append('package', JSON.stringify(Data));

    if (selectedImage) {
      formData.append('file', selectedImage);
    }
    console.log('formDta', formData);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    // Send the request
    return this.http.post(`${this.apiUrl}market-place/add-package`, formData, {
      headers,
    });
  }

  getProductById(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}market-place/get-product-by-id/${id}`;
    return this.http.get<any>(url, { headers });
  }

  updateProduct(Data: any, id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.patch(
      `${this.apiUrl}market-place/edit-market-product/${id}`,
      Data,
      {
        headers,
      }
    );
  }

  updatePackages(Data: any, id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.patch(
      `${this.apiUrl}market-place/edit-market-packages/${id}`,
      Data,
      {
        headers,
      }
    );
  }

  getPackageById(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}market-place/get-package-by-id/${id}`;
    return this.http.get<any>(url, { headers });
  }

  getPackageWithDetailsById(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    const url = `${this.apiUrl}market-place/get-packagedetails-by-id/${id}`;
    return this.http.get<any>(url, { headers });
  }

  // In your MarketPlaceService
  updatePackage(data: any, id: number, base64Image?: string): Observable<any> {
    // Ensure all numeric values are properly converted
    const cleanedData = {
      ...data,
      Items: data.Items.map((item: any) => ({
        ...item,
        mpItemId: Number(item.mpItemId), // Ensure mpItemId is a number
        quantity: Number(item.quantity), // Ensure quantity is a number
        discountedPrice: Number(item.discountedPrice), // Ensure price is a number
      })),
    };

    const requestBody = {
      package: JSON.stringify(cleanedData), // Stringify the cleaned data
      file: base64Image,
    };

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.patch(
      `${this.apiUrl}market-place/edit-product/${id}`,
      requestBody,
      { headers }
    );
  }

  uploadRetailBanner(data: FormData): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.post(`${this.apiUrl}market-place/upload-banner`, data, {
      headers,
    });
  }

  uploadRetailBannerWholesale(data: FormData): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.post(
      `${this.apiUrl}market-place/upload-banner-wholesale`,
      data,
      { headers }
    );
  }

  updateBannerOrder(feedbacks: { id: number; orderNumber: number }[]) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.put(
      `${environment.API_URL}market-place/update-banner-order`,
      { feedbacks },
      { headers }
    );
  }

  updateBannerOrderWhole(feedbacks: { id: number; orderNumber: number }[]) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.put(
      `${environment.API_URL}market-place/update-banner-order`,
      { feedbacks },
      { headers }
    );
  }

  deleteBannerRetail(feedbackId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.delete(
      `${this.apiUrl}market-place/delete-banner-retail/${feedbackId}`,
      {
        headers,
      }
    );
  }

  deleteBannerWhole(feedbackId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.delete(
      `${this.apiUrl}market-place/delete-banner-whole/${feedbackId}`,
      {
        headers,
      }
    );
  }

  createProductType(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.post(
      `${this.apiUrl}market-place/create-product-type`,
      data,
      {
        headers,
      }
    );
  }

  getAllProductType(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.get(`${this.apiUrl}market-place/view-all-product-type`, {
      headers,
    });
  }

  fetchProductTypes(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}market-place/get-product-type`;
    return this.http.get<any>(url, { headers });
  }

  //   editPackage(Data: any, selectedImage: any, id: number): Observable<any> {
  //   console.log('this is data', Data);
  //   const formData = new FormData();
  //   formData.append('package', JSON.stringify(Data));

  //   if (selectedImage) {
  //     formData.append('file', selectedImage);
  //   }

  //   const headers = new HttpHeaders({
  //     Authorization: `Bearer ${this.token}`,
  //   });

  //   return this.http.post(`${this.apiUrl}market-place/add-package`,{
  //     headers,
  //   });
  // }

  editPackage(Data: any, selectedImage: any, id: number): Observable<any> {
    console.log('this is data', Data);
    console.log('this is image', selectedImage);
    const formData = new FormData();

    formData.append('package', JSON.stringify(Data));

    // Only append file if selectedImage is a base64 string (new image)
    // If it's a URL string (old image), don't append it
    if (selectedImage && selectedImage.toString().startsWith('data:')) {
      formData.append('file', selectedImage);
    }

    console.log('formData', formData);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.post(
      `${this.apiUrl}market-place/edit-package/${id}`,
      formData,
      {
        headers,
      }
    );
  }

  getAllProductTypeById(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.get(
      `${this.apiUrl}market-place/get-product-type-by-id/${id}`,
      {
        headers,
      }
    );
  }

  editProductType(data: any, id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.patch(
      `${this.apiUrl}market-place/edit-product-type/${id}`,
      data,
      {
        headers,
      }
    );
  }

  deleteProductType(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.delete(
      `${this.apiUrl}market-place/delete-product-type/${id}`,
      {
        headers,
      }
    );
  }

  getAllRetailOrders(
    page: number,
    limit: number,
    status: string = '',
    method: string = '',
    searchItem: string = '',
    formattedDate: string = ''
  ): Observable<any> {
    console.log(page, limit, status, method, searchItem, formattedDate);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}market-place/get-all-retail-orders?page=${page}&limit=${limit}`;

    if (status) {
      url += `&status=${status}`;
    }

    if (method) {
      url += `&method=${method}`;
    }

    if (searchItem) {
      url += `&searchItem=${searchItem}`;
    }

    if (formattedDate) {
      url += `&formattedDate=${formattedDate}`;
    }

    return this.http.get<any>(url, { headers: headers });
  }

  getAllDeliveryCharges(
    searchCity: string = '',
    exactCity: string = ''
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}market-place/get-all-delivery-charges`;
    const params = new HttpParams();

    if (searchCity) {
      params.set('searchItem', searchCity);
    }

    if (exactCity) {
      params.set('city', exactCity);
    }

    return this.http.get<any>(url, { headers, params });
  }

  uploadDeliveryCharges(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http
      .post(`${this.apiUrl}market-place/upload-delivery-charges`, formData, {
        headers,
      })
      .pipe(
        catchError((error) => {
          console.error('Upload error:', error);
          return throwError(() => new Error('Failed to upload file'));
        })
      );
  }

  updateDeliveryCharge(data: any, id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(
      `${this.apiUrl}market-place/edit-delivery-charge/${id}`,
      data,
      { headers }
    );
  }

  // In your market-place.service.ts
  checkPackageDisplayName(displayName: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.get<any>(
      `${this.apiUrl}market-place/check-package-name?displayName=${displayName}`,
      { headers }
    );
  }
}
