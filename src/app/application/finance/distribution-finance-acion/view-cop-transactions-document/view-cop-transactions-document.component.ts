import { CommonModule, Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import heic2any from 'heic2any';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { FinanceService } from '../../../../services/finance/finance.service';

@Component({
  selector: 'app-view-cop-transactions-document',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, FormsModule],
  templateUrl: './view-cop-transactions-document.component.html',
  styleUrl: './view-cop-transactions-document.component.css',
})
export class ViewCopTransactionsDocumentComponent implements OnInit, OnDestroy {
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

  // Holds the converted HEIC -> JPEG blob URL so it can be released later
  private heicObjectUrl: string | null = null;

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

  ngOnDestroy(): void {
    this.revokeHeicObjectUrl();
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
    const url = this.transactionDocument.slip;

    this.modalTitle = 'Payment Slip';
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.isPDF = this.checkIfPDF(url);

    if (this.isPDF) {
      this.modalImage = url;
      this.sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    } else if (this.checkIfHEIC(url)) {
      this.convertHeicToJpeg(url);
    } else {
      this.modalImage = url;
    }
  }

  // Removes query string / hash (e.g. signed URLs) before checking the extension
  private getCleanUrl(url: string): string {
    return (url || '').split('?')[0].split('#')[0].toLowerCase();
  }

  checkIfPDF(url: string): boolean {
    return this.getCleanUrl(url).endsWith('.pdf');
  }

  checkIfHEIC(url: string): boolean {
    const clean = this.getCleanUrl(url);
    return clean.endsWith('.heic') || clean.endsWith('.heif');
  }

  private async convertHeicToJpeg(url: string): Promise<void> {
    this.isLoading = true;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download image (${response.status})`);
      }

      const heicBlob = await response.blob();

      const converted = await heic2any({
        blob: heicBlob,
        toType: 'image/jpeg',
        quality: 0.9,
      });

      // heic2any returns an array for multi-image HEIC files
      const jpegBlob = Array.isArray(converted) ? converted[0] : converted;

      this.revokeHeicObjectUrl();
      this.heicObjectUrl = URL.createObjectURL(jpegBlob);
      this.modalImage = this.heicObjectUrl;
    } catch (error) {
      console.error('Error converting HEIC image:', error);
      this.modalImage = '';
      Swal.fire({
        title: 'Error!',
        text: 'Failed to display the HEIC image',
        icon: 'error',
        confirmButtonColor: '#C40D0D',
      });
    } finally {
      this.isLoading = false;
    }
  }

  private revokeHeicObjectUrl(): void {
    if (this.heicObjectUrl) {
      URL.revokeObjectURL(this.heicObjectUrl);
      this.heicObjectUrl = null;
    }
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