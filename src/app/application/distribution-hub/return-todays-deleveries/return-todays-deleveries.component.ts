import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
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
export class ReturnTodaysDeleveriesComponent implements OnChanges {
  @Input() deliveries: any[] = [];
  
  // Processed data for display
  processedDeliveries: DeliveryItem[] = [];
  
  // For search functionality
  searchTerm: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['deliveries'] && this.deliveries) {
      this.processDeliveryData();
    }
  }

  private processDeliveryData(): void {
    // Transform the input data to match the DeliveryItem interface
    this.processedDeliveries = this.deliveries.map(delivery => ({
      no: delivery.no || 0,
      orderId: delivery.orderId || delivery.invNo || 'N/A',
      centre: delivery.centre || delivery.regCode || 'N/A',
      driver: delivery.driver || 'N/A',
      phoneNumber: delivery.phoneNumber || 'N/A',
      deliveryTimeSlot: delivery.deliveryTimeSlot || 'N/A',
      returnTime: delivery.returnTime || 'N/A'
    }));
  }

  // Get the total count of processed deliveries
  get totalCount(): number {
    return this.processedDeliveries.length;
  }

  // Method to filter deliveries based on search term
  get filteredDeliveries(): DeliveryItem[] {
    if (!this.searchTerm.trim()) {
      return this.processedDeliveries;
    }

    const term = this.searchTerm.toLowerCase();
    return this.processedDeliveries.filter(
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