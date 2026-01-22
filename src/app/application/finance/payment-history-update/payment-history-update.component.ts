import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { FinanceService } from '../../../services/finance/finance.service';

@Component({
  selector: 'app-payment-history-update',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-history-update.component.html',
  styleUrl: './payment-history-update.component.css'
})
export class PaymentHistoryUpdateComponent implements OnInit {
  paymentId!: number;
  receivers: string = 'Farmers';
  amount: string = '';
  paymentReference: string = '';
  uploadedFile: File | null = null;
  uploadedFileName: string = '';
  existingFileName: string = '';
  existingFileLink: string = '';
  isDragging: boolean = false;
  isUploading: boolean = false;
  isLoading: boolean = true;
  fileChanged: boolean = false;

  receiverOptions = [
    { label: 'Farmers', value: 'Farmers' }
  ];

  // Original data to track changes
  originalData = {
    receivers: '',
    amount: '',
    paymentReference: '',
    fileName: ''
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private financeService: FinanceService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.paymentId = +params['id'];
      if (this.paymentId) {
        this.loadPaymentHistory();
      } else {
        this.showError('Invalid payment history ID');
        this.router.navigate(['/payment-history']);
      }
    });
  }

  loadPaymentHistory(): void {
    this.isLoading = true;

    this.financeService.getPaymentHistoryById(this.paymentId).subscribe({
      next: (response) => {
        this.isLoading = false;

        // Populate form fields
        this.receivers = response.receivers;
        this.amount = this.formatAmountValue(response.amount);
        this.paymentReference = response.payRef;
        this.existingFileLink = response.xlLink;

        // Extract filename from link
        if (response.xlLink) {
          const urlParts = response.xlLink.split('/');
          this.existingFileName = urlParts[urlParts.length - 1];
        }

        // Store original data
        this.originalData = {
          receivers: this.receivers,
          amount: this.amount,
          paymentReference: this.paymentReference,
          fileName: this.existingFileName
        };
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Load error:', error);

        let errorMessage = 'Failed to load payment history. Please try again.';

        if (error.error && error.error.error) {
          errorMessage = error.error.error;
        }

        Swal.fire({
          icon: 'error',
          title: 'Error Loading Data',
          text: errorMessage,
          confirmButtonColor: '#3B82F6',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
            confirmButton: 'bg-blue-500 hover:bg-blue-600',
          },
        }).then(() => {
          this.router.navigate(['/finance/action/viewAll-payments']);
        });
      }
    });
  }

  formatAmountValue(value: number): string {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  back(): void {
  Swal.fire({
    title: 'Are you sure?',
    text: 'You will be redirected to the payments page',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, go to back',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      this.router.navigate(['/finance/action/viewAll-payments']);
    }
  });
}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  handleFile(file: File): void {
    // Validate file type
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File Type',
        text: 'Please upload an Excel file (.xlsx, .xls, or .csv)',
        confirmButtonColor: '#3B82F6',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
          confirmButton: 'bg-blue-500 hover:bg-blue-600',
        },
      });
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'File size should not exceed 10MB',
        confirmButtonColor: '#3B82F6',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
          confirmButton: 'bg-blue-500 hover:bg-blue-600',
        },
      });
      return;
    }

    this.uploadedFile = file;
    this.uploadedFileName = file.name;
    this.fileChanged = true;

    Swal.fire({
      icon: 'success',
      title: 'File Selected',
      text: `${file.name} will replace the existing file`,
      timer: 2000,
      showConfirmButton: false,
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    });
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('csvFileInput') as HTMLInputElement;
    fileInput?.click();
  }

  hasChanges(): boolean {
    return (
      this.receivers !== this.originalData.receivers ||
      this.amount !== this.originalData.amount ||
      this.paymentReference !== this.originalData.paymentReference ||
      this.fileChanged
    );
  }

  validateForm(): boolean {
    if (!this.receivers) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please select receivers',
        confirmButtonColor: '#3B82F6',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
          confirmButton: 'bg-blue-500 hover:bg-blue-600',
        },
      });
      return false;
    }

    if (!this.amount || parseFloat(this.amount.replace(/,/g, '')) <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter a valid amount',
        confirmButtonColor: '#3B82F6',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
          confirmButton: 'bg-blue-500 hover:bg-blue-600',
        },
      });
      return false;
    }

    if (!this.paymentReference.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter payment reference',
        confirmButtonColor: '#3B82F6',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
          confirmButton: 'bg-blue-500 hover:bg-blue-600',
        },
      });
      return false;
    }

    return true;
  }

  onUpdate(): void {
    if (!this.validateForm()) {
      return;
    }

    if (!this.hasChanges()) {
      Swal.fire({
        icon: 'info',
        title: 'No Changes',
        text: 'No changes have been made to update',
        confirmButtonColor: '#3B82F6',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
          confirmButton: 'bg-blue-500 hover:bg-blue-600',
        },
      });
      return;
    }

    // Show loading
    Swal.fire({
      title: 'Updating...',
      text: 'Please wait while we update the payment record',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    });

    this.isUploading = true;
    const cleanAmount = this.amount.replace(/,/g, '');

    this.financeService.updatePaymentHistory(
      this.paymentId,
      this.receivers,
      cleanAmount,
      this.paymentReference,
      this.uploadedFile || undefined
    ).subscribe({
      next: (response) => {
        this.isUploading = false;
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Payment record updated successfully',
          confirmButtonColor: '#3B82F6',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
            confirmButton: 'bg-blue-500 hover:bg-blue-600',
          },
        }).then(() => {
          this.router.navigate(['/finance/action/viewAll-payments']);
        });
      },
      error: (error) => {
        this.isUploading = false;
        console.error('Update error:', error);

        let errorMessage = 'Failed to update payment record. Please try again.';

        if (error.error && error.error.error) {
          errorMessage = error.error.error;
        }

        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: errorMessage,
          confirmButtonColor: '#3B82F6',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
            confirmButton: 'bg-blue-500 hover:bg-blue-600',
          },
        });
      }
    });
  }

  onCancel(): void {
  const forceShowDialog = true;
  
  if (this.hasChanges() || forceShowDialog) {
    console.log('Dialog should appear now');
    Swal.fire({
      icon: 'question',
      title: 'Discard Changes?',
      text: 'You have unsaved changes. Are you sure you want to cancel?',
      showCancelButton: true,
      confirmButtonText: 'Yes, discard',
      cancelButtonText: 'No, keep editing',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
        confirmButton: 'bg-red-500 hover:bg-red-600',
        cancelButton: 'bg-gray-500 hover:bg-gray-600',
      },
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/finance/action/viewAll-payments']);
      }
    });
  } else {
    this.router.navigate(['/finance/action/viewAll-payments']);
  }
}

  formatAmount(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/,/g, '');

    if (value && !isNaN(Number(value))) {
      // Format with commas for thousands
      const parts = value.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      this.amount = parts.join('.');
    }
  }
  removeNewFile(): void {
    Swal.fire({
      icon: 'question',
      title: 'Remove New File?',
      text: 'This will keep the existing file. Are you sure?',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
        confirmButton: 'bg-red-500 hover:bg-red-600',
        cancelButton: 'bg-gray-500 hover:bg-gray-600',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.uploadedFile = null;
        this.uploadedFileName = '';
        this.fileChanged = false;

        const fileInput = document.getElementById('csvFileInput') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }

        Swal.fire({
          icon: 'success',
          title: 'Removed',
          text: 'New file removed. Existing file will be kept.',
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          },
        });
      }
    });
  }

  downloadExistingFile(): void {
    if (this.existingFileLink) {
      window.open(this.existingFileLink, '_blank');
    }
  }

  showError(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonColor: '#3B82F6',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
        confirmButton: 'bg-blue-500 hover:bg-blue-600',
      },
    });
  }
}