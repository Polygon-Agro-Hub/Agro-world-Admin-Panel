import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { SalesAgentsService } from '../../../services/dash/sales-agents.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

interface BuyerDocument {
  id: number;
  customerName: string;
  customerContact: string;
  companyContact: string;
  documentTitle: string;
  documentUrl: string;
  status: string;
}

type StatusAction = 'Approved' | 'Rejected';

@Component({
  selector: 'app-wholesale-buyer-view-document',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './wholesale-buyer-view-document.component.html',
  styleUrl: './wholesale-buyer-view-document.component.css',
})
export class WholesaleBuyerViewDocumentComponent implements OnInit {
  isLoading = false;
  isSubmitting = false;
  userId = 0;

  buyerDocument: BuyerDocument = {
    id: 0,
    customerName: '',
    customerContact: '',
    companyContact: '',
    documentTitle: 'BR Document',
    documentUrl: '',
    status: '',
  };

  modalImage = '';
  modalTitle = 'BR Document';
  sanitizedUrl: SafeResourceUrl | null = null;
  isPDF = false;

  scale = 1;
  translateX = 0;
  translateY = 0;
  isPanning = false;
  startX = 0;
  startY = 0;

  private readonly MIN_SCALE = 1;
  private readonly MAX_SCALE = 3;
  private readonly SCALE_STEP = 0.25;
  private readonly SCALE_EPSILON = 0.0001;

  private readonly swalClasses = {
    popup:
      'bg-white dark:bg-tileBlack text-black dark:text-white rounded-2xl pt-2',
    title: 'font-semibold text-lg',
    confirmButton: 'px-6 py-2.5 rounded-lg',
    cancelButton: 'px-6 py-2.5 rounded-lg',
  };

