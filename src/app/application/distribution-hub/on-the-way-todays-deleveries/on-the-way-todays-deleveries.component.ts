import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface DeliveryItem {
  no: number;
  orderId: string;
  centre: string;
  driver: string;
  phoneNumber: string;
  deliveryTimeSlot: string;
  startedTime: string;
}

@Component({
  selector: 'app-on-the-way-todays-deleveries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './on-the-way-todays-deleveries.component.html',
  styleUrl: './on-the-way-todays-deleveries.component.css',
})
export class OnTheWayTodaysDeleveriesComponent {
  searchQuery: string = '';
  
  // Dummy data based on the image
  deliveries: DeliveryItem[] = [
    { no: 1, orderId: '2506200010', centre: 'D-WPCK-01', driver: 'DIV000001', phoneNumber: '0781112300', deliveryTimeSlot: '8AM - 2PM', startedTime: '11.20AM' },
    { no: 2, orderId: '2506200006', centre: 'D-WPCK-02', driver: 'DIV000007', phoneNumber: '0781112300', deliveryTimeSlot: '8AM - 2PM', startedTime: '11.10AM' },
    { no: 3, orderId: '2506200003', centre: 'D-WPCK-01', driver: 'DIV000090', phoneNumber: '0781112300', deliveryTimeSlot: '2PM - 8PM', startedTime: '11.00AM' },
    { no: 4, orderId: '2506200002', centre: 'D-WPCK-01', driver: 'DIV000080', phoneNumber: '0781112300', deliveryTimeSlot: '2PM - 8PM', startedTime: '10.20AM' },
    { no: 5, orderId: '2506200001', centre: 'D-WPCK-01', driver: 'DIV000667', phoneNumber: '0781112300', deliveryTimeSlot: '2PM - 8PM', startedTime: '10.10AM' },
    { no: 6, orderId: '2506200001', centre: 'D-WPCK-03', driver: 'DIV000065', phoneNumber: '0781112300', deliveryTimeSlot: '2PM - 8PM', startedTime: '10.00AM' }
  ];

  // Filtered deliveries based on search
  get filteredDeliveries(): DeliveryItem[] {
    if (!this.searchQuery.trim()) {
      return this.deliveries;
    }
    
    const query = this.searchQuery.toLowerCase();
    return this.deliveries.filter(delivery =>
      delivery.orderId.toLowerCase().includes(query) ||
      delivery.centre.toLowerCase().includes(query) ||
      delivery.driver.toLowerCase().includes(query)
    );
  }

  // Clear search
  clearSearch(): void {
    this.searchQuery = '';
  }

  // Get total count
  get totalCount(): number {
    return this.deliveries.length;
  }

  // Handle search button click
  onSearch(): void {
    // The filteredDeliveries getter will automatically update with the searchQuery
    console.log('Searching for:', this.searchQuery);
  }

  // Handle details button click
  onDetailsClick(delivery: DeliveryItem): void {
    console.log('Viewing details for order:', delivery.orderId);
    // You can implement navigation or modal opening here
  }
}