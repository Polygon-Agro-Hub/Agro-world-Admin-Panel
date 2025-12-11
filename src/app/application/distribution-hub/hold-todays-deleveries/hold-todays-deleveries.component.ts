import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface DeliveryData {
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
  imports: [CommonModule, FormsModule],
  templateUrl: './hold-todays-deleveries.component.html',
  styleUrl: './hold-todays-deleveries.component.css',
})
export class HoldTodaysDeleveriesComponent {
  searchTerm: string = '';
  
  // Original dummy data
  originalData: DeliveryData[] = [
    { no: 1, orderId: '2506200010', centre: 'D-WPCK-01', driver: 'DIV000001', phoneNumber: '0781112300', deliveryTimeSlot: '8AM - 2PM', heldTime: '11.20AM' },
    { no: 2, orderId: '2506200006', centre: 'D-WPCK-02', driver: 'DIV000007', phoneNumber: '0781112300', deliveryTimeSlot: '8AM - 2PM', heldTime: '11.10AM' },
    { no: 3, orderId: '2506200003', centre: 'D-WPCK-01', driver: 'DIV000090', phoneNumber: '0781112300', deliveryTimeSlot: '2PM - 8PM', heldTime: '11.00AM' },
    { no: 4, orderId: '2506200002', centre: 'D-WPCK-01', driver: 'DIV000080', phoneNumber: '0781112300', deliveryTimeSlot: '2PM - 8PM', heldTime: '10.20AM' },
    { no: 5, orderId: '2506200001', centre: 'D-WPCK-01', driver: 'DIV000667', phoneNumber: '0781112300', deliveryTimeSlot: '2PM - 8PM', heldTime: '10.10AM' },
    { no: 6, orderId: '2506200001', centre: 'D-WPCK-03', driver: 'DIV000065', phoneNumber: '0781112300', deliveryTimeSlot: '2PM - 8PM', heldTime: '10.00AM' }
  ];

  // Filtered data for display
  filteredData: DeliveryData[] = [];

  constructor() {
    // Initialize filtered data with all items
    this.filteredData = [...this.originalData];
  }

  // Search function
  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredData = [...this.originalData];
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredData = this.originalData.filter(item => 
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
    this.filteredData = [...this.originalData];
  }

  // View details (you can implement this as needed)
  viewDetails(item: DeliveryData): void {
    console.log('View details for:', item);
    // Add your logic here for viewing details
    // For example, you might want to open a modal or navigate to another page
  }
}