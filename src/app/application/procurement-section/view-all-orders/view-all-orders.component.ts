import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { ProcumentsService } from '../../../services/procuments/procuments.service'; // <-- your service
import { FinalinvoiceService } from '../../../services/invoice/finalinvoice.service';
import { PostinvoiceService } from '../../../services/invoice/postinvoice.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';

interface AllOrder {
  id: number;
  orderId: number;
  invNo: string;
  orderApp: string;
  scheduleDate: Date | null;
  customerName: string;
  buyerType: string | null;
  companyNameEnglish: string | null;
  method: string;
  creditPaid: number;
  paymentMethod: string | null;
  moneyPaid: number;
  amount: number;
  status: string;
  qrCode: string;
  orderdDate: Date; // spelled this way in the API response
  isConfirmed: number;
  isPackage: number;
  isFinalized: number;
  packingStatus: string;
}

@Component({
  selector: 'app-view-all-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    CalendarModule,
    NgxPaginationModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './view-all-orders.component.html',
  styleUrl: './view-all-orders.component.css',
})
export class ViewAllOrdersComponent implements OnInit {
  allOrders: AllOrder[] = [];

  page = 1;
  itemsPerPage = 10;
  totalItems = 0;
  hasData = true;
  isLoading = false;

  searchItem = '';
  selectDate: Date | null = null;
  selectScheduleDate: Date | null = null;
  formattedDate = '';
  formattedScheduleDate = '';
  selectMethod = '';
  selectStatus = '';

  // Download popup
  showDownloadModal = false;
  dlOrderedFrom: Date | null = null;
  dlOrderedTo: Date | null = null;
  dlScheduledFrom: Date | null = null;
  dlScheduledTo: Date | null = null;
  dlConfirmation = '';

  // Values must match what the backend checks exactly
  confirmationOptions = [
    { label: 'Confirmed', value: 'Confirmed' },
    { label: 'Not Confirmed', value: 'Not Confirmed' },
  ];

  methodOptions = [
    { label: 'Delivery', value: 'delivery' },
    { label: 'Pickup', value: 'pickup' },
  ];

