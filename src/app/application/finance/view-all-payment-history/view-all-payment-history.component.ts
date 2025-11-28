import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { FinanceService, PaymentHistoryListItem } from '../../../services/finance/finance.service';
import Swal from 'sweetalert2';

interface ReceiverOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-view-all-payment-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarModule,
    DropdownModule
  ],
  templateUrl: './view-all-payment-history.component.html',
  styleUrl: './view-all-payment-history.component.css'
})
export class ViewAllPaymentHistoryComponent implements OnInit {
  isLoading: boolean = false;

  paymentHistory: PaymentHistoryListItem[] = [];
  totalItems: number = 0;
  showDeleteModal: boolean = false;
  deleteItemId: number | null = null;
  deleteItemPayRef: string = '';

  // Filter states
  receiverOptions: ReceiverOption[] = [
    { label: 'Farmers', value: 'Farmers' },
    { label: 'HR Section', value: 'HR Section' },
    { label: 'IT Section', value: 'IT Section' }
  ];
  selectedReceiver: ReceiverOption | null = null;

  // Issued date filter (single date)
  selectedIssuedDate: Date | null = null;
  issuedDateFilter: string = '';

  // Search
  search: string = '';

  constructor(
    private financeService: FinanceService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadPaymentHistory();
  }

  loadPaymentHistory(): void {
    this.isLoading = true;

    const receivers = this.selectedReceiver ? this.selectedReceiver.value : undefined;

    this.financeService
      .getAllPaymentHistory(
        receivers,
        this.issuedDateFilter,
        this.search
      )
      .subscribe({
        next: (response) => {
          this.paymentHistory = response.data || [];
          this.totalItems = response.count || 0;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading payment history:', error);
          this.isLoading = false;
        }
      });
  }

  // Receiver Filter
  onReceiverChange(): void {
    this.loadPaymentHistory();
  }

  // Issued Date Filter
  onIssuedDateChange(): void {
    if (this.selectedIssuedDate) {
      this.issuedDateFilter = this.formatDate(this.selectedIssuedDate);
    } else {
      this.issuedDateFilter = '';
    }
    this.loadPaymentHistory();
  }

  clearIssuedDateFilter(): void {
    this.selectedIssuedDate = null;
    this.issuedDateFilter = '';
    this.loadPaymentHistory();
  }

  // Search functionality
  applySearch(): void {
    this.loadPaymentHistory();
  }

  clearSearch(): void {
    this.search = '';
    this.loadPaymentHistory();
  }

  back(): void {
    this.router.navigate(['/finance/action']);
  }

  addNew(): void {
    this.router.navigate(['/finance/action/add-new-payment']);
  }

  editPayment(id: number): void {
    this.router.navigate(['/finance/action/update-payment/', id]);
  }

  deletePayment(id: number, payRef: string): void {
    this.deleteItemId = id;
    this.deleteItemPayRef = payRef;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.deleteItemId !== null) {
      this.isLoading = true;
      this.showDeleteModal = false;

      this.financeService.deletePaymentHistory(this.deleteItemId).subscribe({
        next: () => {
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Payment history deleted successfully',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            },
          });
          this.loadPaymentHistory();
          this.resetDeleteState();
        },
        error: (error) => {
          console.error('Error deleting payment history:', error);
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to delete payment history',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            },
          });
          this.resetDeleteState();
        }
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.resetDeleteState();
  }

  private resetDeleteState(): void {
    this.deleteItemId = null;
    this.deleteItemPayRef = '';
  }

  downloadFile(xlLink: string): void {
    if (xlLink) {
      window.open(xlLink, '_blank');
    }
  }

  // Helper methods
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;

    return `${day} ${month}, ${year}\n${formattedHours}:${minutes} ${ampm}`;
  }

  formatAmount(amount: number | string): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numAmount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}