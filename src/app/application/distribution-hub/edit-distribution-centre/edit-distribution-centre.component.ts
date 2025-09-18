import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DestributionService } from '../../../services/destribution-service/destribution-service.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { DropdownModule } from 'primeng/dropdown';
import { Observable, of } from 'rxjs';
import {
  map,
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
} from 'rxjs/operators';

import { Location } from '@angular/common';
import { EmailvalidationsService } from '../../../services/email-validation/emailvalidations.service';

interface PhoneCode {
  code: string;
  dialCode: string;
  name: string;
}

interface DistributionCenter {
  id: number;
  centerName: string;
  code1: string;
  contact01: string;
  code2: string;
  contact02: string;
  city: string;
  district: string;
  province: string;
  country: string;
  longitude: string;
  latitude: string;
  email: string;
  company?: string;
  companyId?: number;
  regCode: string;
}

@Component({
  selector: 'app-edit-distribution-centre',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, DropdownModule,DropdownModule],
  templateUrl: './edit-distribution-centre.component.html',
  styleUrl: './edit-distribution-centre.component.css',
})
export class EditDistributionCentreComponent implements OnInit {
  distributionForm!: FormGroup;
  companyList: CompanyList[] = [];
  isLoading = false;
  distributionCenterDetails?: DistributionCenter;
  hasData = false;

  submitError: string | null = null;
  submitSuccess: string | null = null;
  companyOptions: { label: string; value: number }[] = [];
  provinceOptions: { label: string; value: string }[] = [];
  districtOptions: { label: string; value: string }[] = [];

  isLoadingregcode: boolean = false;
  private updatingDropdowns = false;
  private originalCenterName = '';


countries: PhoneCode[] = [
  { code: 'LK', dialCode: '+94', name: 'Sri Lanka' },
  { code: 'IN', dialCode: '+91', name: 'India' },
  { code: 'VN', dialCode: '+84', name: 'Vietnam' },
  { code: 'KH', dialCode: '+855', name: 'Cambodia' },
  { code: 'BD', dialCode: '+880', name: 'Bangladesh' },
  { code: 'NL', dialCode: '+31', name: 'Netherlands' },
];


getFlagUrl(countryCode: string): string {
  return `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`;
}

  provinces: string[] = [
    'Central',
    'Eastern',
    'Northern',
    'Southern',
    'Western',
    'North Western',
    'North Central',
    'Uva',
    'Sabaragamuwa',
  ];

  districtsMap: { [key: string]: string[] } = {
    Central: ['Kandy', 'Matale', 'Nuwara Eliya'],
    Eastern: ['Ampara', 'Batticaloa', 'Trincomalee'],
    Northern: ['Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya'],
    Southern: ['Galle', 'Hambantota', 'Matara'],
    Western: ['Colombo', 'Gampaha', 'Kalutara'],
    'North Western': ['Kurunegala', 'Puttalam'],
    'North Central': ['Anuradhapura', 'Polonnaruwa'],
    Uva: ['Badulla', 'Monaragala'],
    Sabaragamuwa: ['Kegalle', 'Ratnapura'],
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private distributionService: DestributionService,
    private location: Location,
    private emailValidationService: EmailvalidationsService
  ) {
    this.initializeForm();
  }

  // Add this to your ngOnInit method after form setup
  ngOnInit(): void {
    this.fetchAllCompanies();
    this.initializeProvinceOptions();
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.fetchDistributionCenterById(id);
    }

    this.setupFormValueChangeListeners();

