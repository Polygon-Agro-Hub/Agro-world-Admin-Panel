import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface DeliveryItem {
  no: number;
  invNo: string;
  regCode: string;
  driver: string;
  phoneNumber: string;
  deliveryTimeSlot: string;
  startedTime: string;
  status: string;
  // These might be needed for formatting
  collectTime?: string;
  sheduleTime?: string;
  outDlvrTime?: string;
  createdAt?: string;
}

@Component({
  selector: 'app-collected',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './collected.component.html',
  styleUrl: './collected.component.css',
})
export class CollectedComponent implements OnChanges {
  @Input() deliveries: any[] = [];

  searchQuery: string = '';
  filteredData: DeliveryItem[] = [];
  originalData: DeliveryItem[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['deliveries'] && this.deliveries) {
      this.transformDeliveryData();
      this.filteredData = [...this.originalData];
    }
  }

  transformDeliveryData(): void {
    this.originalData = this.deliveries.map((delivery, index) => ({
      no: index + 1,
      invNo: delivery.invNo || delivery.orderId || '',
      regCode: delivery.regCode || delivery.centre || '',
      driver: delivery.driver || '', // Use placeholder from parent
      phoneNumber: delivery.phoneNumber || '', // Use placeholder from parent
      deliveryTimeSlot: this.cleanTimeSlotText(
        delivery.deliveryTimeSlot ||
        this.formatDeliveryTimeSlot(delivery.sheduleTime)
      ),
      startedTime:
        delivery.returnTime ||
        this.formatTime(delivery.outDlvrTime || delivery.createdAt),
      status: delivery.status || '',
      sheduleTime: delivery.sheduleTime,
      outDlvrTime: delivery.outDlvrTime,
      createdAt: delivery.createdAt,
    }));
  }

  // Helper method to remove "Within" text from time slot strings
  private cleanTimeSlotText(text: string): string {
    if (!text) return 'N/A';
    // Remove "Within" and any extra spaces (case-insensitive)
    return text.replace(/Within\s*/gi, '').trim();
  }

  private formatDeliveryTimeSlot(sheduleTime: string): string {
    if (!sheduleTime) return 'N/A';

    try {
      const date = new Date(sheduleTime);
      if (isNaN(date.getTime())) {
        // If it's not a valid date, clean any "Within" text
        return this.cleanTimeSlotText(sheduleTime);
      }

      const hours = date.getHours();

      if (hours >= 8 && hours < 14) {
        return '8AM - 2PM';
      } else if (hours >= 14 && hours < 20) {
        return '2PM - 8PM';
      } else {
        return 'Other';
      }
    } catch (error) {
      // If there's an error, clean any "Within" text from the original string
      return this.cleanTimeSlotText(sheduleTime);
    }
  }

  private formatTime(timeString: string): string {
    if (!timeString) return 'N/A';

    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        if (timeString.includes('.')) return timeString;
        return 'N/A';
      }

      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';

      hours = hours % 12;
      hours = hours ? hours : 12;

      const minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();

      return `${hours}.${minutesStr}${ampm}`;
    } catch (error) {
      return 'N/A';
    }
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredData = [...this.originalData];
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    this.filteredData = this.originalData.filter(
      (item) =>
        item.invNo.toLowerCase().includes(query) ||
        item.regCode.toLowerCase().includes(query)
    );
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredData = [...this.originalData];
  }
}