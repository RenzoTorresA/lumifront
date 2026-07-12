import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  let authReq = req;

  // If hitting our backend API admin routes, add Authorization header
  if (token && req.url.includes(`${environment.apiUrl}/admin`)) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If unauthorized and hitting our admin routes, try to refresh token
      if (error.status === 401 && req.url.includes(`${environment.apiUrl}/admin`)) {
        return authService.refreshSession().pipe(
          switchMap((newAuth) => {
            const retriedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newAuth.accessToken}`
              }
            });
            return next(retriedReq);
          }),
          catchError((refreshError) => {
            // If refresh fails, log out the user
            authService.logout();
            // Redirect to login page
            window.location.href = '/admin/login';
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
