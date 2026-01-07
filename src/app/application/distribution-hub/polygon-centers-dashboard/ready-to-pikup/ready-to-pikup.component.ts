import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-ready-to-pikup',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    CalendarModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './ready-to-pikup.component.html',
  styleUrl: './ready-to-pikup.component.css',
})
export class ReadyToPikupComponent {
  isLoading = false;
  hasData = true;
  
  // Dummy data for dropdown
  timeSlots = [
    { label: 'Morning (8AM - 12PM)', value: 'morning' },
    { label: 'Afternoon (12PM - 4PM)', value: 'afternoon' },
    { label: 'Evening (4PM - 8PM)', value: 'evening' },
    { label: 'Night (8PM - 12AM)', value: 'night' }
  ];

  // Dummy order data
  orders = [
    {
      no: 1,
      orderId: 'ORD-001234',
      value: '2,450.00',
      customerPhone: '+94 77 123 4567',
      receiverPhone1: '+94 71 987 6543',
      receiverInfo: 'John Doe - Colombo',
      scheduledTime: '10:00 AM - 12:00 PM',
      payment: 'Paid',
      paymentStatus: 'success'
    },
    {
      no: 2,
      orderId: 'ORD-001235',
      value: '1,850.50',
      customerPhone: '+94 76 234 5678',
      receiverPhone1: '+94 72 876 5432',
      receiverInfo: 'Jane Smith - Kandy',
      scheduledTime: '2:00 PM - 4:00 PM',
      payment: 'Pending',
      paymentStatus: 'pending'
    },
    {
      no: 3,
      orderId: 'ORD-001236',
      value: '3,200.00',
      customerPhone: '+94 75 345 6789',
      receiverPhone1: '+94 70 765 4321',
      receiverInfo: 'Robert Johnson - Galle',
      scheduledTime: '11:00 AM - 1:00 PM',
      payment: 'Paid',
      paymentStatus: 'success'
    },
    {
      no: 4,
      orderId: 'ORD-001237',
      value: '950.75',
      customerPhone: '+94 78 456 7890',
      receiverPhone1: '+94 76 654 3210',
      receiverInfo: 'Sarah Williams - Negombo',
      scheduledTime: '4:00 PM - 6:00 PM',
      payment: 'Failed',
      paymentStatus: 'failed'
    },
    {
      no: 5,
      orderId: 'ORD-001238',
      value: '5,600.25',
      customerPhone: '+94 77 567 8901',
      receiverPhone1: '+94 71 543 2109',
      receiverInfo: 'Michael Brown - Jaffna',
      scheduledTime: '9:00 AM - 11:00 AM',
      payment: 'Paid',
      paymentStatus: 'success'
    }
  ];

  // Function to get payment status color
  getPaymentColor(status: string): string {
    switch(status) {
      case 'success': return 'text-green-600 dark:text-green-400';
      case 'pending': return 'text-yellow-600 dark:text-yellow-400';
      case 'failed': return 'text-red-600 dark:text-red-400';
      default: return 'text-textLight dark:text-textDark';
    }
  }

  // Function to get delivery time color
  getDeliveryTimeColor(timeSlot: string): string {
    const hour = parseInt(timeSlot.split(':')[0]);
    if (hour < 12) return 'text-blue-600 dark:text-blue-400'; // Morning
    if (hour < 16) return 'text-orange-600 dark:text-orange-400'; // Afternoon
    return 'text-purple-600 dark:text-purple-400'; // Evening
  }
}