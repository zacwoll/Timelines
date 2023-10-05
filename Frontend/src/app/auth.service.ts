import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private accessToken: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  // Login with Discord OAuth2
  login() {
    // Redirect the user to Discord's OAuth2 authorization endpoint
    window.location.href = environment.AUTHORIZE_URL;
  }

  // Handle the OAuth2 callback
  handleCallback(code: string) {
    console.log('handleCallback');

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
    // Exchange the authorization code for an access token
    this.http
      .post('https://discord.com/api/oauth2/token', requestBody.toString(), {
        headers,
      })
      .pipe(
        map((response: any) => {
          // Store the access token securely (e.g., in LocalStorage)
          this.accessToken = response.access_token;
          console.log(this.accessToken);
          return response;
        }),
        catchError((error) => {
          console.error('OAuth2 callback error:', error);
          // Handle errors
          // Redirect to an error page or display an error message
          throw error;
        })
      )
      .subscribe(() => {
        // Optionally, fetch user data
        // this.fetchUserData();
        // Redirect to the desired route (e.g., user profile)
        // this.router.navigate(['/landing-page']);
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
