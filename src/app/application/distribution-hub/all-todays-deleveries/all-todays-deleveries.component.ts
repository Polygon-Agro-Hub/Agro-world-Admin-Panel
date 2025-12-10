import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

interface Order {
  no: string;
  orderId: string;
  centre: string;
  deliveryTimeSlot: string;
  status: string;
  details?: string;
}

@Component({
  selector: 'app-all-todays-deleveries',
  standalone: true,
  imports: [CommonModule, DropdownModule, FormsModule],
  templateUrl: './all-todays-deleveries.component.html',
  styleUrl: './all-todays-deleveries.component.css',
})
export class AllTodaysDeleveriesComponent {
  orders: Order[] = [
    {
      no: '01',
      orderId: '2506200010',
      centre: 'D-WPCK-01',
      deliveryTimeSlot: '8AM - 2PM',
      status: 'Out for Delivery',
    },
    {
      no: '02',
      orderId: '2506200006',
      centre: 'D-WPCK-02',
      deliveryTimeSlot: '8AM - 2PM',
      status: 'Delivered',
    },
    {
      no: '03',
      orderId: '2506200003',
      centre: 'D-WPCK-01',
      deliveryTimeSlot: '2PM - 8PM',
      status: 'On the way',
    },
    {
      no: '04',
      orderId: '2506200002',
      centre: 'D-WPCK-01',
      deliveryTimeSlot: '2PM - 8PM',
      status: 'Return',
    },
    {
      no: '05',
      orderId: '2506200001',
      centre: 'D-WPCK-01',
      deliveryTimeSlot: '2PM - 8PM',
      status: 'Hold',
    },
    {
      no: '06',
      orderId: '2506200001',
      centre: 'D-WPCK-03',
      deliveryTimeSlot: '2PM - 8PM',
      status: 'Return',
    },
  ];

  statusOptions = [
    { label: 'All', value: null },
    { label: 'Out for Delivery', value: 'Out for Delivery' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'On the way', value: 'On the way' },
    { label: 'Return', value: 'Return' },
    { label: 'Hold', value: 'Hold' },
  ];

  selectedStatus: any = null;
  searchText: string = '';

  getStatusClass(status: string): string {
    switch (status) {
      case 'Out for Delivery':
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

  get filteredOrders(): Order[] {
    let filtered = this.orders;

    if (this.selectedStatus) {
      filtered = filtered.filter(
        (order) => order.status === this.selectedStatus
      );
    }

    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderId.toLowerCase().includes(searchLower) ||
          order.centre.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }

  getOrderCount(): number {
    return this.filteredOrders.length;
  }

  clearSearch(): void {
    this.searchText = '';
  }
}
