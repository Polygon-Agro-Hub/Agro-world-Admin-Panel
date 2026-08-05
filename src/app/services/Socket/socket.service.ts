// src/app/services/socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;
  private readonly BASE_PATH = '/agro-api/admin-api';
  private readonly SOCKET_URL = `${environment.API_URL}`;

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket(): void {
    let socketUrl = '';
    let socketPath = '/socket.io';

    try {
      const socketUrlObj = new URL(this.SOCKET_URL);
      socketUrl = socketUrlObj.origin;
      
      // Replace the trailing '/api/' or '/api' with '/socket.io'
      const pathname = socketUrlObj.pathname;
      if (pathname.endsWith('/api/')) {
        socketPath = pathname.substring(0, pathname.length - 5) + '/socket.io';
      } else if (pathname.endsWith('/api')) {
        socketPath = pathname.substring(0, pathname.length - 4) + '/socket.io';
      } else {
        socketPath = `${this.BASE_PATH}/socket.io`;
      }
    } catch (error) {
      console.warn('Could not parse SOCKET_URL as absolute URL, falling back to defaults:', error);
      socketUrl = this.SOCKET_URL;
      socketPath = `${this.BASE_PATH}/socket.io`;
    }

    console.log(`Connecting to Socket.IO server at: ${socketUrl} with path: ${socketPath}`);

    this.socket = io(socketUrl, {
      path: socketPath,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Connection event listeners
    this.socket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server. Socket ID:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from Socket.IO server. Reason:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected to Socket.IO server after', attemptNumber, 'attempts');
    });
  }

  // Join a specific room
  joinRow(rowId: string | number): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join_row', rowId);
      console.log(`📡 Joined row_${rowId} room`);
    } else {
      console.warn('⚠️ Socket not connected. Cannot join room.');
    }
  }

  // Listen for row joined confirmation
  onRowJoined(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('row_joined', (data) => {
        observer.next(data);
      });
    });
  }

  // General event listener
  onEvent<T>(eventName: string): Observable<T> {
    return new Observable(observer => {
      this.socket.on(eventName, (data: T) => {
        observer.next(data);
      });
    });
  }

  // Emit custom events
  emitEvent(eventName: string, data: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit(eventName, data);
    } else {
      console.warn('⚠️ Socket not connected. Cannot emit event.');
    }
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      console.log('🔌 Socket disconnected manually');
    }
  }

  // Get connection status
  isConnected(): boolean {
    return this.socket ? this.socket.connected : false;
  }

  // Get socket ID
  getSocketId(): string | undefined {
    return this.socket ? this.socket.id : undefined;
  }
}