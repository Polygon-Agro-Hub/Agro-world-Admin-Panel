import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { TokenService } from '../token/services/token.service';

export interface NewCropCalender {
  varietyId: any;
  groupId: any;
  id: number;
  cropNameEnglish: string;
  varietyNameEnglish: string;
  category: string;
  method: string;
  natOfCul: string;
  cropDuration: string;
  createdAt: string;
  suitableAreas: string; // Added to match component usage
}

export interface NewVarietyGroup {
  id: number;
  cropGroupId: string;
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

export interface NewCropGroup {
  id: number;
  cropNameEnglish: string;
  category: string;
  varietyCount: number;
  varietyList: string[];
}


@Injectable({
  providedIn: 'root',
})
export class CropCalendarService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(private http: HttpClient, private tokenService: TokenService) { }

  // Create Crop Calendar
  createCropGroup(formData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.post(
      `${this.apiUrl}crop-calendar/create-crop-group`,
      formData,
      {
        headers,
      }
    );
  }

  createCropVariety(formData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.post(
      `${this.apiUrl}crop-calendar/create-crop-variety`,
      formData,
      {
        headers,
      }
    );
  }

  createCropCalendar(formData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.post(
      `${this.apiUrl}crop-calendar/admin-add-crop-calender`,
      formData,
      { headers }
    );
  }

  // Method to check for duplicate crop calendars
  checkDuplicateCropCalendar(
    varietyId: string,
    cultivationMethod: string,
    natureOfCultivation: string,
    excludeId?: number
  ): Observable<{ exists: boolean }> {
    const token = localStorage.getItem('AdminLoginToken');
    if (!token) {
      console.error('No authentication token available');
      throw new Error('No authentication token available');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    let params = new HttpParams()
      .set('varietyId', varietyId || '')
      .set('cultivationMethod', cultivationMethod)
      .set('natureOfCultivation', natureOfCultivation);

    if (excludeId) {
      params = params.set('excludeId', excludeId.toString());
    }

    console.log('Checking duplicate with params:', {
      varietyId,
      cultivationMethod,
      natureOfCultivation,
      excludeId,
    });

    // Proper usage: empty body + options (headers, params)
    return this.http.post<{ exists: boolean }>(
      `${this.apiUrl}crop-calendar/check-duplicate-crop-calendar`,
      {}, // empty POST body
      { headers, params } // these are options
    );
  }



  // Get Crop Calendar by ID
  getCropCalendarById(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.apiUrl}auth/get-cropcalender-by-id/${id}`, {
      headers,
    });
  }

  // Update Crop Calendar

  updateCropCalendar(cropId: number, formData: FormData): Observable<any> {
    if (!this.token) {
      throw new Error('No authentication token available');
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.put(
      `${this.apiUrl}crop-calendar/edit-cropcalender/${cropId}`,
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

    return this.http.post(
      `${this.apiUrl}crop-calendar/upload-xlsx/${cropId}`,
      formData,
      {
        headers,
      }
    );
  }

  fetchAllCropCalenders(
    page: number = 1,
    limit: number = 10,
    searchText: string = '',
    category: string = ''
  ): Observable<{ items: NewCropCalender[]; total: number }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}crop-calendar/get-all-crop-calender?page=${page}&limit=${limit}`;

    if (searchText) {
      url += `&searchText=${encodeURIComponent(searchText)}`;
    }

    // Only add category param if not empty string
    if (category && category !== '') {
      url += `&category=${encodeURIComponent(category)}`;
    }

    return this.http.get<{ items: NewCropCalender[]; total: number }>(url, {
      headers,
    });
  }

  // fetchAllCropGroups(
  //   page: number = 1,
  //   limit: number = 10,
  // ): Observable<{ items: NewCropGroup[]; total: number }> {
  //   const headers = new HttpHeaders({
  //     Authorization: `Bearer ${this.token}`,
  //   });
  //   return this.http.get<{ items: NewCropGroup[]; total: number }>(
  //     `${this.apiUrl}crop-calendar/get-all-crop-groups?page=${page}&limit=${limit}`,
  //     { headers },
  //   );
  // }

