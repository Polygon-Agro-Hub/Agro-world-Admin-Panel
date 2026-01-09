import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../../../components/loading-spinner/loading-spinner.component';
import { DestributionService } from '../../../../../services/destribution-service/destribution-service.service';

interface Order {
  no: number;
  orderId: string;
  value: string;
  status: string;
  customerPhone: string;
  receiverPhone: string;
  receiversInfo: string;
  scheduledTimeSlot: string;
  payment: string;
  scheduleDate?: string;
  timeSlot?: string;
}

interface CenterDetails {
  centerId: number;
  centerName: string;
  centerRegCode: string;
}

@Component({
  selector: 'app-pikup-oders',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    CalendarModule,
    LoadingSpinnerComponent,
    FormsModule,
  ],
  templateUrl: './pikup-oders.component.html',
  styleUrl: './pikup-oders.component.css',
  providers: [DatePipe],
})
export class PikupOdersComponent implements OnChanges {
  @Input() centerObj!: CenterDetails;

  isLoading = false;
  hasData: boolean = false;
  orderCount: number = 0;
  orders: Order[] = [];

  // Filter properties
  selectedDate: Date | null = null;
  selectedTimeSlot: string = '';
  searchText: string = '';

  // Time slot options for dropdown
  timeSlotOptions = [
    { label: 'Morning (8AM-12PM)', value: 'morning' },
    { label: 'Afternoon (12PM-4PM)', value: 'afternoon' },
    { label: 'Evening (4PM-8PM)', value: 'evening' },
    { label: 'Night (8PM-12AM)', value: 'night' },
  ];