  constructor(
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private salesAgentsService: SalesAgentsService,
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId = parseInt(id, 10);
    }
  }

  ngOnInit(): void {
    if (this.userId) {
      this.loadDocument();
    } else {
      console.warn('No user ID provided');
      this.back();
    }
  }

  // ---------------------------------------------------------------
  // Load
  // ---------------------------------------------------------------
  loadDocument(): void {
    this.isLoading = true;
    this.modalImage = '';
    this.sanitizedUrl = null;
    this.isPDF = false;
    this.resetZoom();

    this.salesAgentsService.viewWholesaleBuyerDocument(this.userId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (!response?.success || !response?.data) {
          this.showError('Failed to load document');
          return;
        }

        const d = response.data;
        this.buyerDocument = {
          id: d.userId,
          customerName: `${d.firstName ?? ''} ${d.lastName ?? ''}`.trim(),
          customerContact: this.formatPhoneNumber(d.phoneCode, d.phoneNumber),
          companyContact: this.formatPhoneNumber(
            d.companyPhoneCode,
            d.companyPhone,
          ),
          documentTitle: 'BR Document',
          documentUrl: d.brImg,
          status: d.approveStatus,
        };

        this.modalTitle = this.buyerDocument.documentTitle;

        if (!this.isSafeUrl(d.brImg)) {
          console.warn('Rejected unsafe document URL:', d.brImg);
          this.showError('Document URL is invalid');
          return;
        }

        this.isPDF = this.checkIfPDF(d.brImg);
        if (this.isPDF) {
          this.sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            d.brImg,
          );
        } else {
          this.modalImage = d.brImg;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading wholesale buyer document:', error);
        this.showError('Failed to load document');
      },
    });
  }

  back(): void {
    this.location.back();
  }

  // ---------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------
  private checkIfPDF(url: string): boolean {
    if (!url) return false;
    const path = url.split('?')[0].split('#')[0];
    return path.split('.').pop()?.toLowerCase() === 'pdf';
  }

  private isSafeUrl(url: string | null | undefined): boolean {
    if (!url || typeof url !== 'string') return false;
    return /^https?:\/\//i.test(url.trim());
  }

  formatPhoneNumber(
    phoneCode?: string | null,
    phoneNumber?: string | null,
  ): string {
    if (!phoneNumber) return '';
    const code = (phoneCode ?? '').trim();
    const num = phoneNumber.trim();

    if (code === '+94') {
      return '0' + num.replace(/^0+/, '');
    }
    return code + num;
  }

  onImageError(event: Event): void {
    console.error('Failed to load image', event);
    this.modalImage = '';
  }

  // ---------------------------------------------------------------
  // Zoom / Pan
  // ---------------------------------------------------------------
  zoomIn(): void {
    this.scale = Math.min(this.MAX_SCALE, this.scale + this.SCALE_STEP);
  }

  zoomOut(): void {
    this.scale = Math.max(this.MIN_SCALE, this.scale - this.SCALE_STEP);
    if (this.scale <= this.MIN_SCALE + this.SCALE_EPSILON) {
      this.resetZoom();
    }
  }

  private resetZoom(): void {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.isPanning = false;
  }

  getImageTransform(): string {
    return `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
  }

  onMouseDown(event: MouseEvent): void {
    if (this.scale > 1) {
      this.isPanning = true;
      this.startX = event.clientX - this.translateX;
      this.startY = event.clientY - this.translateY;
      event.preventDefault();
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (this.isPanning && this.scale > 1) {
      this.translateX = event.clientX - this.startX;
      this.translateY = event.clientY - this.startY;
    }
  }

  onMouseUp(): void {
    this.isPanning = false;
  }

  onMouseLeave(): void {
    this.isPanning = false;
  }

  // ---------------------------------------------------------------
  // Approve
  // ---------------------------------------------------------------
  openApprovePopup(): void {
    if (this.isSubmitting) return;
    Swal.fire({
      title: 'Please Confirm!',
      text: 'Are you sure you want to Approve this wholesale buyer?',
      showCancelButton: true,
      confirmButtonText: 'Yes, Approve',
      cancelButtonText: 'No, Go Back',
      confirmButtonColor: '#3980C0',
      cancelButtonColor: '#74788D',
      customClass: this.swalClasses,
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.updateStatus('Approved');
      }
    });
  }

  // ---------------------------------------------------------------
  // Reject
  // ---------------------------------------------------------------
  openRejectPopup(): void {
    if (this.isSubmitting) return;
    Swal.fire({
      title: 'Please Confirm!',
      text: 'Are you sure you want to Reject this wholesale buyer?',
      showCancelButton: true,
      confirmButtonText: 'Yes, Reject',
      cancelButtonText: 'No, Go Back',
      confirmButtonColor: '#C40D0D',
      cancelButtonColor: '#74788D',
      customClass: this.swalClasses,
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.updateStatus('Rejected');
      }
    });
  }

  // ---------------------------------------------------------------
  // Shared status update
  // ---------------------------------------------------------------
  private updateStatus(status: StatusAction): void {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    this.isLoading = true;

    this.salesAgentsService
      .updateWholesaleBuyerStatus(this.userId, status)
      .subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.isLoading = false;

          if (!response?.success) {
            this.showError(`Failed to ${status.toLowerCase()} document`);
            return;
          }

          this.buyerDocument.status = status;

          Swal.fire({
            title: 'Success!',
            text: `Wholesale buyer ${status.toLowerCase()} successfully`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            customClass: this.swalClasses,
          }).then(() =>
            this.router.navigate(['/sales-dash/action/buyer-approvals']),
          );
        },
        error: (error) => {
          this.isSubmitting = false;
          this.isLoading = false;
          console.error(`Error ${status.toLowerCase()} document:`, error);
          this.showError(`Failed to ${status.toLowerCase()} document`);
        },
      });
  }

  // ---------------------------------------------------------------
  // Swal helper
  // ---------------------------------------------------------------
  private showError(text: string): void {
    Swal.fire({
      title: 'Error!',
      text,
      icon: 'error',
      confirmButtonColor: '#C40D0D',
      customClass: this.swalClasses,
    });
  }
}
