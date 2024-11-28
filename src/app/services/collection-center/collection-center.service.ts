import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

interface centerData{
  id: number;
  regCode: string;
  centerName: string;
  contact01: string;
  contact02: string;
  buildingNumber: string;
  street: string
  district: string;
  province: string;
}

@Injectable({
  providedIn: 'root'
})
export class CollectionCenterService {
  private apiUrl = `${environment.API_BASE_URL}`;
  private api = `${environment.API_URL}`;
  private token = `${environment.TOKEN}`;
  constructor(private http: HttpClient) {}

  getAllCollectionCenter(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.apiUrl}get-all-center`, {
      headers,
    });
  }

  deleteCollectionCenter(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    console.log("DELETE ITEM",id);
    return this.http.delete(`${this.apiUrl}delete-collection-center/${id}`, {
      headers,
    });
  }

  createCollectionCenter(centerData: any):Observable<any>{
    console.log(centerData);
    
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    })
    return this.http.post(`${this.apiUrl}create-collection-center`, centerData,{
      headers,
    })
  }

  getAllComplain(page: number, limit: number, status:String, searchText:string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}get-all-complains?page=${page}&limit=${limit}`

    if(status){
      url+=`&status=${status}`
    }

    if(searchText){
      url+=`&searchText=${searchText}`
    }
    
    return this.http.get(url, {
      headers,
    });
  }

  getComplainById(id:string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.apiUrl}get-complain-by-id/${id}`, {
      headers,
    });
  }



  getOfficerReportById(id: number) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get(`${this.apiUrl}collection-officer-by-id/${id}`, {
      headers,
    });
  }



  getAllCollectionCenterPage(page: number, limit: number, searchItem: string = ''): Observable<any> {
    console.log(page,limit,searchItem);
    
    const token = localStorage.getItem('Login Token : ');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    let url = `${this.apiUrl}get-all-centerpage?page=${page}&limit=${limit}`;
    if (searchItem) {
      url += `&searchItem=${searchItem}`;
    }

    return this.http.get<any>(url, { headers });
  }

}
