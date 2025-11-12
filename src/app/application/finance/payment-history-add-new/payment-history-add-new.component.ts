import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FinanceService } from '../../../services/finance/finance.service';

@Component({
  selector: 'app-payment-history-add-new',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-history-add-new.component.html',
  styleUrl: './payment-history-add-new.component.css'
})
export class PaymentHistoryAddNewComponent {
  receivers: string = 'Farmers';
  amount: string = '';
  paymentReference: string = '';
  uploadedFile: File | null = null;
  uploadedFileName: string = '';
  isDragging: boolean = false;
  isUploading: boolean = false;

  receiverOptions = [
    { label: 'Farmers', value: 'Farmers' }
  ];

  constructor(
    private router: Router,
    private financeService: FinanceService
  ) {}

  back(): void {
    this.router.navigate(['/finance/action/viewAll-payments']);
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
    // Validate file type (Excel files)
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
    const maxSize = 10 * 1024 * 1024; // 10MB
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

    // Show success notification
    Swal.fire({
      icon: 'success',
      title: 'File Selected',
      text: `${file.name} has been selected successfully`,
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

    if (!this.uploadedFile) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please upload a CSV/Excel file',
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

  onUpload(): void {
    if (!this.validateForm()) {
      return;
    }

    // Show loading indicator
    Swal.fire({
      title: 'Uploading...',
      text: 'Please wait while we upload your payment file',
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

    // Remove commas from amount before sending
    const cleanAmount = this.amount.replace(/,/g, '');

    this.financeService.createPaymentHistory(
      this.receivers,
      cleanAmount,
      this.paymentReference,
      this.uploadedFile!
    ).subscribe({
      next: (response) => {
        this.isUploading = false;
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Payment file uploaded successfully',
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
        console.error('Upload error:', error);
        
        let errorMessage = 'Failed to upload payment file. Please try again.';
        
        if (error.error && error.error.error) {
          errorMessage = error.error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }

        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
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
    // Check if there's unsaved data
    if (this.amount || this.paymentReference || this.uploadedFile) {
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
      // Format with commas
      value = Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      this.amount = value;
    }
  }

  // Helper method to remove file
  removeFile(): void {
    Swal.fire({
      icon: 'question',
      title: 'Remove File?',
      text: 'Are you sure you want to remove the selected file?',
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
        
        // Reset file input
        const fileInput = document.getElementById('csvFileInput') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }

        Swal.fire({
          icon: 'success',
          title: 'Removed',
          text: 'File has been removed',
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
}