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
  @Input() orders: any[] = [];

  @Output() dateChange = new EventEmitter<Date | null>();
  @Output() timeSlotChange = new EventEmitter<string>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() clearSearch = new EventEmitter<void>();
  @Output() clearDate = new EventEmitter<void>();

  selectedDate: Date | null = null;
  selectedTimeSlot: string = '';
  searchText: string = '';

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
      const backendTimeSlot = changes['selectedTimeSlot'].currentValue || '';
      this.selectedTimeSlot = this.convertTimeSlotToUIFormat(backendTimeSlot);
    } else if (this.selectedTimeSlot === undefined) {
      this.selectedTimeSlot = '';
    }
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
    
    const cleanTimeSlot = timeSlot.replace(/^Within\s*/i, '').trim();
    
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

  onClearTimeSlot(): void {
    console.log('Time slot cleared');
    this.selectedTimeSlot = '';
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

  // SORTING REMOVED - orders displayed as received from API
  private transformApiData(apiData: any[]): Order[] {
    return apiData.map((item, index) => ({
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

  private formatCurrencyValue(value: any): string {
    if (value === null || value === undefined || value === '') {
      return '0.00';
    }
    
    const numericValue = parseFloat(value);
    
    if (isNaN(numericValue)) {
      return '0.00';
    }
    
    return numericValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  private getFormattedTimeSlotForDisplay(timeSlot: string): string {
    if (!timeSlot) return '';

    const cleanTimeSlot = timeSlot.replace(/^Within\s*/i, '').trim();
    
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

  private formatScheduledTimeSlot(item: any): string {
    const scheduleDate = item.scheduleDate || item.sheduleDate;
    const timeSlot = item.timeSlot || item.sheduleTime;

    if (!scheduleDate) {
      return this.getFormattedTimeSlotForDisplay(timeSlot) || 'N/A';
    }

    const formattedDate = this.formatDisplayDate(scheduleDate);
    const formattedTimeSlot = this.getFormattedTimeSlotForDisplay(timeSlot);

    return `${formattedTimeSlot}<br>${formattedDate}`;
  }

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

  private formatPhoneNumber(code: string, number: string): string {
    if (!code && !number) return 'N/A';
    if (code && number) {
      const cleanCode = code.replace(/\s+/g, '');
      const cleanNumber = number.replace(/\s+/g, '');
      return `${cleanCode} ${cleanNumber}`;
    }
    return number || code || 'N/A';
  }

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
    
    if (paymentMethod === 'Cash' && isPaid === 1 && fullTotal > 0) {
      return 'Received';
    }
    
    if (isPaid === 1) {
      return 'Paid';
    }
    
    return 'Pending';
  }

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

  private extractOrderIdFromDisplay(displayId: string): number | null {
    const match = displayId.match(/\d+/);
    if (match) {
      return parseInt(match[0], 10);
    }
    return null;
  }

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