    // Add this for debugging - remove after fixing
    this.distributionForm.statusChanges.subscribe(status => {
      console.log('Form status:', status);
      if (status === 'INVALID') {
        this.checkFormValidity();
      }
    });
  }

  private setupFormValueChangeListeners() {
    // Phone code listeners
    this.distributionForm.get('contact1Code')?.valueChanges.subscribe(() => {
      this.distributionForm.get('contact1')?.updateValueAndValidity();
    });
    this.distributionForm.get('contact2Code')?.valueChanges.subscribe(() => {
      this.distributionForm.get('contact2')?.updateValueAndValidity();
    });

    // Province/District sync listeners
    this.distributionForm
      .get('province')
      ?.valueChanges.subscribe((province) => {
        if (!this.updatingDropdowns && province) {
          this.updatingDropdowns = true;
          this.distributionForm.get('district')?.setValue('');
          this.updatingDropdowns = false;
        }
      });

    this.distributionForm
      .get('district')
      ?.valueChanges.subscribe((district) => {
        if (!this.updatingDropdowns && district) {
          const matchingProvince = this.findProvinceByDistrict(district);
          if (matchingProvince) {
            this.updatingDropdowns = true;
            this.distributionForm.get('province')?.setValue(matchingProvince);
            this.updatingDropdowns = false;
          }
        }
      });

    // Contact number change listeners for duplicate validation
    this.distributionForm.get('contact1')?.valueChanges.subscribe(() => {
      // Small delay to ensure all form updates are processed
      setTimeout(() => {
        this.distributionForm.updateValueAndValidity();
      }, 0);
    });

    this.distributionForm.get('contact1Code')?.valueChanges.subscribe(() => {
      setTimeout(() => {
        this.distributionForm.updateValueAndValidity();
      }, 0);
    });

    this.distributionForm.get('contact2')?.valueChanges.subscribe(() => {
      setTimeout(() => {
        this.distributionForm.updateValueAndValidity();
      }, 0);
    });

    this.distributionForm.get('contact2Code')?.valueChanges.subscribe(() => {
      setTimeout(() => {
        this.distributionForm.updateValueAndValidity();
      }, 0);
    });

    // Name validation with debounce - Remove async validator from here
    this.distributionForm
      .get('name')
      ?.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((value) => {
          if (value && value.length >= 3 && value !== this.originalCenterName) {
            return this.distributionService.checkDistributionCentreNameExists(
              value
            );
          }
          return of({ exists: false });
        })
      )
      .subscribe((result) => {
        const nameControl = this.distributionForm.get('name');
        if (nameControl && result.exists) {
          const currentErrors = nameControl.errors || {};
          nameControl.setErrors({ ...currentErrors, nameExists: true });
        } else if (nameControl?.errors?.['nameExists']) {
          const errors = { ...nameControl.errors };
          delete errors['nameExists'];
          nameControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
        }
      });
  }

  checkFormValidity(): void {
    console.log('Form valid:', this.distributionForm.valid);
    console.log('Form errors:', this.distributionForm.errors);

    Object.keys(this.distributionForm.controls).forEach(key => {
      const control = this.distributionForm.get(key);
      if (control && control.invalid) {
        console.log(`${key} errors:`, control.errors);
      }
    });
  }

  initializeProvinceOptions() {
  // Sort provinces alphabetically A to Z
  const sortedProvinces = this.provinces.sort((a, b) => a.localeCompare(b));
  
  this.provinceOptions = sortedProvinces.map(province => ({
    label: province,
    value: province
  }));
}

  private findProvinceByDistrict(district: string): string | null {
    for (const province in this.districtsMap) {
      if (this.districtsMap[province].includes(district)) {
        return province;
      }
    }
    return null;
  }

  // Custom validator for phone numbers based on country code
  phoneNumberValidator(codeControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const phoneNumber = control.value;
      const phoneCode = control.parent?.get(codeControlName)?.value;

      if (!phoneNumber && codeControlName === 'contact2Code') {
        // Allow empty secondary contact
        return null;
      }

      if (!phoneNumber) {
        return { required: true };
      }

      // Define phone number patterns based on country code
      const patterns: { [key: string]: RegExp } = {
        '+94': /^[0-9]{9}$/, // Sri Lanka: 9 digits
        '+91': /^[6-9][0-9]{9}$/, // India: 10 digits, starts with 6-9
        '+1': /^[0-9]{10}$/, // USA: 10 digits
        '+44': /^[0-9]{10}$/, // UK: 10 digits
      };

      const pattern = patterns[phoneCode];
      if (!pattern) {
        return { invalidPhone: 'Unsupported country code' };
      }

      if (!pattern.test(phoneNumber)) {
        return {
          invalidPhone: `Please enter a valid mobile number (format: +947XXXXXXXX)`,
        };
      }

      return null;
    };
  }

  // Update fetchAllCompanies method
  fetchAllCompanies() {
    this.distributionService.getAllCompanies().subscribe(
      (res) => {
        this.companyList = res.data.map((company: any) => ({
          id: company.id,
          companyNameEnglish: company.companyNameEnglish,
        }));

        // Convert to dropdown options format
        this.companyOptions = this.companyList.map(company => ({
          label: company.companyNameEnglish,
          value: company.id
        }));

        console.log('Company list loaded:', this.companyList);
      },
      (error) => {
        console.error('Error fetching companies:', error);
        this.showErrorAlert('Failed to load companies');
      }
    );
  }

  // Update initializeForm with enhanced validations
  // In your component class, update the initializeForm method:
