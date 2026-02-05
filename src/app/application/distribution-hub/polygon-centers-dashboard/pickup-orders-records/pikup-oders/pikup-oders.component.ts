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
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../../../components/loading-spinner/loading-spinner.component';
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
  originalData?: any;
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
    PikupOderRecordDetailsComponent,
    ReciverinfoPopupComponent,
  ],
  templateUrl: './pikup-oders.component.html',
  styleUrl: './pikup-oders.component.css',
  providers: [DatePipe],
})
export class PikupOdersComponent implements OnChanges {
  @Input() centerObj!: CenterDetails;
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

  // Time slot options for dropdown - updated format
  timeSlotOptions = [
    { label: '8AM - 2PM', value: '8AM-2PM' },
    { label: '2PM - 8PM', value: '2PM-8PM' }
  ];

  isLoading = false;
  hasData: boolean = false;
  orderCount: number = 0;
  transformedOrders: Order[] = [];
  showDetailsPopup: boolean = false;
  selectedOrderId: number | undefined;
  selectedOrderDisplayId: string = '';
  selectedOrderData: any = null;

  showReceiverPopup: boolean = false;
  selectedReceiverInfo: any = null;

  constructor(private datePipe: DatePipe) {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log('PikupOders - ngOnChanges triggered:', changes);
    
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

  // Method to convert UI time slot to backend format (WITH "Within")
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

  // Method to convert backend time slot to UI format (WITHOUT "Within")
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

  private transformData(): void {
    console.log('Transforming data, orders count:', this.orders?.length);
    if (this.orders && this.orders.length > 0) {
      this.transformedOrders = this.transformApiData(this.orders);
      this.orderCount = this.transformedOrders.length;
      this.hasData = this.orderCount > 0;
      console.log('Transformed orders:', this.transformedOrders);
    } else {
      this.transformedOrders = [];
      this.orderCount = 0;
      this.hasData = false;
      console.log('No orders to transform');
    }
  }

  // Filter methods - emit events to parent
  onDateSelect(): void {
    console.log('Date selected:', this.selectedDate);
    this.dateChange.emit(this.selectedDate);
  }

  onDateClear(): void {
    console.log('Date cleared');
    this.selectedDate = null;
    this.clearDate.emit();
  }

  onTimeSlotSelect(): void {
    console.log('UI Time slot selected:', this.selectedTimeSlot);
    const backendTimeSlot = this.convertTimeSlotToBackendFormat(this.selectedTimeSlot);
    console.log('Converted to backend format:', backendTimeSlot);
    this.timeSlotChange.emit(backendTimeSlot);
  }

  // Add method to clear time slot
  onClearTimeSlot(): void {
    console.log('Time slot cleared');
    this.selectedTimeSlot = '';
    // Send empty string to backend
    this.timeSlotChange.emit('');
  }

  onSearch(): void {
    console.log('Search triggered with:', this.searchText);
    this.searchChange.emit(this.searchText);
  }

  onClearSearch(): void {
    console.log('Search cleared');
    this.searchText = '';
    this.clearSearch.emit();
  }

  // Transform API data to match your Order interface
  // Update the transformApiData method to include sorting by pickup time
private transformApiData(apiData: any[]): Order[] {
  // First, create a copy of the data to avoid mutating the original
  const dataToProcess = [...apiData];
  
  // Sort by pickup timestamp (most recent first)
  const sortedData = dataToProcess.sort((a, b) => {
    // Try to get pickup timestamps - check various possible field names
    const pickupTimeA = a.pickupTime || a.pickedUpAt || a.pickupAt || a.updatedAt;
    const pickupTimeB = b.pickupTime || b.pickedUpAt || b.pickupAt || b.updatedAt;
    
    // If both have pickup times, compare them (most recent first)
    if (pickupTimeA && pickupTimeB) {
      return new Date(pickupTimeB).getTime() - new Date(pickupTimeA).getTime();
    }
    
    // If only one has a pickup time, put it first
    if (pickupTimeA && !pickupTimeB) return -1;
    if (!pickupTimeA && pickupTimeB) return 1;
    
    // If no pickup times, try order creation date (as fallback)
    const createdA = a.orderCreatedAt;
    const createdB = b.orderCreatedAt;
    
    if (createdA && createdB) {
      return new Date(createdB).getTime() - new Date(createdA).getTime();
    }
    
    // Fallback to schedule date if available
    const scheduleA = a.scheduleDate || a.sheduleDate;
    const scheduleB = b.scheduleDate || b.sheduleDate;
    
    if (scheduleA && scheduleB) {
      return new Date(scheduleB).getTime() - new Date(scheduleA).getTime();
    }
    
    // Last resort: alphabetical by order ID (descending)
    return (b.orderId || b.invNo || '').localeCompare(a.orderId || a.invNo || '');
  });

  // Now transform the sorted data
  return sortedData.map((item, index) => ({
    no: index + 1,
    orderId: item.invNo || item.orderId || `ORD-${index + 1000}`,
    value: this.formatCurrencyValue(item.fullTotal),
    status: 'Picked Up',
    customerPhone: this.formatPhoneNumber(
      item.customerPhoneCode,
      item.customerPhoneNumber,
    ),
    receiverPhone: this.formatPhoneNumber(
      item.receiverPhoneCode1,
      item.receiverPhone1,
    ),
    receiversInfo: this.getReceiverInfo(item),
    scheduledTimeSlot: this.formatScheduledTimeSlot(item),
    payment: this.getPaymentStatus(item),
    scheduleDate: item.scheduleDate || item.sheduleDate,
    timeSlot: item.timeSlot || item.sheduleTime,
    originalData: item,
  }));
}

  // NEW METHOD: Format currency value with comma separators
  private formatCurrencyValue(value: any): string {
    if (value === null || value === undefined || value === '') {
      return '0.00';
    }
    
    // Convert to number
    const numericValue = parseFloat(value);
    
    // Check if it's a valid number
    if (isNaN(numericValue)) {
      return '0.00';
    }
    
    // Format with comma separators for thousands
    return numericValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // NEW: Update time slot display formatting to remove "Within"
  private getFormattedTimeSlotForDisplay(timeSlot: string): string {
    if (!timeSlot) return '';

    // Remove "Within " prefix if present
    const cleanTimeSlot = timeSlot.replace(/^Within\s*/i, '').trim();
    
    // Format nicely for display
    const displayFormatMap: { [key: string]: string } = {
      '8AM - 2PM': '8AM - 2PM',
      '2PM - 8PM': '2PM - 8PM',
      '8AM-2PM': '8AM - 2PM',
      '2PM-8PM': '2PM - 8PM',
      '8AM-2 PM': '8AM - 2PM',
      '2PM-8 PM': '2PM - 8PM'
    };

    return displayFormatMap[cleanTimeSlot] || cleanTimeSlot;
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

    // Return with time slot on top and date below (like in screenshot)
    return `${formattedTimeSlot}<br>${formattedDate}`;
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

 private getPaymentStatus(item: any): string {
  const isPaid = parseInt(item.isPaid?.toString() || '0');
  const paymentMethod = item.paymentMethod || '';
  const fullTotal = item.fullTotal || 0;
  
  // If payment method is Cash, isPaid = 1, and fullTotal exists, show "Received"
  if (paymentMethod === 'Cash' && isPaid === 1 && fullTotal > 0) {
    return 'Received';
  }
  
  // For other payment methods or conditions
  if (isPaid === 1) {
    return 'Paid';
  }
  
  return 'Pending';
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
      const title =
        data.customerTitle || data.receiverTitle || data.title || '';
      const fullName =
        data.fullName ||
        data.receiverFullName ||
        `${data.fillName || ''} ${data.lastName || ''}`.trim() ||
        data.receiverName ||
        '';

      // Combine title and name
      const receiverNameWithTitle =
        title && fullName
          ? `${title} ${fullName}`.trim()
          : fullName || title || '--';

      this.selectedReceiverInfo = {
        orderId: order.orderId,
        receiverName: receiverNameWithTitle,
        receiverPhone1: this.formatPhoneNumber(
          data.receiverPhoneCode1,
          data.receiverPhone1,
        ),
        receiverPhone2:
          data.receiverPhone2 || data.receiverPhoneCode2
            ? this.formatPhoneNumber(
                data.receiverPhoneCode2,
                data.receiverPhone2,
              )
            : '--',
        customerName:
          `${data.title || ''} ${data.firstName || ''} ${data.lastName || ''}`.trim(),
        customerPhone: this.formatPhoneNumber(
          data.customerPhoneCode,
          data.customerPhoneNumber,
        ),
        platform: data.orderApp || 'Salesdash',
        orderPlaced: this.formatOrderDate(data.orderCreatedAt),
        scheduledTime: this.formatScheduledTime(data),
        title: title,
      };
      this.showReceiverPopup = true;

      console.log('Receiver Info Data:', this.selectedReceiverInfo);
    }
  }

  private formatOrderDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return this.datePipe.transform(date, "h:mm a 'on' MMMM dd, yyyy") || 'N/A';
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

  // Function to get payment status color
  getPaymentColor(payment: string): string {
    switch (payment) {
      case 'Paid':
        return 'text-green-600 dark:text-green-400 font-semibold';
      case 'Pending':
        return 'text-yellow-600 dark:text-yellow-400 font-semibold';
      case 'Received':
        return 'text-green-600 dark:text-green-400 font-semibold';
      case 'Failed':
        return 'text-red-600 dark:text-red-400 font-semibold';
      default:
        return 'text-textLight dark:text-textDark';
    }
  }

  openOrderDetails(order: Order): void {
    console.log('=== openOrderDetails triggered ===');
    console.log('Order clicked:', order);
    console.log('Order has originalData:', !!order.originalData);

    if (order.originalData) {
      console.log('Original data keys:', Object.keys(order.originalData));
      console.log('Full original data:', order.originalData);
    }

    this.selectedOrderDisplayId = order.orderId;
    console.log('Display ID set to:', this.selectedOrderDisplayId);

    if (order.originalData) {
      const processOrderId =
        order.originalData.processOrderId ||
        order.originalData.id ||
        order.originalData.orderId ||
        this.extractOrderIdFromDisplay(order.orderId);

      console.log('Extracted processOrderId:', processOrderId);

      if (processOrderId) {
        const numericId =
          typeof processOrderId === 'string'
            ? parseInt(processOrderId, 10)
            : processOrderId;

        if (!isNaN(numericId) && numericId !== 0) {
          this.selectedOrderId = numericId;
        } else {
          this.selectedOrderId = processOrderId;
        }

        this.selectedOrderData = order.originalData;
        this.showDetailsPopup = true;

        console.log('Popup opened successfully');
        console.log('- Display ID (invoice):', this.selectedOrderDisplayId);
        console.log('- API ID (processOrderId):', this.selectedOrderId);
        console.log('- Original data type:', typeof this.selectedOrderData);
        console.log('- showDetailsPopup set to:', this.showDetailsPopup);
      } else {
        console.warn('No valid processOrderId found in original data');
        console.warn('Original data:', order.originalData);
        this.showErrorMessage(
          'Unable to open order details: No valid order ID found.',
        );
      }
    } else {
      console.warn('No original data available for order:', order);
      this.showErrorMessage('Unable to open order details: No data available.');
    }
  }

  // Helper method to extract numeric ID from display ID
  private extractOrderIdFromDisplay(displayId: string): number | null {
    const match = displayId.match(/\d+/);
    if (match) {
      return parseInt(match[0], 10);
    }
    return null;
  }

  // Helper method to show error messages
  private showErrorMessage(message: string): void {
    console.error(message);
    alert(message);
  }

  closeDetailsPopup(): void {
    console.log('Closing details popup');
    this.showDetailsPopup = false;
    this.selectedOrderId = undefined;
    this.selectedOrderData = null;
    this.selectedOrderDisplayId = '';
  }
}