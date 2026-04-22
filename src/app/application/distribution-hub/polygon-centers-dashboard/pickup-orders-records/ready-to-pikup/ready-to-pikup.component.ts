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
import { TokenService } from '../../../../../services/token/services/token.service';
import { PermissionService } from '../../../../../services/roles-permission/permission.service';

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
    { label: '2PM - 8PM', value: '2PM-8PM' },
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

  constructor(
    private datePipe: DatePipe,
    public tokenService: TokenService,
    public permissionService: PermissionService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['orders']) {
      this.transformData();
    }

    if (changes['searchText']) {
      this.searchText = changes['searchText'].currentValue || '';
    }

    if (changes['selectedDate']) {
      this.selectedDate = changes['selectedDate'].currentValue;
    }

    if (changes['selectedTimeSlot']) {
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
      '2PM - 8PM': 'Within 2PM - 8PM',
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
      '2PM-8PM': '2PM-8PM',
    };

    return uiFormatMap[cleanTimeSlot] || cleanTimeSlot;
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

  onDateSelect(): void {
    this.dateChange.emit(this.selectedDate);
  }

  onDateClear(): void {
    this.selectedDate = null;
    this.clearDate.emit();
  }

  onTimeSlotSelect(): void {
    const backendTimeSlot = this.convertTimeSlotToBackendFormat(
      this.selectedTimeSlot,
    );
    this.timeSlotChange.emit(backendTimeSlot);
  }

  onClearTimeSlot(): void {
    this.selectedTimeSlot = '';
    this.timeSlotChange.emit('');
  }

  onSearch(): void {
    this.searchChange.emit(this.searchText);
  }

  onClearSearch(): void {
    this.searchText = '';
    this.clearSearch.emit();
  }

  private transformApiData(apiData: any[]): Order[] {
    return apiData.map((item, index) => ({
      no: index + 1,
      orderId: item.invNo || item.orderId || `ORD-${index + 1000}`,
      value: this.formatCurrencyValue(item.fullTotal),
      status: 'Ready to Pickup',
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
      originalData: item,
    }));
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
      '2PM-8 PM': '2PM - 8PM',
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

  private getPaymentStatus(isPaid: number | string): string {
    const paidStatus = parseInt(isPaid?.toString() || '0');

    if (paidStatus === 1) {
      return 'Paid';
    }

    return 'Pending';
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
      maximumFractionDigits: 2,
    });
  }

  formatDisplayDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return this.datePipe.transform(dateString, 'MMM d, yyyy') || 'N/A';
  }

  viewReceiverInfo(order: Order): void {
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

  openOrderDetails(order: Order): void {
    if (order.originalData) {
    }

    this.selectedOrderDisplayId = order.orderId;

    if (order.originalData) {
      const processOrderId =
        order.originalData.processOrderId ||
        order.originalData.id ||
        order.originalData.orderId ||
        this.extractOrderIdFromDisplay(order.orderId);

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
    this.showDetailsPopup = false;
    this.selectedOrderId = undefined;
    this.selectedOrderData = null;
    this.selectedOrderDisplayId = '';
  }

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
}

interface CenterDetails {
  centerId: number;
  centerName: string;
  centerRegCode: string;
}
