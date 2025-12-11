import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface DeliveryItem {
  no: number;
  orderId: string;
  centre: string;
  deliveryTimeSlot: string;
  outTime: string;
}

@Component({
  selector: 'app-out-for-delivery-todays-deleveries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './out-for-delivery-todays-deleveries.component.html',
  styleUrl: './out-for-delivery-todays-deleveries.component.css',
})
export class OutForDeliveryTodaysDeleveriesComponent {
  searchTerm: string = '';
  deliveries: DeliveryItem[] = [
    {
      no: 1,
      orderId: '2506200010',
      centre: 'D-WPCK-01',
      deliveryTimeSlot: '8AM - 2PM',
      outTime: '11.20AM',
    },
    {
      no: 2,
      orderId: '2506200006',
      centre: 'D-WPCK-02',
      deliveryTimeSlot: '8AM - 2PM',
      outTime: '11.10AM',
    },
    {
      no: 3,
      orderId: '2506200003',
      centre: 'D-WPCK-01',
      deliveryTimeSlot: '2PM - 8PM',
      outTime: '11.00AM',
    },
    {
      no: 4,
      orderId: '2506200002',
      centre: 'D-WPCK-01',
      deliveryTimeSlot: '2PM - 8PM',
      outTime: '10.20AM',
    },
    {
      no: 5,
      orderId: '2506200001',
      centre: 'D-WPCK-01',
      deliveryTimeSlot: '2PM - 8PM',
      outTime: '10.10AM',
    },
    {
      no: 6,
      orderId: '2506200001',
      centre: 'D-WPCK-03',
      deliveryTimeSlot: '2PM - 8PM',
      outTime: '10.00AM',
    },
  ];

  filteredDeliveries: DeliveryItem[] = [...this.deliveries];

  constructor() {
    this.updateAllCount();
  }

  search() {
    if (!this.searchTerm.trim()) {
      this.filteredDeliveries = [...this.deliveries];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredDeliveries = this.deliveries.filter(
        (item) =>
          item.orderId.toLowerCase().includes(term) ||
          item.centre.toLowerCase().includes(term) ||
          item.deliveryTimeSlot.toLowerCase().includes(term) ||
          item.outTime.toLowerCase().includes(term)
      );
    }
    this.updateAllCount();
  }

  clearSearch() {
    this.searchTerm = '';
    this.filteredDeliveries = [...this.deliveries];
    this.updateAllCount();
  }

  updateAllCount() {
    // This will update the count in the template
    const allCountElement = document.querySelector('h2.text-2xl.font-normal');
    if (allCountElement) {
      allCountElement.textContent = `All (${this.filteredDeliveries.length})`;
    }
  }
}
