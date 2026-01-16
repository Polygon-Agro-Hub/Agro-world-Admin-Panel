import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodayDeliveriesViewDetailsPopupComponent } from '../today-deliveries-view-details-popup/today-deliveries-view-details-popup.component';

interface DeliveryItem {
  id: number;
  invNo: string;
  regCode: string;
  centerName: string;
  sheduleTime: string;
  sheduleDate: string;
  createdAt: string;
  status: string;
  outDlvrTime: string;
  collectTime: string;
  driverEmpId: string;
  driverStartTime: string;
  returnTime: string;
  deliveryTime: string;
  driverPhone: string;
  holdTime: string;
}

@Component({
  selector: 'app-return-todays-deleveries',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TodayDeliveriesViewDetailsPopupComponent,
  ],
  templateUrl: './return-todays-deleveries.component.html',
  styleUrl: './return-todays-deleveries.component.css',
})
export class ReturnTodaysDeleveriesComponent implements OnChanges {
  @Input() deliveries: DeliveryItem[] = [];

  // Processed data for display
  showDetailsPopup: boolean = false;
  selectedDeliveryId!: number;
  filteredDeliveries: DeliveryItem[] = [];

  // For search functionality
  searchTerm: string = '';

  ngOnChanges(): void {
    this.filteredDeliveries = [...this.deliveries];
  }

  cleanTimeSlotText(text: string): string {
    if (!text) return 'N/A';
    let cleaned = text.replace(/Within\s*/gi, '').trim();

    const parts = cleaned.split('-').map((part) => {
      return part.trim().replace(/(\d)(AM|PM)/i, '$1 $2');
    });

    return parts.join(' - ');
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredDeliveries = [...this.deliveries];
      return;
    }

    this.searchTerm = this.searchTerm.trim();
    const query = this.searchTerm.toLowerCase();
    this.filteredDeliveries = this.deliveries.filter(
      (item) =>
        (item.invNo && item.invNo.toLowerCase().includes(query)) ||
        (item.regCode && item.regCode.toLowerCase().includes(query))
    );
  }

  // Method to clear search
  clearSearch(): void {
    this.searchTerm = '';
    this.filteredDeliveries = [...this.deliveries];
  }

  viewDetails(delivery: DeliveryItem): void {
    if (delivery?.id == null) {
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
