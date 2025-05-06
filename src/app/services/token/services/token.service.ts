import { Injectable } from '@angular/core';
import { AuthContextService } from '../../context/auth-context.service';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private token: string | null = null;
  private userName: string | null = null;
  private userId: string | null = null;
  private role: string | null = null;
  private permissions: any[] = [];
  private expiration: number | null = null;


  constructor(private authContext: AuthContextService) { }

  saveLoginDetails(token: string, userName: string, userId: string, role: string, permissions: any, expiresIn: number): void {
    this.token = token;
    this.userName = userName;
    this.userId = userId;
    this.role = role.toString();
    this.permissions = permissions;
    this.expiration = Date.now() + expiresIn * 1000;

    console.log('Token:', this.token);
    console.log('UserName:', this.userName);
    console.log('UserId:', this.userId);
    console.log('Role:', this.role);
    console.log('Permissions:', this.permissions);
    console.log('Expiration:', this.expiration);
  }


  getToken(): string | null {
    return this.token;
  }
  
 
  clearLoginDetails(): void {
    this.token = null;
    this.userName = null;
    this.userId = null;
    this.role = null;
    this.permissions = [];
    this.expiration = null;
  }

  isTokenExpired(): boolean {
    return !this.expiration || Date.now() > this.expiration;
  }

  getUserDetails(): any {
    return {
      userName: this.userName,
      userId: this.userId,
      role: this.role,
      permissions: this.permissions,
      tokenExpiration: this.expiration,
    };
  }

}
