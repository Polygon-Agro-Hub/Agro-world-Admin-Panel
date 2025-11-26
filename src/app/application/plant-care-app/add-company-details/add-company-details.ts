import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { DropdownModule } from 'primeng/dropdown';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import {
  CertificateCompanyService,
  CertificateCompany,
} from '../../../services/plant-care/certificate-company.service';

@Component({
  selector: 'app-add-company-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './add-company-details.component.html',
  styleUrls: ['./add-company-details.component.css'],
})
export class AddCompanyDetailsComponent implements OnInit {
  companyForm!: FormGroup;
  isLoading = false;
  sameNumberError = false;
  contactNumberError1 = false;
  contactNumberError2 = false;
  logoRequiredError = false;

  // Logo related
  @ViewChild('logoInput', { static: false })
  logoInput!: ElementRef<HTMLInputElement>;
  logoFile: File | null = null;
  logoPreview: string | ArrayBuffer | null = null;
  logoError = false;

  countries = [
    { name: 'Sri Lanka', code: 'LK', dialCode: '+94' },
    { name: 'Vietnam', code: 'VN', dialCode: '+84' },
    { name: 'Cambodia', code: 'KH', dialCode: '+855' },
    { name: 'Bangladesh', code: 'BD', dialCode: '+880' },
    { name: 'India', code: 'IN', dialCode: '+91' },
    { name: 'Netherlands', code: 'NL', dialCode: '+31' },
  ];

  constructor(
    private fb: FormBuilder,
    private companyService: CertificateCompanyService,
    private location: Location,
    private router: Router
  ) { }

