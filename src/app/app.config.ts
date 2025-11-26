 import { ApplicationConfig } from '@angular/core';
import { provideRouter, UrlSerializer } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';



import { authInterceptor } from './auth.interceptor'; // Import the function-based interceptor
import { CustomUrlSerializer } from './guards/custom-url-serializer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // { provide: UrlSerializer, useClass: CustomUrlSerializer }, //this one for encript url
    provideClientHydration(),
    provideAnimationsAsync(), provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])), provideAnimationsAsync(), // Use the function-based interceptor
  ],
 
};
