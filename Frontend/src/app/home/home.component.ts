import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private webSocketSubject: WebSocketSubject<any>;
  messages: any[] = [];
  private destroy$: Subject<void> = new Subject<void>();
  public primaryUser: any;

  constructor(private authService: AuthService) {
    this.webSocketSubject = webSocket('ws://your-websocket-url.com');
  }

  ngOnInit(): void {
    this.primaryUser = this.authService.authenticatedUser;
    this.webSocketSubject
      .asObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (message) => this.messages.push(message),
        (err) => console.error(err)
      );
  }

  ngOnDestroy(): void {
    // Unsubscribe from WebSocket and complete the destroy$ subject
    this.webSocketSubject.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
