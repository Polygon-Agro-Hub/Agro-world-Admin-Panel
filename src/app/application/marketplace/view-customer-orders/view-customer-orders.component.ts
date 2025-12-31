import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { finalize } from 'rxjs/operators';
import { InvoiceService } from '../../../services/invoice/invoice.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import Swal from 'sweetalert2';
import { FinalinvoiceService } from '../../../services/invoice/finalinvoice.service';
import { PostinvoiceService } from '../../../services/invoice/postinvoice.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';

interface Order {
  id: number;
  invNo: string;
  sheduleType: string;
  sheduleDate: string;
  paymentMethod: string;
  isPaid: number;
  fullTotal: number;
  status: string;
  createdAt: string;
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
  imports: [CommonModule, LoadingSpinnerComponent],
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
  hasData: boolean = false;

  private statusMap: { [key: string]: string } = {
    assigned: 'Assinged',
    processing: 'Processing',
    delivered: 'Delivered',
    ontheway: 'Out For Delivery',
    cancelled: 'Cancelled',
    collected: 'Collected',
    hold: 'Hold',
    return: 'Return',
    returnReceived: 'Return Received',
    'Out For Delivery': 'Out For Delivery',
    'Ready to Pickup': 'Ready to Pickup',
    'Picked up': 'Picked up',
    'On the way': 'On the way'
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private marketplace: MarketPlaceService,
    private invoiceService: FinalinvoiceService,
    private postInvoiceService: PostinvoiceService,
    private permissionService: PermissionService,
    private tokenService: TokenService
  ) { }

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

    const apiStatus = this.statusMap[this.activeButton] || 'Ordered';

    this.marketplace
      .fetchUserOrders(this.userId, apiStatus)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: ApiResponse) => {
          if (response.success) {
            console.log('Fetched orders:', response.data.orders);

            this.orders = response.data.orders;
            this.totalItems = response.data.totalCount;
            this.hasData = response.data.orders.length > 0;
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

  getPaymentStatusClass(paymentMethod: string, isPaid: number): string {
    if (isPaid === 1) {
      if (paymentMethod?.toLowerCase() === 'card' || paymentMethod?.toLowerCase() === 'debit/credit') {
        return 'bg-[#BBFFC6] text-[#308233] rounded-xl px-7 py-2';
      } else if (paymentMethod?.toLowerCase() === 'cash' || paymentMethod?.toLowerCase() === 'cash on delivery') {
        return 'bg-[#F5FF85] text-[#878216] rounded-xl px-5 py-2';
      }
    }
    return 'bg-[#DFDFDF] text-[#5C5C5C] rounded-xl px-4 py-2';
  }

  getPaymentStatusText(paymentMethod: string, isPaid: number): string {
    if (isPaid === 1) {
      if (paymentMethod?.toLowerCase() === 'card' || paymentMethod?.toLowerCase() === 'debit/credit') {
        return 'Paid';
      } else if (paymentMethod?.toLowerCase() === 'cash' || paymentMethod?.toLowerCase() === 'cash on delivery') {
        return 'Received';
      }
    }
    return 'Pending';
  }

  downloadInvoice(id: number, tableInvoiceNo: string): void {
    this.isLoading = true;
    this.invoiceService.generateAndDownloadInvoice(id, tableInvoiceNo)
      .finally(() => {
        this.isLoading = false;
      })
      .catch(error => {
        console.error('Error generating invoice:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to download invoice. Please try again.',
          confirmButtonColor: '#3085d6',
        });
      });
  }

  isPostInvoiceEnabled(status: string): boolean {
    // Normalize status by trimming
    const normalizedStatus = status?.trim();
    
    // Define the statuses that allow post-invoice download
    const enabledStatuses = [
      'Out For Delivery', 
      'Delivered', 
      'Picked up',
      'Picked Up',
      'On the way',
      'Failed',
      'Faild'
    ];
    
    return enabledStatuses.some(enabledStatus => 
      normalizedStatus?.toLowerCase() === enabledStatus.toLowerCase()
    );
  }

  shouldShowPostInvoiceColumn(): boolean {
    // Check if any order has a status that enables post-invoice download
    return this.orders.some(order => this.isPostInvoiceEnabled(order.status));
  }

  downloadPostInvoice(id: number, tableInvoiceNo: string): void {
    this.isLoading = true;

    this.postInvoiceService.generateAndDownloadInvoice(id, tableInvoiceNo)
      .then(() => {
        // Success case
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Post invoice downloaded successfully!',
          confirmButtonColor: '#3085d6',
        });
      })
      .catch((error) => {
        console.error('Error generating invoice:', error);
        this.errorMessage = 'Failed to download invoice';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to download invoice. Please try again.',
          confirmButtonColor: '#3085d6',
        });
      })
      .finally(() => {
        this.isLoading = false;
      });
  }
}