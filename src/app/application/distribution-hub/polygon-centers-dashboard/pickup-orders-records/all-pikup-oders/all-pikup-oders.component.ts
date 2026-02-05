import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../../../components/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PikupOderRecordDetailsComponent } from '../popup-component/pikup-oder-record-details/pikup-oder-record-details.component';
import { ReciverinfoPopupComponent } from '../reciverinfo-popup/reciverinfo-popup.component';

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
  originalData?: any; // Store original API data for popup
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
    PikupOderRecordDetailsComponent,
    ReciverinfoPopupComponent,
  ],
  templateUrl: './all-pikup-oders.component.html',
  styleUrl: './all-pikup-oders.component.css',
  providers: [DatePipe],
})
export class AllPikupOdersComponent implements OnChanges {
  @Input() centerObj!: CenterDetails;
  @Input() activeTab: string = 'All';
  @Input() orders: any[] = []; // Orders from parent

  // Output events for parent to handle filters
  @Output() dateChange = new EventEmitter<Date | null>();
  @Output() timeSlotChange = new EventEmitter<string>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() clearSearch = new EventEmitter<void>();
  @Output() clearDate = new EventEmitter<void>();

  // Local filter properties for child component
  selectedDate: Date | null = null;
  selectedTimeSlot: string = '';
  searchText: string = '';

  // Time slot options for dropdown
  timeSlotOptions = [
  { label: '8AM-2PM', value: '8AM-2PM' },
  { label: '2PM-8PM', value: '2PM-8PM' }
];

  isLoading = false; // Not used for API calls anymore
  hasData: boolean = false;
  orderCount: number = 0;
  transformedOrders: Order[] = [];

  // Popup control
  showDetailsPopup: boolean = false;
  selectedOrderId: number | undefined; // This should be processOrderId for API
  selectedOrderDisplayId: string = ''; // This is for display (invoice/order number)
  selectedOrderData: any = null;

  showReceiverPopup: boolean = false;
  selectedReceiverInfo: any = null;

  constructor(private datePipe: DatePipe) {}

  // In each child component, update ngOnChanges
// In AllPikupOdersComponent - update ngOnChanges:

ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges triggered:', changes);
    
    if (changes['orders']) {
      console.log('Orders changed, transforming data...');
      this.transformData();
    }
    
    // Update local filter values when parent passes them
    if (changes['searchText']) {
      console.log('Search text changed from parent:', changes['searchText'].currentValue);
      this.searchText = changes['searchText'].currentValue || '';
    }
    
    if (changes['selectedDate']) {
      console.log('Date changed from parent:', changes['selectedDate'].currentValue);
      this.selectedDate = changes['selectedDate'].currentValue;
    }
    
    if (changes['selectedTimeSlot']) {
      console.log('Time slot changed from parent:', changes['selectedTimeSlot'].currentValue);
      // Convert backend format to UI format for dropdown
      const backendTimeSlot = changes['selectedTimeSlot'].currentValue || '';
      this.selectedTimeSlot = this.convertTimeSlotToUIFormat(backendTimeSlot);
    } else if (this.selectedTimeSlot === undefined) {
      // Initialize if undefined
      this.selectedTimeSlot = '';
    }
  }

  private transformData(): void {
    if (this.orders && this.orders.length > 0) {
      this.transformedOrders = this.transformApiData(this.orders);
      this.orderCount = this.transformedOrders.length;
      this.hasData = this.orderCount > 0;
    } else {
      this.transformedOrders = [];
      this.orderCount = 0;
      this.hasData = false;
    }
  }

  // Filter methods - emit events to parent
  onDateSelect(): void {
    this.dateChange.emit(this.selectedDate);
  }

  onDateClear(): void {
    this.selectedDate = null;
    this.clearDate.emit();
  }

  onTimeSlotSelect(): void {
    console.log('UI Time slot selected:', this.selectedTimeSlot);
    const backendTimeSlot = this.convertTimeSlotToBackendFormat(this.selectedTimeSlot);
    console.log('Converted to backend format:', backendTimeSlot);
    this.timeSlotChange.emit(backendTimeSlot);
  }

  onSearch(): void {
    this.searchChange.emit(this.searchText);
  }

  onClearSearch(): void {
    this.searchText = '';
    this.clearSearch.emit();
  }

  // Transform API data to match your Order interface
  private transformApiData(apiData: any[]): Order[] {
  // First transform the data with priority and timestamps
  const ordersWithPriority = apiData.map((item, index) => {
    const status = this.getOrderStatus(item.status || item.orderStatus);
    const statusPriority = this.getStatusPriority(status);
    const sortTimestamp = this.getSortTimestamp(item, status);
    
    return {
      no: index + 1, // This will be recalculated after sorting
      orderId: item.invNo || item.orderId || `ORD-${index + 1000}`,
      value: item.fullTotal
        ? `${parseFloat(item.fullTotal).toFixed(2)}`
        : '0.00',
      status: status,
      customerPhone: this.formatPhoneNumber(
        item.customerPhoneCode,
        item.customerPhoneNumber
      ),
      receiverPhone: this.formatPhoneNumber(
        item.receiverPhoneCode1,
        item.receiverPhone1
      ),
      receiversInfo: this.getReceiverInfo(item),
      scheduledTimeSlot: this.formatScheduledTimeSlot(item),
      payment: this.getPaymentStatus(item.isPaid),
      scheduleDate: item.scheduleDate || item.sheduleDate,
      timeSlot: item.timeSlot || item.sheduleTime,
      originalData: item,
      statusPriority: statusPriority,
      sortTimestamp: sortTimestamp
    };
  });

  // Sort orders: first by status priority, then by timestamp (descending)
  const sortedOrders = ordersWithPriority.sort((a, b) => {
    // First compare by status priority (lower number = higher priority)
    if (a.statusPriority !== b.statusPriority) {
      return a.statusPriority - b.statusPriority;
    }
    
    // For same status, sort by timestamp (most recent first)
    return b.sortTimestamp.getTime() - a.sortTimestamp.getTime();
  });

  // Reassign numbers after sorting
  return sortedOrders.map((order, index) => ({
    ...order,
    no: index + 1
  }));
}

  // Format scheduled time slot
