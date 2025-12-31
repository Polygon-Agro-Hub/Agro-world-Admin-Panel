import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
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
export class DeliveredTodaysDeleveriesComponent implements OnChanges {
  @Input() deliveries: any[] = [];
  
  searchTerm: string = '';
  deliveryRecords: DeliveryRecord[] = [];
  filteredDeliveries: DeliveryRecord[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['deliveries'] && this.deliveries) {
      this.transformDeliveryData();
      this.filteredDeliveries = [...this.deliveryRecords];
    }
  }

  private transformDeliveryData(): void {
    // Transform parent data to match child component interface
    this.deliveryRecords = this.deliveries.map(delivery => ({
      no: delivery.no || 0,
      orderId: delivery.orderId || delivery.invNo || 'N/A',
      centre: delivery.centre || delivery.regCode || 'N/A',
      driver: delivery.driver || 'N/A',
      phoneNumber: delivery.phoneNumber || 'N/A',
      deliveryTimeSlot: delivery.deliveryTimeSlot || 'N/A',
      deliveryTime: delivery.deliveryTime || delivery.outDlvrTime || 'N/A'
    }));
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredDeliveries = [...this.deliveryRecords];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredDeliveries = this.deliveryRecords.filter(delivery =>
        delivery.orderId.toLowerCase().includes(term) ||
        delivery.centre.toLowerCase().includes(term) ||
        delivery.driver.toLowerCase().includes(term) ||
        delivery.phoneNumber.includes(term)
      );
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredDeliveries = [...this.deliveryRecords];
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