  statusOptions = [
    { label: 'Assigned', value: 'Ordered' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Hold', value: 'Hold' },
    { label: 'Out For Delivery', value: 'Out For Delivery' },
    { label: 'Picked Up', value: 'Picked up' },
    { label: 'On the Way', value: 'On the way' },
    { label: 'Processing', value: 'Processing' },
    { label: 'Ready to Pickup', value: 'Ready to Pickup' },
    { label: 'Collected', value: 'Collected' },
    { label: 'Return', value: 'Return' },
    { label: 'Return Received', value: 'Return Received' },
  ].sort((a, b) => a.label.localeCompare(b.label));

  constructor(
    private procumentsSrv: ProcumentsService,
    private finalInvoiceService: FinalinvoiceService,
    private postInvoiceService: PostinvoiceService,
    public permissionService: PermissionService,
    public tokenService: TokenService,
  ) { }

  ngOnInit(): void {
    this.fetchAllOrders();
  }

  // ---------- List ----------
  fetchAllOrders() {
    this.isLoading = true;
    this.procumentsSrv
      .getAllOrders(
        this.page,
        this.itemsPerPage,
        this.selectStatus,
        this.selectMethod,
        this.searchItem,
        this.formattedDate,
        this.formattedScheduleDate,
      )
      .subscribe({
        next: (res) => {
          this.allOrders = res.items;
          this.totalItems = res.total;
          this.hasData = this.allOrders.length > 0;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching orders:', err);
          this.isLoading = false;
          this.allOrders = [];
          this.totalItems = 0;
          this.hasData = false;
        },
      });
  }

  onPageChange(p: number) {
    this.page = p;
    this.fetchAllOrders();
  }

  searchOrders() {
    this.searchItem = this.searchItem.trim();
    this.page = 1;
    this.fetchAllOrders();
  }

  clearSearch() {
    this.searchItem = '';
    this.page = 1;
    this.fetchAllOrders();
  }

  applyMethodFilters() {
    this.page = 1;
    this.fetchAllOrders();
  }

  applyStatusFilters() {
    this.page = 1;
    this.fetchAllOrders();
  }

  dateFilter() {
    this.formattedDate = this.toYmd(this.selectDate);
    this.page = 1;
    this.fetchAllOrders();
  }

  onDateClear() {
    this.formattedDate = '';
    this.page = 1;
    this.fetchAllOrders();
  }

  scheduleDateFilter() {
    this.formattedScheduleDate = this.toYmd(this.selectScheduleDate);
    this.page = 1;
    this.fetchAllOrders();
  }

  onScheduleDateClear() {
    this.formattedScheduleDate = '';
    this.page = 1;
    this.fetchAllOrders();
  }

  private toYmd(d: Date | null): string {
    if (!(d instanceof Date)) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // ---------- Download popup ----------
  downloadOrders() {
    this.showDownloadModal = true;
  }

  closeDownloadModal() {
    this.showDownloadModal = false;
    this.dlOrderedFrom = null;
    this.dlOrderedTo = null;
    this.dlScheduledFrom = null;
    this.dlScheduledTo = null;
    this.dlConfirmation = '';
  }

  confirmDownload() {
    if (!this.isDownloadFormValid) return;
    const filters = {
      orderedFrom: this.toYmd(this.dlOrderedFrom),
      orderedTo: this.toYmd(this.dlOrderedTo),
      scheduledFrom: this.toYmd(this.dlScheduledFrom),
      scheduledTo: this.toYmd(this.dlScheduledTo),
      confirmation: this.dlConfirmation,
    };

    this.isLoading = true;
    this.procumentsSrv.downloadOrders(filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `All Orders ordered between ${filters.orderedFrom} - ${filters.orderedTo}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.isLoading = false;
        this.closeDownloadModal();
      },
      error: (err) => {
        console.error('Error downloading orders:', err);
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to download orders. Please try again.',
          confirmButtonColor: '#3085d6',
        });
      },
    });
  }

  // ---------- Row actions ----------
  downloadInvoice(item: AllOrder) {
    this.isLoading = true;
    this.finalInvoiceService
      .generateAndDownloadInvoice(item.orderId, item.invNo)
      .catch((error) => {
        console.error('Error generating invoice:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to download invoice. Please try again.',
          confirmButtonColor: '#3085d6',
        });
      })
      .finally(() => (this.isLoading = false));
  }

  downloadPostInvoice(item: AllOrder) {
    this.isLoading = true;
    this.postInvoiceService
      .generateAndDownloadInvoice(item.orderId, item.invNo)
      .catch((error) => {
        console.error('Error generating invoice:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to download invoice. Please try again.',
          confirmButtonColor: '#3085d6',
        });
      })
      .finally(() => (this.isLoading = false));
  }

  isPostInvoiceEnabled(item: AllOrder): boolean {
    const packingStatus = String(item.packingStatus || '').trim();
    if (Number(item.isPackage) === 1 && packingStatus) {
      return packingStatus.toLowerCase() === 'dispatch';
    }

    const isConfirmed = Number(item.isConfirmed) === 1;
    const isPackage = Number(item.isPackage) === 1;
    const isFinalized = Number(item.isFinalized) === 1;

    return isConfirmed || (isPackage && isFinalized);
  }

  downloadQRCode(item: AllOrder) {
    if (!item.qrCode) return;
    const fileName = `QR_${item.invNo}.png`;

    fetch(item.qrCode)
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.blob();
      })
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch((error) => {
        console.error('Error downloading QR code:', error);
        alert('Failed to download QR code. Please try again.');
      });
  }

  get isDownloadFormValid(): boolean {
    return !!(
      this.dlOrderedFrom &&
      this.dlOrderedTo &&
      this.dlScheduledFrom &&
      this.dlScheduledTo &&
      this.dlConfirmation
    );
  }


}