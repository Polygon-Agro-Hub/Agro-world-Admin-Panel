import { Component, ViewChild, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { StakeholderService } from '../../../../services/stakeholder/stakeholder.service';

@Component({
  selector: 'app-update-govi-shop-user',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
    FormsModule,
    DropdownModule,
  ],
  templateUrl: './update-govi-shop-user.component.html',
  styleUrl: './update-govi-shop-user.component.css'
})
export class UpdateGoviShopUserComponent implements OnInit {

  goviShopSupplierObj: GoViShopSupplier = new GoViShopSupplier();

  errorMessage: string = '';
  isLoading = false;
  formSubmitted = false;
  hasLeadingOrTrailingSpaces: boolean = false;

  isVerification: boolean = false;
  otpDigits: string = ''
  referenceId: string = ''

  timer: any;
  timeLeft = 600; 
  displayTime = '10:00';
  canResend = false;

  id!: number;

  constructor(
    private router: Router,
    private location: Location,
    private goviShopService: StakeholderService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {

    this.route.queryParamMap.subscribe((params) => {
      const id = params.get('id');
      console.log('Query parameter ID:', id);
      
      this.id = Number(id);
      this.fetchSupplierById()
      });
  }

  fetchSupplierById(
    id: number = this.id,
  ) {
    this.isLoading = true;
    this.goviShopService.getSupplierById(id)
      .subscribe(
        (response) => {
          console.log('response', response)

          this.isLoading = false;
          this.goviShopSupplierObj = response.data
          console.log('response', this.goviShopSupplierObj)
      
        },
        (error) => {
          if (error.status === 401) {
          }
        }
      );
  }

  onUpload(form: NgForm) {
    this.isLoading = true;
    form.form.markAllAsTouched();

    const missingFields: string[] = [];
    if (!this.goviShopSupplierObj.fullName) {
      missingFields.push('Full Name is required');
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/;

    if (!this.goviShopSupplierObj.email) {
      missingFields.push('Email Address is required');
    } else if (!emailPattern.test(this.goviShopSupplierObj.email)) {
      missingFields.push('Email Address must be a valid address');
    }

    const nicPattern = /^(\d{9}[V]|\d{12})$/;

    if (!this.goviShopSupplierObj.nic) {
      missingFields.push('Nic Number is required');
    } else if (!nicPattern.test(this.goviShopSupplierObj.nic)) {
      missingFields.push('NIC number must be a valid number');
    }

    const mobilePattern = /^[0-9]{10}$/;

    if (!this.goviShopSupplierObj.mobileNumber) {
      missingFields.push('Mobile Number is required');
    } else if (!mobilePattern.test(this.goviShopSupplierObj.mobileNumber)) {
      missingFields.push('Mobile Number must be a valid number');
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
      text: 'Do you really want to update this GoViShop Supplier?',
      showCancelButton: true,
      confirmButtonText: 'Yes, Update',
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
        this.updateGoviShopUser();
      } else {
        this.isLoading = false;
      }
    });
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
  this.goviShopSupplierObj.email = trimmedValue;
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
  this.goviShopSupplierObj.nic = value;
}

onFormatInput2(event: any): void {  //trim spaces only from start
  const inputElement = event.target as HTMLInputElement;

  if (inputElement && inputElement.value) {
    // Trim spaces only at the start
    let value = inputElement.value.trimStart();

    // Capitalize first letter
    value = value.charAt(0).toUpperCase() + value.slice(1);

    // Update model
    this.goviShopSupplierObj.fullName = value;

    // Update input box value
    inputElement.value = value;
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

  if (value[0] !== '0') {
    value = '0' + value.substring(1);
  }

  input.value = value;

  // Trigger ngModel update
  input.dispatchEvent(new Event('input'));
}

updateGoviShopUser() {
  this.isLoading = true;
  this.isVerification = false;
  this.goviShopService.updateGoviShopUser(
    this.goviShopSupplierObj,
    )
    .subscribe(
      (res) => {
        this.isLoading= false;
        if (res?.status) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'GoViShop Supplier Updated Successfully',
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
            title: 'Error',
            text: 'GoViShop Supplier Update failed',
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


}

class GoViShopSupplier {
  id!: number;
  fullName!: string;
  nic!: string;
  email!: string;
  mobileNumber!: string;
}

