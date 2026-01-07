import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';

interface Order {
  no: number;
  orderId: string;
  value: string;
  customerPhone: string;
  receiverPhone: string;
  receiverInfo: string;
  scheduledTimeSlot: string;
  payment: string;
  details: string;
}

@Component({
  selector: 'app-pikup-oders',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    CalendarModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './pikup-oders.component.html',
  styleUrl: './pikup-oders.component.css',
})
export class PikupOdersComponent {
  isLoading = false;
  
  // Dummy data from the image
  orders: Order[] = [
    {
      no: 1,
      orderId: 'ORD-001234',
      value: '2,450.00',
      customerPhone: '+94 77 123 4567',
      receiverPhone: '+94 71 987 6543',
      receiverInfo: '⭕',
      scheduledTimeSlot: '10:00 AM - 12:00 PM',
      payment: 'Paid',
      details: '⭕'
    },
    {
      no: 2,
      orderId: 'ORD-001235',
      value: '1,850.50',
      customerPhone: '+94 76 234 5678',
      receiverPhone: '+94 72 876 5432',
      receiverInfo: '⭕',
      scheduledTimeSlot: '2:00 PM - 4:00 PM',
      payment: 'Pending',
      details: '⭕'
    },
    {
      no: 3,
      orderId: 'ORD-001236',
      value: '3,200.00',
      customerPhone: '+94 75 345 6789',
      receiverPhone: '+94 70 765 4321',
      receiverInfo: '⭕',
      scheduledTimeSlot: '11:00 AM - 1:00 PM',
      payment: 'Paid',
      details: '⭕'
    },
    {
      no: 4,
      orderId: 'ORD-001237',
      value: '950.75',
      customerPhone: '+94 78 456 7890',
      receiverPhone: '+94 76 654 3210',
      receiverInfo: '⭕',
      scheduledTimeSlot: '4:00 PM - 6:00 PM',
      payment: 'Failed',
      details: '⭕'
    },
    {
      no: 5,
      orderId: 'ORD-001238',
      value: '5,600.25',
      customerPhone: '+94 77 567 8901',
      receiverPhone: '+94 71 543 2109',
      receiverInfo: '⭕',
      scheduledTimeSlot: '9:00 AM - 11:00 AM',
      payment: 'Paid',
      details: '⭕'
    }
  ];
}