  fetchAllCropGroups(
    page: number = 1,
    limit: number = 10,
    cropNameEnglish: string = '',
    category: string = ''
  ): Observable<{ items: NewCropGroup[]; total: number }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    // Create URL with base parameters
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    // Add search parameter if cropNameEnglish is provided
    if (cropNameEnglish) {
      params = params.set('searchText', cropNameEnglish);
    }

    // Add category filter if provided
    if (category) {
      params = params.set('category', category);
    }

    return this.http.get<{ items: NewCropGroup[]; total: number }>(
      `${this.apiUrl}crop-calendar/get-all-crop-groups`,
      {
        headers,
        params,
      }
    );
  }

  deleteCropCalender(id: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.delete(`${this.apiUrl}crop-calendar/delete-crop/${id}`, {
      headers,
    });
  }

  deleteCropGroup(id: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.delete(
      `${this.apiUrl}crop-calendar/delete-crop-group/${id}`,
      {
        headers,
      }
    );
  }

  getAllCropTaskBycropId(id: string, page: number = 1, limit: number = 10) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.get<any>(
      `${this.apiUrl}crop-calendar/get-all-crop-task/${id}?page=${page}&limit=${limit}`,
      {
        headers,
      }
    );
  }

  getCropTaskBycropId(id: string) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.get<any>(`${this.apiUrl}auth/get-crop-task/${id}`, {
      headers,
    });
  }

  getUserCropTaskBycropId(id: string) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.get<any>(`${this.apiUrl}auth/get-slave-crop-task/${id}`, {
      headers,
    });
  }

  deleteCropTask(id: string, cropId: string, indexId: string) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.delete<any>(
      `${this.apiUrl}auth/delete-crop-task/${id}/${cropId}/${indexId}`,
      {
        headers,
      }
    );
  }

  updateCropTask(cropId: string, formData: any) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.post(
      `${this.apiUrl}auth/edit-crop-task/${cropId}`,
      formData,
      {
        headers,
      }
    );
  }

  updateUserCropTask(cropId: string, formData: any) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.post(
      `${this.apiUrl}auth/edit-user-crop-task/${cropId}`,
      formData,
      { headers }
    );
  }

  createNewCropTask(cropId: string, indexId: string, formData: any) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.post(
      `${this.apiUrl}auth/add-new-task/${cropId}/${indexId}`,
      formData,
      { headers }
    );
  }

  createNewCropTaskU(
    cropId: string,
    indexId: string,
    userId: string,
    formData: any,
    onCulscropID: any
  ) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.post(
      `${this.apiUrl}auth/add-new-task-user/${cropId}/${indexId}/${userId}/${onCulscropID}`,
      formData,
      { headers }
    );
  }

  getVarietiesByGroup(
    cropGroupId: any
  ): Observable<{ groups: NewVarietyGroup[] }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get<{ groups: NewVarietyGroup[] }>(
      `${this.apiUrl}crop-calendar/crop-variety-by-group/${cropGroupId}`,
      { headers }
    );
  }

  deleteCropVariety(id: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.delete(
      `${this.apiUrl}crop-calendar/delete-crop-variety/${id}`,
      {
        headers,
      }
    );
  }

  getCropGroupById(id: number) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get(`${this.apiUrl}crop-calendar/crop-group-by-id/${id}`, {
      headers,
    });
  }

  getCropVarietyById(id: number) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get(
      `${this.apiUrl}crop-calendar/crop-variety-by-id/${id}`,
      {
        headers,
      }
    );
  }

  updateCropGroup(id: number, data: FormData) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.put(
      `${this.apiUrl}crop-calendar/update-crop-group/${id}`,
      data,
      { headers }
    );
  }

  updateVariety(cropId: number, formData: FormData) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.put(
      `${this.apiUrl}crop-calendar/update-crop-variety/${cropId}`,
      formData,
      { headers }
    );
  }

  cropGropForFilter(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.get<any>(
      `${this.apiUrl}crop-calendar/get-crop-groups-for-filters`,
      {
        headers,
      }
    );
  }
}