initializeForm(): void {
  this.distributionForm = this.fb.group({
    name: ['', Validators.required], // Removed lettersOnlyValidator - now allows numbers and special characters
    company: ['', Validators.required],
    contact1Code: ['+94', Validators.required],
    contact1: ['', [
      Validators.required, 
      Validators.pattern(/^7\d{8}$/), // Must start with 7 and have 9 digits total
      this.startsWithSevenValidator.bind(this)
    ]],
    contact2Code: ['+94'],
    contact2: ['', [
      Validators.pattern(/^7\d{8}$/), // Must start with 7 and have 9 digits total
      this.startsWithSevenValidator.bind(this)
    ]],
    latitude: [
      '',
      [
        Validators.required,
        this.numericDecimalValidator,
        this.latitudeRangeValidator
      ],
    ],
    longitude: [
      '',
      [
        Validators.required,
        this.numericDecimalValidator,
        this.longitudeRangeValidator
      ],
    ],
    email: ['', [
      Validators.required, 
      this.customEmailValidator.bind(this)
    ]],
    country: ['Sri Lanka', Validators.required],
    province: ['', Validators.required],
    district: ['', Validators.required],
    city: ['', [Validators.required, this.englishLettersOnlyValidator]],
    regCode: ['', Validators.required],
  }, { validators: [this.contactNumbersMatchValidator] });
}

