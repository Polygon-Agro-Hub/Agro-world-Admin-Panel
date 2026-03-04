import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { FinanceService } from '../../../services/finance/finance.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-govi-shop-view-document',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './govi-shop-view-document.component.html',
  styleUrl: './govi-shop-view-document.component.css',
})
export class GoviShopViewDocumentComponent implements OnInit {
  isLoading = false;
  shopId: number = 0;

  shopDocument: ShopDocument = {
    id: 0,
    shopName: '',
    ownername: '',
    shopPhone: '',
    nic: '',
    brImg: '',
    paySlip: '',
    userStatus: 'Deactivate',
  };

  // Document status
  isRenewed = false;
  isRejected = false;

  // Image Modal Properties
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

  currentTab: 'BR Image' | 'Payment Slip' = 'BR Image';

  // Sample Images
  brImageUrl = '';
  paymentSlipUrl = '';

  // File type detection
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
    this.financeService.goviShopViewDocument(this.shopId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.shopDocument = {
            id: response.data.id || 0,
            shopName: response.data.shopName || '',
            ownername: response.data.ownername || '',
            shopPhone: response.data.shopPhone || '',
            nic: response.data.nic || '',
            brImg: response.data.brImg || '',
            paySlip: response.data.paySlip || '',
            userStatus: response.data.userStatus || 'Deactivate',
          };
          this.isRenewed = this.shopDocument.userStatus === 'Activate';
          this.isRejected = this.shopDocument.userStatus === 'Rejected';
          this.brImageUrl = this.shopDocument.brImg;
          this.paymentSlipUrl = this.shopDocument.paySlip;
          this.loadCurrentImage();
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading shop documents:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to load shop documents',
          icon: 'error',
          confirmButtonColor: '#C40D0D',
        });
      },
    });
  }

  back(): void {
    this.location.back();
  }

  selectTab(tab: 'BR Image' | 'Payment Slip'): void {
    this.currentTab = tab;
    this.loadCurrentImage();
    this.resetImageTransform();
  }

  previousTab(): void {
    if (this.currentTab === 'Payment Slip') {
      this.selectTab('BR Image');
    }
  }

  nextTab(): void {
    if (this.currentTab === 'BR Image') {
      this.selectTab('Payment Slip');
    }
  }

  loadCurrentImage(): void {
    if (this.currentTab === 'BR Image') {
      this.modalImage = this.brImageUrl;
      this.modalTitle = 'BR Image';
      this.isPDF = this.checkIfPDF(this.brImageUrl);
    } else {
      this.modalImage = this.paymentSlipUrl;
      this.modalTitle = 'Payment Slip';
      this.isPDF = this.checkIfPDF(this.paymentSlipUrl);
    }

    // Sanitize URL for PDF viewer
    if (this.isPDF) {
      this.sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        this.modalImage,
      );
    }
  }

  // Check if the file is a PDF
  checkIfPDF(url: string): boolean {
    return url.toLowerCase().endsWith('.pdf');
  }

  // Image Modal Methods
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

  // Renew Action
  openRenewPopup(): void {
    Swal.fire({
      title: 'Please Confirm!',
      text: 'Are you sure you want to Renew the membership?',
      showCancelButton: true,
      confirmButtonText: 'Yes, Renew',
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
        this.renewMembership();
      }
    });
  }

  renewMembership(): void {
    this.isLoading = true;
    this.financeService
      .updateGoviShopUserStatus(this.shopId, 'Activate')
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.isRenewed = true;
            this.isRejected = false;
            this.shopDocument.userStatus = 'Activate';
            Swal.fire({
              title: 'Success!',
              text: response.message || 'Membership renewed successfully',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: 'bg-white dark:bg-tileBlack text-black dark:text-white',
              },
            }).then(() => {
              this.router.navigate([
                '/finance/action/finance-govishop/view-action',
              ]);
            });
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error renewing membership:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to renew membership',
            icon: 'error',
            confirmButtonColor: '#C40D0D',
          });
        },
      });
  }

  // Reject Action
  openRejectPopup(): void {
    Swal.fire({
      title: 'Please Confirm!',
      text: 'Are you sure you want to Reject the membership?',
      showCancelButton: true,
      confirmButtonText: 'Yes, Reject',
      cancelButtonText: 'No, Go Back',
      confirmButtonColor: '#C40D0D',
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
        this.rejectMembership();
      }
    });
  }

  rejectMembership(): void {
    this.isLoading = true;
    this.financeService
      .updateGoviShopUserStatus(this.shopId, 'Rejected')
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.isRejected = true;
            this.isRenewed = false;
            this.shopDocument.userStatus = 'Rejected';
            Swal.fire({
              title: 'Rejected!',
              text: response.message || 'Membership rejected successfully',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: 'bg-white dark:bg-tileBlack text-black dark:text-white',
              },
            }).then(() => {
              this.router.navigate([
                '/finance/action/finance-govishop/view-action',
              ]);
            });
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error rejecting membership:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to reject membership',
            icon: 'error',
            confirmButtonColor: '#C40D0D',
          });
        },
      });
  }
}

interface ShopDocument {
  id: number;
  shopName: string;
  ownername: string;
  shopPhone: string;
  nic: string;
  brImg: string;
  paySlip: string;
  userStatus: string;
}
