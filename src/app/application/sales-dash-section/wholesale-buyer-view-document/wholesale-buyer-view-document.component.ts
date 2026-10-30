import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { SalesAgentsService } from '../../../services/dash/sales-agents.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component'; // adjust path/name

interface BuyerDocument {
  id: number;
  customerName: string;
  customerContact: string;
  companyContact: string;
  documentTitle: string;
  documentUrl: string;
  status: string;
}

@Component({
  selector: 'app-wholesale-buyer-view-document',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './wholesale-buyer-view-document.component.html',
  styleUrl: './wholesale-buyer-view-document.component.css',
})
export class WholesaleBuyerViewDocumentComponent implements OnInit {
  isLoading = false;
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
  sanitizedUrl: SafeResourceUrl = '';
  isPDF = false;

  scale = 1;
  translateX = 0;
  translateY = 0;
  isPanning = false;
  startX = 0;
  startY = 0;

  isRejectPopUp = false;
  text = '';
  textAreaTouched = false;

  private readonly swalClasses = {
    popup:
      'bg-white dark:bg-tileBlack text-black dark:text-white rounded-lg pt-2',
    title: 'font-semibold text-lg',
    confirmButton: 'px-6 py-2 rounded-md',
    cancelButton: 'px-6 py-2 rounded-md',
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

  loadDocument(): void {
    this.isLoading = true;
    this.salesAgentsService.viewWholesaleBuyerDocument(this.userId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
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
          this.isPDF = this.checkIfPDF(d.brImg);

          if (this.isPDF) {
            this.sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
              d.brImg,
            );
          } else {
            this.modalImage = d.brImg;
          }
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading wholesale buyer document:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to load document',
          icon: 'error',
          confirmButtonColor: '#C40D0D',
        });
      },
    });
  }

  back(): void {
    this.location.back();
  }

  checkIfPDF(url: string): boolean {
    if (!url) return false;
    const path = url.split('?')[0].split('#')[0];
    return path.split('.').pop()?.toLowerCase() === 'pdf';
  }

  formatPhoneNumber(phoneCode: string, phoneNumber: string): string {
    if (!phoneNumber) return '';
    if (phoneCode === '+94') {
      return '0' + phoneNumber;
    }
    return (phoneCode || '') + phoneNumber;
  }

  // ---- Zoom / pan ----
  zoomIn(): void {
    if (this.scale < 3) {
      this.scale += 0.25;
    }
  }

  zoomOut(): void {
    if (this.scale > 1) {
      this.scale -= 0.25;
      if (this.scale === 1) {
        this.translateX = 0;
        this.translateY = 0;
      }
    }
  }

  getImageTransform(): string {
    return `scale(${this.scale}) translate(${this.translateX}px, ${this.translateY}px)`;
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

  // ---- Approve ----
  openApprovePopup(): void {
    Swal.fire({
      title: 'Please Confirm!',
      text: 'Are you sure you want to Approve this document?',
      showCancelButton: true,
      confirmButtonText: 'Yes, Approve',
      cancelButtonText: 'No, Go Back',
      confirmButtonColor: '#3980C0',
      cancelButtonColor: '#6B7280',
      customClass: this.swalClasses,
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.approveDocument();
      }
    });
  }

  approveDocument(): void {
    this.isLoading = true;
    this.salesAgentsService
      .updateWholesaleBuyerStatus(this.userId, 'Approved')
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.buyerDocument.status = 'Approved';
            Swal.fire({
              title: 'Success!',
              text: 'Document approved successfully',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
              customClass: this.swalClasses,
            }).then(() =>
              this.router.navigate(['/sales-dash/action/buyer-approvals']),
            );
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error approving document:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to approve document',
            icon: 'error',
            confirmButtonColor: '#C40D0D',
            customClass: this.swalClasses,
          });
        },
      });
  }

  // ---- Reject ----
  openRejectPopup(): void {
    this.isRejectPopUp = true;
  }

  rejectDocument(): void {
    this.textAreaTouched = true;
    if (!this.text) {
      return;
    }

    this.isRejectPopUp = false;
    this.isLoading = true;
    this.salesAgentsService
      .updateWholesaleBuyerStatus(this.userId, 'Rejected', this.text)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.buyerDocument.status = 'Rejected';
            Swal.fire({
              title: 'Success!',
              text: 'Document rejected successfully',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
              customClass: this.swalClasses,
            }).then(() => {
              this.text = '';
              this.textAreaTouched = false;
              this.router.navigate(['/sales-dash/action/buyer-approvals']);
            });
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error rejecting document:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to reject document',
            icon: 'error',
            confirmButtonColor: '#C40D0D',
            customClass: this.swalClasses,
          });
        },
      });
  }

  onTextareaClick(): void {
    this.textAreaTouched = true;
  }

  cancelReject(): void {
    this.isRejectPopUp = false;
    this.text = '';
    this.textAreaTouched = false;
  }
}
