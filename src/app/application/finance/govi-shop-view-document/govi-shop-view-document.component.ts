import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { FinanceService } from '../../../services/finance/finance.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-govi-shop-view-document',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, FormsModule],
  templateUrl: './govi-shop-view-document.component.html',
  styleUrl: './govi-shop-view-document.component.css',
})
export class GoviShopViewDocumentComponent implements OnInit {
  isLoading = false;
  shopId: number = 0;

  shopDocument!: ShopDocument;

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

  isRejectPopUp: boolean = false;
  // Sample Images
  paymentSlipUrl = '';
  text: string = ''
  textAreaTouched: boolean = false;

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
          this.shopDocument = response.data;
          this.paymentSlipUrl = response.data.paymentSlip;
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

  loadCurrentImage(): void {

    this.modalImage = this.paymentSlipUrl;
    this.modalTitle = 'Payment Slip';
    this.isPDF = this.checkIfPDF(this.paymentSlipUrl);

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
      text: 'Are you sure you want to Activate the membership?',
      showCancelButton: true,
      confirmButtonText: 'Yes, Activate',
      cancelButtonText: 'No, Go Back',
      confirmButtonColor: '#3980C0',
      cancelButtonColor: '#6B7280',
      customClass: {
        popup: 'bg-white dark:bg-tileBlack text-black dark:text-white rounded-lg pt-2',
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
      .renewGoviShopUser(this.shopId, 'Activate')
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            Swal.fire({
              title: 'Success!',
              text: 'GoViShop Membership renewed successfully',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: 'bg-white dark:bg-tileBlack text-black dark:text-white rounded-lg pt-2',
                title: 'font-semibold text-lg',
                confirmButton: 'px-6 py-2 rounded-md',
                cancelButton: 'px-6 py-2 rounded-md',
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
          console.error('Error renewing GoViShop membership:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to renew GoViShop membership',
            icon: 'error',
            confirmButtonColor: '#C40D0D',
            customClass: {
              popup: 'bg-white dark:bg-tileBlack text-black dark:text-white rounded-lg pt-2',
              title: 'font-semibold text-lg',
              confirmButton: 'px-6 py-2 rounded-md',
              cancelButton: 'px-6 py-2 rounded-md',
            },
          });
        },
      });
  }

  // Reject Action
  openRejectPopup(): void {
    this.isRejectPopUp = true;
    // Swal.fire({
    //   title: 'Please Confirm!',
    //   text: 'Are you sure you want to Reject the membership?',
    //   showCancelButton: true,
    //   confirmButtonText: 'Yes, Reject',
    //   cancelButtonText: 'No, Go Back',
    //   confirmButtonColor: '#C40D0D',
    //   cancelButtonColor: '#6B7280',
    //   customClass: {
    //     popup:
    //       'bg-white dark:bg-tileBlack text-black dark:text-white rounded-lg pt-2',
    //     title: 'font-semibold text-lg',
    //     confirmButton: 'px-6 py-2 rounded-md',
    //     cancelButton: 'px-6 py-2 rounded-md',
    //   },
    //   reverseButtons: true,
      
    // }).then((result) => {
    //   if (result.isConfirmed) {
    //     this.isRejectPopUp = true;
    //     // this.rejectMembership();
    //   }
    // });
  }

  rejectMembership(): void {

    this.textAreaTouched = true;

    if (!this.text) {
      return;
    }
    
    this.isRejectPopUp = false;
    this.isLoading = true;
    this.financeService
      .rejectGoviShopUser(this.shopId, this.text)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.status) {
            Swal.fire({
              title: 'Success!',
              text: 'GoViShop Membership rejected successfully',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: 'bg-white dark:bg-tileBlack text-black dark:text-white rounded-lg pt-2',
                title: 'font-semibold text-lg',
                confirmButton: 'px-6 py-2 rounded-md',
                cancelButton: 'px-6 py-2 rounded-md',
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
          console.error('Error rejecting GoViShop membership:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to reject GoViShop membership',
            icon: 'error',
            confirmButtonColor: '#C40D0D',
            customClass: {
              popup: 'bg-white dark:bg-tileBlack text-black dark:text-white rounded-lg pt-2',
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

interface ShopDocument {
  id: number;
  ownername: string;
  shopPhone: string;
  nic: string;
  accessStatus: string;
  isActivated: string;
  currentPlan: string;
  paymentSlip: string;
  planPrice: string;
}