  onBack(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after going back!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Go Back',
      cancelButtonText: 'No, Stay Here',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.location.back();
      }
    });
  }

  ngOnInit(): void {
    this.companyForm = this.fb.group({
      registrationNumber: ['', [Validators.required]],
      taxId: ['', [Validators.required]],
      companyName: ['', [Validators.required]],
      phoneCode1: ['+94', [Validators.required]],
      phone1: ['', [Validators.required]],
      phoneCode2: ['+94'],
      phone2: [''],
      address: ['', [Validators.required]],
    });

    // Dynamic phone validation for phone1
    this.companyForm.get('phoneCode1')?.valueChanges.subscribe((code) => {
      this.setPhoneValidators('phone1', code, true);
      this.validateContactNumbers(); // Add real-time validation
    });

    // Dynamic phone validation for phone2
    this.companyForm.get('phoneCode2')?.valueChanges.subscribe((code) => {
      this.setPhoneValidators('phone2', code, false);
      this.validateContactNumbers(); // Add real-time validation
    });

    // Add real-time validation on phone1 input
    this.companyForm.get('phone1')?.valueChanges.subscribe(() => {
      this.validateContactNumbers();
    });

    // Add real-time validation on phone2 input
    this.companyForm.get('phone2')?.valueChanges.subscribe(() => {
      this.validateContactNumbers();
    });

    // Initialize validators
    this.setPhoneValidators(
      'phone1',
      this.companyForm.get('phoneCode1')?.value,
      true
    );
    this.setPhoneValidators(
      'phone2',
      this.companyForm.get('phoneCode2')?.value,
      false
    );
  }

  // Apply validators dynamically
  private setPhoneValidators(
    field: 'phone1' | 'phone2',
    dialCode: string,
    required: boolean
  ): void {
    const control = this.companyForm.get(field);
    if (!control) return;

    const validators = [];
    if (required) {
      validators.push(Validators.required);
    }

    if (dialCode === '+94') {
      // Must be exactly 9 digits AND start with 7
      validators.push(Validators.pattern(/^7[0-9]{8}$/));
    } else {
      validators.push(Validators.pattern(/^[0-9]*$/)); // only numbers, any length
    }

    control.setValidators(validators);
    control.updateValueAndValidity();
  }

  // Prevent non-numeric input
  allowOnlyNumbers(event: KeyboardEvent): void {
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }

  getFlagUrl(code: string): string {
    return `https://flagcdn.com/w20/${code.toLowerCase()}.png`;
  }

  preventLeadingSpace(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement | HTMLTextAreaElement;
    if (event.key === ' ' && input.selectionStart === 0) {
      event.preventDefault();
    }
  }

  validateContactNumbers(): void {
    const phone1 = this.companyForm.get('phone1')?.value;
    const phone2 = this.companyForm.get('phone2')?.value;
    const phoneCode1 = this.companyForm.get('phoneCode1')?.value;
    const phoneCode2 = this.companyForm.get('phoneCode2')?.value;

    // Reset all phone errors first
    this.contactNumberError1 = false;
    this.contactNumberError2 = false;
    this.sameNumberError = false;

    // Step 1: Check Sri Lanka number validation FIRST
    if (phoneCode1 === '+94' && phone1) {
      this.contactNumberError1 = phone1.length !== 9 || !phone1.startsWith('7');
    }

    if (phoneCode2 === '+94' && phone2 && phone2.length > 0) {
      this.contactNumberError2 = phone2.length !== 9 || !phone2.startsWith('7');
    }

    // Step 2: Only check for duplicate numbers if both numbers have valid formats
    if (!this.contactNumberError1 && !this.contactNumberError2) {
      this.sameNumberError =
        phone1 && phone2 && phone1 === phone2 && phoneCode1 === phoneCode2;
    }
  }

  // Check if phone numbers have valid format (for validation popup)
  private hasValidPhoneFormat(phone: string, dialCode: string): boolean {
    if (!phone) return false;

    if (dialCode === '+94') {
      return phone.length === 9;
    }

    return /^[0-9]+$/.test(phone); // Only numbers for other countries
  }

  // Logo helpers
  openFilePicker(): void {
    if (this.logoInput && this.logoInput.nativeElement) {
      this.logoInput.nativeElement.click();
    } else {
      const el = document.getElementById('logo') as HTMLInputElement | null;
      if (el) el.click();
    }
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input || !input.files || input.files.length === 0) {
      this.logoError = true;
      this.logoFile = null;
      this.logoPreview = null;
      this.logoRequiredError = true;
      return;
    }

    const file = input.files[0];

    // Validate file type (image only)
    if (!file.type.startsWith('image/')) {
      this.logoError = true;
      this.logoFile = null;
      this.logoPreview = null;
      this.logoRequiredError = true;
      Swal.fire({
        icon: 'error',
        title: 'Invalid File',
        text: 'Please select an image file (png, jpg, jpeg, webp, etc.).',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });
      input.value = ''; // clear the value
      return;
    }

    // check file size (example: < 5MB)
    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSizeBytes) {
      this.logoError = true;
      this.logoFile = null;
      this.logoPreview = null;
      this.logoRequiredError = true;
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'Logo must be smaller than 5 MB.',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });
      input.value = '';
      return;
    }

    // All good
    this.logoError = false;
    this.logoRequiredError = false;
    this.logoFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  removeLogo(): void {
    this.logoFile = null;
    this.logoPreview = null;
    this.logoError = false;
    this.logoRequiredError = true; // Show required error when logo is removed
    if (this.logoInput && this.logoInput.nativeElement) {
      this.logoInput.nativeElement.value = '';
    } else {
      const el = document.getElementById('logo') as HTMLInputElement | null;
      if (el) el.value = '';
    }
  }

  // Get all validation errors for the popup
  private getAllValidationErrors(): { field: string; message: string }[] {
    const errors: { field: string; message: string }[] = [];

    // Logo validation
    if (!this.logoFile) {
      errors.push({
        field: 'Company Logo',
        message: 'Company logo is required',
      });
    }

    // Registration Number
    const regNumberControl = this.companyForm.get('registrationNumber');
    if (regNumberControl?.errors?.['required'] && regNumberControl.touched) {
      errors.push({
        field: 'Registration Number',
        message: 'Registration Number is required',
      });
    }

    // Tax ID
    const taxIdControl = this.companyForm.get('taxId');
    if (taxIdControl?.errors?.['required'] && taxIdControl.touched) {
      errors.push({ field: 'TAX ID', message: 'TAX ID is required' });
    }

    // Company Name
    const companyNameControl = this.companyForm.get('companyName');
    if (
      companyNameControl?.errors?.['required'] &&
      companyNameControl.touched
    ) {
      errors.push({
        field: 'Company Name',
        message: 'Company Name is required',
      });
    }

    // Phone 1 - Format validation first
    const phone1Control = this.companyForm.get('phone1');
    const phoneCode1 = this.companyForm.get('phoneCode1')?.value;

    if (phone1Control?.errors?.['required'] && phone1Control.touched) {
      errors.push({
        field: 'Phone Number - 1',
        message: 'Phone Number - 1 is required',
      });
    }

    if (this.contactNumberError1) {
      errors.push({
        field: 'Phone Number - 1',
        message: 'Phone Number must be exactly 9 digits and start with 7 for Sri Lanka (+94)',
      });
    }

    if (
      phone1Control?.errors?.['pattern'] &&
      phone1Control.touched &&
      phoneCode1 !== '+94'
    ) {
      errors.push({
        field: 'Phone Number - 1',
        message: 'Please enter a valid phone number containing only digits',
      });
    }

    // Phone 2 - Format validation first
    const phone2Control = this.companyForm.get('phone2');
    const phoneCode2 = this.companyForm.get('phoneCode2')?.value;

    if (this.contactNumberError2) {
      errors.push({
        field: 'Phone Number - 2',
        message: 'Phone Number must be exactly 9 digits and start with 7 for Sri Lanka (+94)',
      });
    }

    if (
      phone2Control?.errors?.['pattern'] &&
      phone2Control.touched &&
      phoneCode2 !== '+94'
    ) {
      errors.push({
        field: 'Phone Number - 2',
        message: 'Please enter a valid phone number containing only digits',
      });
    }

    // Only check for duplicate numbers if both numbers have valid formats
    if (
      !this.contactNumberError1 &&
      !this.contactNumberError2 &&
      this.sameNumberError
    ) {
      errors.push({
        field: 'Phone Numbers',
        message: 'Phone Number - 1 and Phone Number - 2 cannot be the same',
      });
    }

    // Address
    const addressControl = this.companyForm.get('address');
    if (addressControl?.errors?.['required'] && addressControl.touched) {
      errors.push({ field: 'Address', message: 'Address is required' });
    }

    return errors;
  }

  // Submit
  onSubmit(): void {
    this.companyForm.markAllAsTouched();
    this.validateContactNumbers();

    // Check if logo is required
    this.logoRequiredError = !this.logoFile;

    const validationErrors = this.getAllValidationErrors();

    if (validationErrors.length > 0) {
      this.scrollToFirstError();
      this.showValidationErrorPopup(validationErrors);
      return;
    }

    // Show confirmation popup before saving
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'Do you really want to create a new certificate company?',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, create it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-white dark:bg-[#363636] text-gray-800 dark:text-white',
        title: 'dark:text-white',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        const formValue = this.companyForm.value;

        const formData = new FormData();
        formData.append('companyName', formValue.companyName);
        formData.append('regNumber', formValue.registrationNumber);
        formData.append('taxId', formValue.taxId);
        formData.append('phoneCode1', formValue.phoneCode1);
        formData.append('phoneNumber1', formValue.phone1);
        formData.append('phoneCode2', formValue.phoneCode2 || '');
        formData.append('phoneNumber2', formValue.phone2 || '');
        formData.append('address', formValue.address);
        if (this.logoFile) {
          formData.append('logo', this.logoFile, this.logoFile.name);
        }

        this.companyService.createCompany(formData).subscribe({
          next: (res: { message: string; status: boolean; id?: number }) => {
            this.isLoading = false;
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: res.message || 'Certificate Company Created Successfully.',
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup:
                  'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            }).then(() => {
              this.router.navigate(['/plant-care/action/view-company-list']);
            });
            this.companyForm.reset({ phoneCode1: '+94', phoneCode2: '+94' });
            this.removeLogo();
          },
          error: (err: any) => {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text:
                err.error?.message ||
                'Failed to add company details. Please try again.',
              customClass: {
                popup:
                  'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            });
          },
        });
      }
    });
  }

  // Show validation error popup with all errors
  private showValidationErrorPopup(
    errors: { field: string; message: string }[]
  ): void {
    const errorsList = errors
      .map((error) => `<li>${error.message}</li>`)
      .join('');

    Swal.fire({
      icon: 'error',
      title: 'Missing or Invalid Information',
      html: `
        <div class="text-left">
          <p class="mb-3">Please fix the following issues:</p>
            <ul class="list-disc list-inside space-y-1 validation-errors max-h-60 overflow-y-auto">
          ${errorsList}
        </ul>
        </div>
      `,
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
        htmlContainer: 'text-left',
      },
      confirmButtonText: 'OK',
      width: '600px',
    });
  }

  // Helper method to scroll to first error
  private scrollToFirstError(): void {
    const firstErrorElement = document.querySelector('.border-red-500');
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
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
        title: 'font-semibold',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.location.back();
      }
    });
  }
}
