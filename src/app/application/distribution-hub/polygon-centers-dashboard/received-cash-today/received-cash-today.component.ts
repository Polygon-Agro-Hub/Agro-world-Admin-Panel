import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
export class ReceivedCashTodayComponent implements OnInit {
  isLoading = false;
  
  storeName = '';
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

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.setStoreNameFromQueryParams();
  }
  
  private setStoreNameFromQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      const centerName = params['name'];
      const centerRegCode = params['regCode'];
      
      if (centerRegCode && centerName) {
        this.storeName = `${centerRegCode} ${centerName}`;
      } else if (centerName) {
        this.storeName = centerName;
      } else {
        this.storeName = 'Unknown Store';
      }
    });
  }
  
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