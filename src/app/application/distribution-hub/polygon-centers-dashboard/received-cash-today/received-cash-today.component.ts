import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // Added Router import
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
  centerObj: CenterDetails = {
    centerId: null,
    centerName: '',
    centerRegCode: ''
  };
  
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

  constructor(
    private route: ActivatedRoute,
    private router: Router // Added Router to constructor
  ) {}

  ngOnInit(): void {
    this.setStoreNameFromQueryParams();
    this.setCenterDetails();
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
  
  private setCenterDetails(): void {
    this.route.params.subscribe(params => {
      this.centerObj.centerId = params['id'] || null;
    });

    this.route.queryParams.subscribe(params => {
      this.centerObj.centerName = params['name'] || '';
      this.centerObj.centerRegCode = params['regCode'] || '';
    });
  }
  
  formatCurrency(amount: number): string {
    return `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  viewPickupRevenue(): void {
    const id = this.centerObj.centerId;
    const name = this.centerObj.centerName;
    const regCode = this.centerObj.centerRegCode;
    
    this.router.navigate([`/distribution-hub/action/view-polygon-centers/view-pikup-chash-revenue/${id}`], {
      queryParams: { name, regCode }
    });
  }

  
  
  viewDeliveryRevenue(): void {
    const id = this.centerObj.centerId;
    const name = this.centerObj.centerName;
    const regCode = this.centerObj.centerRegCode;
    
    this.router.navigate([`/distribution-hub/action/view-polygon-centers/view-delivery-revenue/${id}`], {
      queryParams: { name, regCode }
    });
  }
}

interface CenterDetails {
  centerId: number | null;
  centerName: string;
  centerRegCode: string;
}

interface CashPrice {
  total_price: number;
  total_orders: number;
}