private lettersOnlyValidator(control: AbstractControl) {
  if (!control.value) return null;
  // \p{L} matches any kind of letter in any language, \s allows spaces
  const lettersOnly = /^[\p{L}\s]+$/u;
  return lettersOnly.test(control.value) ? null : { lettersOnly: true };
}

  // Add validation methods from add component
  private englishLettersOnlyValidator(control: AbstractControl) {
    if (!control.value) return null;
    const englishLettersOnly = /^[A-Za-z\s]+$/;
    return englishLettersOnly.test(control.value) ? null : { englishLettersOnly: true };
  }

  private numericDecimalValidator(control: AbstractControl) {
    if (!control.value) return null;
    const numericDecimal = /^-?\d+(\.\d+)?$/;
    return numericDecimal.test(control.value) ? null : { numericDecimal: true };
  }

  private nameExistsValidator(): any {
    return (control: AbstractControl) => {
      if (!control.value || control.value.length < 3 || control.value === this.originalCenterName) {
        return Promise.resolve(null);
      }

      return this.distributionService
        .checkDistributionCentreNameExists(control.value)
        .pipe(
          map((res) => {
            return res.exists ? { nameExists: true } : null;
          }),
          catchError(() => {
            return Promise.resolve(null);
          })
        );
    };
  }

  private contactNumbersMatchValidator = (formGroup: AbstractControl): ValidationErrors | null => {
  if (!(formGroup instanceof FormGroup)) {
    return null;
  }

  const contact1Control = formGroup.get('contact1');
  const contact1CodeControl = formGroup.get('contact1Code');
  const contact2Control = formGroup.get('contact2');
  const contact2CodeControl = formGroup.get('contact2Code');

  if (
    !contact1Control ||
    !contact2Control ||
    !contact1CodeControl ||
    !contact2CodeControl
  ) {
    return null;
  }

  const contact1 = contact1Control.value;
  const contact2 = contact2Control.value;
  const contact1Code = contact1CodeControl.value;
  const contact2Code = contact2CodeControl.value;

  // Only validate if both contact numbers are provided
  if (
    contact1 &&
    contact2 &&
    contact1 === contact2 &&
    contact1Code === contact2Code
  ) {
    // Set error on both fields
    contact1Control.setErrors({ ...contact1Control.errors, sameContactNumbers: true });
    contact2Control.setErrors({ ...contact2Control.errors, sameContactNumbers: true });
    return { sameContactNumbers: true };
  } else {
    // Clear the sameContactNumbers error if it exists
    if (contact1Control.errors?.['sameContactNumbers']) {
      const errors = { ...contact1Control.errors };
      delete errors['sameContactNumbers'];
      contact1Control.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }
    if (contact2Control.errors?.['sameContactNumbers']) {
      const errors = { ...contact2Control.errors };
      delete errors['sameContactNumbers'];
      contact2Control.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }
    return null;
  }
};

private phoneFormatValidator = (formGroup: AbstractControl): ValidationErrors | null => {
  if (!(formGroup instanceof FormGroup)) {
    return null;
  }

  const contact1Control = formGroup.get('contact1');
  const contact1CodeControl = formGroup.get('contact1Code');
  const contact2Control = formGroup.get('contact2');
  const contact2CodeControl = formGroup.get('contact2Code');

  // Validate contact1 format
  if (contact1Control && contact1Control.value && contact1CodeControl && contact1CodeControl.value === '+94') {
    const phoneRegex = /^7\d{8}$/;
    if (!phoneRegex.test(contact1Control.value)) {
      contact1Control.setErrors({ ...contact1Control.errors, pattern: true });
      return { invalidPhoneFormat: true };
    }
  }

  // Validate contact2 format
  if (contact2Control && contact2Control.value && contact2CodeControl && contact2CodeControl.value === '+94') {
    const phoneRegex = /^7\d{8}$/;
    if (!phoneRegex.test(contact2Control.value)) {
      contact2Control.setErrors({ ...contact2Control.errors, pattern: true });
      return { invalidPhoneFormat: true };
    }
  }

  return null;
};



