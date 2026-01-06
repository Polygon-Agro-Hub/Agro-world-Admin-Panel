import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { InvoiceService } from '../../../services/invoice/invoice.service';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { CustomersService } from '../../../services/dash/customers.service';
import { FinalinvoiceService } from '../../../services/invoice/finalinvoice.service';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { PostinvoiceService } from '../../../services/invoice/postinvoice.service';
import Swal from 'sweetalert2';

interface Order {
  id: number;
  invNo: string;
  sheduleType: string;
  sheduleDate: string;
  paymentMethod: string;
  isPaid: number;
  fullTotal: number;
  status: string;
  isPackage: number;
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
  selector: 'app-customer-orders',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './customer-orders.component.html',
  styleUrl: './customer-orders.component.css',
})
export class CustomerOrdersComponent implements OnInit {
  hasData: boolean = false;
  isLoading: boolean = false;
  activeButton: string = 'assigned';
  errorMessage: string | null = null;
  userId: string = '';
  orders: Order[] = [];
  totalItems: number = 0;

  // Status mapping for UI buttons to API values
  private statusMap: { [key: string]: string } = {
    assigned: 'Assigned',
    processing: 'Processing',
    hold: 'Hold',
    collected: 'Collected',
    ontheway: 'On the way',
    outForDelivery: 'Out For Delivery',
    readyToPickup: 'Ready to Pickup',
    pickedUp: 'Picked up',
    delivered: 'Delivered',
    return: 'Return',
    returnReceived: 'Return Received',
    cancelled: 'Cancelled',
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dasService: CustomersService,
    private invoiceSrv: InvoiceService,
    private http: HttpClient,
    public tokenService: TokenService,
    public permissionService: PermissionService,
    private finalInvoiceService: FinalinvoiceService,
    private postInvoiceService: PostinvoiceService

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
    this.hasData = false;

    const apiStatus = this.statusMap[this.activeButton] || 'Ordered';
    console.log(this.activeButton, apiStatus);

    this.dasService
      .fetchUserOrders(this.userId, apiStatus)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: ApiResponse) => {
          this.hasData = response.data.orders.length > 0;
          if (response.success) {
            this.orders = response.data.orders;
            this.totalItems = response.data.totalCount;
          } else {
            this.errorMessage = response.message || 'Failed to load orders';
            this.hasData = false;
          }
        },
        error: (error) => {
          console.error('Error fetching orders:', error);
          this.errorMessage =
            error.message || 'An error occurred while fetching orders';
          this.hasData = false;
        },
      });
  }

  getPaymentStatusClass(paymentMethod: string, isPaid: number): string {
    if (isPaid === 1) {
      if (paymentMethod?.toLowerCase() === 'card') {
        return 'bg-[#BBFFC6] text-[#308233] rounded-xl px-7 py-2';
      } else if (paymentMethod?.toLowerCase() === 'cash') {
        return 'bg-[#F5FF85] text-[#878216] rounded-xl px-5 py-2';
      }
    }
    return 'bg-[#DFDFDF] text-[#5C5C5C] rounded-xl px-4 py-2';
  }

  getPaymentStatusText(paymentMethod: string, isPaid: number): string {
    if (isPaid === 1) {
      if (paymentMethod?.toLowerCase() === 'card') {
        return 'Paid';
      } else if (paymentMethod?.toLowerCase() === 'cash') {
        return 'Received';
      }
    }
    return 'Pending';
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      Assigned: 'bg-[#F5FF85] text-[#878216] rounded-xl px-5 py-2',
      Processing: 'bg-[#CFE1FF] text-[#3B82F6] rounded-xl px-5 py-2',
      'Out For Delivery': 'bg-[#FCD4FF] text-[#80118A] rounded-xl px-5 py-2',
      'Ready to Pickup': 'bg-[#ACFBFF] text-[#00818A] rounded-xl px-5 py-2',
      'Picked up': 'bg-[#BBFFC6] text-[#308233] rounded-xl px-5 py-2',
      Collected: 'bg-[#F8FEA5] text-[#7E8700] rounded-xl px-5 py-2',
      'On the way': 'bg-[#FFEDCF] text-[#D17A00] rounded-xl px-5 py-2',
      Delivered: 'bg-[#BBFFC6] text-[#308233] rounded-xl px-5 py-2',
      Hold: 'bg-[#FFEDCF] text-[#D17A00] rounded-xl px-5 py-2',
      Return: 'bg-[#FFDCDA] text-[#FF1100] rounded-xl px-5 py-2',
      'Return Received': 'bg-[#FFDCDA] text-[#FF1100] rounded-xl px-5 py-2',
      Cancelled: 'bg-[#DFDFDF] text-[#5C5C5C] rounded-xl px-5 py-2',
    };
    return (
      statusClasses[status] || 'bg-gray-100 text-gray-800 rounded-xl px-5 py-2'
    );
  }

  async downloadInvoice(orderId: number, invoiceNumber: string): Promise<void> {
    this.isLoading = true;
    try {
      await this.finalInvoiceService.generateAndDownloadInvoice(
        orderId,
        invoiceNumber
      );
    } catch (error) {
      console.error('Error generating invoice:', error);
      this.errorMessage = 'Failed to download invoice';
    } finally {
      this.isLoading = false;
    }
  }

  isPostInvoiceEnabled(status: string): boolean {
    // Define the statuses that allow post-invoice download
    const enabledStatuses = [
      'Out For Delivery',
      'Delivered',
      'Picked Up',
      'On the way',
      'Failed',
    ];

    return enabledStatuses.includes(status);
  }

  downloadPostInvoice(id: number, tableInvoiceNo: string): void {
    this.isLoading = true;

    this.postInvoiceService
      .generateAndDownloadInvoice(id, tableInvoiceNo)
      .then(() => {
        // Success case - no action needed unless you want to show a success message
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
