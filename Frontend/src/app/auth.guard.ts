import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { WebsocketService } from './websocket.service';
import { finalize, map } from 'rxjs';

export const AuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const websocketService = inject(WebsocketService); // Instantiates a websocketService instance

  console.log('AuthGuard inspection start');
  // websocketService.connectService();
  // Call the AuthService to verify the token
  const verificationResult = authService.verifyToken();

  return verificationResult.pipe(
    map((authenticated) => {
      if (authenticated) {
        console.log('Verified as ', authenticated.global_name);
        websocketService.connectService();
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