back(): void {
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
      this.location.back(); // Go to the previous page
    }
  });
}


  onProvinceChange() {
    const selectedProvince = this.distributionForm.get('province')?.value;
    if (selectedProvince) {
      // Update district options based on selected province
      const districts = this.districtsMap[selectedProvince] || [];
      this.districtOptions = districts.sort().map(district => ({
        label: district,
        value: district
      }));

      // Clear district selection when province changes
      if (!this.updatingDropdowns) {
        this.distributionForm.get('district')?.setValue('');
      }
    } else {
      // Show all districts if no province selected
      const allDistricts = Object.values(this.districtsMap).flat().sort();
      this.districtOptions = allDistricts.map(district => ({
        label: district,
        value: district
      }));
    }

    this.updateRegCode();

    const province = this.distributionForm.get('province')?.value;
    const district = this.distributionForm.get('district')?.value;
    const city = this.distributionForm.get('city')?.value;

    if (province && district && city) {
      this.isLoadingregcode = true;
      this.distributionService
        .generateRegCode(province, district, city)
        .subscribe((response) => {
          this.distributionForm.patchValue({ regCode: response.regCode });
          this.isLoadingregcode = false;
        });
    }
  }

  onDistrictChange() {
    const selectedDistrict = this.distributionForm.get('district')?.value;
    if (selectedDistrict && !this.updatingDropdowns) {
      const matchingProvince = this.findProvinceByDistrict(selectedDistrict);
      if (matchingProvince) {
        this.updatingDropdowns = true;
        this.distributionForm.get('province')?.setValue(matchingProvince);
        this.updatingDropdowns = false;
      }
    }
    this.updateRegCode();
  }

  updateRegCode() {
  console.log('update reg code');
  const province = this.distributionForm.get('province')?.value;
  const district = this.distributionForm.get('district')?.value;
  const city = this.distributionForm.get('city')?.value;

  console.log('province', province, 'district', district, 'city', city);

  if (province && district && city) {
    this.isLoadingregcode = true;
    this.distributionService
      .generateRegCode(province, district, city)
      .subscribe({
        next: (response) => {
          let regCode = response.regCode;
          
          // Ensure the regCode starts with 'D'
          if (!regCode.startsWith('D')) {
            regCode = 'D' + regCode;
          }
          
          this.distributionForm.patchValue({ regCode });
          this.isLoadingregcode = false;
        },
        error: (error) => {
          console.error('Error generating reg code:', error);
          // Fallback to manual generation if API fails
          let regCode = `${province.slice(0, 2).toUpperCase()}${district
            .slice(0, 1)
            .toUpperCase()}${city.slice(0, 1).toUpperCase()}`;
          
          // Ensure the regCode starts with 'D'
          if (!regCode.startsWith('D')) {
            regCode = 'D' + regCode;
          }
          
          console.log('regCode fallback', regCode);
          this.distributionForm.patchValue({ regCode });
          this.isLoadingregcode = false;
        }
      });
  }
}

  fetchDistributionCenterById(id: number) {
    console.log('Fetching distribution center with ID:', id);
    this.isLoading = true;

    this.distributionService.getDistributionCentreById(id).subscribe(
      (response: DistributionCenter) => {
        console.log('Distribution center details:', response);
        this.isLoading = false;
        this.distributionCenterDetails = response;
        this.hasData = !!response;
        this.populateForm(response);
      },
      (error) => {
        console.error('API Error:', error);
        this.isLoading = false;

        if (error.status === 401) {
          this.showErrorAlert('Unauthorized access');
        } else if (error.status === 404) {
          this.showErrorAlert('Distribution center not found');
          this.router.navigate([
            '/distribution-hub/action/view-destribition-center',
          ]);
        } else {
          this.showErrorAlert('Failed to load distribution center details');
        }
      }
    );
  }

  populateForm(data: DistributionCenter): void {
    this.originalCenterName = data.centerName; // Store original name

    const matchingCompany = this.companyList.find(
      (company) => company.companyNameEnglish === data.company
    );

    // Update district options based on province
    if (data.province) {
      const districts = this.districtsMap[data.province] || [];
      this.districtOptions = districts.sort().map(district => ({
        label: district,
        value: district
      }));
    }

    this.distributionForm.patchValue({
      name: data.centerName,
      company: matchingCompany ? matchingCompany.id : null,
      contact1Code: data.code1,
      contact1: data.contact01,
      contact2Code: data.code2,
      contact2: data.contact02,
      latitude: data.latitude,
      longitude: data.longitude,
      email: data.email,
      country: data.country,
      province: data.province,
      district: data.district,
      city: data.city,
      regCode: data.regCode,
    });

    console.log('distributionForm', this.distributionForm);
  }

  getDistricts(): string[] {
    const selectedProvince = this.distributionForm.get('province')?.value;
    return selectedProvince ? this.districtsMap[selectedProvince] || [] : [];
  }

  private showErrorAlert(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonColor: '#3085d6',
    });
  }

  onCancel() {
  Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: 'All entered data will be lost!',
    showCancelButton: true,
    confirmButtonText: 'Yes, Cancel',
    cancelButtonText: 'No, Keep Editing',
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
    },
  }).then((result) => {
    if (result.isConfirmed) {
    
       this.location.back(); // Go to the previous page
   
    }
  });
}




  // Fixed isFieldInvalid method
  isFieldInvalid(fieldName: string): boolean {
    const field = this.distributionForm.get(fieldName);
    if (!field) return false;

    // Show validation errors when field is invalid AND (touched OR dirty)
    return !!(field.invalid && (field.touched || field.dirty));
  }

  // Add method to trigger validation on blur for important fields
  onFieldBlur(fieldName: string) {
    const field = this.distributionForm.get(fieldName);
    if (field) {
      field.markAsTouched();
      field.updateValueAndValidity();
    }
  }

  updateDistributionCentre() {
  // Remove the form.valid check and always allow submission
  if (!this.companyList || this.companyList.length === 0) {
    this.showErrorAlert(
      'Company list not loaded. Please wait or refresh the page.'
    );
    return;
  }

  // Check if form is invalid and show validation errors
  if (this.distributionForm.invalid) {
    // Mark all fields as touched to show validation errors
    this.markFormGroupTouched(this.distributionForm);
    
    // Collect all validation errors
    const errorMessages = this.getAllValidationErrors();
    
    Swal.fire({
      icon: 'error',
      title: 'Form Validation Failed',
      html: this.formatErrorMessagesForAlert(errorMessages),
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      }
    });
    return;
  }

  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to update this distribution centre?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Update it!',
    cancelButtonText: 'No, Cancel',
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
    }
  }).then((result) => {
    if (result.isConfirmed) {
      this.isLoading = true;

      const companyId = Number(this.distributionForm.value.company);
      const selectedCompany = this.companyList.find(
        (company) => Number(company.id) === companyId
      );

      if (!selectedCompany) {
        this.isLoading = false;
        this.showErrorAlert('Selected company not found');
        return;
      }

      const updateData = {
    name: this.distributionForm.value.name, // Map to centerName
    contact1Code: this.distributionForm.value.contact1Code, // Map to code1
    contact1: this.distributionForm.value.contact1, // Map to contact01
    contact2Code: this.distributionForm.value.contact2Code || '', // Map to code2
    contact2: this.distributionForm.value.contact2 || '', // Map to contact02
    city: this.distributionForm.value.city,
    district: this.distributionForm.value.district,
    province: this.distributionForm.value.province,
    country: this.distributionForm.value.country,
    regCode: this.distributionForm.value.regCode,
    longitude: parseFloat(this.distributionForm.value.longitude).toString(),
    latitude: parseFloat(this.distributionForm.value.latitude).toString(),
    email: this.distributionForm.value.email,
    company: companyId // Send companyId instead of company
  };

      const id = this.route.snapshot.params['id'];

      this.distributionService
        .updateDistributionCentreDetails(id, updateData)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.success) {
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Distribution centre updated successfully!',
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                }
              }).then(() => {
                this.router.navigate(['/distribution-hub/action/view-destribition-center']);
              });
            } else {
              this.showErrorAlert(response.error || 'Update failed');
            }
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Update error:', error);

            let errorMessage = 'Update failed. Please try again.';
            
            if (error.error) {
              // Handle validation errors
              if (error.status === 400 && error.error.error) {
                errorMessage = error.error.error;
              }
              // Handle conflict errors
              else if (error.status === 409) {
                if (error.error.conflictingRecord) {
                  const conflict = error.error.conflictingRecord;
                  switch (conflict.conflictType) {
                    case 'name':
                      errorMessage = 'A distribution center with this name already exists.';
                      break;
                    case 'regCode':
                      errorMessage = 'A distribution center with this registration code already exists.';
                      break;
                    case 'contact':
                      errorMessage = 'A distribution center with this contact number already exists.';
                      break;
                    default:
                      errorMessage = error.error.error || 'A distribution center with these details already exists.';
                  }
                } else {
                  errorMessage = error.error.error || 'A distribution center with these details already exists.';
                }
              }
              // Handle other errors
              else if (error.error.message) {
                errorMessage = error.error.message;
              }
            }

            this.showErrorAlert(errorMessage);
          },
        });
    }
  });
}

