import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return handle401Error(req, next, authService, notificationService);
      }

      let errorMessage = error.error?.message || `Server Error: ${error.status}`;
      notificationService.showError(errorMessage);
      return throwError(() => error);
    }),
  );
};

function handle401Error(
  req: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService,
  notificationService: NotificationService,
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = authService.getRefreshToken();

    if (refreshToken) {
      return authService.refreshToken(refreshToken).pipe(
        switchMap((response) => {
          isRefreshing = false;

          refreshTokenSubject.next(response.accessToken);

          const clonedReq = req.clone({
            setHeaders: { Authorization: `Bearer ${response.accessToken}` },
          });
          return next(clonedReq);
        }),
        catchError((err) => {
          isRefreshing = false;
          authService.logout(refreshToken);
          notificationService.showError('Session expired. Please log in again.');
          return throwError(() => err);
        }),
      );
    } else {
      isRefreshing = false;
      authService.logout(refreshToken!);
      return throwError(() => new Error('No refresh token available'));
    }
  } else {
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => {
        const clonedReq = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        });
        return next(clonedReq);
      }),
    );
  }
}
