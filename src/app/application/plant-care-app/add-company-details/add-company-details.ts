import { Component, OnInit } from '@angular/core';
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

  onSubmit(): void {
    this.companyForm.markAllAsTouched();
    this.validateContactNumbers();

    if (this.companyForm.invalid || this.sameNumberError) {
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
    const formValue = this.companyForm.value;

    const company: CertificateCompany = {
      companyName: formValue.companyName,
      regNumber: formValue.registrationNumber,
      taxId: formValue.taxId,
      phoneCode1: formValue.phoneCode1,
      phoneNumber1: formValue.phone1,
      phoneCode2: formValue.phoneCode2,
      phoneNumber2: formValue.phone2,
      address: formValue.address,
    };

    this.companyService.createCompany(company).subscribe({
      next: (res: { message: string; status: boolean; id?: number }) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: res.message || 'Company details added successfully!',
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
    this.companyForm.reset({ phoneCode1: '+94', phoneCode2: '+94' });
  }
}
