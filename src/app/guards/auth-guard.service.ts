import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TokenService } from '../services/token/services/token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, public tokenService: TokenService) {}

  canActivate(): boolean {
    const token = this.tokenService.getToken();
    const tokenExpiration = this.tokenService.getUserDetails().tokenExpiration;

    if (token && tokenExpiration) {
      const isExpired = new Date().getTime() > Number(tokenExpiration);

      if (!isExpired) {
        return true; // Token is valid and not expired
      } else {
        // Token expired, remove token and redirect to login
        this.tokenService.clearLoginDetails()
        return false;
      }
    } else {
      // If no token or expiration, redirect to the login page
      this.router.navigate(['/login']);
      return false;
    }
  }
}
