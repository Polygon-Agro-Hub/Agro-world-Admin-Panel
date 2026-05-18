import { Component, ViewChild, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
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

  @ViewChildren('otpInput') inputs!: QueryList<ElementRef>;

  otpValues: string[] = ['', '', '', '', ''];

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

  isVerification: boolean = false;
  otpDigits: string = ''
  referenceId: string = ''

  timer: any;
  timeLeft = 600; 
  displayTime = '10:00';
  canResend = false;

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
    this.startTimer();
  }

  onUpload(form: NgForm) {
    this.isLoading = true;
    form.form.markAllAsTouched();
    this.fileInputTouched = true;

    const missingFields: string[] = [];
    if (!this.fullName) {
      missingFields.push('Full Name is required');
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/;

    if (!this.email) {
      missingFields.push('Email Address is required');
    } else if (!emailPattern.test(this.email)) {
      missingFields.push('Email Address must be a valid address');
    }

    const nicPattern = /^(\d{9}[V]|\d{12})$/;

    if (!this.nic) {
      missingFields.push('Nic Number is required');
    } else if (!nicPattern.test(this.nic)) {
      missingFields.push('NIC number must be a valid number');
    }

    const mobilePattern = /^[0-9]{10}$/;

    if (!this.mobileNumber) {
      missingFields.push('Mobile Number is required');
    } else if (!mobilePattern.test(this.mobileNumber)) {
      missingFields.push('Mobile Number must be a valid number');
    }

    if (!this.selectedSubscription) {
      missingFields.push('Subscription is required');
    }


    if (!this.selectedFile && this.selectedSubscription === 'Premium') {
      missingFields.push('File is required');
    }

    if (missingFields.length > 0) {
      let errorMessage = '<div class="text-left"><p class="mb-2">Please fix the following issues:</p><ul class="list-disc pl-5">';
      missingFields.forEach((field) => {
        errorMessage += `<li>${field}</li>`;
      });
      errorMessage += '</ul></div>';

      this.isLoading = false;

      Swal.fire({
        icon: 'error',
        title: 'Missing or Invalid Information',
        html: errorMessage,
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
          htmlContainer: 'text-left',
          confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
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
        htmlContainer: 'text-left',
        confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
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
            title: 'Server Error!',
            text: 'Could not find mobile number.',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
              htmlContainer: 'text-left',
              confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
            },
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
              title: 'Success!',
              html: 'OTP code has been sent to the mobile number',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
                htmlContainer: 'text-left',
                confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
              },
            });
          } else {
            this.isLoading= false;
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: `${res.messageResult.description}`,
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
                htmlContainer: 'text-left',
                confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
              },
            });
          }
        },
        (error) => {
          this.isLoading= false;
          console.error('Error:', error);
          Swal.fire({
            icon: 'error',
            title: 'Server Error!',
            text: 'Failed to send the otp. Please try again later.',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
              htmlContainer: 'text-left',
              confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
            },
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
        htmlContainer: 'text-left',
        confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
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
  
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
    const isValidExtension = fileExtension && allowedExtensions.includes(fileExtension);
  
    if (isValidExtension) {
      this.selectedFile = file;
      this.errorMessage = '';
    } else {
      this.errorMessage =
        'Invalid file type. Please upload (.jpg, .jpeg, .png, .pdf).';
      this.selectedFile = null;
  
      Swal.fire({
        icon: 'error',
        title: 'Server Error!',
        text: this.errorMessage,
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
          htmlContainer: 'text-left',
          confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
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
      htmlContainer: 'text-left',
      confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
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

onInput(event: Event, index: number) {
  const input = event.target as HTMLInputElement;
  let value = input.value.replace(/[^0-9]/g, ''); // only numbers

  input.value = value;
  this.otpValues[index] = value;

  if (value && index < this.inputs.length - 1) {
    this.inputs.toArray()[index + 1].nativeElement.focus();
  }
}

onKeyDown(event: KeyboardEvent, index: number) {
  const input = event.target as HTMLInputElement;

  if (event.key === 'Backspace' && !input.value && index > 0) {
    this.inputs.toArray()[index - 1].nativeElement.focus();
  }
}

verifyOtp(): void {
  const otp = this.otpValues.join('');
  console.log('otp', otp);

  this.isLoading = true;

  this.goviShopService.verifyOtp(this.referenceId, otp)
    .subscribe(
      (res) => {
        console.log('verify res', res);
        this.isLoading = false;

        if (res.statusCode === '1000') {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'OTP verification successful!\nCreating GoViShop owner',
            timer: 2000,     
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
              htmlContainer: 'text-left',
              confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
            },
          });

          this.isVerification = false;

          setTimeout(() => {
            this.createGoviShopUser();
          }, 1500); 
          
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Invalid OTP!',
            text: 'The code you entered is incorrect. Please try again.',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
              htmlContainer: 'text-left',
              confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
            },   
          });
          this.otpValues = ['', '', '', '', ''];
          this.inputs.toArray().forEach(input => input.nativeElement.value = '');
          this.inputs.first?.nativeElement.focus();
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('Error:', error);

        Swal.fire({
          icon: 'error',
          title: 'Server Error!',
          text: 'OTP verification failed. Please try again later.',
          timer: 1000,
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
            htmlContainer: 'text-left',
            confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
          },
        });
        this.isVerification = false;
      }
    );
}

