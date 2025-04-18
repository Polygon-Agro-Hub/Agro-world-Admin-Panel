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
    
    




    getPackageOrderDetailsById(id: number) {

      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      });

      return this.http.get<any[]>(`${this.apiUrl}dispatch/get-additional-pack-items/${id}`, { headers });
    }
    


}
