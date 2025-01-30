import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY = 'Login Token : ';
  private readonly USERNAME_KEY = 'userName:';
  private readonly USERID_KEY = 'userId:';
  private readonly ROLE_KEY = 'role:';
  private readonly PERMISSIONS_KEY = 'permissions';
  private readonly EXPIRATION_KEY = 'Token Expiration';


  constructor() { }

  saveLoginDetails(token: string, userName: string, userId: string, role: string, permissions: any, expiresIn: number): void {
    const expirationTime = new Date().getTime() + expiresIn * 1000; // Convert seconds to milliseconds
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USERNAME_KEY, userName);
    localStorage.setItem(this.USERID_KEY, userId);
    localStorage.setItem(this.ROLE_KEY, role);
    localStorage.setItem(this.PERMISSIONS_KEY, JSON.stringify(permissions));
    localStorage.setItem(this.EXPIRATION_KEY, expirationTime.toString());

    
  }


  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }


  clearLoginDetails(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USERNAME_KEY);
    localStorage.removeItem(this.USERID_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem(this.PERMISSIONS_KEY);
    localStorage.removeItem(this.EXPIRATION_KEY);
  }


  isTokenExpired(): boolean {
    const expiration = localStorage.getItem(this.EXPIRATION_KEY);
    if (!expiration) {
      return true;
    }
    return new Date().getTime() > parseInt(expiration, 10);
  }


  getUserDetails(): any {
    return {
      userName: localStorage.getItem(this.USERNAME_KEY),
      userId: localStorage.getItem(this.USERID_KEY),
      role: localStorage.getItem(this.ROLE_KEY),
      permissions: JSON.parse(localStorage.getItem(this.PERMISSIONS_KEY) || '[]'),
    };
  }
}
