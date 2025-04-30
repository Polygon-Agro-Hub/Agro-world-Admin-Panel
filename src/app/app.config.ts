import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { APP_BASE_HREF } from '@angular/common';

import { routes } from './app.routes';
import { authInterceptor } from './auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      provide: APP_BASE_HREF,
      useFactory: () => {
        const pathname = window.location.pathname;
        console.log('Pathname:', pathname); // Debug log
        console.log('Full URL:', window.location.href); // Debug log
        const baseHref = pathname.startsWith('/admin') || pathname.startsWith('/admin/') ? '/admin/' : '/';
        console.log('Setting APP_BASE_HREF to:', baseHref); // Debug log
        return baseHref;
      }
    }
  ]
};