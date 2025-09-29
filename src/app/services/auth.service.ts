import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import { environment } from '../environment/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.API_URL}auth/login`;
  private forgotUrl = `${environment.API_URL}auth/forgot-password`;
  private resetUrl = `${environment.API_URL}auth/reset-password`;
  private resendUrl = `${environment.API_URL}auth/resend-reset-password`;
  private secretKey = 'agroworldadmin'; // Must match backend

  constructor(private http: HttpClient) {}

  // Login
  login(email: string, password: string): Observable<any> {
    const loginObj = { email, password };
  const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(loginObj),
      this.secretKey
    ).toString();

    // Send encrypted payload in a wrapper object
    return this.http.post<any>(this.apiUrl, { data: encryptedData }).pipe(
      map((response) => {
        const bytes = CryptoJS.AES.decrypt(response.data, this.secretKey);
        const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        return decryptedData;
      })
    );
  }

  // Forgot Password (send initial link)
  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(this.forgotUrl, { email });
  }

  // Reset Password
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(this.resetUrl, { token, newPassword });
  }

  // Resend Reset Password Link
  resendResetLink(token: string): Observable<any> {
    return this.http.post<any>(this.resendUrl, { token });
  }
}
