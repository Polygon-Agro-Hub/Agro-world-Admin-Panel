import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';

interface Subscription {
  name: string;
  value: string;
}

@Component({
  selector: 'app-create-govi-shop-supplier',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
    FormsModule,
    DropdownModule,
  ],
  templateUrl: './create-govi-shop-supplier.component.html',
  styleUrl: './create-govi-shop-supplier.component.css'
})
export class CreateGoviShopSupplierComponent implements OnInit {

  @ViewChild('fileInput') fileInput!: ElementRef;

  selectedFile: File | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading = false;
  isInitializing = false;
  fullName: string = '';
  mobileNumber: string = '';
  email: string = '';
  selectedSubscription: string = 'Standard';
  nic: string = '';
  formSubmitted = false;
  hasLeadingOrTrailingSpaces: boolean = false;
  missingRegCodesP: any[] = [];

  fileInputTouched: boolean = false;

  subscriptions: Subscription[] = [
    { name: 'Standard', value: 'Standard' },
    { name: 'Premium', value: 'Premium' },
  ];

  constructor(
    private router: Router,
    private location: Location,
  ) { }

  ngOnInit(): void {
    // this.loadCertificates();
  }

  onUpload(form: NgForm) {
    form.form.markAllAsTouched();
    this.fileInputTouched = true;

    const missingFields: string[] = [];
    if (!this.fullName) {
      missingFields.push('Full Name is required');
    }

    if (!this.email) {
      missingFields.push('Email Address is required');
    }

    if (!this.nic) {
      missingFields.push('Nic Number is required');
    }

    if (!this.mobileNumber) {
      missingFields.push('Mobile Number is required');
    }

    if (!this.selectedSubscription) {
      missingFields.push('Subscription is required');
    }


    if (!this.selectedFile && this.selectedSubscription === 'Premium') {
      missingFields.push('Selected File is required');
    }

    if (missingFields.length > 0) {
      let errorMessage = '<div class="text-left"><p class="mb-2">Please fix the following issues:</p><ul class="list-disc pl-5">';
      missingFields.forEach((field) => {
        errorMessage += `<li>${field}</li>`;
      });
      errorMessage += '</ul></div>';

      Swal.fire({
        icon: 'error',
        title: 'Missing or Invalid Information',
        html: errorMessage,
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-white dark:bg-[#363636] text-[#534E4E] dark:text-textDark',
          title: 'font-semibold text-lg',
          htmlContainer: 'text-left',
        },
      });
      return;
    }

    Swal.fire({
      icon: 'info',
      title: 'Are you sure?',
      text: 'Do you really want to create this GoViShop Supplier?',
      showCancelButton: true,
      confirmButtonText: 'Yes, Create',
      cancelButtonText: 'No, Cancel',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
      buttonsStyling: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.processUpload();
      } else {
        // User cancelled
        this.isLoading = false;
      }
    });
  }

  processUpload() {

  }

  onBack(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after going back!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Go Back',
      cancelButtonText: 'No, Keep Editing',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
      buttonsStyling: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.location.back();
      }
    });
  }

  onFileSelected(event: any): void {
    this.fileInputTouched = true;
    const file = event.target.files[0];
    this.validateFile(file);
  }

  onDragOver(event: any): void {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
  }

  onDragLeave(event: any): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: any): void {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files[0];
    // this.validateFile(file);
  }

  validateFile(file: File): void {
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf'
    ];
  
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
    const isValidExtension = fileExtension && allowedExtensions.includes(fileExtension);
    const isValidMimeType = allowedMimeTypes.includes(file.type);
  
    if (isValidExtension && isValidMimeType) {
      this.selectedFile = file;
      this.errorMessage = '';
    } else {
      this.errorMessage =
        'Invalid file type. Please upload (.jpg, .jpeg, .png, .pdf).';
      this.selectedFile = null;
  
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: this.errorMessage,
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });
    }
  }

onCancel(): void {
  Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: 'You may lose the added data after canceling!',
    showCancelButton: true,
    confirmButtonText: 'Yes, Cancel',
    cancelButtonText: 'No, Keep Editing',
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold text-lg',
    },
    buttonsStyling: true,
  }).then((result) => {
    if (result.isConfirmed) {
      this.location.back();
    }
  });
}

blockInvalidKeypressForPhone(event: KeyboardEvent) {

  const input = event.target as HTMLInputElement;

  // Allow control keys
  if (['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(event.key)) {
    return;
  }

  // Only allow digits
  if (!/^[0-9]$/.test(event.key)) {
    event.preventDefault();
    return;
  }

  // If first digit and not 7 → force 7
  if (input.value.length === 0 && event.key !== '7') {
    event.preventDefault();

    input.value = '7';                 // visually set
    input.dispatchEvent(new Event('input')); // update ngModel
  }
}

blockInvalidPasteForPhone(event: ClipboardEvent) {

  const pastedData = event.clipboardData?.getData('text') || '';

  // Must match 7XXXXXXXX
  if (!/^7[0-9]{0,8}$/.test(pastedData)) {
    event.preventDefault();
  }
}

onPhoneInput(event: Event) {
  const input = event.target as HTMLInputElement;

  // Remove non-digits (extra safety)
  let value = input.value.replace(/\D/g, '');

  // If empty → do nothing
  if (value.length === 0) {
    input.value = '';
    return;
  }

  // If first digit is not 7 → force it
  if (value[0] !== '7') {
    value = '7' + value.substring(1);
  }

  input.value = value;

  // Trigger ngModel update
  input.dispatchEvent(new Event('input'));
}

onTrimInput(event: any): void {
  const inputElement = event.target as HTMLInputElement;
  const trimmedValue = inputElement.value.trimStart();
  this.email = trimmedValue;
  inputElement.value = trimmedValue;
}

onNicInput(event: any) {
  // Get value and trim leading/trailing spaces
  let value: string = event.target.value.trimStart().toUpperCase();

  // Remove all invalid characters except digits and V
  value = value.replace(/[^0-9V]/g, '');

  // Prevent entering V anywhere except last character of 10-char NIC
  if (value.includes('V') && value.length !== 10) {
    value = value.replace(/V/g, '');
  }

  // Handle 10-char NIC ending with V
  if (value.length === 10 && value.endsWith('V')) {
    value = value.slice(0, 10);
  }

  // Limit 12-digit NIC
  if (value.length > 12) {
    value = value.slice(0, 12);
  }

  // Update the model
  this.nic = value;
}

onFormatInput2(event: any): void {  //trim spaces only from start
  const inputElement = event.target as HTMLInputElement;

  if (inputElement && inputElement.value) {
    // Trim spaces only at the start
    let value = inputElement.value.trimStart();

    // Capitalize first letter
    value = value.charAt(0).toUpperCase() + value.slice(1);

    // Update model
    this.fullName = value;

    // Update input box value
    inputElement.value = value;
  }
}

}