// Add these helper methods to collect and format validation errors
private getAllValidationErrors(): { field: string; error: string }[] {
  const errors: { field: string; error: string }[] = [];
  
  Object.keys(this.distributionForm.controls).forEach(key => {
    const control = this.distributionForm.get(key);
    if (control && control.invalid && control.errors) {
      const errorMessage = this.getFieldError(key);
      if (errorMessage) {
        errors.push({
          field: this.getFieldLabel(key),
          error: errorMessage
        });
      }
    }
  });
  
  return errors;
}

private formatErrorMessagesForAlert(errors: { field: string; error: string }[]): string {
  if (errors.length === 0) {
    return 'Please correct the form errors.';
  }
  
  let html = '<div class="text-left">';
  html += '<p class="mb-3 font-semibold">Please correct the following errors:</p>';
  html += '<ul class="list-disc pl-5 space-y-1">';
  
  errors.forEach(error => {
    html += `<li><span class="font-medium">${error.field}:</span> ${error.error}</li>`;
  });
  
  html += '</ul></div>';
  return html;
}

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Fixed getFieldError method to handle all error types properly
  getFieldError(fieldName: string): string {
  const field = this.distributionForm.get(fieldName);

  if (!field?.errors) return '';

  // Handle required validation first
  if (field.errors['required']) {
    return `${this.getFieldLabel(fieldName)} is required`;
  }

   if (fieldName.includes('contact')) {
    if (field.errors['pattern']) {
      return 'Please enter a valid mobile number (format: +947XXXXXXXX)';
    }
    if (field.errors['startsWithSeven']) {
      return 'Mobile number must start with 7';
    }
    if (field.errors['sameContactNumbers']) {
      return 'Contact numbers cannot be the same';
    }
  }

  // Add these new error handlers for coordinate ranges
  if (field.errors['latitudeRange']) {
    return 'Latitude must be between -90 and 90';
  }

  if (field.errors['longitudeRange']) {
    return 'Longitude must be between -180 and 180';
  }

  if (field.errors['customEmail']) {
    return field.errors['customEmail']; // Return the specific error message from service
  }

  if (field.errors['pattern']) {
    if (fieldName.includes('contact')) {
      return 'Please enter a valid mobile number (format: +947XXXXXXXX)';
    }
  }

  if (field.errors['numericDecimal']) {
    return `${this.getFieldLabel(fieldName)} must be a valid number (e.g., 6.9271 or -79.8612)`;
  }



  if (field.errors['sameContactNumbers']) {
    return 'Contact Number 02 must be different from Contact Number 01';
  }

  if (field.errors['nameExists']) {
    return 'Distribution Centre Name already exists';
  }

  return '';
}

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Distribution Centre Name',
      company: 'Company Name',
      contact1: 'Contact Number 01',
      contact2: 'Contact Number 02',
      latitude: 'Latitude',
      longitude: 'Longitude',
      email: 'Email',
      country: 'Country',
      province: 'Province',
      district: 'District',
      city: 'City',
      regCode: 'Reg Code',
    };
    return labels[fieldName] || fieldName;
  }
