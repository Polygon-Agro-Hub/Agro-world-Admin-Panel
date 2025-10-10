import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
    private router: Router,
    private route: ActivatedRoute
  ) {}

  onBack(): void {
    this.location.back();
  }

  ngOnInit(): void {
    // Initialize form
    this.companyForm = this.fb.group({
      registrationNumber: ['', Validators.required],
      taxId: ['', Validators.required],
      companyName: ['', Validators.required],
      phoneCode1: ['+94', Validators.required],
      phone1: ['', Validators.required],
      phoneCode2: ['+94'],
      phone2: [''],
      address: ['', Validators.required],
    });

    // Read companyId from route params
    this.route.params.subscribe((params) => {
      this.companyId = +params['id'];
      this.loadCompanyDetails();
    });

    // Dynamic validation
    this.companyForm.get('phoneCode1')?.valueChanges.subscribe((code) => {
      this.setPhoneValidators('phone1', code, true);
    });
    this.companyForm.get('phoneCode2')?.valueChanges.subscribe((code) => {
      this.setPhoneValidators('phone2', code, false);
    });
  }

  // Load existing company details
  private loadCompanyDetails(): void {
    this.isLoading = true;
    this.companyService.getCompanyById(this.companyId).subscribe({
      next: (res) => {
        this.isLoading = false;
        const company = res.company;

        this.companyForm.patchValue({
          registrationNumber: company.regNumber,
          taxId: company.taxId,
          companyName: company.companyName,
          phoneCode1: company.phoneCode1 || '+94',
          phone1: company.phoneNumber1,
          phoneCode2: company.phoneCode2 || '+94',
          phone2: company.phoneNumber2,
          address: company.address,
        });
      },
      error: () => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load company details.',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        }).then(() => {
          this.router.navigate(['/plant-care/action/view-company-list']);
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
    if (required) validators.push(Validators.required);

    if (dialCode === '+94') {
      validators.push(Validators.pattern(/^[0-9]{9}$/));
    } else {
      validators.push(Validators.pattern(/^[0-9]*$/));
    }

    control.setValidators(validators);
    control.updateValueAndValidity();
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }

  getFlagUrl(code: string): string {
    return `https://flagcdn.com/w20/${code.toLowerCase()}.png`;
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
      id: this.companyId,
      companyName: formValue.companyName,
      regNumber: formValue.registrationNumber,
      taxId: formValue.taxId,
      phoneCode1: formValue.phoneCode1,
      phoneNumber1: formValue.phone1,
      phoneCode2: formValue.phoneCode2,
      phoneNumber2: formValue.phone2,
      address: formValue.address,
    };

    this.companyService.updateCompany(this.companyId, company).subscribe({
      next: (res: { message: string; status: boolean }) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: res.message || 'Company details updated successfully!',
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
          text:
            err.error?.message ||
            'Failed to update company details. Please try again.',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
      },
    });
  }

  onCancel(): void {
    this.location.back();
  }
}
