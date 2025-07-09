import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { finalize } from 'rxjs/operators';

interface Order {
  id: string;
  invNo: string;
  sheduleType: string;
  sheduleDate: string;
  paymentMethod: string;
  isPaid: boolean;
  fullTotal: number;
  status: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    orders: Order[];
    totalCount: number;
  };
  message?: string;
}

@Component({
  selector: 'app-view-customer-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-customer-orders.component.html',
  styleUrls: ['./view-customer-orders.component.css'],
})
export class ViewCustomerOrdersComponent implements OnInit {
  isLoading: boolean = false;
  activeButton: string = 'assigned';
  errorMessage: string | null = null;
  userId: string = '';
  orders: Order[] = [];
  totalItems: number = 0;

  // Status mapping for UI buttons to API values
  private statusMap: { [key: string]: string } = {
    assigned: 'Assinged',
    processing: 'Processing',
    delivered: 'Delivered',
    ontheway: 'On the way',
    cancelled: 'Cancelled',
    failed: 'Faild',
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private marketplace: MarketPlaceService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.userId = params['id'];
      if (this.userId) {
        this.fetchCustomerOrders();
      } else {
        this.errorMessage = 'No user ID provided';
      }
    });
  }

  back(): void {
    window.history.back();
  }

  onStatusChange(status: string): void {
    if (this.activeButton !== status) {
      this.activeButton = status;
      this.fetchCustomerOrders();
    }
  }

  fetchCustomerOrders(): void {
    if (!this.userId) {
      this.errorMessage = 'User ID is required';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    // Get the API status value from our mapping
    const apiStatus = this.statusMap[this.activeButton] || 'Ordered';

    this.marketplace
      .fetchUserOrders(this.userId, apiStatus)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: ApiResponse) => {
          if (response.success) {
            this.orders = response.data.orders;
            this.totalItems = response.data.totalCount;
          } else {
            this.errorMessage = response.message || 'Failed to load orders';
          }
        },
        error: (error) => {
          console.error('Error fetching orders:', error);
          this.errorMessage =
            error.message || 'An error occurred while fetching orders';
        },
      });
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      Assinged: 'bg-[#E6F0FF] text-[#415CFF]', // Blue background, blue text
      Processing: 'bg-[#FFF8E6] text-[#FFB800]', // Yellow background, yellow text
      Delivered: 'bg-[#E6FFEE] text-[#00A441]', // Green background, green text
      'On the way': 'bg-[#F3E6FF] text-[#8A3FFC]', // Purple background, purple text
      Cancelled: 'bg-[#FFE6E6] text-[#FF0000]', // Red background, red text
      Faild: 'bg-[#FFE6E6] text-[#FF0000]', // Red background, red text
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }
}
