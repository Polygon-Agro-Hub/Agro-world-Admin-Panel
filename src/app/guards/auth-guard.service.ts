import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('Login Token : ');
    const tokenExpiration = localStorage.getItem('Token Expiration');

    if (token && tokenExpiration) {
      const isExpired = new Date().getTime() > Number(tokenExpiration);

      if (!isExpired) {
        return true; // Token is valid and not expired
      } else {
        // Token expired, remove token and redirect to login
        localStorage.removeItem('Login Token : ');
        localStorage.removeItem('Token Expiration');
        this.router.navigate(['/admin/login']);
        return false;
      }
    } else {
      // If no token or expiration, redirect to the login page
      this.router.navigate(['/admin/login']);
      return false;
    }
  }
}
