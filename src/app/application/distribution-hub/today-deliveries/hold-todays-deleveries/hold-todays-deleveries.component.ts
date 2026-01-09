import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodayDeliveriesViewDetailsPopupComponent } from '../today-deliveries-view-details-popup/today-deliveries-view-details-popup.component';

interface DeliveryData {
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
  @Input() holdDeliveries: DeliveryData[] = [];

  searchTerm: string = '';

  // Processed data for display
  processedData: DeliveryData[] = [];
  filteredData: DeliveryData[] = [];
  showDetailsPopup: boolean = false;
  selectedDeliveryId!: number;

  ngOnChanges(): void {
    this.filteredData = [...this.holdDeliveries];

  }

  // Search function
  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredData = [...this.holdDeliveries];
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredData = this.holdDeliveries.filter(
      (item) =>
        item.invNo.toLowerCase().includes(term) ||
        item.regCode.toLowerCase().includes(term) ||
        item.driverEmpId.toLowerCase().includes(term) ||
        item.driverPhone.toLowerCase().includes(term) ||
        item.sheduleTime.toLowerCase().includes(term) ||
        item.holdTime.toLowerCase().includes(term)
    );
  }

  // Clear search
  clearSearch(): void {
    this.searchTerm = '';
    this.filteredData = [...this.holdDeliveries];
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

  cleanTimeSlotText(text: string): string {
    if (!text) return 'N/A';
    // Remove "Within" and any extra spaces (case-insensitive)
    return text.replace(/Within\s*/gi, '').trim();
  }
}
