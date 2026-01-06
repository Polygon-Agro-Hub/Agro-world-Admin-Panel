import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodayDeliveriesViewDetailsPopupComponent } from '../today-deliveries-view-details-popup/today-deliveries-view-details-popup.component';

interface DeliveryRecord {
  id?: number;
  no: number;
  orderId: string;
  centre: string;
  driver: string;
  phoneNumber: string;
  deliveryTimeSlot: string;
  deliveryTime: string;
   driverStartTime?: string;
}

@Component({
  selector: 'app-delivered-todays-deleveries',
  standalone: true,
  imports: [CommonModule, FormsModule, TodayDeliveriesViewDetailsPopupComponent],
  templateUrl: './delivered-todays-deleveries.component.html',
  styleUrl: './delivered-todays-deleveries.component.css',
})
export class DeliveredTodaysDeleveriesComponent implements OnChanges {
  @Input() deliveries: any[] = [];

  searchTerm: string = '';
  deliveryRecords: DeliveryRecord[] = [];
  filteredDeliveries: DeliveryRecord[] = [];
  showDetailsPopup: boolean = false;
  selectedDeliveryId!: number;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['deliveries'] && this.deliveries) {
      this.transformDeliveryData();
      this.filteredDeliveries = [...this.deliveryRecords];
    }
  }

  private transformDeliveryData(): void {
    // Transform parent data to match child component interface
    this.deliveryRecords = this.deliveries.map((delivery) => ({
      id: delivery.id, 
      no: delivery.no || 0,
      orderId: delivery.orderId || delivery.invNo || 'N/A',
      centre: delivery.centre || delivery.regCode || 'N/A',
      driver: delivery.driver || 'N/A',
      phoneNumber: delivery.phoneNumber || 'N/A',
      deliveryTimeSlot: delivery.deliveryTimeSlot || 'N/A',
      deliveryTime: delivery.deliveryTime || delivery.outDlvrTime || 'N/A',
      driverStartTime: delivery.driverStartTime,
    }));
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredDeliveries = [...this.deliveryRecords];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredDeliveries = this.deliveryRecords.filter(
        (delivery) =>
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

  get totalCount(): string {
    return this.filteredDeliveries.length.toString().padStart(2, '0');
  }

  viewDetails(delivery: DeliveryRecord): void {
     if (delivery.id == null) {
      console.warn('Delivery id is missing for selected row:', delivery);
      return; 
    }
    this.selectedDeliveryId = delivery.id;
    this.showDetailsPopup = true;
  }

  closeDetailsPopup(): void {
    this.showDetailsPopup = false;
  }
}
