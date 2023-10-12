import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavigationExtras, Router } from '@angular/router';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { forkJoin, of } from 'rxjs';

export type AccessTokenResponse = {
  access_token: string,
  token_type: any,
  expires_in: number,
  refresh_token: string,
  scope: any
}

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // @ts-ignore
  public authenticatedUser;
  constructor(private http: HttpClient) {}

  // Verify the token at 'localhost:3000/auth/check_cookie'
  verifyToken(): Observable<boolean> {
    return this.http
      .get<any>('http://localhost:3000/auth/check_cookie', {
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          console.log('User Data: ', response);
          this.authenticatedUser = response;
          if (response) {
            return true;
          } else {
            console.log('No response from API');
            return false;
          }
        }),
        catchError(() => of(false)) // Handle network errors or other errors
      );
  }
}


@Injectable({
  providedIn: 'root',
})
export class NotAuthService {
  private accessToken: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  // Login with Discord OAuth2
  login() {
    // Redirect the user to Discord's OAuth2 authorization endpoint
    window.location.href = environment.AUTHORIZE_URL;
  }

  // Handle the OAuth2 callback
  handleCallback(code: string) {
    // Create a URL-encoded request body
    const requestBody = new URLSearchParams();
    requestBody.set('client_id', environment.CLIENT_ID);
    requestBody.set('client_secret', environment.CLIENT_SECRET);
    requestBody.set('grant_type', 'authorization_code');
    requestBody.set('redirect_uri', 'http://localhost:4200/auth/callback'); // Make sure this matches your redirect URI
    requestBody.set('code', code);

    // Set the headers for the request
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    this.http
      .post('https://discord.com/api/oauth2/token', requestBody.toString(), {
        headers,
      })
      .pipe(
        mergeMap((response: any) => {
          // No need to store the access token, you can use it directly
          const accessToken = response.access_token;

          const tokenResponse = response;

          // Make an API request to get user data using the access token
          const userDataRequest = this.http.get(
            'https://discord.com/api/v10/users/@me',
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          // Make an API request to get guild data using the access token
          const guildDataRequest = this.http.get(
            'https://discord.com/api/v10/users/@me/guilds',
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          // Combine the two requests into a single observable
          return forkJoin([userDataRequest, guildDataRequest]).pipe(
            map(([userData, guildData]: [any, any]) => {

              // Extract relevant user information
              console.log('userData', userData);

              // Extract relevant guild information
              console.log('guildData', guildData);

              // Create an object with the required information
              const userInfo = {
                tokenResponse,
                userData,
                guildData,
              };

              // Return this object
              return userInfo;
            }),
            catchError((error) => {
              // Handle errors in the user or guild data request
              console.error('Error in user or guild data request:', error);
              throw error; // Rethrow the error to propagate it further if needed
            })
          );
        }),
        catchError((error) => {
          // Handle errors in the token request
          console.error('Error in token request:', error);
          throw error; // Rethrow the error to propagate it further if needed
        })
      )
      .subscribe((userInfo: any) => {
        console.log('userInfo', userInfo);
        // Now, you have access to authInfo, which contains accessToken, username, and guildData
        // You can navigate to the desired route with this information
        const navigationExtras: NavigationExtras = {
          state: { userInfo },
        };
        const userID = userInfo.userData.id;
        this.router.navigate([''], navigationExtras)
        // this.router.navigate(['timeline'], navigationExtras);
      });
  }

  // Logout
  logout() {
    // Clear user data and tokens
    this.accessToken = null;
    // Redirect to the login page
    this.router.navigate(['/landing-page']);
  }

  // // Fetch user data (replace with your API endpoint)
  // fetchUserData(): Observable<User> {
  //   return this.http.get<User>(`${this.authUrl}/user`).pipe(
  //     catchError((error) => {
  //       console.error("User data retrieval error:", error);
  //       // Handle errors
  //       // Redirect to an error page or display an error message
  //       return of(null);
  //     })
  //   );
  // }

  // Check if the user is authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}
