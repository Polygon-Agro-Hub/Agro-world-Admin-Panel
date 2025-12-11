import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface DeliveryRecord {
  no: number;
  orderId: string;
  centre: string;
  driver: string;
  phoneNumber: string;
  deliveryTimeSlot: string;
  deliveryTime: string;
}

@Component({
  selector: 'app-delivered-todays-deleveries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivered-todays-deleveries.component.html',
  styleUrl: './delivered-todays-deleveries.component.css'
})
export class DeliveredTodaysDeleveriesComponent {
  searchTerm: string = '';
  deliveries: DeliveryRecord[] = [
    { no: 1, orderId: '2506200010', centre: 'D-WPCK-01', driver: 'DIV000001', phoneNumber: '0781112300', deliveryTimeSlot: '8AM - 2PM', deliveryTime: '11.20AM' },
    { no: 2, orderId: '2506200006', centre: 'D-WPCK-02', driver: 'DIV000007', phoneNumber: '0781112300', deliveryTimeSlot: '8AM - 2PM', deliveryTime: '11.10AM' },
    { no: 3, orderId: '2506200003', centre: 'D-WPCK-01', driver: 'DIV000090', phoneNumber: '0781112300', deliveryTimeSlot: '2PM - 8PM', deliveryTime: '11.00AM' },
    { no: 4, orderId: '2506200002', centre: 'D-WPCK-01', driver: 'DIV000080', phoneNumber: '0781112300', deliveryTimeSlot: '2PM - 8PM', deliveryTime: '10.20AM' },
    { no: 5, orderId: '2506200001', centre: 'D-WPCK-01', driver: 'DIV000667', phoneNumber: '0781112300', deliveryTimeSlot: '2PM - 8PM', deliveryTime: '10.10AM' },
    { no: 6, orderId: '2506200001', centre: 'D-WPCK-03', driver: 'DIV000065', phoneNumber: '0781112300', deliveryTimeSlot: '2PM - 8PM', deliveryTime: '10.00AM' }
  ];

  filteredDeliveries: DeliveryRecord[] = [...this.deliveries];

  constructor() {
    this.updateHeaderCount();
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredDeliveries = [...this.deliveries];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredDeliveries = this.deliveries.filter(delivery =>
        delivery.orderId.toLowerCase().includes(term) ||
        delivery.centre.toLowerCase().includes(term) ||
        delivery.driver.toLowerCase().includes(term) ||
        delivery.phoneNumber.includes(term)
      );
    }
    this.updateHeaderCount();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredDeliveries = [...this.deliveries];
    this.updateHeaderCount();
  }

  private updateHeaderCount(): void {
    // This will be used in the template to show the count
  }

  get totalCount(): number {
    return this.filteredDeliveries.length;
  }

  viewDetails(orderId: string): void {
    console.log('View details for order:', orderId);
    // Add your detail viewing logic here
    alert(`Viewing details for order: ${orderId}`);
  }
}