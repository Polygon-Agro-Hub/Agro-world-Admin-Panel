import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface DeliveryItem {
  invNo: string;
  regCode: string;
  sheduleTime: string;
  createdAt: string;
  status: string;
  outDlvrTime: string;
}

@Component({
  selector: 'app-out-for-delivery-todays-deleveries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './out-for-delivery-todays-deleveries.component.html',
  styleUrl: './out-for-delivery-todays-deleveries.component.css',
})
export class OutForDeliveryTodaysDeleveriesComponent implements OnChanges {
  @Input() deliveries: DeliveryItem[] = [];
  
  searchTerm: string = '';
  filteredDeliveries: DeliveryItem[] = [];
  
  // Local copy of deliveries for filtering
  localDeliveries: DeliveryItem[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['deliveries']) {
      this.localDeliveries = [...this.deliveries];
      this.filteredDeliveries = [...this.deliveries];
    }
  }

  search() {
    if (!this.searchTerm.trim()) {
      this.filteredDeliveries = [...this.localDeliveries];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredDeliveries = this.localDeliveries.filter(
        (item) =>
          item.invNo.toLowerCase().includes(term) ||
          item.regCode.toLowerCase().includes(term) ||
          item.sheduleTime.toLowerCase().includes(term) ||
          (item.outDlvrTime && item.outDlvrTime.toLowerCase().includes(term))
      );
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.filteredDeliveries = [...this.localDeliveries];
  }

  // Helper method to format the out time
  formatOutTime(outTime: string): string {
    if (!outTime) return '';
    
    // Remove seconds if present (HH:MM:SS -> HH:MM)
    const timeParts = outTime.split(':');
    if (timeParts.length >= 2) {
      const hours = parseInt(timeParts[0]);
      const minutes = timeParts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      return `${formattedHours}.${minutes}${ampm}`;
    }
    return outTime;
  }

  // Helper method to format time slot
  formatTimeSlot(scheduleTime: string): string {
    if (!scheduleTime) return '';
    
    try {
      const date = new Date(scheduleTime);
      const hours = date.getHours();
      
      if (hours < 12) {
        return '8AM - 2PM';
      } else if (hours < 18) {
        return '2PM - 8PM';
      } else {
        return '8PM - 12AM';
      }
    } catch (e) {
      return scheduleTime;
    }
  }
}