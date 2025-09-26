import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  AsyncValidatorFn,
} from '@angular/forms';
import {
  DestributionService,
  DistributionCentreRequest,
} from '../../../services/destribution-service/destribution-service.service';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import Swal from 'sweetalert2';
import { Observable, of } from 'rxjs';
import {
  map,
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
} from 'rxjs/operators';
import { DropdownModule } from 'primeng/dropdown';
import { EmailvalidationsService } from '../../../services/email-validation/emailvalidations.service';

interface PhoneCode {
  code: string;
  dialCode: string;
  name: string;
}
@Component({
  selector: 'app-add-destribution-center',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, DropdownModule],
  templateUrl: './add-destribution-center.component.html',
  styleUrl: './add-destribution-center.component.css',
})
export class AddDestributionCenterComponent implements OnInit {
  distributionForm!: FormGroup;
  companyList: CompanyList[] = [];

  isLoading = false;
  isSubmitting = false;
  submitError: string | null = null;
  submitSuccess: string | null = null;
  isLoadingregcode = false;
  showDropdown1 = false;
  showDropdown2 = false;
  companyOptions: { label: string; value: number }[] = [];
  provinceOptions: { label: string; value: string }[] = [];
  districtOptions: { label: string; value: string }[] = [];


  private updatingDropdowns = false;

  countries: PhoneCode[] = [
    { code: 'LK', dialCode: '+94', name: 'Sri Lanka' },
    { code: 'VN', dialCode: '+84', name: 'Vietnam' },
    { code: 'KH', dialCode: '+855', name: 'Cambodia' },
    { code: 'BD', dialCode: '+880', name: 'Bangladesh' },
    { code: 'IN', dialCode: '+91', name: 'India' },
    { code: 'NL', dialCode: '+31', name: 'Netherlands' }
  ];



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
    private fb: FormBuilder,
    private distributionService: DestributionService,
    private emailValidationService: EmailvalidationsService
  ) { }

  ngOnInit() {
    this.initializeForm();
    this.fetchAllCompanies();
    this.initializeProvinceOptions();
  }

  getFlagUrl(countryCode: string): string {
    return `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`;
  }
  private initializeForm() {
  this.distributionForm = this.fb.group(
    {
      name: ['', [Validators.required, this.englishLettersOnlyValidator], [this.nameExistsValidator()]],
      company: ['', Validators.required],
      contact1: ['', [Validators.required, this.mobileNumberValidator]], // Updated validator
      contact1Code: ['+94', Validators.required], // Fixed property name
      contact2: ['', [this.mobileNumberValidator]], // Updated validator - optional field
      contact2Code: ['+94'], // Fixed property name
      latitude: [
        '',
        [
          Validators.required,
          this.latitudeRangeValidator
        ],
      ],
      longitude: [
        '',
        [
          Validators.required,
          this.longitudeRangeValidator
        ],
      ],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/), this.customEmailValidator.bind(this)]],
      country: [{ value: 'Sri Lanka', disabled: true }, Validators.required],
      province: ['', Validators.required],
      district: ['', Validators.required],
      city: ['', Validators.required],
      regCode: ['', Validators.required],
    },
    { validators: [this.contactNumbersMatchValidator] } // Updated to use validators array
  );

  // Watch province changes to update districts
  this.distributionForm
    .get('province')
    ?.valueChanges.subscribe((province) => {
      if (!this.updatingDropdowns && province) {
        this.updatingDropdowns = true;
        this.distributionForm.get('district')?.setValue('');
        this.updatingDropdowns = false;
      }
    });

  // Watch district changes to update province
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

  // Watch contact number changes to validate duplicates
  this.distributionForm.get('contact1')?.valueChanges.subscribe(() => {
    this.distributionForm.updateValueAndValidity();
  });

  this.distributionForm.get('contact1Code')?.valueChanges.subscribe(() => {
    this.distributionForm.updateValueAndValidity();
  });

  this.distributionForm.get('contact2')?.valueChanges.subscribe(() => {
    this.distributionForm.updateValueAndValidity();
  });

  this.distributionForm.get('contact2Code')?.valueChanges.subscribe(() => {
    this.distributionForm.updateValueAndValidity();
  });

  // Optimize name validation with debounce
  this.distributionForm
    .get('name')
    ?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((value) => {
        if (value && value.length >= 3) {
          return this.distributionService.checkDistributionCentreNameExists(
            value
          );
        }
        return of({ exists: false });
      })
    )
    .subscribe();
}

