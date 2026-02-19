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

  // Format a name with title
  formatNameWithTitle(nameWithTitle: string): string {
    if (!nameWithTitle || nameWithTitle === '--') return '--';
    
    // Common titles that should have periods
    const titles = ['Mr', 'Mrs', 'Ms', 'Miss', 'Dr', 'Prof', 'Capt', 'Rev', 'Hon'];
    
    // Check if the string starts with a title without period
    for (const title of titles) {
      if (nameWithTitle.startsWith(`${title} `) && !nameWithTitle.startsWith(`${title}. `)) {
        // Add period after title
        return `${title}. ${nameWithTitle.substring(title.length + 1)}`;
      }
    }
    
    return nameWithTitle;
  }

  // Get the formatted customer name
  getFormattedCustomerName(): string {
    if (!this.receiverInfo) return '--';
    
    const name = this.receiverInfo.customerName || '--';
    return this.formatNameWithTitle(name);
  }

  // Get the formatted receiver's name
  getFormattedReceiverName(): string {
    if (!this.receiverInfo) return '--';
    
    const name = this.receiverInfo.receiverName || '--';
    return this.formatNameWithTitle(name);
  }
}