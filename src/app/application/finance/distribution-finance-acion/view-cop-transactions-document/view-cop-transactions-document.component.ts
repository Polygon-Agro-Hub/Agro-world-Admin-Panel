import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { FinanceService } from '../../../../services/finance/finance.service';

@Component({
  selector: 'app-view-cop-transactions-document',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, FormsModule],
  templateUrl: './view-cop-transactions-document.component.html',
  styleUrl: './view-cop-transactions-document.component.css',
})
export class ViewCopTransactionsDocumentComponent implements OnInit {
  isLoading = false;
  id: number = 0;

  transactionDocument!: TransactionDocument;

  modalImage = '';
  modalTitle = '';
  sanitizedUrl: SafeResourceUrl = '';
  scale = 1;
  translateX = 0;
  translateY = 0;
  isPanning = false;
  startX = 0;
  startY = 0;

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
      this.loadCopTransactionDocument();
    } else {
      console.warn('No transaction ID provided');
      this.back();
    }
  }

  loadCopTransactionDocument(): void {
    this.isLoading = true;
    this.financeService.viewCopTransactionDocument(this.id).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          const result = Array.isArray(response.data)
            ? response.data[0]
            : response.data;

          if (!result) {
            console.warn('No transaction document found');
            return;
          }

          this.transactionDocument = {
            id: this.id,
            empId: result.empId,
            officerName: result.officerName,
            phoneCode01: result.phoneCode01,
            phoneNumber01: result.phoneNumber01,
            handOverPrice: Number(result.handOverPrice),
            transactionStatus: result.transactionStatus,
            slip: result.slip,
          };

          this.loadCurrentImage();
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading COP transaction document:', error);
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
    this.modalImage = this.transactionDocument.slip;
    this.modalTitle = 'Payment Slip';
    this.isPDF = this.checkIfPDF(this.modalImage);

    if (this.isPDF) {
      this.sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        this.modalImage,
      );
    }
  }

  checkIfPDF(url: string): boolean {
    return url?.toLowerCase().endsWith('.pdf');
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
      text: 'Are you sure you want to Finalize this transaction?',
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
    this.financeService.updateCopTransactionStatus(this.id).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.transactionDocument.transactionStatus = 'Completed';

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
              '/finance/action/distribution-finance/view-transactions',
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
}

interface TransactionDocument {
  id: number;
  empId: string;
  officerName: string;
  phoneCode01: string;
  phoneNumber01: string;
  handOverPrice: number;
  transactionStatus: string;
  slip: string;
}