isValidGmail(email: string): boolean {
  if (!email) return false;

  // Strict Gmail validation: any valid username, but domain must be exactly @gmail.com
  const pattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  return pattern.test(email);
}

private mobileNumberValidator(control: AbstractControl): { [key: string]: any } | null {
  if (!control.value) {
    return null; // Let required validator handle empty values for required fields
  }
  
  const value = control.value.toString().trim();
  
  // Check if it's exactly 9 digits
  if (!/^\d{9}$/.test(value)) {
    return { invalidMobileFormat: true };
  }
  
  // Check if it starts with 7
  if (!value.startsWith('7')) {
    return { mustStartWith7: true };
  }
  
  return null;
}

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


  private nameExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value || control.value.length < 3) {
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

  private contactNumbersMatchValidator(formGroup: AbstractControl): { [key: string]: any } | null {
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

  // Only validate if both numbers are provided
  if (contact1 && contact2 && contact1.trim() !== '' && contact2.trim() !== '') {
    // Check if both number and country code are the same
    if (contact1 === contact2 && contact1Code === contact2Code) {
      // Set error on contact2 field specifically
      if (contact2Control.errors) {
        contact2Control.errors['duplicateContactNumbers'] = true;
      } else {
        contact2Control.setErrors({ duplicateContactNumbers: true });
      }
      return { duplicateContactNumbers: true };
    } else {
      // Clear the duplicate error if numbers are different
      if (contact2Control.errors?.['duplicateContactNumbers']) {
        delete contact2Control.errors['duplicateContactNumbers'];
        if (Object.keys(contact2Control.errors).length === 0) {
          contact2Control.setErrors(null);
        }
      }
    }
  }
  
  return null;
}



  private findProvinceByDistrict(district: string): string | null {
    for (const province in this.districtsMap) {
      if (this.districtsMap[province].includes(district)) {
        return province;
      }
    }
    return null;
  }

  getDistricts(): string[] {
    const selectedProvince = this.distributionForm.get('province')?.value;
    if (selectedProvince) {
      return (this.districtsMap[selectedProvince] || []).sort();
    } else {
      return Object.values(this.districtsMap).flat().sort();
    }
  }

  onKeyDown(event: KeyboardEvent, fieldType: string) {
  // Prevent space bar for coordinate fields
  if (fieldType === 'coordinates' && event.key === ' ') {
    event.preventDefault();
  }
  
  // You can add other key restrictions here if needed
}

  isFieldInvalid(fieldName: string): boolean {
    const field = this.distributionForm.get(fieldName);
    if (!field) return false;

    // Show validation errors if field is touched/dirty and invalid
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
  const field = this.distributionForm.get(fieldName);

  if (!field?.errors) return '';

  if (field.errors['required']) {
    return `${this.getFieldLabel(fieldName)} is required`;
  }
  if (field.errors['email'] || field.errors['customEmail']) {
    return field.errors['customEmail'] || 'Please enter a valid email';
  }
  if (field.errors['invalidMobileFormat']) {
    return 'Please enter a valid contact number (format: +947XXXXXXXX)';
  }
  if (field.errors['mustStartWith7']) {
    return 'Contact number must start with 7 (format: +947XXXXXXXX)';
  }
  if (field.errors['duplicateContactNumbers']) {
    return 'Contact Number - 1 and Contact Number - 2 cannot be the same';
  }
  if (field.errors['pattern']) {
    if (fieldName.includes('contact')) {
      return 'Please enter a valid contact number (format: +947XXXXXXXX)';
    }
  }
  if (field.errors['numericDecimal']) {
    return `${this.getFieldLabel(fieldName)} must be a valid number (e.g., 6.9271 or -79.8612)`;
  }
  if (field.errors['sameContactNumbers']) {
    return 'Contact Number - 1 and Contact Number - 2 cannot be the same';
  }
  if (field.errors['nameExists']) {
    return 'Distribution Centre Name already exists';
  }
  if (field.errors['latitudeRange']) {
    return 'Latitude must be between -90 and 90';
  }
  if (field.errors['longitudeRange']) {
    return 'Longitude must be between -180 and 180';
  }

  return '';
}

onInputChangeCor(event: Event, field: string): void {
  const target = event.target as HTMLInputElement;
  const raw = target.value;

  if (field === 'coordinates') {
    // 1) remove invalid chars (allow digits, dot and minus)
    let sanitized = raw.replace(/[^0-9.-]/g, '');

    // 2) preserve a leading minus if the user typed it
    const hadLeadingMinus = /^-/.test(raw);
    sanitized = sanitized.replace(/-/g, ''); // remove all minus signs
    if (hadLeadingMinus) {
      sanitized = '-' + sanitized;
    }

    // 3) keep only the first dot
    const parts = sanitized.split('.');
    if (parts.length > 1) {
      sanitized = parts.shift() + '.' + parts.join('');
    }

    // 4) update only if changed (and also notify Angular/ngModel)
    if (sanitized !== raw) {
      target.value = sanitized;
      target.dispatchEvent(new Event('input')); // ensures [(ngModel)] updates
    }
  }
}

/**
 * Run final validation on blur: if there are no digits at all, clear the field.
 */
onInputBlurCor(event: Event, field: string): void {
  const target = event.target as HTMLInputElement;
  let value = target.value;

  if (field === 'coordinates') {
    // If there are no digits anywhere, reset to empty
    if (!/\d/.test(value)) {
      value = '';
    } else {
      // Optional cleanup: remove trailing dot
      if (value.endsWith('.')) {
        value = value.slice(0, -1);
      }
      // If final value ends up as just "-" (no digits), clear it
      if (value === '-') {
        value = '';
      }
    }

    if (target.value !== value) {
      target.value = value;
      target.dispatchEvent(new Event('input'));
    }
  }
}


  onInputChange(event: any, fieldType: string) {
  const target = event.target as HTMLInputElement;
  let value = target.value;
  let shouldUpdate = true;

  switch (fieldType) {
    case 'text':
      // For text fields, prevent leading spaces
      if (value.length > 0 && value.startsWith(' ')) {
        value = value.trimStart();
        target.value = value;
      }
      break;
    case 'email':
      // For email fields, trim leading spaces
      if (value.length > 0 && value.startsWith(' ')) {
        value = value.trimStart();
        target.value = value;
      }
      break;
    case 'centreName':
      // For centre name, prevent leading spaces and ensure first letter is capital
      if (value.length > 0 && value.startsWith(' ')) {
        value = value.trimStart();
        target.value = value;
      }
      // Capitalize first letter in real-time
      if (value.length > 0) {
        const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
        if (capitalizedValue !== value) {
          target.value = capitalizedValue;
          value = capitalizedValue;
        }
      }
      break;

      case 'city':
      // For city field, prevent leading spaces and ensure first letter is capital
      if (value.length > 0 && value.startsWith(' ')) {
        value = value.trimStart();
        target.value = value;
      }
      // Capitalize first letter in real-time
      if (value.length > 0) {
        const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
        if (capitalizedValue !== value) {
          target.value = capitalizedValue;
          value = capitalizedValue;
        }
      }
      break;
    case 'phone':
      // For phone numbers, allow only digits and enforce starting with 7
      const originalValue = value;
      value = value.replace(/[^0-9]/g, '');
      
      // Limit to 9 digits max
      if (value.length > 9) {
        value = value.substring(0, 9);
      }
      
      // If user tries to enter something other than 7 as first digit, reset to 7
      if (value.length > 0 && !value.startsWith('7')) {
        // If they're typing the first digit and it's not 7, replace with 7
        if (value.length === 1) {
          value = '7';
        } else {
          // If they're editing and first digit is not 7, keep only digits starting from position 1
          // but ensure first digit is 7
          value = '7' + value.substring(1);
        }
      }
      
      if (originalValue !== value) {
        target.value = value;
      }
      break;
    case 'coordinates':
      // For latitude/longitude, allow numbers, dots, and minus signs
      const coordOriginalValue = value;
      value = value.replace(/[^0-9.-]/g, '');
      if (coordOriginalValue !== value) {
        target.value = value;
      }
      break;
  }

  // Mark field as touched to trigger validation display
  const fieldName = target.getAttribute('formControlName');
  if (fieldName) {
    const formControl = this.distributionForm.get(fieldName);
    if (formControl) {
      formControl.markAsTouched();
      // Trigger validation for contact number fields to check for duplicates
      if (fieldName.includes('contact')) {
        setTimeout(() => {
          this.distributionForm.updateValueAndValidity();
        }, 0);
      }
    }
  }

  // Update reg code in real-time when city changes
  if (fieldName === 'city') {
    setTimeout(() => this.updateRegCode(), 0);
  }
}





  // Updated updateRegCode method to handle real-time updates
  // Updated updateRegCode method to handle real-time updates and prepend "D"
updateRegCode() {
  const province = this.distributionForm.get('province')?.value;
  const district = this.distributionForm.get('district')?.value;
  const city = this.distributionForm.get('city')?.value;

  if (province && district && city && city.trim().length > 0) {
    // Use API call for reg code generation if available
    this.isLoadingregcode = true;
    this.distributionService
      .generateRegCode(province, district, city.trim())
      .subscribe({
        next: (response) => {
          // Prepend "D" to the reg code from API
          this.distributionForm.patchValue({ regCode: `D-${response.regCode}` });
          this.isLoadingregcode = false;
        },
        error: (error) => {
          // Fallback to local generation if API fails - prepend "D"
          const regCode = `D${province.slice(0, 2).toUpperCase()}${district
            .slice(0, 1)
            .toUpperCase()}${city.trim().slice(0, 1).toUpperCase()}`;
          this.distributionForm.patchValue({ regCode });
          this.isLoadingregcode = false;
        }
      });
  } else {
    // Clear reg code if required fields are empty
    this.distributionForm.patchValue({ regCode: '' });
  }
}

  // Updated onProvinceChange method
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

    // Update reg code in real-time
    this.updateRegCode();
  }

  // Updated onDistrictChange method
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
    // Update reg code in real-time
    this.updateRegCode();
  }

  // Add method to capitalize first letter and trim spaces
  private formatCentreName(value: string): string {
    if (!value) return value;
    const trimmed = value.trim();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  }

  // Add onBlur method for centre name formatting
  onCentreNameBlur() {
    const nameControl = this.distributionForm.get('name');
    if (nameControl?.value) {
      const formatted = this.formatCentreName(nameControl.value);
      nameControl.setValue(formatted);
    }
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

  fetchAllCompanies() {
   this.distributionService.getAllCompanies().subscribe(
  (res) => {
    console.log('Raw API data:', res.data); // Check if 15 companies are here
    this.companyList = res.data;
    this.companyOptions = this.companyList.map(company => ({
      label: company.companyNameEnglish,
      value: company.id
    }));
    console.log('Dropdown options:', this.companyOptions); // Verify all 15 appear
  },
  (error) => console.error('Error fetching companies:', error)
);

  }

  // Add method to initialize province options
  initializeProvinceOptions() {
    this.provinceOptions = this.provinces.map(province => ({
      label: province,
      value: province
    }));
  }

  onSubmit() {
  // Mark all fields as touched to show validation messages
  Object.keys(this.distributionForm.controls).forEach((key) => {
    this.distributionForm.get(key)?.markAsTouched();
  });

  // Collect all validation errors
  const missingFields: string[] = [];
  const formControls = this.distributionForm.controls;

  // Check each form control for validation errors
  Object.keys(formControls).forEach((key) => {
    const control = formControls[key];
    
    if (control.errors && control.touched) {
      // Customize error messages based on field name and error type
      if (key === 'name' && control.errors['required']) {
        missingFields.push('Distribution Centre Name is Required');
      } else if (key === 'regCode' && control.errors['required']) {
        missingFields.push('Registration Code is Required');
      } else if (key === 'company' && control.errors['required']) {
        missingFields.push('Company is Required');
      } else if (key === 'email') {
        if (control.errors['required']) {
          missingFields.push('Email Address is Required');
        } else if (control.errors['pattern']) {
          missingFields.push('Email Address - Please enter a valid email');
        }
      } else if (key === 'contact1' && control.errors['required']) {
        missingFields.push('Contact Number is Required');
      } else if (key === 'contact1' && this.getFieldError("contact1") === 'Please enter a valid contact number (format: +947XXXXXXXX)') {
        missingFields.push('Contact Number -1 - Must be a valid phone number format');
      } else if (key === 'contact2' && this.getFieldError("contact2") === 'Please enter a valid contact number (format: +947XXXXXXXX)' ) {
        missingFields.push('Contact Number -2 - Must be a valid phone number format');
    } else if (key === 'contact2' && this.getFieldError("contact2") === 'Contact Number - 1 and Contact Number - 2 cannot be the same' ) {
      missingFields.push('Contact Number - 1 and Contact Number - 2 cannot be the same');
    } else if (key === 'latitude' && control.errors['required']) {
        missingFields.push('Latitude is Required');
      } else if (key === 'latitude' && this.getFieldError("latitude") === 'Latitude must be between -90 and 90') {
        missingFields.push('Latitude - Must be be between -90 and 90');
      } else if (key === 'longitude' && control.errors['required']) {
        missingFields.push('Longitude is Required');
      } else if (key === 'longitude' && this.getFieldError("longitude") === 'Longitude must be between -180 and 180') {
        missingFields.push('Longitude - Must be between -180 and 180');
      } else if (key === 'address' && control.errors['required']) {
        missingFields.push('Address is Required');
      } else if (key === 'city' && control.errors['required']) {
        missingFields.push('City is Required');
      } else if (key === 'district' && control.errors['required']) {
        missingFields.push('District is Required');
      } else if (key === 'province' && control.errors['required']) {
        missingFields.push('Province is Required');
      } else if (control.errors['required']) {
        // Generic required field message for other fields
        const fieldName = this.formatFieldName(key);
        missingFields.push(fieldName);

        console.log('missingFields', missingFields);
      }
    }
  });

  // If there are validation errors, show them and stop the submission
  if (missingFields.length > 0) {
    let errorMessage = '<div class="text-left"><p class="mb-2">Please fix the following issues:</p><ul class="list-disc pl-5">';
    missingFields.forEach((field) => {
      errorMessage += `<li>${field}</li>`;
    });
    errorMessage += '</ul></div>';

    Swal.fire({
      icon: 'error',
      title: 'Missing or Invalid Information',
      html: errorMessage,
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg'
      },
    });
    return;
  }

  // If form is valid, proceed with confirmation
  if (this.distributionForm.valid) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to create this distribution centre?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Create it!',
      cancelButtonText: 'No, Cancel',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',

      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.submitError = null;
        this.submitSuccess = null;

        // Get form values including disabled fields
        const formValue = this.distributionForm.getRawValue();

        const formData: DistributionCentreRequest = {
          ...formValue,
          latitude: parseFloat(formValue.latitude).toString(),
          longitude: parseFloat(formValue.longitude).toString(),
        };

        this.distributionService
          .createDistributionCentre(formData)
          .subscribe({
            next: (response) => {
              this.isLoading = false;

              if (response.success) {
                this.submitSuccess =
                  response.message ||
                  'Distribution Centre created successfully!';
                Swal.fire({
                  icon: 'success',
                  title: 'Success!',
                  text: this.submitSuccess,
                  timer: 2000,
                  showConfirmButton: false,
                  customClass: {
                    popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                    title: 'font-semibold text-lg',

                  },
                });
                this.navigatePath('/distribution-hub/action/view-destribition-center');
              } else {
                this.submitError =
                  response.error || 'Failed to create distribution centre';
                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: this.submitError,
                  customClass: {
                    popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                    title: 'font-semibold text-lg',

                  },
                });
              }
            },
            error: (error) => {
              this.isLoading = false;
              console.error('Error creating distribution centre:', error);

              // Default error message
              let errorMessage = 'An unexpected error occurred.';

              if (error.error && error.error.error) {
                // Use the specific error message from the backend
                errorMessage = error.error.error;
              } else if (error.status === 400) {
                errorMessage = 'Invalid data. Please check your inputs.';
              } else if (error.status === 401) {
                errorMessage = 'Unauthorized. Please log in again.';
              } else if (error.status === 409) {
                // Check if we have more specific conflict information
                if (error.error && error.error.conflictingRecord) {
                  const conflict = error.error.conflictingRecord;
                  switch (conflict.conflictType) {
                    case 'name':
                      errorMessage = 'A distribution center with this name already exists.';
                      break;
                    case 'regCode':
                      errorMessage = 'A distribution center with this registration code already exists.';
                      break;
                    case 'email':
                      errorMessage = 'Email already exists.';
                      break;
                    case 'contact1':
                      errorMessage = 'Contact Number already exists.';
                      break;
                    default:
                      errorMessage = 'A distribution center with these details already exists.';
                  }
                } else {
                  errorMessage = 'A distribution center with these details already exists.';
                }
              } else if (error.status === 500) {
                errorMessage = 'Server error. Please try again later.';
              }

              this.submitError = errorMessage;

              Swal.fire({
                icon: 'error',
                title: 'Submission Failed',
                text: this.submitError,
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold text-lg',

                },
              });
            },
          });
      }
    });
  }
}

