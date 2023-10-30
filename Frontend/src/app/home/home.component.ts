import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from '../auth.service';
import { WebsocketService } from '../websocket.service';
// import { WebsocketService } from '../websocket.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  messages: any[] = [];
  private destroy$: Subject<void> = new Subject<void>();
  public primaryUser: any;

  constructor(
    private authService: AuthService,
    private websocketService: WebsocketService
  ) {}

  ngOnInit(): void {
    this.primaryUser = this.authService.authenticatedUser;
    // this.websocketService.subscribe('initial');
  }

  ngOnDestroy(): void {
    // Unsubscribe from WebSocket and complete the destroy$ subject
    this.destroy$.next();
    this.destroy$.complete();
  }
}
