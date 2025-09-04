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
      contact1: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      contact1Code: ['+94', Validators.required],
      contact2: ['', [Validators.pattern(/^\d{9}$/)]],
      contact2Code: ['+94'],
      latitude: [
        '',
        [
          Validators.required,
          this.latitudeRangeValidator // New range validator
        ],
      ],
      longitude: [
        '',
        [
          Validators.required,
          this.longitudeRangeValidator // New range validator
        ],
      ],
      email: ['', [Validators.required, this.customEmailValidator.bind(this)]],
      country: [{ value: 'Sri Lanka', disabled: true }, Validators.required],
      province: ['', Validators.required],
      district: ['', Validators.required],
      city: ['', Validators.required],
      regCode: ['', Validators.required],
    },
    { validator: this.contactNumbersMatchValidator }
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

  private contactNumbersMatchValidator(formGroup: FormGroup) {
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

    if (
      contact1 &&
      contact2 &&
      contact1 === contact2 &&
      contact1Code === contact2Code
    ) {
      contact2Control.setErrors({ sameContactNumbers: true });
      return { sameContactNumbers: true };
    } else {
      if (contact2Control.errors?.['sameContactNumbers']) {
        delete contact2Control.errors['sameContactNumbers'];
        if (Object.keys(contact2Control.errors).length === 0) {
          contact2Control.setErrors(null);
        }
      }
      return null;
    }
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
  if (field.errors['pattern']) {
    if (fieldName.includes('contact')) {
      return 'Please enter a valid mobile number (format: +947XXXXXXXX)';
    }
  }
  if (field.errors['numericDecimal']) {
    return `${this.getFieldLabel(fieldName)} must be a valid number (e.g., 6.9271 or -79.8612)`;
  }
  // if (field.errors['englishLettersOnly']) {
  //   return 'Centre Name should contain only English letters and spaces';
  // }
  if (field.errors['sameContactNumbers']) {
    return 'Contact Number 02 must be different from Contact Number 01';
  }
  if (field.errors['nameExists']) {
    return 'Distribution Centre Name already exists';
  }
  // Add the new validation errors
  if (field.errors['latitudeRange']) {
    return 'Latitude must be between -90 and 90';
  }
  if (field.errors['longitudeRange']) {
    return 'Longitude must be between -180 and 180';
  }

  return '';
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
      case 'phone':
        // For phone numbers, allow only digits
        const originalValue = value;
        value = value.replace(/[^0-9]/g, '');
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
      this.distributionForm.get(fieldName)?.markAsTouched();
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
          this.distributionForm.patchValue({ regCode: `D${response.regCode}` });
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
  if (this.distributionForm.valid) {
    // ... existing code for valid form submission ...
  } else {
    // Mark all fields as touched to trigger validation display
    Object.keys(this.distributionForm.controls).forEach((key) => {
      this.distributionForm.get(key)?.markAsTouched();
    });
    
    // Collect all validation errors
    const errorMessages = this.getAllValidationErrors();
    
    Swal.fire({
      icon: 'warning',
      title: 'Form Validation Errors',
      html: this.formatErrorMessagesForAlert(errorMessages),
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    });
  }
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
    text: 'All entered data will be lost!',
    showCancelButton: true,
    confirmButtonText: 'Yes, Reset',
    cancelButtonText: 'No, Keep Editing',
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
    },
  }).then((result) => {
    if (result.isConfirmed) {
      this.distributionForm.reset({
        contact1Code: '+94',
        contact2Code: '+94',
      });
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
