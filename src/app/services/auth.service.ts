import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.API_URL}auth/login`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    const loginObj = { email, password };
    return this.http.post<any>(this.apiUrl, loginObj);
  }
}
