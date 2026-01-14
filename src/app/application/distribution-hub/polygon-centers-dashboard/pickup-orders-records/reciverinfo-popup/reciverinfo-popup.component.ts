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
}