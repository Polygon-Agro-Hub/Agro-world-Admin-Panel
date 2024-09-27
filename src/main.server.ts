import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';
import { provideHttpClient } from '@angular/common/http';

const bootstrap = () => bootstrapApplication(AppComponent, {
  ...config,
  providers: [
    provideHttpClient(), // Provide HttpClient for the application
    ...config.providers, // Spread any existing providers from config
  ]
});

export default bootstrap;
