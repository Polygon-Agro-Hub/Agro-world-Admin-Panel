import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  private apiUrl = `${environment.API_BASE_URL}`;
  private token = `${environment.TOKEN}`;

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

  // getToolFixedAssetsById(id: number): Observable<FixedAsset[]> {
  //   const token = localStorage.getItem('Login Token : ');
  //   const headers = new HttpHeaders({
  //     Authorization: `Bearer ${token}`,
  //   });

  //   return this.http.get<FixedAsset[]>(`${this.apiUrl}get-tool-fixed-assets-by-id/${id}`, { headers });
  // }
}
