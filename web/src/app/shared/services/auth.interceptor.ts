import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/** Adds the Bearer token to API calls and sends the user to login when the token is rejected. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token();
  const authed = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authed).pipe(
    catchError((err: unknown) => {
      const isAuthCall = req.url.includes('/auth/');
      if (err instanceof HttpErrorResponse && err.status === 401 && !isAuthCall) {
        auth.clearSession();
        router.navigate(['/auth/login'], { queryParams: { returnUrl: router.url } });
      }
      return throwError(() => err);
    }),
  );
};