  constructor(
    private destributionService: DestributionService,
    private datePipe: DatePipe
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['centerObj'] && this.centerObj && this.centerObj.centerId > 0) {
      this.fetchPickedUpOrders();
    }
  }

  // FETCH ONLY PICKED UP ORDERS
  fetchPickedUpOrders(): void {
    this.isLoading = true;

    // Format date for API
    let formattedDate = '';
    if (this.selectedDate) {
      formattedDate = this.formatDateForApi(this.selectedDate);
    }

    // Fetch all orders from API (without activeTab parameter)
    this.destributionService
      .getDistributedCenterPickupOrders({
        companycenterId: this.centerObj.centerId,
        sheduleTime: this.selectedTimeSlot,
        date: formattedDate,
        searchText: this.searchText
        // DO NOT pass activeTab parameter
      })
      .subscribe({
        next: (res) => {
          if (res && res.data) {
            const dataArray = Array.isArray(res.data) ? res.data : [res.data];
            
            // CRITICAL: Filter for ONLY PICKED UP orders on client side
            const pickedUpData = this.filterOnlyPickedUp(dataArray);
            
            // Transform only the filtered data
            this.orders = this.transformApiData(pickedUpData);
            this.orderCount = this.orders.length;
            this.hasData = this.orderCount > 0;
          } else {
            this.orders = [];
            this.orderCount = 0;
            this.hasData = false;
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching orders:', error);
          this.orders = [];
          this.orderCount = 0;
          this.hasData = false;
          this.isLoading = false;
        },
      });
  }

  // Filter ONLY for Picked Up orders (exclude Ready to Pickup)
  private filterOnlyPickedUp(apiData: any[]): any[] {
    return apiData.filter(item => {
      const status = (item.status || item.orderStatus || '').toLowerCase().trim();
      
      // Include only orders with "picked up" status (not "ready")
      const isPickedUp = status.includes('picked') || 
                        status.includes('picked_up') || 
                        status.includes('picked up') ||
                        status.includes('collected') ||
                        status.includes('delivered_to_customer');
      
      const isReady = status.includes('ready') || 
                     status.includes('ready_for_pickup') || 
                     status.includes('ready to pickup');
      
      return isPickedUp && !isReady;
    });
  }

  private formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Transform API data to match your Order interface
  private transformApiData(apiData: any[]): Order[] {
    return apiData.map((item, index) => ({
      no: index + 1,
      orderId: item.invNo || item.orderId || `ORD-${index + 1000}`,
      value: item.fullTotal
        ? `Rs. ${parseFloat(item.fullTotal).toFixed(2)}`
        : 'Rs. 0.00',
      status: 'Picked Up', // Force status for this component
      customerPhone: this.formatPhoneNumber(
        item.customerPhoneCode,
        item.customerPhoneNumber
      ),
      receiverPhone: this.formatPhoneNumber(
        item.receiverPhoneCode,
        item.receiverPhone
      ),
      receiversInfo: this.getReceiverInfo(item),
      scheduledTimeSlot: this.formatScheduledTimeSlot(item),
      payment: this.getPaymentStatus(item.isPaid),
      scheduleDate: item.scheduleDate || item.sheduleDate,
      timeSlot: item.timeSlot || item.sheduleTime,
    }));
  }

  // Format scheduled time slot to match the image format: "8AM - 2PM, June 2, 2025"
  private formatScheduledTimeSlot(item: any): string {
    const scheduleDate = item.scheduleDate || item.sheduleDate;
    const timeSlot = item.timeSlot || item.sheduleTime;
    
    if (!scheduleDate) {
      return this.getFormattedTimeSlotForDisplay(timeSlot) || 'N/A';
    }
    
    const formattedDate = this.formatDisplayDate(scheduleDate);
    const formattedTimeSlot = this.getFormattedTimeSlotForDisplay(timeSlot);
    
    return `${formattedTimeSlot}, ${formattedDate}`;
  }

  // Helper method to format time slot for display
  private getFormattedTimeSlotForDisplay(timeSlot: string): string {
    if (!timeSlot) return '';
    
    const timeSlotLower = timeSlot.toLowerCase();
    
    if (timeSlotLower.includes('8-12') || timeSlotLower.includes('8am-12pm') || timeSlotLower.includes('morning')) {
      return '8AM - 12PM';
    } else if (timeSlotLower.includes('12-4') || timeSlotLower.includes('12pm-4pm') || timeSlotLower.includes('afternoon')) {
      return '12PM - 4PM';
    } else if (timeSlotLower.includes('4-8') || timeSlotLower.includes('4pm-8pm') || timeSlotLower.includes('evening')) {
      return '4PM - 8PM';
    } else if (timeSlotLower.includes('8pm-12am') || timeSlotLower.includes('night')) {
      return '8PM - 12AM';
    }
    
    const timeRange = timeSlot.match(/(\d{1,2}(?:AM|PM)?)\s*[-–]\s*(\d{1,2}(?:AM|PM)?)/i);
    if (timeRange) {
      const startTime = this.formatTimeComponent(timeRange[1]);
      const endTime = this.formatTimeComponent(timeRange[2]);
      return `${startTime} - ${endTime}`;
    }
    
    return timeSlot;
  }

  // Helper method to format time components
  private formatTimeComponent(time: string): string {
    time = time.trim().toUpperCase();
    
    if (time.includes('AM') || time.includes('PM')) {
      return time.replace(/\s+/g, '').replace(/(\d+)(AM|PM)/i, '$1$2');
    }
    
    const hour = parseInt(time);
    if (!isNaN(hour)) {
      if (hour === 0) return '12AM';
      if (hour < 12) return `${hour}AM`;
      if (hour === 12) return '12PM';
      return `${hour - 12}PM`;
    }
    
    return time;
  }

  // Helper method to format phone numbers
  private formatPhoneNumber(code: string, number: string): string {
    if (!code && !number) return 'N/A';
    if (code && number) {
      const cleanCode = code.replace(/\s+/g, '');
      const cleanNumber = number.replace(/\s+/g, '');
      return `${cleanCode} ${cleanNumber}`;
    }
    return number || code || 'N/A';
  }

  // Helper method to get receiver info
  private getReceiverInfo(item: any): string {
    const infoParts = [];

    if (item.receiverName) infoParts.push(item.receiverName);
    if (item.firstName || item.lastName) {
      infoParts.push(`${item.firstName || ''} ${item.lastName || ''}`.trim());
    }

    if (item.receiverAddress)
      infoParts.push(`Address: ${item.receiverAddress}`);

    return infoParts.length > 0 ? infoParts.join(', ') : 'N/A';
  }

  // Update payment status
  private getPaymentStatus(isPaid: number | string): string {
    const paidStatus = parseInt(isPaid?.toString() || '0');

    if (paidStatus === 1) {
      return 'Paid';
    }

    return 'Pending';
  }

  // Add this method to format the scheduleDate for display
  formatDisplayDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return this.datePipe.transform(dateString, 'MMM d, yyyy') || 'N/A';
  }

  // Filter methods
  onDateChange(): void {
    this.fetchPickedUpOrders();
  }

  onTimeSlotChange(): void {
    this.fetchPickedUpOrders();
  }

  onSearch(): void {
    this.fetchPickedUpOrders();
  }

  clearSearch(): void {
    this.searchText = '';
    this.fetchPickedUpOrders();
  }

  // Navigation methods for view details
  viewReceiverInfo(order: Order): void {
    console.log('View receiver info for:', order);
    // Implement your modal or navigation logic here
  }

  viewOrderDetails(order: Order): void {
    console.log('View order details for:', order);
    // Implement your modal or navigation logic here
  }

  // Function to get payment status color
  getPaymentColor(payment: string): string {
    switch(payment) {
      case 'Paid': return 'text-green-600 dark:text-green-400 font-semibold';
      case 'Pending': return 'text-yellow-600 dark:text-yellow-400 font-semibold';
      case 'Failed': return 'text-red-600 dark:text-red-400 font-semibold';
      default: return 'text-textLight dark:text-textDark';
    }
  }
}