import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';

interface OrderMetric {
  label: string;
  count: number;
  color: string;
}

@Component({
  selector: 'app-received-cash-today',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './received-cash-today.component.html',
  styleUrl: './received-cash-today.component.css',
})
export class ReceivedCashTodayComponent {
  isLoading = false;
  
  storeName = 'D-WPCK-02 Kollupitiya Central';
  receivedDate = 'Received Cash on June 2, 2026 (09)';
  
  totalPickupIncome = 1000000.00;
  totalDeliveryIncome = 10000000.00;
  
  pickupMetrics: OrderMetric[] = [
    { label: 'All Ready to Pickup Orders', count: 11, color: '#EED600' },
    { label: 'Today Ready to Pickup Orders', count: 10, color: '#415CFF' },
    { label: 'Overdue Ready to Pickups', count: 1, color: '#FF3D3D' },
    { label: 'All Pickups Completed Today', count: 10, color: '#7ED100' },
    { label: "Today's Scheduled Pickups", count: 10, color: '#00BCFB' },
    { label: 'Overdue Pickups - Today', count: 0, color: '#FFA202' }
  ];
  
  deliveryMetrics: OrderMetric[] = [
    { label: 'All Out For Delivery Orders', count: 11, color: '#EED600' },
    { label: 'Today Out For Delivery Orders', count: 10, color: '#415CFF' },
    { label: 'Overdue Out For Delivery Orders', count: 1, color: '#FF3D3D' },
    { label: 'All Deliveries Completed Today', count: 10, color: '#7ED100' },
    { label: "Today's Scheduled Deliveries", count: 10, color: '#00BCFB' },
    { label: 'Overdue Deliveries - Today', count: 0, color: '#FFA202' }
  ];
  
  formatCurrency(amount: number): string {
    return `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  viewPickupRevenue(): void {
    console.log('View Pickup Revenue clicked');
  }
  
  viewDeliveryRevenue(): void {
    console.log('View Delivery Revenue clicked');
  }
}