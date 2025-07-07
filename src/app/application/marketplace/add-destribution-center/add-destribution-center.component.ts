import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  DestributionService,
  DistributionCentreRequest,
} from '../../../services/destribution-service/destribution-service.service';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import Swal from 'sweetalert2';

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

  // Flag to prevent infinite loops when programmatically setting values
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
  ) { }

  ngOnInit() {
    this.initializeForm();
    this.fetchAllCompanies();
  }

  private initializeForm() {
    this.distributionForm = this.fb.group({
      name: ['', Validators.required],
      company: ['', Validators.required],
      officerInCharge: [
        '',
        [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)],
      ],
      contact1: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      contact1Code: ['+94', Validators.required],
      contact2: ['', [Validators.pattern(/^\d{9}$/)]],
      contact2Code: ['+94', Validators.required],
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
    });

    // Watch province changes to update districts
    this.distributionForm
      .get('province')
      ?.valueChanges.subscribe((province) => {
        if (!this.updatingDropdowns && province) {
          // Clear district when province changes
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
          // Find which province this district belongs to
          const matchingProvince = this.findProvinceByDistrict(district);
          if (matchingProvince) {
            this.updatingDropdowns = true;
            this.distributionForm.get('province')?.setValue(matchingProvince);
            this.updatingDropdowns = false;
          }
        }
      });
  }

  // Helper method to find province by district
  private findProvinceByDistrict(district: string): string | null {
    for (const province in this.districtsMap) {
      if (this.districtsMap[province].includes(district)) {
        return province;
      }
    }
    return null;
  }

  // Get all districts initially, then filter by province if one is selected
  getDistricts(): string[] {
    const selectedProvince = this.distributionForm.get('province')?.value;
    if (selectedProvince) {
      return this.districtsMap[selectedProvince] || [];
    } else {
      // Return all districts when no province is selected
      return Object.values(this.districtsMap).flat();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.distributionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.distributionForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required'])
        return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['pattern']) {
        if (fieldName.includes('contact'))
          return 'Phone number must be exactly 9 digits';
        if (fieldName === 'latitude')
          return 'Please enter a valid latitude (-90 to 90)';
        if (fieldName === 'longitude')
          return 'Please enter a valid longitude (-180 to 180)';
        if (fieldName === 'officerInCharge') return 'Only letters are allowed';
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Distribution Centre Name',
      company: 'Company Name',
      officerInCharge: 'Officer In-Charge Name',
      contact1: 'Contact Number 01',
      contact2: 'Contact Number 02',
      latitude: 'Latitude',
      longitude: 'Longitude',
      email: 'Email',
      country: 'Country',
      province: 'Province',
      district: 'District',
      city: 'City',
    };
    return labels[fieldName] || fieldName;
  }

  fetchAllCompanies() {
    this.distributionService.getAllCompanies().subscribe(
      (res) => {
        console.log('this is company', res);
        this.companyList = res.data;
        console.log(this.companyList);
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

                // Handle specific HTTP status errors
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
