import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

export interface NewCropCalender {
  id: number;
  cropName: string;
  variety: string;
  CultivationMethod: string;
  NatureOfCultivation: string;
  CropDuration: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class CropCalendarService {
  private apiUrl = `${environment.API_BASE_URL}`;
  private token = `${environment.TOKEN}`;

  constructor(private http: HttpClient) {}

  // Create Crop Calendar
  createCropCalendar(formData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.post(`${this.apiUrl}admin-add-crop-calender`, formData, {
      headers,
    });
  }

  // Get Crop Calendar by ID
  getCropCalendarById(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.apiUrl}get-cropcalender-by-id/${id}`, {
      headers,
    });
  }

  // Update Crop Calendar

  updateCropCalendar(cropId: number, formData: FormData) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('Login Token : ')}`,
    });

    return this.http.put(
      `${this.apiUrl}edit-cropcalender/${cropId}`,
      formData,
      { headers }
    );
  }

  // Upload XLSX file
  uploadXlsxFile(cropId: number, file: File): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}upload-xlsx/${cropId}`, formData, {
      headers,
    });
  }

  fetchAllCropCalenders(
    page: number = 1,
    limit: number = 10
  ): Observable<{ items: NewCropCalender[]; total: number }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get<{ items: NewCropCalender[]; total: number }>(
      `${this.apiUrl}get-all-crop-calender?page=${page}&limit=${limit}`,
      { headers }
    );
  }

  deleteCropCalender(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.delete(`${this.apiUrl}delete-crop/${id}`, {
      headers,
    });
  }

  getAllCropTaskBycropId(id: string) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.get<any>(`${this.apiUrl}get-all-crop-task/${id}`, {
      headers,
    });
  }

  getCropTaskBycropId(id: string) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.get<any>(`${this.apiUrl}get-crop-task/${id}`, { headers });
  }

  getUserCropTaskBycropId(id: string) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.get<any>(`${this.apiUrl}get-slave-crop-task/${id}`, { headers });
  }

  

  deleteCropTask(id: string) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.delete<any>(`${this.apiUrl}delete-crop-task/${id}`, {
      headers,
    });
  }

  updateCropTask(cropId: string, formData: any) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('Login Token : ')}`,
    });

    return this.http.post(
      `${this.apiUrl}edit-crop-task/${cropId}`,
      formData,
      { headers }
    );
  }

  updateUserCropTask(cropId: string, formData: any) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('Login Token : ')}`,
    });

    return this.http.post(
      `${this.apiUrl}edit-user-crop-task/${cropId}`,
      formData,
      { headers }
    );
  }


  createNewCropTask(cropId: string, indexId:string ,formData: any) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('Login Token : ')}`,
    });

    return this.http.post(
      `${this.apiUrl}add-new-task/${cropId}/${indexId}`,
      formData,
      { headers }
    );
  }

  createNewCropTaskU(cropId: string, indexId:string, userId: string ,formData: any) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('Login Token : ')}`,
    });

    return this.http.post(
      `${this.apiUrl}add-new-task-user/${cropId}/${indexId}/${userId}`,
      formData,
      { headers }
    );
  }
}


