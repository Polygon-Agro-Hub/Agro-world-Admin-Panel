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
  returnTime: string;
}

@Component({
  selector: 'app-return-todays-deleveries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './return-todays-deleveries.component.html',
  styleUrl: './return-todays-deleveries.component.css',
})
export class ReturnTodaysDeleveriesComponent {
  // Dummy data based on the screenshot
  deliveries: DeliveryItem[] = [
    {
      no: 1,
      orderId: '2506200010',
      centre: 'D-WPCK-01',
      driver: 'DIV000001',
      phoneNumber: '0781112300',
      deliveryTimeSlot: '8AM - 2PM',
      returnTime: '11.20AM',
    },
    {
      no: 2,
      orderId: '2506200006',
      centre: 'D-WPCK-02',
      driver: 'DIV000007',
      phoneNumber: '0781112300',
      deliveryTimeSlot: '8AM - 2PM',
      returnTime: '11.10AM',
    },
    {
      no: 3,
      orderId: '2506200003',
      centre: 'D-WPCK-01',
      driver: 'DIV000090',
      phoneNumber: '0781112300',
      deliveryTimeSlot: '2PM - 8PM',
      returnTime: '11.00AM',
    },
    {
      no: 4,
      orderId: '2506200002',
      centre: 'D-WPCK-01',
      driver: 'DIV000080',
      phoneNumber: '0781112300',
      deliveryTimeSlot: '2PM - 8PM',
      returnTime: '10.20AM',
    },
    {
      no: 5,
      orderId: '2506200001',
      centre: 'D-WPCK-01',
      driver: 'DIV000667',
      phoneNumber: '0781112300',
      deliveryTimeSlot: '2PM - 8PM',
      returnTime: '10.10AM',
    },
    {
      no: 6,
      orderId: '2506200001',
      centre: 'D-WPCK-03',
      driver: 'DIV000065',
      phoneNumber: '0781112300',
      deliveryTimeSlot: '2PM - 8PM',
      returnTime: '10.00AM',
    },
  ];

  // Update the "All ()" count to show the number of items
  get totalCount(): number {
    return this.deliveries.length;
  }

  // For search functionality (optional - you can expand this)
  searchTerm: string = '';

  // Method to filter deliveries based on search term
  get filteredDeliveries(): DeliveryItem[] {
    if (!this.searchTerm.trim()) {
      return this.deliveries;
    }

    const term = this.searchTerm.toLowerCase();
    return this.deliveries.filter(
      (item) =>
        item.orderId.toLowerCase().includes(term) ||
        item.centre.toLowerCase().includes(term) ||
        item.driver.toLowerCase().includes(term)
    );
  }

  // Method to clear search
  clearSearch(): void {
    this.searchTerm = '';
  }

  // Method to handle search (optional - can be used for button click)
  onSearch(): void {
    // You can add additional search logic here if needed
    console.log('Searching for:', this.searchTerm);
  }
}
