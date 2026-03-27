import { Component, ViewChild, ElementRef, OnInit, ViewChildren, QueryList } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { StakeholderService } from '../../../../services/stakeholder/stakeholder.service';

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
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

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

  isVerification: boolean = false;
  otpDigits: string = ''
  referenceId: string = ''

  subscriptions: Subscription[] = [
    { name: 'Standard', value: 'Standard' },
    { name: 'Premium', value: 'Premium' },
  ];

  constructor(
    private router: Router,
    private location: Location,
    private goviShopService: StakeholderService
  ) { }

  ngOnInit(): void {
  }

  onUpload(form: NgForm) {
    this.isLoading = true;
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
        // this.createGoviShopUser();
        this.checkPhoneNumber();
      } else {
        // User cancelled
        this.isLoading = false;
      }
    });
  }

  checkPhoneNumber() {
    this.isVerification = true;
    this.isLoading= true;
    this.goviShopService.checkPhone(
      this.mobileNumber
      )
      .subscribe(
        (res) => {
          console.log('res', res)
          if (res?.status) {
            this.isVerification = true;
            this.sendOtp();
          }
        },
        (error) => {
          console.error('Error:', error);
          Swal.fire({
            icon: 'error',
            title: 'Server Error',
            text: 'Could not find mobile number.',
          });
        }
      );
  }

  sendOtp() {

    this.isVerification = true;
    console.log('otp called')
    this.goviShopService.sendOtp(
      this.mobileNumber
      )
      .subscribe(
        (res) => {
          console.log('res', res)
          this.referenceId = res.referenceId;
          console.log('referenceId', this.referenceId)
          this.isLoading= false;
          if (res.messageResult.status === '1001') {
            Swal.fire({
              icon: 'success',
              title: 'OTP code recieved',
              html: 'OTP code has been sent to the mobile number',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'bg-white rounded-lg dark:bg-[#363636] text-[#534E4E] dark:text-textDark',
                title: 'font-semibold text-lg',
                htmlContainer: 'text-left',
              },
            });
          } else {
            this.isLoading= false;
            Swal.fire({
              icon: 'error',
              title: 'Server Error',
              text: `${res.messageResult.description}`,
            });
          }
        },
        (error) => {
          this.isLoading= false;
          console.error('Error:', error);
          Swal.fire({
            icon: 'error',
            title: 'Server Error',
            text: 'Failed to send the otp. Please try again later.',
          });
        }
      );
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
  if (input.value.length === 0 && event.key !== '0') {
    event.preventDefault();

    input.value = '0';                 // visually set
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

// onKeyDown(event: KeyboardEvent, index: number): void {
//   const input = event.target as HTMLInputElement;
//   const inputs = this.otpInputs.toArray();

//   if (event.key === 'Backspace') {
//     event.preventDefault();
//     input.value = '';
//     this.otpDigits[index] = '';
//     if (index > 0) inputs[index - 1].nativeElement.focus();
//     return;
//   }

//   // Allow only digits
//   if (!/^[0-9]$/.test(event.key)) {
//     event.preventDefault();
//     return;
//   }

//   event.preventDefault();
//   input.value = event.key;
//   this.otpDigits[index] = event.key;

//   if (index < inputs.length - 1) {
//     inputs[index + 1].nativeElement.focus();
//   }
// }

// onPaste(event: ClipboardEvent): void {
//   event.preventDefault();
//   const pasted = event.clipboardData?.getData('text') ?? '';
//   const digits = pasted.replace(/[^0-9]/g, '').slice(0, this.otpDigits.length);
//   const inputs = this.otpInputs.toArray();

//   digits.split('').forEach((char, i) => {
//     this.otpDigits[i] = char;
//     inputs[i].nativeElement.value = char;
//   });

//   const focusIndex = Math.min(digits.length, this.otpDigits.length - 1);
//   inputs[focusIndex].nativeElement.focus();
// }

// isOtpComplete(): boolean {
//   return this.otpDigits.every(d => d !== '');
// }

verifyOtp(): void {
  const otp = this.otpDigits;
  console.log('otp', otp)

  // if (!this.isOtpComplete()) {
  //   Swal.fire({
  //     icon: 'warning',
  //     title: 'Incomplete OTP',
  //     text: 'Please enter all 6 digits.',
  //   });
  //   return;
  // }
  this.isLoading = true;
  this.goviShopService.verifyOtp(this.referenceId, otp)
    .subscribe(
      (res) => {
        console.log('verify res', res);
        this.isLoading= false;
        if (res.statusCode === '1000') {
          Swal.fire('Success', 'OTP verification successfull!', 'success');
          this.isVerification = false;
          this.createGoviShopUser();
          // proceed with your next step here
        } else {
          this.isLoading= false;
          Swal.fire({
            icon: 'error',
            title: 'Invalid OTP',
            text: 'The code you entered is incorrect. Please try again.',
          });
        }
      },
      (error) => {
        this.isLoading= false;
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Server Error',
          text: 'OTP verification failed. Please try again later.',
        });
      }
    );
}

createGoviShopUser() {
  this.isLoading = true;
  this.isVerification = true;
  this.goviShopService.createGoviShopUser(
    this.fullName,
    this.mobileNumber,
    this.email,
    this.selectedSubscription,
    this.nic,
    this.selectedFile
    )
    .subscribe(
      (res) => {
        this.isLoading= false;
        if (res?.status) {
          Swal.fire(
            'Success',
            'GoViShop Supplier Created Successfully',
            'success'
          );
        } else {
          this.isLoading= false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'GoViShop Supplier creation failed',
          });
        }
      },
      (error) => {
        this.isLoading= false;
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Server Error',
          text: 'Failed to create GoViShop Supplier. Please try again later.',
        });
      }
    );
}

cancelVerification(): void {
  this.isVerification = false;
  this.otpDigits = '';
}

}
