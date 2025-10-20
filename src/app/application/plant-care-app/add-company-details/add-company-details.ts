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
  ) {}

  onBack(): void {
    this.location.back();
  }

  ngOnInit(): void {
    this.companyForm = this.fb.group({
      registrationNumber: ['', Validators.required],
      taxId: ['', Validators.required],
      companyName: ['', Validators.required],
      phoneCode1: ['+94', Validators.required],
      phone1: ['', Validators.required], // validators added dynamically
      phoneCode2: ['+94'],
      phone2: [''], // optional
      address: ['', Validators.required],
    });

    // Dynamic phone validation for phone1
    this.companyForm.get('phoneCode1')?.valueChanges.subscribe((code) => {
      this.setPhoneValidators('phone1', code, true);
    });
    // Dynamic phone validation for phone2
    this.companyForm.get('phoneCode2')?.valueChanges.subscribe((code) => {
      this.setPhoneValidators('phone2', code, false);
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
      validators.push(Validators.pattern(/^[0-9]{9}$/)); // exactly 9 digits
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

  isInvalidMobileNumber(field: 'phone1' | 'phone2'): boolean {
    const control = this.companyForm.get(field);
    return !!(control?.value && !/^[0-9]{9}$/.test(control.value));
  }

  validateContactNumbers(): void {
    const phone1 = this.companyForm.get('phone1')?.value;
    const phone2 = this.companyForm.get('phone2')?.value;

    this.sameNumberError = phone1 && phone2 && phone1 === phone2;
    this.contactNumberError1 = phone1 && phone1.length !== 9;
    this.contactNumberError2 =
      phone2 && phone2.length > 0 && phone2.length !== 9;
  }

  // Logo helpers
  openFilePicker(): void {
    // prefer ViewChild if available
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
      return;
    }

    const file = input.files[0];

    // Validate file type (image only)
    if (!file.type.startsWith('image/')) {
      this.logoError = true;
      this.logoFile = null;
      this.logoPreview = null;
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
    const maxSizeBytes = 5 * 1024 * 1024; // 2 MB
    if (file.size > maxSizeBytes) {
      this.logoError = true;
      this.logoFile = null;
      this.logoPreview = null;
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
    if (this.logoInput && this.logoInput.nativeElement) {
      this.logoInput.nativeElement.value = '';
    } else {
      const el = document.getElementById('logo') as HTMLInputElement | null;
      if (el) el.value = '';
    }
  }

  // Submit
  onSubmit(): void {
    this.companyForm.markAllAsTouched();
    this.validateContactNumbers();

    // enforce logo required
    if (!this.logoFile) {
      this.logoError = true;
    }

    if (this.companyForm.invalid || this.sameNumberError || this.logoError) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: this.logoError
          ? 'Please upload a valid company logo.'
          : 'Please fix the errors before submitting.',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });
      return;
    }

    this.isLoading = true;
    const formValue = this.companyForm.value;

    // Build FormData for multipart/form-data
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
          text: res.message || 'Certificate Company Created  Successfully.',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
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
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
      },
    });
  }

  onCancel(): void {
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
}
