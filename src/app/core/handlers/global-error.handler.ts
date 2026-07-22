import { ErrorHandler, inject, Injectable, Injector } from '@angular/core';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private injector = inject(Injector);

  handleError(error: any): void {
    const notificationService = this.injector.get(NotificationService);

    const message = error.message ? error.message : error.toString();

    console.error('GlobalErrorHandler caught an error:', error);

    notificationService.showError('An unexpected client error occurred');
  }
}
