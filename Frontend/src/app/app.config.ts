// app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
// Import 'withInterceptors'
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthService } from './core/services/auth-service';
import { authInterceptor } from './core/interceptors/auth.fn.interceptor'; // <-- Import the function

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    AuthService,

    // --- BEFORE (Incorrect for standalone) ---
    // provideHttpClient(),
    // { 
    //   provide: HTTP_INTERCEPTORS, 
    //   useClass: AuthInterceptor, 
    //   multi: true 
    // },

    // --- AFTER (Correct for standalone) ---
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};