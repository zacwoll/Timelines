import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service'; // Import the AuthService

@Component({
  selector: 'app-oauth-callback',
  templateUrl: './oauth-callback.component.html',
  styleUrls: ['./oauth-callback.component.scss'],
})
export class OAuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  // subscribe to the route's Query Params to get the 'code' from Discord OAuth2
  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams) => {
      const code = queryParams['code'];
      if (code) {
        // Handle the OAuth2 callback using AuthService's handleCallback
        // @ts-ignore
        this.authService.handleCallback(code);
      } else {
        console.log('no code');
      }
    });
  }
}
