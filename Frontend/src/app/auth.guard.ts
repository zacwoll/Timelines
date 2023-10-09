import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { map } from 'rxjs';

export const AuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);

  console.log('AuthGuard called');
  // Call the AuthService to verify the token
  return authService.verifyToken().pipe(
    map((authenticated) => {
      if (authenticated) {
        // User is authenticated, pass through
        return true;
      } else {
        // User is not authenticated, redirect to '/landing-page'
        window.location.href = '/landing-page';
        console.log('authentication failed');
        return false;
      }
    })
  );
};
