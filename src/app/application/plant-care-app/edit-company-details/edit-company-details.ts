import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import {
  CertificateCompanyService,
  CertificateCompany,
} from '../../../services/plant-care/certificate-company.service';

@Component({
  selector: 'app-edit-company-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './edit-company-details.component.html',
  styleUrls: ['./edit-company-details.component.css'],
})
export class EditCompanyDetailsComponent implements OnInit {
  companyForm!: FormGroup;
  isLoading = false;
  companyId!: number;
  isEditMode = false;

  logoPreview: string | ArrayBuffer | null = null;
  logoFile: File | null = null;
  sameNumberError = false;
  contactNumberError1 = false;
  contactNumberError2 = false;

  @ViewChild('logoInput', { static: false })
  logoInput!: ElementRef<HTMLInputElement>;

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
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {}

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
    });
    // Dynamic phone validation for phone2
    this.companyForm.get('phoneCode2')?.valueChanges.subscribe((code) => {
      this.setPhoneValidators('phone2', code, false);
    });

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.companyId = +params['id'];
        this.loadCompanyDetails();
      }
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

  private loadCompanyDetails(): void {
    this.isLoading = true;
    this.companyService.getCompanyById(this.companyId).subscribe({
      next: (res) => {
        this.isLoading = false;
        const company = res.company;

        // Handle null phoneNumber2 - convert to empty string
        const phoneNumber2 =
          company.phoneNumber2 === 'null' || company.phoneNumber2 === null
            ? ''
            : company.phoneNumber2;
        const phoneCode2 =
          company.phoneCode2 === 'null' || company.phoneCode2 === null
            ? '+94'
            : company.phoneCode2;

        this.companyForm.patchValue({
          registrationNumber: company.regNumber,
          taxId: company.taxId,
          companyName: company.companyName,
          phoneCode1: company.phoneCode1,
          phone1: company.phoneNumber1,
          phoneCode2: phoneCode2,
          phone2: phoneNumber2,
          address: company.address,
        });
        this.logoPreview = company.logo ?? null;

        // Initialize validators after loading data
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
      },
      error: () => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load company details',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
        this.router.navigate(['/plant-care/action/view-company-list']);
      },
    });
  }

  openFilePicker(): void {
    if (this.logoInput && this.logoInput.nativeElement) {
      this.logoInput.nativeElement.click();
    } else {
      const fileInput = document.getElementById('logo') as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
      }
    }
  }

  onLogoChange(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File',
        text: 'Please select a valid image file.',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });
      return;
    }

    // Check file size (5MB limit)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'Logo must be smaller than 5 MB.',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });
      return;
    }

    this.logoFile = file;
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.logoPreview = e.target?.result ?? null;
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    this.companyForm.markAllAsTouched();
    this.validateContactNumbers();

    if (this.companyForm.invalid || this.sameNumberError) {
      // Scroll to first error
      this.scrollToFirstError();

      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Please fix the errors before submitting.',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });
      return;
    }

    this.isLoading = true;
    const formData = new FormData();
    const val = this.companyForm.value;

    formData.append('companyName', val.companyName);
    formData.append('regNumber', val.registrationNumber);
    formData.append('taxId', val.taxId);
    formData.append('phoneCode1', val.phoneCode1);
    formData.append('phoneNumber1', val.phone1);
    formData.append('phoneCode2', val.phoneCode2);

    // Only append phoneNumber2 if it has a value and is not empty/null
    if (val.phone2 && val.phone2.trim() !== '' && val.phone2 !== 'null') {
      formData.append('phoneNumber2', val.phone2);
    }

    formData.append('address', val.address);

    if (this.logoFile) {
      formData.append('logo', this.logoFile);
    }

    this.companyService.updateCompany(this.companyId, formData).subscribe({
      next: (res) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: res.message || 'Certificate Company Updated Successfully.',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        }).then(() => {
          this.router.navigate(['/plant-care/action/view-company-list']);
        });
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'Failed to update company details.',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
      },
    });
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

  validateContactNumbers(): void {
    const phoneCode1 = this.companyForm.get('phoneCode1')?.value;
    const phone1 = this.companyForm.get('phone1')?.value;
    const phoneCode2 = this.companyForm.get('phoneCode2')?.value;
    const phone2 = this.companyForm.get('phone2')?.value;

    // Check if numbers are the same (only if both are provided and same country code)
    this.sameNumberError =
      phone1 && phone2 && phone1 === phone2 && phoneCode1 === phoneCode2;

    // Check Sri Lanka number validation
    this.contactNumberError1 =
      phoneCode1 === '+94' && phone1 && phone1.length !== 9;
    this.contactNumberError2 =
      phoneCode2 === '+94' &&
      phone2 &&
      phone2.length > 0 &&
      phone2.length !== 9;
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
      text: 'You may lose the unsaved changes!',
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

  onBack(): void {
    this.onCancel();
  }
}
