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

  readonly MAX_REFERENCE_LENGTH = 50;

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
  // Convert to string and remove any existing formatting
  let strValue = value.toString();
  
  // Handle decimal numbers
  const parts = strValue.split('.');
  let integerPart = parts[0];
  const decimalPart = parts.length > 1 ? parts[1] : '';
  
  // Add commas to integer part
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Reconstruct the value
  let formattedValue = integerPart;
  if (decimalPart !== '') {
    // Ensure decimal part has max 2 digits
    formattedValue += '.' + decimalPart.slice(0, 2);
  }
  
  return formattedValue;
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
      title: 'Confirm Upload',
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

  // Show confirmation dialog before proceeding
  Swal.fire({
    icon: 'question',
    title: 'Confirm Update',
    text: 'Are you sure you want to update the payment record?',
    showCancelButton: true,
    confirmButtonText: 'Yes, update',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#10B981',
    cancelButtonColor: '#6B7280',
    reverseButtons: true,
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
      confirmButton: 'bg-green-500 hover:bg-green-600 px-4 py-2',
      cancelButton: 'bg-gray-500 hover:bg-gray-600 px-4 py-2',
      htmlContainer: 'text-left'
    },
  }).then((result) => {
    if (result.isConfirmed) {
      this.executeUpdate();
    }
  });
}

// New method to handle the actual update process
private executeUpdate(): void {
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

  formatAmount(): void {
  if (!this.amount || this.amount.trim() === '') {
    return;
  }
  
  // Remove existing commas and clean up
  let value = this.amount.replace(/,/g, '').trim();
  
  // Ensure it's a valid number
  if (isNaN(Number(value)) || value === '') {
    this.amount = '';
    return;
  }
  
  // Format with commas for thousands
  const parts = value.split('.');
  let integerPart = parts[0];
  const decimalPart = parts.length > 1 ? parts[1] : '';
  
  // Add commas for thousands
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Reconstruct the value
  let formattedValue = integerPart;
  if (decimalPart !== '') {
    // Ensure decimal part has max 2 digits
    formattedValue += '.' + decimalPart.slice(0, 2);
  }
  
  this.amount = formattedValue;
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

    onAmountInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  let value = input.value.replace(/,/g, '');
  
  // Remove all non-numeric characters except decimal point
  value = value.replace(/[^0-9.]/g, '');
  
  // Allow only one decimal point
  const parts = value.split('.');
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limit decimal places to 2
  if (parts.length > 1) {
    parts[1] = parts[1].slice(0, 2);
    value = parts[0] + '.' + parts[1];
  }
  
  // Update the amount (without commas for now, will format on blur)
  this.amount = value;
  
  // Set the input value without commas for better typing experience
  input.value = value;
}

onAmountKeydown(event: KeyboardEvent): void {
  const allowedKeys = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Home', 'End'
  ];
  
  // Allow control keys
  if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
    return;
  }
  
  // Allow only numbers and decimal point
  if (!/[\d.]/.test(event.key)) {
    event.preventDefault();
    return;
  }
  
  // Check for existing decimal point
  const input = event.target as HTMLInputElement;
  const currentValue = input.value.replace(/,/g, '');
  
  if (event.key === '.' && currentValue.includes('.')) {
    event.preventDefault();
    return;
  }
  
  // Prevent multiple leading zeros
  if (event.key === '0' && currentValue === '0') {
    event.preventDefault();
  }
  
  // Prevent starting with decimal point
  if (event.key === '.' && (currentValue === '' || currentValue === '0')) {
    event.preventDefault();
    // If starting with decimal, add leading zero
    setTimeout(() => {
      this.amount = '0.';
      const inputElement = event.target as HTMLInputElement;
      inputElement.value = '0.';
      inputElement.setSelectionRange(2, 2);
    });
  }
}

}