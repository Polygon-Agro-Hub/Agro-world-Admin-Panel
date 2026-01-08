import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';

interface Order {
  no: number;
  orderId: string;
  value: string;
  customerPhone: string;
  receiverPhone: string;
  receiverInfo: string;
  scheduledTimeSlot: string;
  payment: string;
}

@Component({
  selector: 'app-ready-to-pikup',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    CalendarModule,
    LoadingSpinnerComponent,
    FormsModule
  ],
  templateUrl: './ready-to-pikup.component.html',
  styleUrl: './ready-to-pikup.component.css',
})
export class ReadyToPikupComponent implements OnInit, OnChanges {
  @Input() orders: Order[] = [];
  @Input() isLoading: boolean = false;
  @Output() filterChanged = new EventEmitter<any>();
  @Output() searchChanged = new EventEmitter<string>();

  hasData = false;
  
  // Filter states
  selectedDate: Date | null = null;
  selectedTimeSlot: any = null;
  searchText: string = '';

  // Time slot options
  timeSlots = [
    { label: 'Morning (8AM - 12PM)', value: 'morning' },
    { label: 'Afternoon (12PM - 4PM)', value: 'afternoon' },
    { label: 'Evening (4PM - 8PM)', value: 'evening' },
    { label: 'Night (8PM - 12AM)', value: 'night' }
  ];

  ngOnInit() {
    this.updateHasData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['orders']) {
      this.updateHasData();
    }
  }

  private updateHasData() {
    this.hasData = this.orders.length > 0;
  }

  // Handle date change
  onDateChange() {
    const filters = {
      date: this.selectedDate ? this.formatDate(this.selectedDate) : '',
      time: this.selectedTimeSlot?.value || ''
    };
    this.filterChanged.emit(filters);
  }

  // Handle time slot change
  onTimeSlotChange() {
    const filters = {
      date: this.selectedDate ? this.formatDate(this.selectedDate) : '',
      time: this.selectedTimeSlot?.value || ''
    };
    this.filterChanged.emit(filters);
  }

  // Handle search
  onSearch() {
    if (this.searchText.trim() || this.searchText === '') {
      this.searchChanged.emit(this.searchText);
    }
  }

  // Clear search
  clearSearch() {
    this.searchText = '';
    this.searchChanged.emit('');
  }

  // Format date for API
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Function to get payment status color
  getPaymentColor(payment: string): string {
    switch(payment) {
      case 'Paid': return 'text-green-600 dark:text-green-400 font-semibold';
      case 'Pending': return 'text-yellow-600 dark:text-yellow-400 font-semibold';
      case 'Failed': return 'text-red-600 dark:text-red-400 font-semibold';
      default: return 'text-textLight dark:text-textDark';
    }
  }

  // Function to get delivery time color
  getDeliveryTimeColor(timeSlot: string): string {
    if (!timeSlot) return 'text-textLight dark:text-textDark';
    const hourMatch = timeSlot.match(/\d+/);
    if (hourMatch) {
      const hour = parseInt(hourMatch[0]);
      if (hour < 12) return 'text-blue-600 dark:text-blue-400'; // Morning
      if (hour < 16) return 'text-orange-600 dark:text-orange-400'; // Afternoon
    }
    return 'text-purple-600 dark:text-purple-400'; // Evening
  }
}