import {
  ApplicationConfig,
  inject,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { UserService } from './shared/user.service';

import { routes } from './app.routes';
import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
function authUser(request: HttpRequest<unknown>, next: HttpHandlerFn) {
  const userService = inject(UserService);
  const token = userService.token;
  if (token) {
    const req = request.clone({
      headers: request.headers.set('Authorization', `bearer: ${token}`),
    });

    return next(req);
  }

  return next(request);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authUser])),
  ],
};
