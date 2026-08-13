import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/refresh') && !req.url.includes('/auth/login')) {
        return authService.refresh().pipe(
          switchMap(() => next(req)),
          catchError(() => {
            authService.logout();
            return throwError(() => error);
          })
        );
      }

      const message = error.error?.detail || 'Something went wrong.';
      snackBar.open(message, 'Close', { duration: 4000 });
      return throwError(() => error);
    })
  );
};