import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../../../components/loading-spinner/loading-spinner.component';
import { DestributionService } from '../../../../../services/destribution-service/destribution-service.service';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

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

@Component({
  selector: 'app-all-pikup-oders',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    CalendarModule,
    LoadingSpinnerComponent,
    FormsModule,
  ],
  templateUrl: './all-pikup-oders.component.html',
  styleUrl: './all-pikup-oders.component.css',
  providers: [DatePipe],
})
export class AllPikupOdersComponent implements OnChanges {
  @Input() centerObj!: CenterDetails;
  @Input() activeTab: string = 'All'; // Receive activeTab from parent

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

  ngOnChanges(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.isLoading = true;

    // Format date for API
    let formattedDate = '';
    if (this.selectedDate) {
      const year = this.selectedDate.getFullYear();
      const month = (this.selectedDate.getMonth() + 1)
        .toString()
        .padStart(2, '0');
      const day = this.selectedDate.getDate().toString().padStart(2, '0');
      formattedDate = `${year}-${month}-${day}`;
    }

    // Map the activeTab to the service parameter
    let activeTabParam: 'ready-to-pickup' | 'picked-up' | undefined;
    
    if (this.activeTab === 'Ready to Pickup') {
      activeTabParam = 'ready-to-pickup';
    } else if (this.activeTab === 'Picked Up') {
      activeTabParam = 'picked-up';
    }
    // If activeTab is 'All', we don't pass activeTab parameter (show both statuses)

    // Call the service with new signature
    this.destributionService
      .getDistributedCenterPickupOrders({
        companycenterId: this.centerObj.centerId,
        sheduleTime: this.selectedTimeSlot,
        date: formattedDate,
        searchText: this.searchText,
        activeTab: activeTabParam
      })
      .subscribe({
        next: (res) => {
          if (res && res.data) {
            const dataArray = Array.isArray(res.data) ? res.data : [res.data];
            const transformedOrders = this.transformApiData(dataArray);
            
            // Filter based on activeTab if not 'All'
            if (this.activeTab !== 'All') {
              this.orders = this.filterOrdersByActiveTab(transformedOrders);
            } else {
              this.orders = this.filterOrdersByStatus(transformedOrders);
            }
            
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
          console.error('Error fetching pickup orders:', error);
          this.orders = [];
          this.orderCount = 0;
          this.hasData = false;
          this.isLoading = false;
        },
      });
  }

  // Filter orders based on active tab
  private filterOrdersByActiveTab(orders: Order[]): Order[] {
    if (this.activeTab === 'Ready to Pickup') {
      return orders.filter(order => 
        order.status === 'Ready to Pickup' || 
        order.status.toLowerCase().includes('ready')
      );
    } else if (this.activeTab === 'Picked Up') {
      return orders.filter(order => 
        order.status === 'Picked Up' || 
        order.status.toLowerCase().includes('picked')
      );
    }
    return orders;
  }

  // Original filter method (for All tab)
  private filterOrdersByStatus(orders: Order[]): Order[] {
    const allowedStatuses = [
      'Picked Up',
      'Ready to Pickup',
      'Ready for Pickup',
      'Pending',
    ];

    return orders.filter((order) => {
      const isAllowedStatus = allowedStatuses.some((status) =>
        order.status.toLowerCase().includes(status.toLowerCase())
      );
      return isAllowedStatus;
    });
  }

  // Transform API data to match your Order interface
  private transformApiData(apiData: any[]): Order[] {
    return apiData.map((item, index) => ({
      no: index + 1,
      orderId: item.invNo || item.orderId || `ORD-${index + 1000}`,
      value: item.fullTotal
        ? `Rs. ${parseFloat(item.fullTotal).toFixed(2)}`
        : 'Rs. 0.00',
      status: this.getOrderStatus(item.status || item.orderStatus),
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

  // Update the order status mapping
  private getOrderStatus(status: string): string {
    const statusLower = status?.toLowerCase() || '';

    const statusMap: { [key: string]: string } = {
      pending: 'Pending',
      processing: 'Processing',
      'ready to pickup': 'Ready to Pickup',
      'ready for pickup': 'Ready to Pickup',
      ready_for_pickup: 'Ready to Pickup',
      'picked up': 'Picked Up',
      picked_up: 'Picked Up',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      completed: 'Delivered',
    };

    return statusMap[statusLower] || 'Pending';
  }

  // Add this method to format the scheduleDate for display
  formatDisplayDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return this.datePipe.transform(dateString, 'MMM d, yyyy') || 'N/A';
  }

  // Filter methods
  clearDate(): void {
    this.selectedDate = null;
    this.fetchData();
  }

  clearTimeSlot(): void {
    this.selectedTimeSlot = '';
    this.fetchData();
  }

  onSearch(): void {
    this.fetchData();
  }

  clearSearch(): void {
    this.searchText = '';
    this.fetchData();
  }

  // Navigation methods for view details
  viewReceiverInfo(order: Order): void {
    console.log('View receiver info for:', order);
  }

  viewOrderDetails(order: Order): void {
    console.log('View order details for:', order);
  }

  // Get status badge class
  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'Ready to Pickup': 'bg-[#ACFBFF] text-[#00818A]',
      'Picked Up': 'bg-[#BBFFC6] text-[#308233]',
    };

    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  // Get payment badge class
  getPaymentClass(payment: string): string {
    const paymentClasses: { [key: string]: string } = {
      Paid: 'text-black dark:text-white',
      Pending: 'text-black dark:text-white',
    };

    return paymentClasses[payment] || 'bg-gray-100 text-gray-800';
  }
}

interface CenterDetails {
  centerId: number;
  centerName: string;
  centerRegCode: string;
}