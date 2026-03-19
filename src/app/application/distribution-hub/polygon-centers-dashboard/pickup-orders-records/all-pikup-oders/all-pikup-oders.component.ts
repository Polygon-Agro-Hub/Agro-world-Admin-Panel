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
    { label: '8AM-2PM', value: '8AM-2PM' },
    { label: '2PM-8PM', value: '2PM-8PM' },
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
      value: item.fullTotal
        ? `${parseFloat(item.fullTotal).toFixed(2)}`
        : '0.00',
      status: this.getOrderStatus(item.status || item.orderStatus),
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

  private getFormattedTimeSlotForDisplay(timeSlot: string): string {
    if (!timeSlot) return '';

    const cleanTimeSlot = timeSlot.replace(/^Within\s*/i, '').trim();

    const displayFormatMap: { [key: string]: string } = {
      '8AM - 2PM': '8AM - 2PM',
      '2PM - 8PM': '2PM - 8PM',
      '8AM-2PM': '8AM - 2PM',
      '2PM-8PM': '2PM - 8PM',
    };

    return displayFormatMap[cleanTimeSlot] || cleanTimeSlot;
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
    this.selectedOrderDisplayId = order.orderId;

    if (order.originalData) {
      const processOrderId =
        order.originalData.processOrderId ||
        order.originalData.id ||
        order.originalData.orderId;

      if (processOrderId) {
        this.selectedOrderId = processOrderId;
        this.selectedOrderData = order.originalData;
        this.showDetailsPopup = true;
      } else {
        console.warn('No processOrderId found in:', order.originalData);
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

  closeDetailsPopup(): void {
    this.showDetailsPopup = false;
    this.selectedOrderId = undefined;
    this.selectedOrderData = null;
    this.selectedOrderDisplayId = '';
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'Ready to Pickup': 'bg-[#ACFBFF] text-[#00818A]',
      'Picked Up': 'bg-[#BBFFC6] text-[#308233]',
    };

    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

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
}

interface CenterDetails {
  centerId: number;
  centerName: string;
  centerRegCode: string;
}
