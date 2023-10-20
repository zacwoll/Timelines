import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private readonly webSocketUrl = 'wss://localhost:3000';
  private socket: Socket;
  private readonly socketIoConfig = {
    url: this.webSocketUrl,
    options: {
      transports: ['websocket', 'polling'],
      extraHeaders: {
        'Access-Control-Allow-Origin': 'http://localhost:4200',
      },
    },
  };

  constructor() {
    this.socket = new Socket(this.socketIoConfig);
    this.socket.connect();
  }

  // Disconnect from the WebSocket server
  disconnect() {
    this.socket.disconnect();
  }

  // Subscribe to a specific channel
  subscribe(channel: string): Observable<any> {
    return this.socket.fromEvent(channel);
  }

  // Unsubscribe from a specific channel
  unsubscribe(channel: string) {
    this.socket.removeListener(channel);
  }
}
