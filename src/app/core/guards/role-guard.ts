import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { NotificationService } from '../services/notification.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  if (!authService.hasValidToken()) return false;

  const expectedRoles = route.data?.['roles'] as Array<string>;
  const currentRole = authService.userRole();

  if (expectedRoles && currentRole && expectedRoles.includes(currentRole)) return true;

  notificationService.showError('Access Denied: You lack the permissions to view this module.');

  router.navigate(['/dashboard']);
  return false;
};
