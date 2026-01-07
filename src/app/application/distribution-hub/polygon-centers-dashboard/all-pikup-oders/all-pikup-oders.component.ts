import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';

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
}

@Component({
  selector: 'app-all-pikup-oders',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    CalendarModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './all-pikup-oders.component.html',
  styleUrl: './all-pikup-oders.component.css',
})
export class AllPikupOdersComponent {
  isLoading = false;
  
  // Dummy data matching the screenshot
  orders: Order[] = [
    {
      no: 1,
      orderId: '2506200010',
      value: '2,000.00',
      status: 'Ready to Pickup',
      customerPhone: '+94 781212300',
      receiverPhone: '+94 781212300',
      receiversInfo: '⬆',
      scheduledTimeSlot: '8AM - 2PM June 2, 2025',
      payment: 'Pending'
    },
    {
      no: 2,
      orderId: '2506200006',
      value: '2,000.00',
      status: 'Picked Up',
      customerPhone: '+94 781212300',
      receiverPhone: '+94 781212300',
      receiversInfo: '⬆',
      scheduledTimeSlot: '8AM - 2PM June 2, 2025',
      payment: 'Paid'
    },
    {
      no: 3,
      orderId: '2506200003',
      value: '2,000.00',
      status: 'Ready to Pickup',
      customerPhone: '+94 781212300',
      receiverPhone: '+94 781212300',
      receiversInfo: '⬆',
      scheduledTimeSlot: '8AM - 2PM June 2, 2025',
      payment: 'Pending'
    },
    {
      no: 4,
      orderId: '2506200002',
      value: '2,000.00',
      status: 'Ready to Pickup',
      customerPhone: '+94 781212300',
      receiverPhone: '+94 781212300',
      receiversInfo: '⬆',
      scheduledTimeSlot: '8AM - 2PM June 2, 2025',
      payment: 'Pending'
    },
    {
      no: 5,
      orderId: '2506200001',
      value: '2,000.00',
      status: 'Ready to Pickup',
      customerPhone: '+94 781212300',
      receiverPhone: '+94 781212300',
      receiversInfo: '⬆',
      scheduledTimeSlot: '8AM - 2PM June 2, 2025',
      payment: 'Pending'
    },
    {
      no: 6,
      orderId: '2506200001',
      value: '2,000.00',
      status: 'Ready to Pickup',
      customerPhone: '+94 781212300',
      receiverPhone: '+94 781212300',
      receiversInfo: '⬆',
      scheduledTimeSlot: '8AM - 2PM June 2, 2025',
      payment: 'Pending'
    },
    {
      no: 7,
      orderId: '2506200002',
      value: '2,000.00',
      status: 'Ready to Pickup',
      customerPhone: '+94 781212300',
      receiverPhone: '+94 781212300',
      receiversInfo: '⬆',
      scheduledTimeSlot: '8AM - 2PM June 2, 2025',
      payment: 'Pending'
    },
    {
      no: 8,
      orderId: '2506200001',
      value: '2,000.00',
      status: 'Ready to Pickup',
      customerPhone: '+94 781212300',
      receiverPhone: '+94 781212300',
      receiversInfo: '⬆',
      scheduledTimeSlot: '2PM - 8PM June 2, 2025',
      payment: 'Pending'
    }
  ];

  // Function to get status color class
  getStatusClass(status: string): string {
    switch(status) {
      case 'Ready to Pickup':
        return 'text-orange-500 font-semibold';
      case 'Picked Up':
        return 'text-green-500 font-semibold';
      default:
        return 'text-textLight dark:text-textDark';
    }
  }

  // Function to get payment status color class
  getPaymentClass(payment: string): string {
    switch(payment) {
      case 'Pending':
        return 'text-orange-500 font-semibold';
      case 'Paid':
        return 'text-green-500 font-semibold';
      default:
        return 'text-textLight dark:text-textDark';
    }
  }

  hasData = true; // For controlling the no data display
}