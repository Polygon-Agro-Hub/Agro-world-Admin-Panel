 import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { APP_BASE_HREF } from '@angular/common';

import { routes } from './app.routes';



import { authInterceptor } from './auth.interceptor'; // Import the function-based interceptor

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(), provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])), provideAnimationsAsync(), // Use the function-based interceptor
    {
      provide: APP_BASE_HREF,
      useFactory: () => {
        return window.location.pathname.startsWith('/admin') ? '/admin/' : '/';
      }
    }
  ],
 
};