blockNumbers(value: string): string {
  return value.replace(/[0-9]/g, ''); // remove all numbers
}
  // Input handling methods
onInputChange(event: any, fieldType: string) {
  const target = event.target as HTMLInputElement;
  let value = target.value;
  let shouldUpdate = true;

  switch (fieldType) {
    case 'text':
      if (value.trim() === '' && value.length > 0) {
        target.value = '';
        shouldUpdate = false;
      } else {
        value = value.trimStart();


        // ✅ Capitalize first letter for centre name
        if (target.getAttribute('formControlName') === 'name' && value.length > 0) {
          value = value.charAt(0).toUpperCase() + value.slice(1);
        }
      }
      break;

    case 'email':
      // Trim leading spaces for email
      value = value.trimStart();
      break;

    case 'phone':
      const originalValue = value;
      value = value.replace(/[^0-9]/g, '');
      if (originalValue !== value) {
        target.value = value;
      }
      if (value === '' && originalValue.length > 0 && !/[0-9]/.test(originalValue)) {
        shouldUpdate = false;
      }
      break;

    case 'coordinates':
      const coordOriginalValue = value;
      value = value.replace(/[^0-9.-]/g, '');
      if (coordOriginalValue !== value) {
        target.value = value;
      }
      if (value === '' && coordOriginalValue.length > 0 && !/[0-9.-]/.test(coordOriginalValue)) {
        shouldUpdate = false;
      }
      break;
  }

  if (shouldUpdate && target.value !== value) {
    target.value = value;
  }
}

  onCityChange() {
    // Update reg code when city changes
    this.updateRegCode();
  }

  // Centre name formatting
  private formatCentreName(value: string): string {
    if (!value) return value;
    const trimmed = value.trim();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  }

  onCentreNameBlur() {
    const nameControl = this.distributionForm.get('name');
    if (nameControl?.value) {
      const formatted = this.formatCentreName(nameControl.value);
      nameControl.setValue(formatted);
    }
  }

  // Custom email validator using the service
private customEmailValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null; // Let required validator handle empty values
  }
  
  const validation = this.emailValidationService.validateEmail(control.value);
  
  if (!validation.isValid) {
    return { customEmail: validation.errorMessage };
  }
  
  return null;
}

private latitudeRangeValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  
  const numericValue = parseFloat(control.value);
  if (isNaN(numericValue)) return { numericDecimal: true };
  
  if (numericValue < -90 || numericValue > 90) {
    return { latitudeRange: true };
  }
  
  return null;
}

private longitudeRangeValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  
  const numericValue = parseFloat(control.value);
  if (isNaN(numericValue)) return { numericDecimal: true };
  
  if (numericValue < -180 || numericValue > 180) {
    return { longitudeRange: true };
  }
  
  return null;
}

private startsWithSevenValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  
  const value = control.value.toString();
  if (value.length > 0 && value.charAt(0) !== '7') {
    return { startsWithSeven: true };
  }
  
  return null;
}

onPhoneInputChange(event: any, fieldName: string) {
  const target = event.target as HTMLInputElement;
  let value = target.value;
  
  // Remove any non-digit characters
  value = value.replace(/[^0-9]/g, '');
  
  // If field is empty or starts with 7, allow the input
  if (value === '' || value.charAt(0) === '7') {
    // Limit to 9 digits max
    if (value.length > 9) {
      value = value.substring(0, 9);
    }
    target.value = value;
    
    // Update the form control
    this.distributionForm.get(fieldName)?.setValue(value);
  } else {
    // If doesn't start with 7, reset to empty or valid value
    target.value = value.startsWith('7') ? value : '';
    this.distributionForm.get(fieldName)?.setValue(value.startsWith('7') ? value : '');
  }
  
  // Trigger validation for both contact fields when either changes
  if (fieldName === 'contact1' || fieldName === 'contact2') {
    this.distributionForm.get('contact1')?.updateValueAndValidity();
    this.distributionForm.get('contact2')?.updateValueAndValidity();
  }
}

}

class CompanyList {
  companyNameEnglish!: string;
  id!: number;
}