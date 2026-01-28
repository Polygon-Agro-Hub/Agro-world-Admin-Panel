import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // Added Router import
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { TokenService } from '../../../../services/token/services/token.service';
import { PermissionService } from '../../../../services/roles-permission/permission.service';
import { DistributionHubService } from '../../../../services/distribution-hub/distribution-hub.service';

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
  receivedDate = new Date();

  totalPickupIncome = 0;
  totalDeliveryIncome = 0;

  pickupMetrics: OrderMetric[] = [];
  deliveryMetrics: OrderMetric[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService,
    private distributionHubService: DistributionHubService
  ) { }

  ngOnInit(): void {
    this.setStoreNameFromQueryParams();
    this.setCenterDetails();
    this.fetchData();
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

  fetchData() {
    this.isLoading = true;
    this.distributionHubService.getRecivedCashDashbord(this.centerObj.centerId).subscribe(
      (res) => {
        console.log(res);
        // this.pickUpObj = res.pickupResult;
        this.assignPickUpOrders(res.pickupResult)
        this.assignDelivaryOrders(res.delivaryResult)
        this.isLoading = false;
      }
    )
  }

  assignPickUpOrders(data: IPickUp) {
    this.pickupMetrics = [
      { label: 'All Ready to Pickup Orders', count: data.total_today, color: '#EED600' },
      { label: 'Today Ready to Pickup Orders', count: data.scheduled_today, color: '#415CFF' },
      { label: 'Overdue Ready to Pickups', count: (data.total_today - data.scheduled_today), color: '#FF3D3D' },
      { label: 'All Pickups Completed Today', count: data.all_pickup, color: '#7ED100' },
      { label: "Today's Scheduled Pickups", count: data.today_pickup, color: '#00BCFB' },
      { label: 'Overdue Pickups - Today', count: (data.all_pickup - data.today_pickup), color: '#FFA202' }
    ]

    this.totalPickupIncome = data.order_price
  }

  assignDelivaryOrders(data: IDelivary) {
    this.deliveryMetrics = [
      { label: 'All Out For Delivery Orders', count: data.total_today, color: '#EED600' },
      { label: 'Today Out For Delivery Orders', count: data.scheduled_today, color: '#415CFF' },
      { label: 'Overdue Out For Delivery Orders', count: (data.total_today - data.scheduled_today), color: '#FF3D3D' },
      { label: 'All Deliveries Completed Today', count: data.all_delivary, color: '#7ED100' },
      { label: "Today's Scheduled Deliveries", count: data.today_delivary, color: '#00BCFB' },
      { label: 'Overdue Deliveries - Today', count: (data.all_delivary - data.today_delivary), color: '#FFA202' }
    ]
    this.totalDeliveryIncome = data.order_price

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

interface IPickUp {
  total_today: number;
  scheduled_today: number;
  not_scheduled_today: number;
  all_pickup: number;
  today_pickup: number;
  order_price: number;
}

interface IDelivary {
  total_today: number;
  scheduled_today: number;
  all_delivary: number;
  today_delivary: number;
  order_price: number;

}