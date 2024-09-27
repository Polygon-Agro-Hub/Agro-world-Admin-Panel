import { HttpInterceptorFn } from '@angular/common/http';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const router = inject(Router);

  // Get the token from localStorage
  const token = localStorage.getItem('Login Token : ');

  // Clone the request to add the new headers
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Send the newly created request
  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // If the user is unauthorized, log them out and redirect to the login page
        localStorage.removeItem('Login Token : ');
        router.navigateByUrl('/login');
      }
      throw error;
    })
  );
};