private formatScheduledTimeSlot(item: any): string {
  const scheduleDate = item.scheduleDate || item.sheduleDate;
  const timeSlot = item.timeSlot || item.sheduleTime;

  if (!scheduleDate) {
    return this.getFormattedTimeSlotForDisplay(timeSlot) || 'N/A';
  }

  const formattedDate = this.formatDisplayDate(scheduleDate);
  const formattedTimeSlot = this.getFormattedTimeSlotForDisplay(timeSlot);

  // Return with time slot on top and date below
  return `${formattedTimeSlot}<br>${formattedDate}`;
}

  // Helper method to format time slot for display
  private getFormattedTimeSlotForDisplay(timeSlot: string): string {
  if (!timeSlot) return '';

  // Remove "Within " prefix if present
  const cleanTimeSlot = timeSlot.replace(/^Within\s*/i, '').trim();
  
  // Format nicely for display
  const displayFormatMap: { [key: string]: string } = {
    '8AM - 2PM': '8AM - 2PM',
    '2PM - 8PM': '2PM - 8PM',
    '8AM-2PM': '8AM - 2PM',
    '2PM-8PM': '2PM - 8PM'
  };

  return displayFormatMap[cleanTimeSlot] || cleanTimeSlot;
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

  viewReceiverInfo(order: Order): void {
  console.log('View receiver info for:', order);
  
  if (order.originalData) {
    const data = order.originalData;
    const title = data.customerTitle || data.receiverTitle || data.title || '';
    const fullName = data.fullName || 
                     data.receiverFullName || 
                     `${data.fillName || ''} ${data.lastName || ''}`.trim() ||
                     data.receiverName ||
                     '';
    
    // Combine title and name
    const receiverNameWithTitle = title && fullName 
      ? `${title} ${fullName}`.trim()
      : fullName || title || '--';
    
    this.selectedReceiverInfo = {
      orderId: order.orderId,
      receiverName: receiverNameWithTitle,
      receiverPhone1: this.formatPhoneNumber(
        data.receiverPhoneCode1, 
        data.receiverPhone1
      ),
      receiverPhone2: (data.receiverPhone2 || data.receiverPhoneCode2) 
        ? this.formatPhoneNumber(data.receiverPhoneCode2, data.receiverPhone2) // FIXED: removed extra "Code"
        : "--",
      customerName: `${data.title || ''} ${data.firstName || ''} ${data.lastName || ''}`.trim(),
      customerPhone: this.formatPhoneNumber(
        data.customerPhoneCode, 
        data.customerPhoneNumber
      ),
      platform: data.orderApp || 'Salesdash',
      orderPlaced: this.formatOrderDate(data.orderCreatedAt),
      scheduledTime: this.formatScheduledTime(data),
      // Store title separately if needed for display
      title: title
    };
    this.showReceiverPopup = true;
    
    console.log('Receiver Info Data:', this.selectedReceiverInfo);
    console.log('Phone 2 details:', {
      receiverPhoneCode2: data.receiverPhoneCode2,
      receiverPhone2: data.receiverPhone2,
      formatted: (data.receiverPhone2 || data.receiverPhoneCode2) 
        ? this.formatPhoneNumber(data.receiverPhoneCode2, data.receiverPhone2)
        : "--"
    });
  }
}

private formatOrderDate(dateString: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return this.datePipe.transform(date, 'h:mm a \'on\' MMMM dd, yyyy') || 'N/A';
}

private formatScheduledTime(item: any): string {
  const scheduleDate = item.scheduleDate || item.sheduleDate;
  const timeSlot = item.timeSlot || item.sheduleTime;
  
  if (!scheduleDate) return 'N/A';
  
  const date = new Date(scheduleDate);
  const formattedDate = this.datePipe.transform(date, 'MMMM dd, yyyy') || '';
  const formattedTimeSlot = this.getFormattedTimeSlotForDisplay(timeSlot);
  
  return `${formattedTimeSlot} on ${formattedDate}`;
}

closeReceiverPopup(): void {
  this.showReceiverPopup = false;
  this.selectedReceiverInfo = null;
}

  // Open order details popup
  openOrderDetails(order: Order): void {
    console.log('View order details for:', order);

    // For display in popup header (show invoice/order number)
    this.selectedOrderDisplayId = order.orderId;

    // For API call (use processOrderId from original data)
    if (order.originalData) {
      // Debug: Log all available fields
      console.log('Original data fields:', Object.keys(order.originalData));
      console.log('Full original data:', order.originalData);

      // Try to get the processOrderId from original data
      const processOrderId =
        order.originalData.processOrderId ||
        order.originalData.id ||
        order.originalData.orderId;

      if (processOrderId) {
        // Pass the processOrderId directly to API
        this.selectedOrderId = processOrderId;
        this.selectedOrderData = order.originalData;
        this.showDetailsPopup = true;

        console.log('Popup opened with:');
        console.log('- Display ID (invoice):', this.selectedOrderDisplayId);
        console.log('- API ID (processOrderId):', this.selectedOrderId);
      } else {
        console.warn('No processOrderId found in:', order.originalData);
        // Fallback: try to use any available ID
        const possibleId = order.originalData.id || order.originalData.orderId;
        if (possibleId) {
          this.selectedOrderId = possibleId;
          this.selectedOrderData = order.originalData;
          this.showDetailsPopup = true;
        }
      }
    } else {
      console.warn('No original data available for order:', order);
    }
  }

  // Close the details popup
  closeDetailsPopup(): void {
    this.showDetailsPopup = false;
    this.selectedOrderId = undefined;
    this.selectedOrderData = null;
    this.selectedOrderDisplayId = '';
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
    if (payment === 'Paid') {
      return '   dark:text-white';
    } else if (payment === 'Pending') {
      return '   dark:text-white';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }

  onClearTimeSlot(): void {
  this.selectedTimeSlot = '';
  this.timeSlotChange.emit('');
}

private convertTimeSlotToBackendFormat(timeSlot: string): string {
    if (!timeSlot) return '';
    
    const conversionMap: { [key: string]: string } = {
      '8AM-2PM': 'Within 8AM - 2PM',
      '2PM-8PM': 'Within 2PM - 8PM',
      '8AM - 2PM': 'Within 8AM - 2PM',
      '2PM - 8PM': 'Within 2PM - 8PM'
    };
    
    return conversionMap[timeSlot] || timeSlot;
  }

  private convertTimeSlotToUIFormat(timeSlot: string): string {
    if (!timeSlot) return '';
    
    // Remove "Within " prefix and clean up
    const cleanTimeSlot = timeSlot.replace(/^Within\s*/i, '').trim();
    
    // Convert to consistent format for dropdown
    const uiFormatMap: { [key: string]: string } = {
      '8AM - 2PM': '8AM-2PM',
      '2PM - 8PM': '2PM-8PM',
      '8AM-2PM': '8AM-2PM',
      '2PM-8PM': '2PM-8PM'
    };
    
    return uiFormatMap[cleanTimeSlot] || cleanTimeSlot;
  }

  private getStatusPriority(status: string): number {
  const priorityMap: { [key: string]: number } = {
    'Picked Up': 1,        // Highest priority
    'Ready to Pickup': 2,  // Second priority
    'Processing': 3,
    'Pending': 4,
    'Delivered': 5,
    'Cancelled': 6
  };
  
  return priorityMap[status] || 7; // Default lowest priority
}

private getSortTimestamp(item: any, status: string): Date {
  // For "Picked Up" orders, use pickup timestamp if available
  if (status === 'Picked Up') {
    const pickupTime = item.pickupTime || item.pickedUpAt || item.updatedAt;
    if (pickupTime) {
      return new Date(pickupTime);
    }
  }
  
  // For "Ready to Pickup" orders, use status change timestamp if available
  if (status === 'Ready to Pickup') {
    const readyTime = item.readyAt || item.statusUpdatedAt || item.updatedAt;
    if (readyTime) {
      return new Date(readyTime);
    }
  }
  
  // Default: use order creation time or current date
  const orderTime = item.orderCreatedAt || item.createdAt || new Date();
  return new Date(orderTime);
}
}

interface CenterDetails {
  centerId: number;
  centerName: string;
  centerRegCode: string;
}
