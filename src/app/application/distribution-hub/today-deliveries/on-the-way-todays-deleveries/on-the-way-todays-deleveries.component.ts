import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface DeliveryItem {
  no: number;
  invNo: string; // Changed from orderId to invNo to match backend
  regCode: string; // Changed from centre to regCode to match backend
  driver: string;
  phoneNumber: string;
  deliveryTimeSlot: string; // This will come from sheduleTime
  startedTime: string; // This will come from outDlvrTime or createdAt
  status: string;
  sheduleTime?: string;
  outDlvrTime?: string;
  createdAt?: string;
}

@Component({
  selector: 'app-on-the-way-todays-deleveries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './on-the-way-todays-deleveries.component.html',
  styleUrl: './on-the-way-todays-deleveries.component.css',
})
export class OnTheWayTodaysDeleveriesComponent implements OnChanges {
  @Input() deliveries: any[] = [];
  
  searchQuery: string = '';
  
  // Transformed delivery data for the table
  deliveryData: DeliveryItem[] = [];
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['deliveries'] && this.deliveries) {
      this.transformDeliveryData();
    }
  }
  
  transformDeliveryData(): void {
  // Transform the backend data to match the frontend interface
  this.deliveryData = this.deliveries.map((delivery, index) => ({
    no: index + 1,
    invNo: delivery.invNo || '',
    regCode: delivery.regCode || '',
    driver: delivery.driver || delivery.driverEmpId || 'N/A', // Use driverEmpId if driver not provided
    phoneNumber: delivery.phoneNumber || 'N/A',
    deliveryTimeSlot: this.formatTimeSlot(delivery.sheduleTime),
    // UPDATED: Use startedTime from parent (which maps to driverStartTime from backend)
    startedTime: delivery.startedTime || this.formatTime(delivery.driverStartTime || delivery.outDlvrTime || delivery.createdAt),
    status: delivery.status || '',
    sheduleTime: delivery.sheduleTime,
    outDlvrTime: delivery.outDlvrTime,
    createdAt: delivery.createdAt,
    driverStartTime: delivery.driverStartTime // Keep this for reference
  }));
}
  
  formatTimeSlot(timeString: string): string {
    if (!timeString) return 'N/A';
    
    try {
      // Assuming timeString is in format 'HH:MM:SS'
      const time = new Date(`2000-01-01T${timeString}`);
      const hours = time.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      
      // Create time slot (assuming 6-hour slots as per your dummy data)
      if (hours < 14) {
        return `8AM - 2PM`;
      } else {
        return `2PM - 8PM`;
      }
    } catch {
      return timeString;
    }
  }
  
  formatTime(timeString: string): string {
    if (!timeString) return 'N/A';
    
    try {
      const time = new Date(`2000-01-01T${timeString}`);
      const hours = time.getHours();
      const minutes = time.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      
      return `${formattedHours}.${minutes.toString().padStart(2, '0')}${ampm}`;
    } catch {
      // Try to extract time from datetime string
      const timeMatch = timeString.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}.${minutes}${ampm}`;
      }
      return timeString;
    }
  }

  // Filtered deliveries based on search
  get filteredDeliveries(): DeliveryItem[] {
    if (!this.searchQuery.trim()) {
      return this.deliveryData;
    }
    
    const query = this.searchQuery.toLowerCase();
    return this.deliveryData.filter(delivery =>
      delivery.invNo.toLowerCase().includes(query) ||
      delivery.regCode.toLowerCase().includes(query) ||
      (delivery.driver && delivery.driver.toLowerCase().includes(query))
    );
  }

  // Clear search
  clearSearch(): void {
    this.searchQuery = '';
  }

  // Handle search button click
  onSearch(): void {
    // The filteredDeliveries getter will automatically update with the searchQuery
    console.log('Searching for:', this.searchQuery);
  }

  // Handle details button click
  onDetailsClick(delivery: DeliveryItem): void {
    console.log('Viewing details for invoice:', delivery.invNo);
    // You can implement navigation or modal opening here
  }

  // Get total count
  get totalCount(): number {
    return this.deliveryData.length;
  }
}