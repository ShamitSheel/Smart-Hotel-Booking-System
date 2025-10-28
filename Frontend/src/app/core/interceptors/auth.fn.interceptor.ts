// src/app/core/interceptors/auth.fn.interceptor.ts

import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { EMPTY, Observable } from "rxjs";
import { AuthService } from "../services/auth-service";
import { jwtDecode } from "jwt-decode";

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  // Inject the AuthService instead of using a constructor
  const authService = inject(AuthService);
  const authToken = localStorage.getItem('authToken');

  if (!authToken) {
    return next(req);
  }

  try {
    const decodedToken: { exp: number } = jwtDecode(authToken);
    const expirationDate = new Date(0);
    expirationDate.setUTCSeconds(decodedToken.exp);

    if (expirationDate.valueOf() < new Date().valueOf()) {
      console.warn('Authentication token has expired. Logging out.');
      authService.logout();
      return EMPTY;
    }
  } catch (error) {
    console.error('Invalid token found. Logging out.', error);
    authService.logout();
    return EMPTY;
  }

  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${authToken}`)
  });

  return next(authReq);
};