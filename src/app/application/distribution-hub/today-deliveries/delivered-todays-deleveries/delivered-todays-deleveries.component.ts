import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodayDeliveriesViewDetailsPopupComponent } from '../today-deliveries-view-details-popup/today-deliveries-view-details-popup.component';

interface DeliveryRecord {
  id: number
  invNo: string
  regCode: string
  centerName: string
  sheduleTime: string
  sheduleDate: string
  createdAt: string
  status: string
  outDlvrTime: string
  collectTime: string
  driverEmpId: string
  driverStartTime: string
  returnTime: string
  deliveryTime: string;
  driverPhone: string
  holdTime: string
}


@Component({
  selector: 'app-delivered-todays-deleveries',
  standalone: true,
  imports: [CommonModule, FormsModule, TodayDeliveriesViewDetailsPopupComponent],
  templateUrl: './delivered-todays-deleveries.component.html',
  styleUrl: './delivered-todays-deleveries.component.css',
})
export class DeliveredTodaysDeleveriesComponent implements OnChanges {
  @Input() deliveries: DeliveryRecord[] = [];

  searchTerm: string = '';
  filteredDeliveries: DeliveryRecord[] = [];
  showDetailsPopup: boolean = false;
  selectedDeliveryId!: number;

  ngOnChanges(): void {
    this.filteredDeliveries = [...this.deliveries];
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredDeliveries = [...this.deliveries];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredDeliveries = this.deliveries.filter(
        (delivery) =>
          delivery.invNo.toLowerCase().includes(term) ||
          delivery.regCode.toLowerCase().includes(term) ||
          delivery.driverEmpId.toLowerCase().includes(term) ||
          delivery.driverPhone.includes(term)
      );
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredDeliveries = [...this.deliveries];
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

  cleanTimeSlotText(text: string): string {
    if (!text) return 'N/A';
    // Remove "Within" and any extra spaces (case-insensitive)
    return text.replace(/Within\s*/gi, '').trim();
  }
}
