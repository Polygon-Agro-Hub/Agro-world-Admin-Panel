import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environment/environment';


export interface PlantCareUser {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  NICnumber: string;
  profileImage: string;
  createdAt: string;
}

export interface FixedAsset {
  id: number;
  userId: string;
  tool: string;
  toolType: string;
  brandName: string;
  purchaseDate: string;
  unit: string;
  price: string;
  warranty: string;
  expireDate: string;
  depreciation: string;
  warrantyStatus: string;
  category: string;
  createdAt: string;
}


@Injectable({
  providedIn: 'root'
})
export class PlantcareUsersService {
  getUserProfile(userId: number) {
    throw new Error('Method not implemented.');
  }
  private apiUrl = `${environment.API_BASE_URL}`;
  private token = `${environment.TOKEN}`;
  private url = `${environment.API_URL}`;

  constructor(private http: HttpClient) { }


  getAllPlantCareUsers(page: number, limit: number, searchNIC: string = ''): Observable<any> {
    const token = localStorage.getItem('Login Token : ');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    let url = `${this.apiUrl}get-all-users?page=${page}&limit=${limit}`;
    if (searchNIC) {
      url += `&nic=${searchNIC}`;
    }

    return this.http.get<any>(url, { headers });
  }


  deletePlantCareUser(id: number): Observable<void> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.delete<void>(`${this.apiUrl}delete-plant-care-user/${id}`, { headers });
  }


  getTotalFixedAssets(id: number): Observable<any> {
    
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });

    const url = `${this.apiUrl}get-total-fixed-assets-by-id/${id}`;
    return this.http.get<any>(url, { headers });
  }


  // uploadUserXlsxFile(file: File): Observable<any> {
  //   const headers = new HttpHeaders({
  //     Authorization: `Bearer ${this.token}`,
  //   });

  //   const formData = new FormData();
  //   formData.append('file', file);

  //   return this.http.post(`${this.apiUrl}upload-user-xlsx`, formData, {
  //     headers,
  //   });
  // }

  uploadUserXlsxFile(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}upload-user-xlsx`, formData, {
      responseType: 'json',
      observe: 'body'
    }).pipe(
      catchError(error => {
        // Check if the error response is an Excel file
        if (error.status === 409 && error.error instanceof ArrayBuffer) {
          // Return the file buffer for download
          return new Observable(observer => {
            observer.next(error.error);
            observer.complete();
          });
        }
        return throwError(() => error);
      })
    );
  }

  


  createFeedback(feedbackData: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.post(
      `${this.apiUrl}create-feedback`,
      feedbackData,
      {
        headers,
      }
    );
  }


  updateFeedbackOrder(feedbacks: { id: number; orderNumber: number }[]) {
    const token = localStorage.getItem('Login Token : ');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.put(
      `${environment.API_BASE_URL}update-feedback-order`,
      { feedbacks },
      { headers }
    );
}



deleteFeedback(feedbackId: number): Observable<any> {
  const token = localStorage.getItem('Login Token : ');
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`,
  });

  return this.http.delete(`${this.apiUrl}/feedback/${feedbackId}`, { headers });
}

}
