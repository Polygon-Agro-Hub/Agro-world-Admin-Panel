import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

export interface NewCropCalender {
  id: number;
  cropNameEnglish: string;
  varietyNameEnglish: string;
  category: string;
  method: string;
  natOfCul: string;
  cropDuration: string;
  createdAt: string;
}

export interface NewCropGroup {
  id: number;
  cropNameEnglish: string;
  category: string;
  varietyCount: number;
  varietyList: string[];
}

interface NewVarietyGroup {
  id: number;
  cropGroupId : string;
  varietyNameEnglish: string;
  varietyNameSinhala: string;
  varietyNameTamil: string;
  descriptionEnglish: string;
  descriptionSinhala: string;
  descriptionTamil: string;
  image: string;
  bgColor: string;
  createdAt: string;

}

@Injectable({
  providedIn: 'root',
})
export class CropCalendarService {
  private apiUrl = `${environment.API_BASE_URL}`;
  private url = `${environment.API_URL}`;
  private token = `${environment.TOKEN}`;

  constructor(private http: HttpClient) {}

  // Create Crop Calendar
  createCropGroup(formData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.post(`${this.url}crop-calendar/create-crop-group`, formData, {
      headers,
    });
  }

  createCropVariety(formData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.post(`${this.url}crop-calendar/create-crop-variety`, formData, {
      headers,
    });
  }


  createCropCalendar(formData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.post(`${this.url}crop-calendar/admin-add-crop-calender`, formData, {
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
      `${this.url}crop-calendar/edit-cropcalender/${cropId}`,
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

    return this.http.post(`${this.url}crop-calendar/upload-xlsx/${cropId}`, formData, {
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
      `${this.url}crop-calendar/get-all-crop-calender?page=${page}&limit=${limit}`,
      { headers }
    );
  }

  fetchAllCropGroups(
    page: number = 1,
    limit: number = 10
  ): Observable<{ items: NewCropGroup[]; total: number }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get<{ items: NewCropGroup[]; total: number }>(
      `${this.url}crop-calendar/get-all-crop-groups?page=${page}&limit=${limit}`,
      { headers }
    );
  }

  deleteCropCalender(id: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.delete(`${this.apiUrl}delete-crop/${id}`, {
      headers,
    });
  }


  deleteCropGroup(id: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.delete(`${this.url}crop-calendar/delete-crop-group/${id}`, {
      headers,
    });
  }

  getAllCropTaskBycropId(id: string, page: number = 1,limit: number = 10) {
    
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.get<any>(`${this.apiUrl}get-all-crop-task/${id}?page=${page}&limit=${limit}`, {
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

  

  deleteCropTask(id: string, cropId:string, indexId:string) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
        
    return this.http.delete<any>(`${this.apiUrl}delete-crop-task/${id}/${cropId}/${indexId}`, {
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


  getVarietiesByGroup(cropGroupId: any): Observable<{ groups: NewVarietyGroup[]; }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get<{ groups: NewVarietyGroup[] }>(
      `${this.url}crop-calendar/crop-variety-by-group/${cropGroupId}`,
      { headers }
    );
  }




  deleteCropVariety(id: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.delete(`${this.url}crop-calendar/delete-crop-variety/${id}`, {
      headers,
    });
  }

  getCropGroupById(id: number) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get(`${this.url}crop-calendar/crop-group-by-id/${id}`, {headers});
  }


  updateCropGroup(id: number, data: FormData) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.put(`${this.url}crop-calendar/update-crop-group/${id}`, data, {headers});
  }


  
}


