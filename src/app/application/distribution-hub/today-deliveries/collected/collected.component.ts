import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
}

@Component({
  selector: 'app-collected',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './collected.component.html',
  styleUrl: './collected.component.css',
})
export class CollectedComponent implements OnChanges {
  @Input() deliveries: DeliveryItem[] = [];
  filteredData: DeliveryItem[] = [];

  searchQuery: string = '';

  ngOnChanges(): void {
    this.filteredData = [...this.deliveries];
  }

  // transformDeliveryData(): void {
  //   this.originalData = this.deliveries.map((delivery, index) => ({
  //     id: delivery.id,
  //     invNo: delivery.invNo || '-',
  //     regCode: delivery.regCode || '-',
  //     centerName: delivery.centerName || '-',
  //     sheduleTime: delivery.sheduleTime || '-',
  //     sheduleDate: delivery.sheduleDate || '-',
  //     createdAt: delivery.createdAt || '-',
  //     status: delivery.status || '-',
  //     outDlvrTime: delivery.outDlvrTime || '-',
  //     collectTime: delivery.collectTime || '-',
  //     driverEmpId: delivery.driverEmpId || '-',
  //     driverStartTime: delivery.driverStartTime || '-',
  //     returnTime: delivery.returnTime || '-',
  //     deliveryTime: delivery.deliveryTime || '-',
  //     deliveryTimeSlot: this.cleanTimeSlotText(
  //       delivery.deliveryTimeSlot ||
  //       this.formatDeliveryTimeSlot(delivery.sheduleTime)
  //     ),
  //     startedTime:
  //       delivery.returnTime ||
  //       this.formatTime(delivery.outDlvrTime || delivery.createdAt),
  //     status: delivery.status || '',
  //     sheduleTime: delivery.sheduleTime,
  //     outDlvrTime: delivery.outDlvrTime,
  //     createdAt: delivery.createdAt,
  //   }));
  // }

  // Helper method to remove "Within" text from time slot strings
  cleanTimeSlotText(text: string): string {
    if (!text) return 'N/A';

    let cleaned = text.replace(/Within\s*/gi, '').trim();

    const parts = cleaned.split('-').map((part) => {
      return part.trim().replace(/(\d)(AM|PM)/i, '$1 $2');
    });

    return parts.join(' - ');
  }

  onSearch(): void {
    if (!this.searchQuery) {
      this.filteredData = [...this.deliveries];
      return;
    }
    this.searchQuery = this.searchQuery.trim();
    const query = this.searchQuery.toLowerCase();
    this.filteredData = this.deliveries.filter(
      (item) =>
        (item.invNo && item.invNo.toLowerCase().includes(query)) ||
        (item.regCode && item.regCode.toLowerCase().includes(query))
    );
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredData = [...this.deliveries];
  }
}
