import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { FinanceService } from '../../../../services/finance/finance.service';

@Component({
  selector: 'app-view-transaction-document',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, FormsModule],
  templateUrl: './view-transaction-document.component.html',
  styleUrl: './view-transaction-document.component.css',
})
export class ViewTransactionDocumentComponent implements OnInit {
  isLoading = false;
  shopId: number = 0;

  transactionDocument!: TransactionDocument;

  isModalOpen = false;
  modalImage = '';
  modalTitle = '';
  sanitizedUrl: SafeResourceUrl = '';
  scale = 1;
  translateX = 0;
  translateY = 0;
  isPanning = false;
  startX = 0;
  startY = 0;

  isRejectPopUp: boolean = false;
  paymentSlipUrl = '';
  text: string = '';
  textAreaTouched: boolean = false;

  isPDF = false;

  constructor(
    private location: Location,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private router: Router,
    private financeService: FinanceService,
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.shopId = parseInt(id, 10);
    }
  }

  ngOnInit(): void {
    if (this.shopId) {
      this.loadShopDocuments();
    } else {
      console.warn('No shop ID provided');
      this.back();
    }
  }

  loadShopDocuments(): void {
    this.isLoading = true;
    this.financeService.viewTransactionDocument(this.shopId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          const data = Array.isArray(response.data)
            ? response.data[0]
            : response.data;
          this.transactionDocument = data;
          this.paymentSlipUrl = data.paySlip;
          this.loadCurrentImage();
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading transaction document:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to load transaction document',
          icon: 'error',
          confirmButtonColor: '#C40D0D',
        });
      },
    });
  }

  back(): void {
    this.location.back();
  }

  loadCurrentImage(): void {
    this.modalImage = this.paymentSlipUrl;
    this.modalTitle = 'Payment Slip';
    this.isPDF = this.checkIfPDF(this.paymentSlipUrl);

    if (this.isPDF) {
      this.sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        this.modalImage,
      );
    }
  }

  checkIfPDF(url: string): boolean {
    return url.toLowerCase().endsWith('.pdf');
  }

  resetImageTransform(): void {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.isPanning = false;
  }

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

  formatPhoneNumber(phoneCode: string, phoneNumber: string): string {
    if (phoneCode === '+94') {
      return '0' + phoneNumber;
    }
    return phoneCode + phoneNumber;
  }

  openApprovePopup(): void {
    Swal.fire({
      title: 'Please Confirm!',
      text: 'Are you sure you want to Approve this transaction?',
      showCancelButton: true,
      confirmButtonText: 'Yes, Approve',
      cancelButtonText: 'No, Go Back',
      confirmButtonColor: '#3980C0',
      cancelButtonColor: '#6B7280',
      customClass: {
        popup:
          'bg-white dark:bg-tileBlack text-black dark:text-white rounded-lg pt-2',
        title: 'font-semibold text-lg',
        confirmButton: 'px-6 py-2 rounded-md',
        cancelButton: 'px-6 py-2 rounded-md',
      },
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.approveTransaction();
      }
    });
  }

  approveTransaction(): void {
    this.isLoading = true;
    this.financeService
      .updateTransactionStatus(this.shopId, 'Approved')
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            Swal.fire({
              title: 'Success!',
              text: 'Transaction approved successfully',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup:
                  'bg-white dark:bg-tileBlack text-black dark:text-white rounded-lg pt-2',
                title: 'font-semibold text-lg',
                confirmButton: 'px-6 py-2 rounded-md',
                cancelButton: 'px-6 py-2 rounded-md',
              },
            }).then(() => {
              this.router.navigate([
                'finance/action/govi-trans-finance/view-transactions',
              ]);
            });
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error approving transaction:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to approve transaction',
            icon: 'error',
            confirmButtonColor: '#C40D0D',
            customClass: {
              popup:
                'bg-white dark:bg-tileBlack text-black dark:text-white rounded-lg pt-2',
              title: 'font-semibold text-lg',
              confirmButton: 'px-6 py-2 rounded-md',
              cancelButton: 'px-6 py-2 rounded-md',
            },
          });
        },
      });
  }

  openRejectPopup(): void {
    this.isRejectPopUp = true;
  }

  rejectMembership(): void {
    this.textAreaTouched = true;

    if (!this.text) {
      return;
    }

    this.isRejectPopUp = false;
    this.isLoading = true;
    this.financeService
      .updateTransactionStatus(this.shopId, 'Rejected', this.text)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            Swal.fire({
              title: 'Success!',
              text: 'Transaction rejected successfully',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup:
                  'bg-white dark:bg-tileBlack text-black dark:text-white rounded-lg pt-2',
                title: 'font-semibold text-lg',
                confirmButton: 'px-6 py-2 rounded-md',
                cancelButton: 'px-6 py-2 rounded-md',
              },
            }).then(() => {
              this.router.navigate([
                '/finance/action/govi-trans-finance/view-transactions',
              ]);
              this.transactionDocument.transStatus = 'Rejected';
              this.text = '';
              this.textAreaTouched = false;
            });
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error rejecting transaction:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to reject transaction',
            icon: 'error',
            confirmButtonColor: '#C40D0D',
            customClass: {
              popup:
                'bg-white dark:bg-tileBlack text-black dark:text-white rounded-lg pt-2',
              title: 'font-semibold text-lg',
              confirmButton: 'px-6 py-2 rounded-md',
              cancelButton: 'px-6 py-2 rounded-md',
            },
          });
          this.isRejectPopUp = false;
        },
      });
  }

  onTextareaClick() {
    this.textAreaTouched = true;
  }

  cancelDelete(): void {
    this.isRejectPopUp = false;
    this.text = '';
    this.textAreaTouched = false;
  }
}

interface TransactionDocument {
  id: number;
  transAmount: number;
  paySlip: string;
  transStatus: string;
  driverId: number;
  empId: string;
  firstNameEnglish: string;
  lastNameEnglish: string;
  phoneCode01: string;
  phoneNumber01: string;
}