createGoviShopUser() {
  this.isLoading = true;
  this.isVerification = false;
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
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'GoViShop Supplier Created Successfully',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
              htmlContainer: 'text-left',
              confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
            },
          }
            
          );
          this.router.navigate(['steckholders/action/govi-shop-suppliers']);
        } else {
          this.isLoading= false;
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'GoViShop Supplier creation failed',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
              htmlContainer: 'text-left',
              confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
            },
          });
        }
      },
      (error: any) => {
        this.isLoading = false;
        let errorMessage = 'An unexpected error occurred';
        let messages: string[] = [];

        if (error.error && Array.isArray(error.error.errors)) {
          messages = error.error.errors.map((err: string) => {
            switch (err) {
              case 'NIC':
                return 'The NIC number is already registered.';
              case 'Email':
                return 'Email already exists.';
              case 'phone':
                return 'Mobile Number is already exists.';
              default:
                return 'Validation error: ' + err;
            }
          });
        }

        if (messages.length > 0) {
          errorMessage = '<div class="text-left"><p class="mb-2">Please fix the following Duplicate field issues:</p><ul class="list-disc pl-5">';
          messages.forEach(m => {
            errorMessage += `<li>${m}</li>`;
          });
          errorMessage += '</ul></div>';

          Swal.fire({
            icon: 'error',
            title: 'Duplicate Information',
            html: errorMessage,
            confirmButtonText: 'OK',
            
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
              htmlContainer: 'text-left',
              confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
            },
          });
          return;
        }
      }
    );
}

cancelVerification(): void {
  Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: 'Do you want to cancel OTP verification!',
    showCancelButton: true,
    confirmButtonText: 'Yes, Cancel',
    cancelButtonText: 'No, Keep Editing',
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold text-lg',
      htmlContainer: 'text-left',
      confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
    },
    buttonsStyling: true,
  }).then((result) => {
    if (result.isConfirmed) {
      this.otpValues = ['', '', '', '', ''];
      this.isVerification = false;
      this.startTimer();
    }
  });
}

isOtpComplete(): boolean {
  return this.otpValues.every(val => val !== '');
}

verifyOtp1() {
  console.log('otp', this.otpValues)
}

startTimer() {
  this.canResend = false;
  this.timeLeft = 600;

  this.updateDisplay();

  this.timer = setInterval(() => {
    this.timeLeft--;

    this.updateDisplay();

    if (this.timeLeft <= 0) {
      clearInterval(this.timer);
      this.canResend = true;
    }
  }, 1000);
}

updateDisplay() {
  const minutes = Math.floor(this.timeLeft / 60);
  const seconds = this.timeLeft % 60;

  this.displayTime =
    `${this.pad(minutes)}:${this.pad(seconds)}`;
}

pad(num: number): string {
  return num < 10 ? '0' + num : num.toString();
}

handleResend() {
  if (!this.canResend) return;

  console.log('Resend triggered');
  this.inputs.toArray().forEach(input => input.nativeElement.value = '');
  this.inputs.first?.nativeElement.focus();
  this.sendOtp();
  this.startTimer(); // restart countdown
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

  if (value[0] !== '0') {
    value = '0' + value.substring(1);
  }

  input.value = value;

  // Trigger ngModel update
  input.dispatchEvent(new Event('input'));
}


}
