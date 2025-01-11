import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CollectionOfficerService {
  patchValue(arg0: { language: string[]; }) {
    throw new Error('Method not implemented.');
  }
  private apiUrl = `${environment.API_BASE_URL}`;
  private token = `${environment.TOKEN}`;

  constructor(private http: HttpClient) {}

  createCollectiveOfficer(person: any, selectedImage: any): Observable<any> {
    const formData = new FormData();
    formData.append('officerData', JSON.stringify(person)); // Attach officer data as a string
    formData.append('file', selectedImage); // Attach the file (ensure the key matches the expected field name on the backend)
  
    // No need to set Content-Type headers manually; Angular will handle it for FormData
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
  
    return this.http.post(`${this.apiUrl}collection-officer/create-collection-officer`, formData, {
      headers,
    });
  }
  


  editCollectiveOfficer(person:any, id:number, selectedImage: any): Observable<any> {

    const formData = new FormData();
    formData.append('officerData', JSON.stringify(person)); // Attach officer data as a string
    formData.append('file', selectedImage); // Attach the file (ensure the key matches the expected field name on the backend)

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.put(`${this.apiUrl}update-officer-details/${id}`, formData, {
      headers,
    });
  }
}
