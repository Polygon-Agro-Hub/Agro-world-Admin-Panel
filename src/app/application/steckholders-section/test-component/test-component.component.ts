import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SocketService } from '../../../services/Socket/socket.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-test-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-component.component.html',
  styleUrl: './test-component.component.css'
})
export class TestComponentComponent implements OnInit, OnDestroy {
  isConnected = false;
  socketId: string | undefined;
  statusText = 'Disconnected';
  private subscription: Subscription = new Subscription();

  constructor(private socketService: SocketService) {}

  ngOnInit() {
    // Check connection status every 2 seconds
    this.subscription.add(
      this.socketService.onEvent('connect').subscribe(() => {
        this.isConnected = true;
        this.socketId = this.socketService.getSocketId();
        this.statusText = 'Connected';
      })
    );

    this.subscription.add(
      this.socketService.onEvent('disconnect').subscribe(() => {
        this.isConnected = false;
        this.socketId = undefined;
        this.statusText = 'Disconnected';
      })
    );

    // Initial status check
    setTimeout(() => {
      this.isConnected = this.socketService.isConnected();
      this.socketId = this.socketService.getSocketId();
      this.statusText = this.isConnected ? 'Connected' : 'Disconnected';
    }, 1000);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}