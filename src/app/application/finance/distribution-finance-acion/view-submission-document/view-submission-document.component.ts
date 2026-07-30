import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { FinanceService } from '../../../../services/finance/finance.service';

@Component({
  selector: 'app-view-submission-document',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, FormsModule],
  templateUrl: './view-submission-document.component.html',
  styleUrl: './view-submission-document.component.css',
})
export class ViewSubmissionDocumentComponent implements OnInit {
  isLoading = false;
  id: number = 0;

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
      this.id = parseInt(id, 10);
    }
  }

  ngOnInit(): void {
    if (this.id) {
      this.loadShopDocuments();
    } else {
      console.warn('No shop ID provided');
      this.back();
    }
  }

  loadShopDocuments(): void {
    this.isLoading = true;
    this.financeService.viewShortageSubmissionDocument(this.id).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.result) {
          this.transactionDocument = {
            ...response.result,
            prchQty: Number(response.result.prchQty),
            prchPrice: Number(response.result.prchPrice),
          };
          this.paymentSlipUrl = this.transactionDocument.slip;
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
    return url?.toLowerCase().endsWith('.pdf');
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

  getTotal(): number {
    if (!this.transactionDocument) return 0;
    return (
      Number(this.transactionDocument.prchQty) *
      Number(this.transactionDocument.prchPrice)
    );
  }

  openApprovePopup(): void {
    Swal.fire({
      title: 'Please Confirm!',
      text: 'Are you sure you want to mark this submission as Finalized?',
      showCancelButton: true,
      confirmButtonText: 'Yes, Finalize',
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
      .updateShortageSubmissionTransactionStatus(this.id, 'Completed')
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.transactionDocument.reqStatus = 'Completed';

            Swal.fire({
              title: 'Success!',
              text: 'Submission Finalized successfully',
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
                'finance/action/distribution-finance/view-submissions',
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
  product: string;
  prchQty: number;
  prchPrice: number;
  reqStatus: string;
  empId: string;
  phoneCode01: string;
  phoneNumber01: string;
  slip: string;
}
