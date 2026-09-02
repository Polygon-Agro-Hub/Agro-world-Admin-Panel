import { Component, ViewChild, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { StakeholderService } from '../../../services/stakeholder/stakeholder.service';
import { GovishopService } from '../../../services/govi-shop/govishop.service';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-edit-branch',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
    FormsModule,
    DropdownModule,
  ],
  templateUrl: './edit-branch.component.html',
  styleUrl: './edit-branch.component.css'
})

export class EditBranchComponent implements OnInit {

  branchObj: Branch = new Branch();

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

  branchId!: number;
  districtOptions: any[] = [];

  id!: number;

  districts = [
    { name: 'Ampara', province: 'Eastern' },
    { name: 'Anuradhapura', province: 'North Central' },
    { name: 'Badulla', province: 'Uva' },
    { name: 'Batticaloa', province: 'Eastern' },
    { name: 'Colombo', province: 'Western' },
    { name: 'Galle', province: 'Southern' },
    { name: 'Gampaha', province: 'Western' },
    { name: 'Hambantota', province: 'Southern' },
    { name: 'Jaffna', province: 'Northern' },
    { name: 'Kalutara', province: 'Western' },
    { name: 'Kandy', province: 'Central' },
    { name: 'Kegalle', province: 'Sabaragamuwa' },
    { name: 'Kilinochchi', province: 'Northern' },
    { name: 'Kurunegala', province: 'North Western' },
    { name: 'Mannar', province: 'Northern' },
    { name: 'Matale', province: 'Central' },
    { name: 'Matara', province: 'Southern' },
    { name: 'Monaragala', province: 'Uva' },
    { name: 'Mullaitivu', province: 'Northern' },
    { name: 'Nuwara Eliya', province: 'Central' },
    { name: 'Polonnaruwa', province: 'North Central' },
    { name: 'Puttalam', province: 'North Western' },
    { name: 'Rathnapura', province: 'Sabaragamuwa' },
    { name: 'Trincomalee', province: 'Eastern' },
    { name: 'Vavuniya', province: 'Northern' },
  ];

  constructor(
    private router: Router,
    private location: Location,
    private goviShopService: GovishopService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.branchId = Number(this.route.snapshot.paramMap.get('branchId'));
    this.setupDropdownOptions();
    this.fetchBranchById()
  }

  setupDropdownOptions() {
    this.districts = this.districts.sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    this.districtOptions = this.districts.map((district) => ({
      label: district.name,
      value: district.name,
    }));
  }

  fetchBranchById(
    id: number = this.branchId,
  ) {
    this.isLoading = true;
    this.goviShopService.getBranchForUpdate(id)
      .subscribe(
        (response) => {
          this.isLoading = false;
          this.branchObj = response.data
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
    if (!this.branchObj.branchName) {
      missingFields.push('Branch Name is required');
    }

    if (!this.branchObj.address) {
      missingFields.push('Branch address is required');
    }

    if (!this.branchObj.district) {
      missingFields.push('District is required');
    }

    if (!this.branchObj.province) {
      missingFields.push('Province is required');
    }

    const mobilePattern = /^[0-9]{10}$/;

    if (!this.branchObj.mobilePhone) {
      missingFields.push('Mobile Phone Number is required');
    } else if (!mobilePattern.test(this.branchObj.mobilePhone)) {
      missingFields.push('Mobile Phone Number must be a valid number');
    }

    if (!mobilePattern.test(this.branchObj.LandPhone) && this.branchObj.LandPhone) {
      missingFields.push('Land Phone Number must be a valid number');
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
      text: 'Do you really want to update this GoVi Shop Branch?',
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
        this.updateBranch();
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
    this.branchObj.email = trimmedValue;
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
      this.branchObj.branchName = value;

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
      this.branchObj.address = value;

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

  updateProvince(event: DropdownChangeEvent): void {
    const selectedDistrict = event.value;

    const selected = this.districts.find(
      (district) => district.name === selectedDistrict,
    );

    if (selected) {
      this.branchObj.province = selected.province;
    } else {
      this.branchObj.province = '';
    }
  }

  updateBranch() {
    this.isLoading = true;
    this.isVerification = false;

    this.goviShopService.updateBranchData(
      this.branchObj,
    )
      .subscribe(
        (res) => {
          this.isLoading = false;
          if (res?.status) {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'GoViShop Branch Updated Successfully',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
                htmlContainer: 'text-left',
                confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
              },
            }

            );
            this.location.back();
          } else {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'GoViShop Branch Update failed',
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

                case 'mobilePhone':
                  return 'Mobile Phone Number is already exists.';
                case 'LandPhone':
                  return 'Land Phone Number is already exists.';
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

class Branch {
  id!: number;
  branchName!: string;
  address!: string;
  email!: string;
  mobilePhone!: string;
  LandPhone!: string;
  district!: string;
  province!: string;
}

