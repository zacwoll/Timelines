import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { WebsocketService } from './websocket.service';
import { finalize, map } from 'rxjs';

export const AuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  //TODO: Fix understanding why inject WebsocketService fails here.
  console.log('Now inject the websocket');
  const websocketService = inject(WebsocketService);

  console.log('AuthGuard called');
  // Call the AuthService to verify the token
  const verificationResult = authService.verifyToken();

  return verificationResult.pipe(
    map((authenticated) => {
      if (authenticated) {
        return true;
      } else {
        // User is not authenticated, redirect to '/landing-page'
        window.location.href = '/landing-page';
        console.log('Authentication failed');
        return false;
      }
    })
  );
};
