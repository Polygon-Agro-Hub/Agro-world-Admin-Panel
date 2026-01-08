import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodayDeliveriesViewDetailsPopupComponent } from '../today-deliveries-view-details-popup/today-deliveries-view-details-popup.component';

interface DeliveryItem {
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
  deliveryTime: string
  driverPhone: string
}


@Component({
  selector: 'app-on-the-way-todays-deleveries',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TodayDeliveriesViewDetailsPopupComponent,
  ],
  templateUrl: './on-the-way-todays-deleveries.component.html',
  styleUrl: './on-the-way-todays-deleveries.component.css',
})
export class OnTheWayTodaysDeleveriesComponent implements OnChanges {
  @Input() deliveries: DeliveryItem[] = [];

  searchQuery: string = '';
  showDetailsPopup: boolean = false;
  selectedDeliveryId!: number;

  // Transformed delivery data for the table
  filteredData: DeliveryItem[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    // if (changes['deliveries'] && this.deliveries) {
    //   // this.transformDeliveryData();
    // }
    this.filteredData = [...this.deliveries];

  }


  cleanTimeSlotText(text: string): string {
    if (!text) return 'N/A';
    // Remove "Within" and any extra spaces (case-insensitive)
    return text.replace(/Within\s*/gi, '').trim();
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredData = [...this.deliveries];
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    this.filteredData = this.deliveries.filter(
      (item) =>
        item.invNo.toLowerCase().includes(query) ||
        item.regCode.toLowerCase().includes(query) ||
        item.driverEmpId.toLowerCase().includes(query)
    );
  }

  // Clear search
  clearSearch(): void {
    this.searchQuery = '';
    this.filteredData = [...this.deliveries];
  }



  // Handle details button click
  onDetailsClick(delivery: DeliveryItem): void {
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
