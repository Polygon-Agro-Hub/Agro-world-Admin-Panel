import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FinanceService } from '../../../services/finance/finance.service';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-payment-history-add-new',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule],
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
  uploadedFileNames: Set<string> = new Set(); // Track uploaded file names

  readonly MAX_REFERENCE_LENGTH = 50;

  receiverOptions = [
    { label: 'Farmers', value: 'Farmers' }
  ];

  constructor(
    private router: Router,
    private financeService: FinanceService
  ) {}

  // Check if form is valid for enabling upload button
  isFormValid(): boolean {
    return !!(
      this.receivers &&
      this.amount &&
      parseFloat(this.amount.replace(/,/g, '')) > 0 &&
      this.paymentReference.trim() &&
      this.paymentReference.length <= this.MAX_REFERENCE_LENGTH &&
      this.uploadedFile
    );
  }

  back(): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be redirected to the payments page',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Go Back',
      cancelButtonText: 'No, Stay Here',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
      buttonsStyling: true,
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
    // Check if file with same name already uploaded
    if (this.uploadedFileNames.has(file.name)) {
      Swal.fire({
        icon: 'error',
        title: 'Duplicate File',
        text: 'A file with this name has already been uploaded. Please rename the file or select a different one.',
        confirmButtonColor: '#3B82F6',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
          confirmButton: 'bg-blue-500 hover:bg-blue-600',
        },
      });
      return;
    }

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
      title: 'Confirm Upload',
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
    if (!this.isUploading) {
      const fileInput = document.getElementById('csvFileInput') as HTMLInputElement;
      fileInput?.click();
    }
  }

  validateForm(): { isValid: boolean; missingFields: string[] } {
    const missingFields: string[] = [];

    if (!this.receivers) {
      missingFields.push('Receivers');
    }

    if (!this.amount || parseFloat(this.amount.replace(/,/g, '')) <= 0) {
      missingFields.push('Amount');
    }

    if (!this.paymentReference.trim()) {
      missingFields.push('Payment Reference');
    } else if (this.paymentReference.length > this.MAX_REFERENCE_LENGTH) {
      missingFields.push(`Payment Reference (exceeds ${this.MAX_REFERENCE_LENGTH} characters)`);
    }

    if (!this.uploadedFile) {
      missingFields.push('CSV/Excel File');
    }

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }

  onUpload(): void {
    const validation = this.validateForm();
    
    if (!validation.isValid) {
      const fieldsList = validation.missingFields.map(field => `• ${field}`).join('<br>');
      
      Swal.fire({
        icon: 'warning',
        title: 'Missing Required Fields',
        html: `Please fill in the following fields:<br><br>${fieldsList}`,
        confirmButtonColor: '#3B82F6',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
          confirmButton: 'bg-blue-500 hover:bg-blue-600',
        },
      });
      return;
    }

    // Confirmation dialog before proceeding with upload
    Swal.fire({
      icon: 'question',
      title: 'Confirm Upload',
      html: 'Are you sure you want to upload this file?',
      showCancelButton: true,
      confirmButtonText: 'Yes, upload',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#6B7280',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
        confirmButton: 'bg-blue-500 hover:bg-blue-600',
        cancelButton: 'bg-gray-500 hover:bg-gray-600',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.proceedWithUpload();
      }
    });
  }

  private proceedWithUpload(): void {
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
        // Add file name to uploaded set
        this.uploadedFileNames.add(this.uploadedFileName);
        
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

  onCancel() {
        Swal.fire({
          icon: 'warning',
          title: 'Are you sure?',
          text: 'You may lose the added data after canceling!',
          showCancelButton: true,
          confirmButtonText: 'Yes, Cancel',
          cancelButtonText: 'No, Keep Editing',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          },
          buttonsStyling: true,
        }).then((result) => {
          if (result.isConfirmed) {
            this.navigatePath('/finance/action/viewAll-payments');
          }
        });
      }
  
       navigatePath(path: string) {
      this.router.navigate([path]);
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

  onPaymentReferenceInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart;
    
    // If the input starts with a space, remove leading spaces
    if (input.value.startsWith(' ')) {
      // Remove all leading spaces
      const newValue = input.value.replace(/^\s+/, '');
      
      // Update the model
      this.paymentReference = newValue;
      
      // Restore cursor position (adjust for removed spaces)
      setTimeout(() => {
        const newCursorPosition = Math.max(0, (cursorPosition || 0) - (input.value.length - newValue.length));
        input.setSelectionRange(newCursorPosition, newCursorPosition);
      });
      return;
    }
    
    // Check if character limit is exceeded
    if (input.value.length > this.MAX_REFERENCE_LENGTH) {
      // Truncate to max length
      const truncatedValue = input.value.substring(0, this.MAX_REFERENCE_LENGTH);
      
      // Update the model
      this.paymentReference = truncatedValue;
      
      // Show warning if user keeps typing beyond limit
      if (input.value.length > this.MAX_REFERENCE_LENGTH + 5) { // Show warning after 5 extra characters
        this.showCharacterLimitWarning();
      }
    }
  }

  private showCharacterLimitWarning(): void {
    // You can show a small notification or change border color
    const inputElement = document.querySelector('input[type="text"][(ngModel)]="paymentReference"') as HTMLInputElement;
    if (inputElement) {
      inputElement.classList.add('border-red-500');
      setTimeout(() => {
        inputElement.classList.remove('border-red-500');
      }, 2000);
    }
    
    // Or show a toast notification
    Swal.fire({
      icon: 'warning',
      title: 'Character Limit Exceeded',
      text: `Payment reference cannot exceed ${this.MAX_REFERENCE_LENGTH} characters`,
      timer: 2000,
      showConfirmButton: false,
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    });
  }
}