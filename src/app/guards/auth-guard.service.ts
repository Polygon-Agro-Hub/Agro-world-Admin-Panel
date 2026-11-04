import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router } from '@angular/router';
import { TokenService } from '../services/token/services/token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private router: Router, public tokenService: TokenService) {}

  // Runs on every navigation between child pages of the main layout
  canActivateChild(): boolean {
    return this.canActivate();
  }

  canActivate(): boolean {
    const token = this.tokenService.getToken();
    const tokenExpiration = this.tokenService.getUserDetails().tokenExpiration;


    if (token && tokenExpiration) {
      const isExpired = this.tokenService.isTokenExpired();

      if (!isExpired) {
        return true; // Token is valid and not expired
      } else {
        // Token expired, remove token and redirect to login
        this.tokenService.clearLoginDetails()
        this.router.navigate(['login']).then(() => {
          window.location.reload();
        });
        return false;
      }
    } else {
      // If no token or expiration, redirect to the login page
      this.tokenService.clearLoginDetails()
      this.router.navigate(['login']);
      return false;
    }
  }
}
