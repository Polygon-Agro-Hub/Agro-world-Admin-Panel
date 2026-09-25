import { Component, ViewChild, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { StakeholderService } from '../../../services/stakeholder/stakeholder.service';

@Component({
  selector: 'app-update-govi-shop',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
    FormsModule,
    DropdownModule,
  ],
  templateUrl: './update-govi-shop.component.html',
  styleUrl: './update-govi-shop.component.css'
})

export class UpdateGoviShopComponent implements OnInit {

  goviShopObj: GoViShop = new GoViShop();

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

  shopId!: number;

  id!: number;

  constructor(
    private router: Router,
    private location: Location,
    private goviShopService: StakeholderService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.shopId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchGoViShopById()
  }

  fetchGoViShopById(
    id: number = this.shopId,
  ) {
    this.isLoading = true;
    this.goviShopService.getGoViShopForUpdate(id)
      .subscribe(
        (response) => {
          this.isLoading = false;
          this.goviShopObj = response.data
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
    if (!this.goviShopObj.shopName) {
      missingFields.push('Full Name is required');
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/;

    if (!this.goviShopObj.email) {
      missingFields.push('Email Address is required');
    } else if (!emailPattern.test(this.goviShopObj.email)) {
      missingFields.push('Email Address must be a valid address');
    }

    if (!this.goviShopObj.address) {
      missingFields.push('Shop address is required');
    }

    const mobilePattern = /^[0-9]{10}$/;

    if (!this.goviShopObj.mobileNumber) {
      missingFields.push('Mobile Number is required');
    } else if (!mobilePattern.test(this.goviShopObj.mobileNumber)) {
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
      text: 'Do you really want to update this GoVi Shop?',
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
        this.updateGoviShop();
      } else {
        this.isLoading = false;
      }
    });
  }

  onBack(): void {
    this.location.back();
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
    this.goviShopObj.email = trimmedValue;
    inputElement.value = trimmedValue;
  }

  onFormatInput2(event: any): void {  //trim spaces only from start
    const inputElement = event.target as HTMLInputElement;

    if (inputElement && inputElement.value) {
      // Trim spaces only at the start
      let value = inputElement.value.trimStart();

      // Capitalize first letter
      value = value.charAt(0).toUpperCase() + value.slice(1);

      // Update model
      this.goviShopObj.shopName = value;

      // Update input box value
      inputElement.value = value;
    }
  }

  onFormatInput1(event: any): void {  //trim spaces only from start
    const inputElement = event.target as HTMLInputElement;

    if (inputElement && inputElement.value) {
      // Trim spaces only at the start
      let value = inputElement.value.trimStart();

      // Update model
      this.goviShopObj.address = value;

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

  updateGoviShop() {
    this.isLoading = true;
    this.isVerification = false;
    this.goviShopService.updateGoviShop(
      this.goviShopObj,
    )
      .subscribe(
        (res) => {
          this.isLoading = false;
          if (res?.status) {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'GoVi Shop Updated Successfully',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
                htmlContainer: 'text-left',
                confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
              },
            }

            );
            this.router.navigate(['steckholders/action/govi-shop-suppliers']);
            this.location.back();
          } else {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'GoVi Shop Update failed',
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
                popup: 'bg-tileLight dark:bg-[#363636] text-black dark:text-white',
                title: 'font-semibold text-lg',
                htmlContainer: 'text-left',
                confirmButton: 'bg-red-500 dark:bg-red-500 hover:bg-red-600 dark:hover:bg-red-700',
              },
            });
            return;
          }
        }
      );
  }

}

class GoViShop {
  id!: number;
  shopName!: string;
  address!: string;
  email!: string;
  mobileNumber!: string;
}

