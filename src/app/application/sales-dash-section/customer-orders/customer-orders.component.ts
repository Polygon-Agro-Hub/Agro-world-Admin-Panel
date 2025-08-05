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

interface Order {
  id: string;
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
    private dasService: CustomersService,
    private invoiceSrv: InvoiceService,
    private http: HttpClient,
    private finalInvoiceService: FinalinvoiceService
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
    this.hasData = false;

    const apiStatus = this.statusMap[this.activeButton] || 'Ordered';

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

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      Assinged: 'bg-[#E6F0FF] text-[#415CFF]',
      Processing: 'bg-[#FFF8E6] text-[#FFB800]',
      Delivered: 'bg-[#E6FFEE] text-[#00A441]',
      'On the way': 'bg-[#F3E6FF] text-[#8A3FFC]',
      Cancelled: 'bg-[#FFE6E6] text-[#FF0000]',
      Faild: 'bg-[#FFE6E6] text-[#FF0000]',
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  async downloadInvoice(orderId: string, invoiceNumber: string): Promise<void> {
    this.isLoading = true;
    try {
      await this.finalInvoiceService.generateAndDownloadInvoice(
        parseInt(orderId),
        invoiceNumber
      );
    } catch (error) {
      console.error('Error generating invoice:', error);
      this.errorMessage = 'Failed to download invoice';
    } finally {
      this.isLoading = false;
    }
  }
}
