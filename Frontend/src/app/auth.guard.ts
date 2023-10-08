import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { map } from 'rxjs';

export const AuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);

  // Call the AuthService to verify the token
  return authService.verifyToken().pipe(
    map((authenticated) => {
      if (authenticated) {
        // User is authenticated, allow access to ''
        return true;
      } else {
        // User is not authenticated, redirect to '/landing-page'
        window.location.href = '/landing-page';
        return false;
      }
    })
  );
};