// Helper function to format field names for display
formatFieldName(key: string): string {
  // Convert camelCase to Title Case with spaces
  const result = key.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

private formatErrorMessagesForAlert(errors: {field: string, message: string}[]): string {
  if (errors.length === 0) {
    return 'Please correct the errors in the form before submitting.';
  }
  
  let html = '<div class="text-left"><p class="mb-3">Please correct the following errors:</p><ul class="list-disc pl-5">';
  
  errors.forEach(error => {
    html += `<li class="mb-1"><span class="font-semibold">${error.field}:</span> ${error.message}</li>`;
  });
  
  html += '</ul></div>';
  
  return html;
}

private getAllValidationErrors(): {field: string, message: string}[] {
  const errors: {field: string, message: string}[] = [];
  
  Object.keys(this.distributionForm.controls).forEach((key) => {
    const control = this.distributionForm.get(key);
    if (control && control.invalid && (control.dirty || control.touched)) {
      const errorMessage = this.getFieldError(key);
      if (errorMessage) {
        errors.push({
          field: this.getFieldLabel(key),
          message: errorMessage
        });
      }
    }
  });
  
  return errors;
}

  clearMessages() {
    this.submitError = null;
    this.submitSuccess = null;
  }

onCancel() {
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
      window.history.back();
    }
  });
}


 

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
      this.router.navigate(['/distribution-hub/action/view-destribition-center']);
    }
  });
}


  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  private customEmailValidator(control: AbstractControl): { [key: string]: any } | null {
  if (!control.value || control.value.trim() === '') {
    return null; // Let required validator handle empty values
  }
  
  const validation = this.emailValidationService.validateEmail(control.value);
  return validation.isValid ? null : { customEmail: validation.errorMessage };
}

private latitudeRangeValidator(control: AbstractControl) {
  if (!control.value) return null;
  
  const numericDecimal = /^-?\d+(\.\d+)?$/;
  if (!numericDecimal.test(control.value)) {
    return { numericDecimal: true };
  }
  
  const value = parseFloat(control.value);
  if (value < -90 || value > 90) {
    return { latitudeRange: true };
  }
  
  return null;
}

private longitudeRangeValidator(control: AbstractControl) {
  if (!control.value) return null;
  
  const numericDecimal = /^-?\d+(\.\d+)?$/;
  if (!numericDecimal.test(control.value)) {
    return { numericDecimal: true };
  }
  
  const value = parseFloat(control.value);
  if (value < -180 || value > 180) {
    return { longitudeRange: true };
  }
  
  return null;
}


}

class CompanyList {
  companyNameEnglish!: string;
  id!: number;
}
