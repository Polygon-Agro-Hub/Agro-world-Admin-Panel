import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { TodayDeliveriesViewDetailsPopupComponent } from '../today-deliveries-view-details-popup/today-deliveries-view-details-popup.component';
import { LoadingSpinnerComponent } from "../../../../components/loading-spinner/loading-spinner.component";

interface Delivery {
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
}

@Component({
  selector: 'app-all-todays-deleveries',
  standalone: true,
  imports: [CommonModule, DropdownModule, FormsModule, TodayDeliveriesViewDetailsPopupComponent, LoadingSpinnerComponent],
  templateUrl: './all-todays-deleveries.component.html',
  styleUrl: './all-todays-deleveries.component.css',
})
export class AllTodaysDeleveriesComponent implements OnChanges {
  @Input() deliveries: Delivery[] = [];

  displayedDeliveries: Delivery[] = [];
  showDetailsPopup: boolean = false;
  selectedDeliveryId!: number;
  isLoading = false;

  statusOptions = [
    { label: 'Out for Delivery', value: 'Out For Delivery' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Collected', value: 'Collected' },
    { label: 'On the way', value: 'On the way' },
    { label: 'Return', value: 'Return' },
    { label: 'Hold', value: 'Hold' },
  ];

  selectedStatus: string | null = null;
  searchText: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    // if (changes['deliveries']) {
    //   this.filterDeliveries();
    // }
    this.filterDeliveries();
    console.log(this.deliveries);

  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Out For Delivery':
        return 'bg-[#FCD4FF] text-[#80118A]';
      case 'Delivered':
        return 'bg-[#BBFFC6] text-[#308233]';
      case 'Collected':
        return 'bg-[#F8FEA5] text-[#7E8700]';
      case 'On the way':
        return 'bg-[#FFEDCF] text-[#D17A00]';
      case 'Return':
        return 'bg-[#FFDFDF] text-[#FF0004]';
      case 'Hold':
        return 'bg-[#FFEDCF] text-[#D17A00]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  filterDeliveries(): void {
  this.isLoading = true;
  
  setTimeout(() => {

    let filtered = [...this.deliveries];

    if (this.selectedStatus && this.selectedStatus !== 'ALL') {
      filtered = filtered.filter(
        (delivery) => delivery.status === this.selectedStatus
      );
    }

    if (this.searchText) {
      const searchLower = this.searchText.trim().toLowerCase();
      filtered = filtered.filter(
        (delivery) =>
          delivery.invNo?.toLowerCase().includes(searchLower) ||
          delivery.regCode?.toLowerCase().includes(searchLower) ||
          delivery.sheduleTime?.toLowerCase().includes(searchLower)
      );
    }

    this.displayedDeliveries = filtered;
    this.isLoading = false;

  }, 200); 
}

  onStatusChange(): void {
    this.filterDeliveries();
  }

  onSearchChange(): void {
    this.filterDeliveries();
  }

  getOrderCount(): string {
    const count = this.displayedDeliveries.length;
    return count < 10 ? `0${count}` : `${count}`;
  }

  clearSearch(): void {
    this.searchText = '';
    this.filterDeliveries();
  }

  clearStatusFilter(): void {
    this.selectedStatus = null;
    this.filterDeliveries();
  }

  // Open details popup

  openDetailsPopup(delivery: Delivery): void {
    if (delivery.id == null) {
      console.warn('Delivery id is missing for selected row:', delivery);
      return;
    }
    this.selectedDeliveryId = delivery.id;
    this.showDetailsPopup = true;
  }

  // Close details popup
  closeDetailsPopup(): void {
    this.showDetailsPopup = false;
  }

  // Format the schedule time to remove "Within " if you just want "8-12 PM"
  formatTimeSlot(sheduleTime: string): string {
    if (!sheduleTime) return 'N/A';

    // If it starts with "Within ", remove it
    if (sheduleTime.startsWith('Within ')) {
      return sheduleTime.substring(7); // Remove "Within "
    }

    return sheduleTime;
  }

  // Alternative: If you want to convert to format "8AM - 12PM"
  formatTimeRange(sheduleTime: string): string {
    if (!sheduleTime) return 'N/A';

    // Remove "Within " prefix if present
    let timeRange = sheduleTime;
    if (timeRange.startsWith('Within ')) {
      timeRange = timeRange.substring(7);
    }

    // Convert "8-12 PM" to "8AM - 12PM"
    // Handle various formats
    if (timeRange.includes('AM') || timeRange.includes('PM')) {
      // If it already has AM/PM indicators
      return timeRange.replace('-', ' - ');
    } else {
      // If it's just numbers like "8-12"
      const parts = timeRange.split('-');
      if (parts.length === 2) {
        const start = parts[0].trim();
        const end = parts[1].trim();

        // Determine AM/PM based on the hour
        const startNum = parseInt(start);
        const endNum = parseInt(end);

        const startSuffix = startNum < 12 ? 'AM' : 'PM';
        const endSuffix = endNum < 12 ? 'AM' : 'PM';

        // Convert to 12-hour format if needed
        const startHour = startNum > 12 ? startNum - 12 : startNum;
        const endHour = endNum > 12 ? endNum - 12 : endNum;

        return `${startHour}${startSuffix} - ${endHour}${endSuffix}`;
      }
    }

    return timeRange;
  }
}