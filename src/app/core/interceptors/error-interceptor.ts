import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occurred';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Network Error: ${error.error.message}`;
      } else {
        errorMessage = error.error?.message || error.message || `Server Error: ${error.status}`;
      }

      notificationService.showError(errorMessage);

      return throwError(() => error);
    }),
  );
};
