import { Component, OnInit } from '@angular/core';
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

interface PhoneCode {
  value: string;
  label: string;
}

@Component({
  selector: 'app-add-destribution-center',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
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

  private updatingDropdowns = false;

  phoneCodes: PhoneCode[] = [
    { value: '+94', label: '+94 (SL)' },
    { value: '+91', label: '+91 (India)' },
    { value: '+1', label: '+1 (USA)' },
    { value: '+44', label: '+44 (UK)' },
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
    private distributionService: DestributionService
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.fetchAllCompanies();
  }

  private initializeForm() {
    this.distributionForm = this.fb.group(
      {
        name: ['', [Validators.required], [this.nameExistsValidator()]],
        company: ['', Validators.required],
        contact1: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
        contact1Code: ['+94', Validators.required],
        contact2: ['', [Validators.pattern(/^\d{9}$/)]],
        contact2Code: ['+94'],
        latitude: [
          '',
          [
            Validators.required,
            Validators.pattern(/^-?([0-8]?[0-9]|90)(\.[0-9]+)?$/),
          ],
        ],
        longitude: [
          '',
          [
            Validators.required,
            Validators.pattern(/^-?((1[0-7][0-9])|([0-9]?[0-9]))(\.[0-9]+)?$/),
          ],
        ],
        email: ['', [Validators.required, Validators.email]],
        country: ['', Validators.required],
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

  onProvinceChange() {
    const selectedProvince = this.distributionForm.get('province')?.value;
    const selectedDistrict = this.distributionForm.get('district')?.value;
    const selectedCity = this.distributionForm.get('city')?.value;

    this.updateRegCode();

    if (selectedProvince && selectedDistrict && selectedCity) {
      this.isLoadingregcode = true;
      this.distributionService
        .generateRegCode(selectedProvince, selectedDistrict, selectedCity)
        .subscribe((response) => {
          this.distributionForm.patchValue({ regCode: response.regCode });
          this.isLoadingregcode = false;
        });
    }
  }

  updateRegCode() {
    const province = this.distributionForm.get('province')?.value;
    const district = this.distributionForm.get('district')?.value;
    const city = this.distributionForm.get('city')?.value;

    if (province && district && city) {
      const regCode = `${province.slice(0, 2).toUpperCase()}${district
        .slice(0, 1)
        .toUpperCase()}${city.slice(0, 1).toUpperCase()}`;
      this.distributionForm.patchValue({ regCode });
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
      return this.districtsMap[selectedProvince] || [];
    } else {
      return Object.values(this.districtsMap).flat();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.distributionForm.get(fieldName);
    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched || this.distributionForm.dirty)
    );
  }

  getFieldError(fieldName: string): string {
    const field = this.distributionForm.get(fieldName);

    if (!field?.errors) return '';

    if (field.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field.errors['email']) {
      return 'Please enter a valid email address';
    }
    if (field.errors['pattern']) {
      if (fieldName.includes('contact')) {
        return 'Phone number must be exactly 9 digits';
      }
      if (fieldName === 'latitude') {
        return 'Please enter a valid latitude (-90 to 90)';
      }
      if (fieldName === 'longitude') {
        return 'Please enter a valid longitude (-180 to 180)';
      }
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

  fetchAllCompanies() {
    this.distributionService.getAllCompanies().subscribe(
      (res) => {
        this.companyList = res.data;
      },
      (error) => console.error('Error fetching companies:', error)
    );
  }

  onSubmit() {
    if (this.distributionForm.valid) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to create this distribution centre?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Create it!',
        cancelButtonText: 'No, Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          this.isLoading = true;
          this.submitError = null;
          this.submitSuccess = null;

          const formData: DistributionCentreRequest = {
            ...this.distributionForm.value,
            latitude: parseFloat(
              this.distributionForm.value.latitude
            ).toString(),
            longitude: parseFloat(
              this.distributionForm.value.longitude
            ).toString(),
          };

          this.distributionService
            .createDistributionCentre(formData)
            .subscribe({
              next: (response) => {
                this.isLoading = false;

                if (response.success) {
                  this.submitSuccess =
                    response.message ||
                    'Distribution centre created successfully!';
                  Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: this.submitSuccess,
                    timer: 2000,
                    showConfirmButton: false,
                  });
                  this.navigatePath('/distribution-hub/action');
                } else {
                  this.submitError =
                    response.error || 'Failed to create distribution centre';
                  Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: this.submitError,
                  });
                }
              },
              error: (error) => {
                this.isLoading = false;
                console.error('Error creating distribution centre:', error);

                if (error.status === 400) {
                  this.submitError = 'Invalid data. Please check your inputs.';
                } else if (error.status === 401) {
                  this.submitError = 'Unauthorized. Please log in again.';
                } else if (error.status === 409) {
                  this.submitError =
                    'A distribution center with this name already exists.';
                } else if (error.status === 500) {
                  this.submitError = 'Server error. Please try again later.';
                } else {
                  this.submitError =
                    error.error?.message || 'An unexpected error occurred.';
                }

                Swal.fire({
                  icon: 'error',
                  title: 'Submission Failed',
                  text: this.submitError || 'An unexpected error occurred.',
                });
              },
            });
        }
      });
    } else {
      Object.keys(this.distributionForm.controls).forEach((key) => {
        this.distributionForm.get(key)?.markAsTouched();
      });
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Form',
        text: 'Please correct the errors in the form before submitting.',
      });
    }
  }

  clearMessages() {
    this.submitError = null;
    this.submitSuccess = null;
  }

  onCancel() {
    this.distributionForm.reset({
      contact1Code: '+94',
      contact2Code: '+94',
    });
  }

  back(): void {
    this.router.navigate(['/distribution-hub/action/view-destribition-center']);
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }
}

class CompanyList {
  companyNameEnglish!: string;
  id!: number;
}
