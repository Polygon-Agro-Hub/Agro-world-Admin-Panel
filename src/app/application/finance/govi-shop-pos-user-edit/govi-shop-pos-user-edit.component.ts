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
  selector: 'app-govi-shop-pos-user-edit',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
    FormsModule,
    DropdownModule,
  ],
  templateUrl: './govi-shop-pos-user-edit.component.html',
  styleUrl: './govi-shop-pos-user-edit.component.css'
})
export class GoviShopPosUserEditComponent implements OnInit {

  userObj: User = new User();

  errorMessage: string = '';
  isLoading = false;
  formSubmitted = false;
  hasLeadingOrTrailingSpaces: boolean = false;

  isVerification: boolean = false;
  
  id!: number;
  branchData: Branch[] = [];
  branchOptions: any[] = [];

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
      console.log('id', this.id)
      this.fetchPosUserById();
      });
  }

  fetchPosUserById(
    id: number = this.id,
  ) {
    this.isLoading = true;
    this.goviShopService.getPosUserById(id)
      .subscribe(
        (response) => {
          console.log('response', response)

          this.isLoading = false;

          this.branchData = response.data.branches;

          // Set branchOptions FIRST
          this.branchOptions = this.branchData.map((branch) => ({
            label: branch.branchName,
            value: branch.id,
          }));
        
          // Then assign userObj so the dropdown can match branchId against populated options
          this.userObj = response.data.posUser

          console.log('branchOptions', this.branchOptions)
      
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
    if (!this.userObj.fullName) {
      missingFields.push('User Name is required');
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/;

    if (!this.userObj.email) {
      missingFields.push('Email Address is required');
    } else if (!emailPattern.test(this.userObj.email)) {
      missingFields.push('Email Address must be a valid address');
    }

    if (!this.userObj.branchId) {
      missingFields.push('Branch Name is required');
    }

    const mobilePattern = /^[0-9]{10}$/;

    if (!this.userObj.mobileNumber) {
      missingFields.push('Phone Number is required');
    } else if (!mobilePattern.test(this.userObj.mobileNumber)) {
      missingFields.push('Phone Number must be a valid number');
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

    const roleText =
    this.userObj.role === 'POS'
      ? 'POS User'
      : this.userObj.role === 'Manager'
      ? 'Manager'
      : 'User';

    Swal.fire({
      icon: 'info',
      title: 'Are you sure?',
      text: `Do you really want to update this GoViShop ${roleText}?`,
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
        console.log('object', this.userObj)
        this.updatePOSUser();
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
  this.userObj.email = trimmedValue;
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
    this.userObj.fullName = value;

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

updatePOSUser() {
  const roleText =
    this.userObj.role === 'POS'
      ? 'POS User'
      : this.userObj.role === 'Manager'
      ? 'Manager'
      : 'User';

  this.isLoading = true;
  this.isVerification = false;
  console.log('userObg', this.userObj)
  this.goviShopService.updatePOSUser(
    this.userObj,
    )
    .subscribe(
      (res) => {
        this.isLoading= false;
        if (res?.status) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: `GoViShop ${roleText} Updated Successfully`,
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
              htmlContainer: 'text-left',
              confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
            }
          },
           
          );
          this.location.back();
        } else {
          this.isLoading= false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `GoViShop ${roleText} Update failed`,
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

resetPassword() {
  const roleText =
    this.userObj.role === 'POS'
      ? 'POS User'
      : this.userObj.role === 'Manager'
      ? 'Manager'
      : 'User';
  Swal.fire({
    title: 'Are you sure?',
    text: `You are about to reset the ${roleText} password. This action cannot be undone.`,
    icon: 'info',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, reset password!',
    cancelButtonText: 'Cancel',
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold text-lg',
      htmlContainer: 'text-left',
      confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
    },
  }).then((result) => {
    if (result.isConfirmed) {
      this.isLoading = true;

      this.goviShopService.resetPassword(this.userObj).subscribe(
        (res) => {
          this.isLoading = false;
          if (res.status) {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: `The ${roleText} password reseted successfully.`,
              showConfirmButton: false,
              timer: 3000,
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
                htmlContainer: 'text-left',
                confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
              },
            });
            this.location.back();
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'Something went wrong. Please try again.',
              showConfirmButton: false,
              timer: 3000,
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
                htmlContainer: 'text-left',
                confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
              },
            });
          }
        },
        () => {
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'An error occurred while resetting password. Please try again.',
            showConfirmButton: false,
            timer: 3000,
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
  });
}

}

class User {
  id!: number;
  fullName!: string;
  email!: string;
  mobileNumber!: string;
  branchId!: number;
  shopName!: string;
  shopId!: number;
  role!: string;
  branchName!: string;
}

class Branch {
  id!: number;
  branchName!: string;
}
