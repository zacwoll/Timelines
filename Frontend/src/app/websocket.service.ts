import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private readonly webSocketUrl = 'wss://localhost:3000';
  private socket: Socket | null;
  private readonly socketIoConfig = {
    url: this.webSocketUrl,
    options: {
      transports: ['websocket', 'polling'],
      extraHeaders: {
        'Access-Control-Allow-Origin': 'http://localhost:4200',
      },
      withCredentials: true,
    },
  };

  constructor() {
    this.socket = null;
  }

  connectService() {
    console.log('Attempting to connect socket service');
    this.socket = new Socket(this.socketIoConfig);
    this.socket.connect();
    this.enableHandlers();
  }

  enableHandlers() {
    if (!this.socket?.ioSocket.connected) {
      console.error('Socket is not enabled');
      return;
    } else {
      console.log('Socket is enabled', this.socket);
    }
    this.socket.on('system_message', (msg: any) => {
      console.log(msg);
    });

    this.socket.on('invalid_access_token', (msg: any) => {
      console.log(msg);
      this.socket = new Socket(this.socketIoConfig);
    });
  }

  // Disconnect from the WebSocket server
  disconnect() {
    if (!this.socket) {
      return;
    }
    this.socket.disconnect();
  }

  subscribe(channel: string): Observable<any> {
    if (!this.socket) {
      // Return an empty observable when 'this.socket' is null
      return of();
    }

    // Return the observable when 'this.socket' is not null
    return this.socket.fromEvent(channel);
  }

  // Unsubscribe from a specific channel
  unsubscribe(channel: string) {
    if (this.socket) {
      this.socket.removeListener(channel);
    }
  }
}
