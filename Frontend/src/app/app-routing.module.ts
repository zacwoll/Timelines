import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { OAuthCallbackComponent } from './oauth-callback/oauth-callback.component'

const routes: Routes = [
  {
    path: '',
    redirectTo: '/landing-page',
    pathMatch: 'full',
    // canActivate: [AuthGuard], TODO: Implement AuthGuard
  },
  {
    path: 'landing-page',
    component: LandingPageComponent,
  },
  {
    path: 'auth/callback',
    component: OAuthCallbackComponent,
  }
  // Define routes for individual user pages (e.g., /userID)
  // {
  //   path: ":userID",
  //   component: UserProfileComponent, // Replace with your user profile component
  // },
  // Other routes as needed
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
