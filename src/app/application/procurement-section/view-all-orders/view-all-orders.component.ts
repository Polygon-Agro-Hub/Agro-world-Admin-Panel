import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';

interface AllOrder {
  id: number;
  invNo: string;
  platform: 'SalesDash' | 'Polygon';
  scheduleDate: Date;
  customerName: string;
  customerType: 'Retail' | 'Wholesale';
  companyName: string | null;
  method: 'Delivery' | 'Pick Up';
  creditPaid: number;
  paymentMethod: 'Cash' | 'Card' | null;
  moneyPaid: number;
  amount: number;
  status: string;
  postInvoiceEnabled: boolean;
  qrCode: string;
  orderedDate: Date;
}

@Component({
  selector: 'app-view-all-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    CalendarModule,
    NgxPaginationModule,
  ],
  templateUrl: './view-all-orders.component.html',
  styleUrl: './view-all-orders.component.css',
})
export class ViewAllOrdersComponent {
  page = 1;
  itemsPerPage = 10;

  searchItem = '';
  selectDate: Date | null = null;
  selectScheduleDate: Date | null = null;
  selectMethod = '';
  selectStatus = '';

  methodOptions = [
    { label: 'Delivery', value: 'Delivery' },
    { label: 'Pick Up', value: 'Pick Up' },
  ];

  statusOptions = [
    'Assigned',
    'Cancelled',
    'Collected',
    'Delivered',
    'Hold',
    'On the way',
    'Out For Delivery',
    'Picked up',
    'Processing',
    'Ready to Pickup',
    'Return',
    'Return Received',
  ].map((s) => ({ label: s, value: s }));

  allOrders: AllOrder[] = [
    this.row(
      1,
      'SalesDash',
      '2024-11-10',
      'Wednesday Addams',
      'Retail',
      null,
      'Delivery',
      0,
      'Cash',
      2500,
      2500,
      'Return Received',
      true,
      '2024-11-05T13:55',
    ),
    this.row(
      2,
      'SalesDash',
      '2024-11-10',
      'James Bond',
      'Retail',
      null,
      'Pick Up',
      0,
      'Card',
      2500,
      2500,
      'Collected',
      true,
      '2024-11-05T10:55',
    ),
    this.row(
      3,
      'SalesDash',
      '2024-11-10',
      'Harry Potter',
      'Retail',
      null,
      'Delivery',
      2500,
      null,
      0,
      2500,
      'Assigned',
      false,
      '2024-11-05T09:55',
    ),
    this.row(
      4,
      'Polygon',
      '2024-11-10',
      'Ron Weasly',
      'Wholesale',
      'ABC Company',
      'Pick Up',
      1000,
      'Cash',
      1500,
      2500,
      'Picked up',
      true,
      '2024-11-05T08:55',
    ),
    this.row(
      5,
      'Polygon',
      '2024-11-10',
      'Hermione Granger',
      'Wholesale',
      'ABC Company',
      'Pick Up',
      2000,
      'Card',
      500,
      2500,
      'Cancelled',
      false,
      '2024-11-05T07:55',
    ),
    this.row(
      6,
      'Polygon',
      '2024-11-10',
      'Chalana Prabhashwara',
      'Wholesale',
      'ABC Company',
      'Pick Up',
      2500,
      null,
      0,
      2500,
      'Return',
      true,
      '2024-11-05T06:55',
    ),
    this.row(
      7,
      'Polygon',
      '2024-11-10',
      'James Bond',
      'Wholesale',
      'ABC Company',
      'Pick Up',
      0,
      'Cash',
      2500,
      2500,
      'On the way',
      true,
      '2024-11-05T10:55',
    ),
    this.row(
      8,
      'Polygon',
      '2024-11-10',
      'Harry Potter',
      'Wholesale',
      'ABC Company',
      'Delivery',
      0,
      'Card',
      2500,
      2500,
      'Hold',
      true,
      '2024-11-05T09:55',
    ),
    this.row(
      9,
      'Polygon',
      '2024-11-10',
      'Ron Weasly',
      'Wholesale',
      'ABC Company',
      'Pick Up',
      2500,
      null,
      0,
      2500,
      'Delivered',
      true,
      '2024-11-05T08:55',
    ),
    this.row(
      10,
      'Polygon',
      '2024-11-10',
      'Hermione Granger',
      'Wholesale',
      'ABC Company',
      'Pick Up',
      0,
      'Cash',
      2500,
      2500,
      'Processing',
      true,
      '2024-11-05T07:55',
    ),
    this.row(
      11,
      'Polygon',
      '2024-11-10',
      'Chalana Prabhashwara',
      'Wholesale',
      'ABC Company',
      'Pick Up',
      0,
      'Cash',
      2500,
      2500,
      'Ready to Pickup',
      true,
      '2024-11-05T08:55',
    ),
    this.row(
      12,
      'Polygon',
      '2024-11-10',
      'Chalana Prabhashwara',
      'Wholesale',
      'ABC Company',
      'Pick Up',
      2500,
      null,
      0,
      2500,
      'Out For Delivery',
      true,
      '2024-11-05T08:55',
    ),
  ];

  private row(
    id: number,
    platform: AllOrder['platform'],
    sched: string,
    customerName: string,
    customerType: AllOrder['customerType'],
    companyName: string | null,
    method: AllOrder['method'],
    creditPaid: number,
    paymentMethod: AllOrder['paymentMethod'],
    moneyPaid: number,
    amount: number,
    status: string,
    postInvoiceEnabled: boolean,
    ordered: string,
  ): AllOrder {
    return {
      id,
      invNo: '11555',
      platform,
      scheduleDate: new Date(sched),
      customerName,
      customerType,
      companyName,
      method,
      creditPaid,
      paymentMethod,
      moneyPaid,
      amount,
      status,
      postInvoiceEnabled,
      qrCode: '',
      orderedDate: new Date(ordered),
    };
  }

  get filteredOrders(): AllOrder[] {
    const q = this.searchItem.trim().toLowerCase();
    return this.allOrders.filter(
      (o) =>
        (!q ||
          o.invNo.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q)) &&
        (!this.selectMethod || o.method === this.selectMethod) &&
        (!this.selectStatus || o.status === this.selectStatus) &&
        (!this.selectDate || this.sameDay(o.orderedDate, this.selectDate)) &&
        (!this.selectScheduleDate ||
          this.sameDay(o.scheduleDate, this.selectScheduleDate)),
    );
  }

  get totalItems(): number {
    return this.filteredOrders.length;
  }

  get hasData(): boolean {
    return this.totalItems > 0;
  }

  private sameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  onFilterChange() {
    this.page = 1;
  }
  onPageChange(p: number) {
    this.page = p;
  }
  clearSearch() {
    this.searchItem = '';
    this.page = 1;
  }

  downloadOrders() {
    console.log('Download orders');
  }
  downloadInvoice(o: AllOrder) {
    console.log('Pre invoice', o.id);
  }
  downloadPostInvoice(o: AllOrder) {
    console.log('Post invoice', o.id);
  }
  downloadQRCode(o: AllOrder) {
    console.log('QR', o.id);
  }
}
