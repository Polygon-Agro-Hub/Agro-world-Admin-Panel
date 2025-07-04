import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DestributionService } from '../../../services/destribution-service/destribution-service.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

interface PhoneCode {
  value: string;
  label: string;
}

interface DistributionCenter {
  id: number;
  centerName: string;
  officerName: string;
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
  company?: string; // Changed from companyId to string to match API
  companyId?: number; // Keep this if you still need it elsewhere
}
@Component({
  selector: 'app-edit-distribution-centre',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
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

  companyOptions: any[] = [];

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
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private distributionService: DestributionService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.fetchAllCompanies();
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.fetchDistributionCenterById(id);
    }
  }

  initializeForm(): void {
    this.distributionForm = this.fb.group({
      name: ['', Validators.required],
      company: ['', Validators.required],
      officerInCharge: ['', Validators.required],
      contact1Code: ['+94', Validators.required],
      contact1: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
      contact2Code: ['+94', Validators.required],
      contact2: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
      latitude: [
        '',
        [Validators.required, Validators.pattern(/^-?\d+\.?\d*$/)],
      ],
      longitude: [
        '',
        [Validators.required, Validators.pattern(/^-?\d+\.?\d*$/)],
      ],
      email: ['', [Validators.required, Validators.email]],
      country: ['Sri Lanka', Validators.required],
      province: ['', Validators.required],
      district: ['', Validators.required],
      city: ['', Validators.required],
    });
    // No form.disable() here
  }

  back(): void {
    this.router.navigate(['/distribution-hub/action/view-destribition-center']);
  }

  fetchAllCompanies() {
    this.distributionService.getAllCompanies().subscribe(
      (res) => {
        // Make sure the response contains id and companyNameEnglish
        this.companyList = res.data.map((company: any) => ({
          id: company.id,
          companyNameEnglish: company.companyNameEnglish,
        }));
        console.log('Company list loaded:', this.companyList);
      },
      (error) => {
        console.error('Error fetching companies:', error);
        this.showErrorAlert('Failed to load companies');
      }
    );
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
    const matchingCompany = this.companyList.find(
      (company) => company.companyNameEnglish === data.company
    );

    this.distributionForm.patchValue({
      name: data.centerName,
      company: matchingCompany ? matchingCompany.id : null,
      officerInCharge: data.officerName,
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
    });
    // No form.disable() here
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

  fetchCompanies(): void {
    this.isLoading = true;
    this.distributionService.getCompanies().subscribe({
      next: (response) => {
        console.log('Raw API response:', response); // Add this line
        console.log('Companies fetched:', response.data); // Check the data structure

        if (response.success && response.data) {
          this.companyOptions = response.data
            .map((company) => ({
              label: company.companyNameEnglish,
              value: company.companyNameEnglish,
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching companies:', error);
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load companies',
        });
      },
    });
  }

  onCancel() {
    this.distributionForm.reset({
      contact1Code: '+94',
      contact2Code: '+94',
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.distributionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  updateDistributionCentre() {
    if (this.distributionForm.valid) {
      // Debug: Check if companyList is loaded
      if (!this.companyList || this.companyList.length === 0) {
        this.showErrorAlert(
          'Company list not loaded. Please wait or refresh the page.'
        );
        return;
      }

      Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to update this distribution centre?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Update it!',
        cancelButtonText: 'No, Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          this.isLoading = true;

          // Get company ID and ensure it's a number
          const companyId = Number(this.distributionForm.value.company);

          // Debug logs
          console.log('Selected company ID:', companyId);
          console.log('Company list:', this.companyList);
          console.log('First company in list:', this.companyList[0]);

          // Find the selected company with type conversion
          const selectedCompany = this.companyList.find(
            (company) => Number(company.id) === companyId
          );

          if (!selectedCompany) {
            this.isLoading = false;
            console.error('Company not found. Searched ID:', companyId);
            console.error(
              'Available company IDs:',
              this.companyList.map((c) => c.id)
            );
            this.showErrorAlert(
              `Company ID ${companyId} not found. Available companies: ${this.companyList
                .map((c) => c.id)
                .join(', ')}`
            );
            return;
          }

          // Prepare the update data
          const updateData = {
            centerName: this.distributionForm.value.name,
            officerName: this.distributionForm.value.officerInCharge,
            code1: this.distributionForm.value.contact1Code,
            contact01: this.distributionForm.value.contact1,
            code2: this.distributionForm.value.contact2Code,
            contact02: this.distributionForm.value.contact2,
            city: this.distributionForm.value.city,
            district: this.distributionForm.value.district,
            province: this.distributionForm.value.province,
            country: this.distributionForm.value.country,
            longitude: parseFloat(
              this.distributionForm.value.longitude
            ).toString(),
            latitude: parseFloat(
              this.distributionForm.value.latitude
            ).toString(),
            email: this.distributionForm.value.email,
            companyId: companyId,
            companyNameEnglish: selectedCompany.companyNameEnglish,
          };

          console.log('Final update data:', updateData);

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
                  }).then(() => {
                    this.router.navigate([
                      '/distribution-hub/action/view-destribition-center',
                    ]);
                  });
                } else {
                  this.showErrorAlert(response.error || 'Update failed');
                }
              },
              error: (error) => {
                this.isLoading = false;
                console.error('Update error:', error);
                this.showErrorAlert(this.getErrorMessage(error));
              },
            });
        }
      });
    } else {
      this.markFormGroupTouched(this.distributionForm);
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Form',
        text: 'Please correct the errors in the form before submitting.',
      });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private getErrorMessage(error: any): string {
    if (error.error?.message) return error.error.message;
    if (error.status === 400) return 'Invalid data';
    if (error.status === 401) return 'Unauthorized';
    if (error.status === 404) return 'Not found';
    if (error.status === 500) return 'Server error';
    return 'An unexpected error occurred';
  }
}

class CompanyList {
  companyNameEnglish!: string;
  id!: number;
}
