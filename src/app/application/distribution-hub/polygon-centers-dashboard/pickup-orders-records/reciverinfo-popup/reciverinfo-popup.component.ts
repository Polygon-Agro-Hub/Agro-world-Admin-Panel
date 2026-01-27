import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-reciverinfo-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reciverinfo-popup.component.html',
  styleUrls: ['./reciverinfo-popup.component.css']
})
export class ReciverinfoPopupComponent {
  @Input() visible: boolean = false;
  @Input() receiverInfo: any = null;
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  // Prevent click events from bubbling to the overlay
  onPopupClick(event: Event): void {
    event.stopPropagation();
  }

  // Transform platform display names
  getPlatformDisplay(platform: string): string {
    if (!platform) return '--';
    
    switch (platform) {
      case 'Marketplace':
        return 'GoVi Mart';
      case 'Dash':
        return 'Sales Dash';
      default:
        return platform;
    }
  }

  // Get the receiver's full name
  getReceiverFullName(): string {
    if (!this.receiverInfo) return '--';
    
    return this.receiverInfo.fullName || 
           this.receiverInfo.full_name || 
           this.receiverInfo.receiverFullName ||
           this.receiverInfo.receiver?.fullName ||
           this.receiverInfo.receiverName ||
           '--';
  }
}