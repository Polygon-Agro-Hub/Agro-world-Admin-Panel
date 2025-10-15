import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { finalize } from 'rxjs/operators';
import { InvoiceService } from '../../../services/invoice/invoice.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import Swal from 'sweetalert2';
import { FinalinvoiceService } from '../../../services/invoice/finalinvoice.service';

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
    failed: 'Faild',
    "Out For Delivery": "Out For Delivery"
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private marketplace: MarketPlaceService,
    private invoiceService: FinalinvoiceService
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

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      Assinged: 'bg-[#E6F0FF] text-[#415CFF]',
      Processing: 'bg-[#FFF8E6] text-[#FFB800]',
      Delivered: 'bg-[#E6FFEE] text-[#00A441]',
      'Out For Delivery': 'bg-[#F3E6FF] text-[#8A3FFC]',
      Cancelled: 'bg-[#FFE6E6] text-[#FF0000]',
      Faild: 'bg-[#FFE6E6] text-[#FF0000]',
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
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
}