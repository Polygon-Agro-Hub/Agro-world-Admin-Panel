import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

interface Delivery {
  invNo: string;
  regCode: string;
  sheduleDate: string;
  createdAt: string;
  status: string;
}

@Component({
  selector: 'app-all-todays-deleveries',
  standalone: true,
  imports: [CommonModule, DropdownModule, FormsModule],
  templateUrl: './all-todays-deleveries.component.html',
  styleUrl: './all-todays-deleveries.component.css',
})
export class AllTodaysDeleveriesComponent implements OnChanges {
  @Input() deliveries: Delivery[] = [];

  displayedDeliveries: Delivery[] = [];

  statusOptions = [
    { label: 'All', value: null },
    { label: 'Out for Delivery', value: 'Out For Delivery' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'On the way', value: 'On the way' },
    { label: 'Return', value: 'Return' },
    { label: 'Hold', value: 'Hold' },
  ];

  selectedStatus: any = null;
  searchText: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['deliveries']) {
      this.filterDeliveries();
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Out For Delivery':
        return 'bg-[#FCD4FF] text-[#80118A] dark:bg-[#424B5F] dark:text-[#E3E3E3]';
      case 'Delivered':
        return 'bg-[#BBFFC6] text-[#308233] dark:bg-[#1C4332] dark:text-[#D1FADF]';
      case 'On the way':
        return 'bg-[#FFEDCF] text-[#D17A00] dark:bg-[#5C4109] dark:text-[#FEF0C7]';
      case 'Return':
        return 'bg-[#FFDFDF] text-[#FF0004] dark:bg-[#5C2A25] dark:text-[#FEE4E2]';
      case 'Hold':
        return 'bg-[#FFEDCF] text-[#D17A00] dark:bg-[#0C4A6E] dark:text-[#E0F2FE]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  filterDeliveries(): void {
    let filtered = [...this.deliveries];

    // Apply status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(
        (delivery) => delivery.status === this.selectedStatus
      );
    }

    // Apply search filter
    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter(
        (delivery) =>
          delivery.invNo.toLowerCase().includes(searchLower) ||
          delivery.regCode.toLowerCase().includes(searchLower)
      );
    }

    this.displayedDeliveries = filtered;
  }

  onStatusChange(): void {
    this.filterDeliveries();
  }

  onSearchChange(): void {
    this.filterDeliveries();
  }

  getOrderCount(): number {
    return this.displayedDeliveries.length;
  }

  clearSearch(): void {
    this.searchText = '';
    this.filterDeliveries();
  }

  formatTimeSlot(dateString: string): string {
    if (!dateString) return 'N/A';

    // Parse the date string
    const date = new Date(dateString);

    // Format time to AM/PM format
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

    return `${formattedHours}${
      formattedMinutes !== '00' ? ':' + formattedMinutes : ''
    }${ampm}`;
  }

  formatTimeRange(dateString: string): string {
    if (!dateString) return 'N/A';

    return this.formatTimeSlot(dateString);
  }
}
