import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodayDeliveriesViewDetailsPopupComponent } from '../today-deliveries-view-details-popup/today-deliveries-view-details-popup.component';

interface DeliveryData {
  id?: number; 
  no: number;
  orderId: string;
  centre: string;
  driver: string;
  phoneNumber: string;
  deliveryTimeSlot: string;
  heldTime: string;
}

@Component({
  selector: 'app-hold-todays-deleveries',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TodayDeliveriesViewDetailsPopupComponent,
  ],
  templateUrl: './hold-todays-deleveries.component.html',
  styleUrl: './hold-todays-deleveries.component.css',
})
export class HoldTodaysDeleveriesComponent implements OnChanges {
  @Input() holdDeliveries: any[] = [];

  searchTerm: string = '';

  // Processed data for display
  processedData: DeliveryData[] = [];
  filteredData: DeliveryData[] = [];
  showDetailsPopup: boolean = false;
  selectedDeliveryId!: number;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['holdDeliveries'] && this.holdDeliveries) {
      this.processDeliveryData();
      this.onSearch(); // Apply search filter if any
    }
  }

  // Convert backend data to the format needed by the template
  private processDeliveryData(): void {
    this.processedData = this.holdDeliveries.map((delivery) => {
      // Convert scheduleTime to delivery time slot format (e.g., "8AM - 2PM")
      const deliveryTimeSlot = this.formatToTimeSlot(delivery.sheduleTime);

      return {
        id: delivery.id, // keep id
        no: delivery.no || 0,
        orderId: delivery.invNo || 'N/A',
        centre: delivery.regCode || 'N/A',
        driver: delivery.driver || 'N/A',
        phoneNumber: delivery.phoneNumber || 'N/A',
        deliveryTimeSlot: deliveryTimeSlot,
        heldTime: delivery.heldTime || 'N/A',
      };
    });

    this.filteredData = [...this.processedData];
  }

  // Helper method to format schedule time to time slot
  private formatToTimeSlot(scheduleTime: string): string {
    if (!scheduleTime) return 'N/A';

    try {
      // Assuming scheduleTime is in format like "08:00:00" or similar
      const [hours, minutes] = scheduleTime.split(':');
      const hourNum = parseInt(hours, 10);

      if (hourNum < 12) {
        return '8AM - 2PM'; // Morning slot
      } else {
        return '2PM - 8PM'; // Afternoon slot
      }
    } catch (error) {
      return 'N/A';
    }
  }

  // Search function
  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredData = [...this.processedData];
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredData = this.processedData.filter(
      (item) =>
        item.orderId.toLowerCase().includes(term) ||
        item.centre.toLowerCase().includes(term) ||
        item.driver.toLowerCase().includes(term) ||
        item.phoneNumber.toLowerCase().includes(term) ||
        item.deliveryTimeSlot.toLowerCase().includes(term) ||
        item.heldTime.toLowerCase().includes(term)
    );
  }

  // Clear search
  clearSearch(): void {
    this.searchTerm = '';
    this.filteredData = [...this.processedData];
  }

  // View details
  viewDetails(item: DeliveryData): void {
    if (item?.id == null) {
      console.warn('Delivery id is missing for selected row:', item);
      return;
    }

    this.selectedDeliveryId = item.id;
    this.showDetailsPopup = true;
  }

  closeDetailsPopup(): void {
    this.showDetailsPopup = false;
  }
}
