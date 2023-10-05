import { Component } from '@angular/core';
// Import the environment object
import { environment } from '../../environments/environment';
@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {
  ADD_BOT_TO_SERVER_URL = environment.ADD_BOT_URL;
  AUTHORIZE_URL = environment.AUTHORIZE_URL;
}
