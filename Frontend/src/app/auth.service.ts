import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { catchError, map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private authUrl = "YOUR_AUTH_SERVER_URL"; // Replace with your authentication server URL
  private accessToken: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // Login with Discord OAuth2
  login() {
    // Redirect the user to Discord's OAuth2 authorization endpoint
    window.location.href = `${this.authUrl}/discord/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=YOUR_SCOPES`;
  }

  // Handle the OAuth2 callback
  handleCallback(code: string) {
    // Exchange the authorization code for an access token
    this.http
      .post(`${this.authUrl}/discord/oauth2/token`, { code })
      .pipe(
        map((response: any) => {
          // Store the access token securely (e.g., in LocalStorage)
          this.accessToken = response.access_token;
          return response;
        }),
        catchError((error) => {
          console.error("OAuth2 callback error:", error);
          // Handle errors
          // Redirect to an error page or display an error message
          throw error;
        })
      )
      .subscribe(() => {
        // Optionally, fetch user data
        // this.fetchUserData();
        // Redirect to the desired route (e.g., user profile)
        this.router.navigate(["/profile"]);
      });
  }

  // Logout
  logout() {
    // Clear user data and tokens
    this.accessToken = null;
    // Redirect to the login page
    this.router.navigate(["/landing-pages"]);
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
