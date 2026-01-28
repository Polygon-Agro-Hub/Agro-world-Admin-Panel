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
  originalData?: any;
}

@Component({
  selector: 'app-ready-to-pikup',
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
  templateUrl: './ready-to-pikup.component.html',
  styleUrl: './ready-to-pikup.component.css',
  providers: [DatePipe],
})
export class ReadyToPikupComponent implements OnChanges {
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

  // Time slot options for dropdown
  timeSlotOptions = [{ label: '8AM-2PM' }, { label: '2PM-8PM' }];

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
    if (changes['orders'] || changes['centerObj']) {
      this.transformData();
    }
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
    console.log('Time slot selected:', this.selectedTimeSlot);
    this.timeSlotChange.emit(this.selectedTimeSlot);
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
  private transformApiData(apiData: any[]): Order[] {
    return apiData.map((item, index) => ({
      no: index + 1,
      orderId: item.invNo || item.orderId || `ORD-${index + 1000}`,
      value: item.fullTotal
        ? `${parseFloat(item.fullTotal).toFixed(2)}`
        : ' 0.00',
      status: 'Ready to Pickup', // Force status for this component
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
      payment: this.getPaymentStatus(item.isPaid),
      scheduleDate: item.scheduleDate || item.sheduleDate,
      timeSlot: item.timeSlot || item.sheduleTime,
      originalData: item, // CRITICAL: Preserve original data for popup
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

    // Return with time slot on top and date below (like in screenshot)
    return `${formattedTimeSlot}<br>${formattedDate}`;
  }

  // Helper method to format time slot for display
  private getFormattedTimeSlotForDisplay(timeSlot: string): string {
    if (!timeSlot) return '';

    const timeSlotLower = timeSlot.toLowerCase();

    if (
      timeSlotLower.includes('8-12') ||
      timeSlotLower.includes('8am-12pm') ||
      timeSlotLower.includes('morning')
    ) {
      return '8AM - 12PM';
    } else if (
      timeSlotLower.includes('12-4') ||
      timeSlotLower.includes('12pm-4pm') ||
      timeSlotLower.includes('afternoon')
    ) {
      return '12PM - 4PM';
    } else if (
      timeSlotLower.includes('4-8') ||
      timeSlotLower.includes('4pm-8pm') ||
      timeSlotLower.includes('evening')
    ) {
      return '4PM - 8PM';
    } else if (
      timeSlotLower.includes('8pm-12am') ||
      timeSlotLower.includes('night')
    ) {
      return '8PM - 12AM';
    }

    const timeRange = timeSlot.match(
      /(\d{1,2}(?:AM|PM)?)\s*[-–]\s*(\d{1,2}(?:AM|PM)?)/i,
    );
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

  // Navigation methods for view details
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

  viewOrderDetails(order: Order): void {
    console.log('View order details for:', order);
  }

  // Function to get payment status color
  getPaymentColor(payment: string): string {
    switch (payment) {
      case 'Paid':
        return 'text-green-600 dark:text-green-400 font-semibold';
      case 'Pending':
        return 'text-yellow-600 dark:text-yellow-400 font-semibold';
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

    // For display in popup header (show invoice/order number)
    this.selectedOrderDisplayId = order.orderId;
    console.log('Display ID set to:', this.selectedOrderDisplayId);

    // For API call (use processOrderId from original data)
    if (order.originalData) {
      // Try to get the processOrderId from original data
      const processOrderId =
        order.originalData.processOrderId ||
        order.originalData.id ||
        order.originalData.orderId ||
        this.extractOrderIdFromDisplay(order.orderId); // Fallback

      console.log('Extracted processOrderId:', processOrderId);

      if (processOrderId) {
        // Convert to number if needed
        const numericId =
          typeof processOrderId === 'string'
            ? parseInt(processOrderId, 10)
            : processOrderId;

        if (!isNaN(numericId) && numericId !== 0) {
          this.selectedOrderId = numericId;
        } else {
          // If it's a string ID or 0, keep it as is
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
    // Try to extract numbers from display ID like "ORD-1234"
    const match = displayId.match(/\d+/);
    if (match) {
      return parseInt(match[0], 10);
    }
    return null;
  }

  // Helper method to show error messages
  private showErrorMessage(message: string): void {
    console.error(message);
    // You can also implement a toast notification or alert here
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

interface CenterDetails {
  centerId: number;
  centerName: string;
  centerRegCode: string;
}
