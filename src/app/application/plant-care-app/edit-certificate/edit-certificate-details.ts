import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';
import { CropCalendarService } from '../../../services/plant-care/crop-calendar.service';
import {
  CertificateCompanyService,
  CertificateCompany,
} from '../../../services/plant-care/certificate-company.service';

@Component({
  selector: 'app-edit-certificate-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownModule,
    MultiSelectModule,
    LoadingSpinnerComponent,
    FormsModule,
  ],
  templateUrl: './edit-certificate-details.component.html',
  styleUrls: ['./edit-certificate-details.component.css'],
})
export class EditCertificateDetailsComponent implements OnInit {
  certificateForm!: FormGroup;
  isLoading = false;
  isInitializing = true;
  uploadedFile: File | null = null;
  uploadedLogo: File | null = null;
  logoPreview: string | ArrayBuffer | null = null;
  logoError: string = '';
  existingFileName: string = '';
  certificateId!: number;

  @ViewChild('logoInput', { static: false })
  logoInput!: ElementRef<HTMLInputElement>;

  companies: { label: string; value: number }[] = [];
  applicableOptions = [
    { label: 'For Selected Crops', value: 'For Selected Crops' },
    { label: 'For Farm', value: 'For Farm' },
    { label: 'For Farmer Cluster', value: 'For Farmer Cluster' },
  ];

  serviceAreasOptions = [
    'Ampara',
    'Anuradhapura',
    'Badulla',
    'Batticaloa',
    'Colombo',
    'Galle',
    'Gampaha',
    'Hambantota',
    'Jaffna',
    'Kalutara',
    'Kandy',
    'Kegalle',
    'Kilinochchi',
    'Kurunegala',
    'Mannar',
    'Matale',
    'Matara',
    'Monaragala',
    'Mullaitivu',
    'Nuwara Eliya',
    'Polonnaruwa',
    'Puttalam',
    'Rathnapura',
    'Trincomalee',
    'Vavuniya',
  ];

  cropDropdownOptions: { label: string; value: number }[] = [];
  selectedCrop: number | null = null;
  filteredCropOptions: { label: string; value: number }[] = [];
  selectedCrops: { id: number; cropNameEnglish: string }[] = [];

  // New properties for conditional logic
  showTargetCropsSection = false;
  isForSelectedCrops = false;

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private cropCalendarService: CropCalendarService,
    private certificateCompanyService: CertificateCompanyService
  ) { }

  ngOnInit(): void {
    this.certificateForm = this.fb.group({
      srtName: ['', Validators.required],
      srtNumber: ['', Validators.required],
      srtcomapnyId: ['', Validators.required],
      applicable: ['', Validators.required],
      accreditation: ['', Validators.required],
      serviceAreas: [[], Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      timeLine: ['', [Validators.required, Validators.min(1)]],
      commission: [
        '',
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      scope: ['', Validators.required],
      noOfVisit: ['', [Validators.required, Validators.min(0)]],
      tearmsFile: [null], // Not required for edit
    });

    // Get certificate ID from route parameters
    this.route.params.subscribe((params) => {
      this.certificateId = +params['certificateId'];
      if (this.certificateId) {
        this.loadCertificateData();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Invalid certificate ID',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        }).then(() => {
          this.router.navigate(['/plant-care/action/view-certificate-list']);
        });
      }
    });

    this.loadCropGroups();
    this.loadCompanies();
    this.certificateForm.get('applicable')?.valueChanges.subscribe((value) => {
      this.onApplicableChange();
    });
  }

  loadCertificateData(): void {
    this.isLoading = true;
    this.certificateCompanyService
      .getCertificateDetailsById(this.certificateId)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.isInitializing = false;
          if (response.status && response.data) {
            this.populateForm(response.data);
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.message || 'Certificate not found',
              customClass: {
                popup:
                  'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            }).then(() => {
              this.router.navigate([
                '/plant-care/action/view-certificate-list',
              ]);
            });
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.isInitializing = false;
          console.error('Error loading certificate:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load certificate details',
            customClass: {
              popup:
                'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          }).then(() => {
            this.router.navigate(['/plant-care/action/view-certificate-list']);
          });
        },
      });
  }

  populateForm(certificate: any): void {
    if (certificate.tearms) {
      this.existingFileName = this.extractFileName(certificate.tearms);
    }

    // Set logo preview if exists
    if (certificate.logo) {
      this.logoPreview = certificate.logo;
    }

    let serviceAreasArray: string[] = [];

    // Handle various formats gracefully
    if (Array.isArray(certificate.serviceAreas)) {
      serviceAreasArray = certificate.serviceAreas.filter(
        (s: any) => typeof s === 'string' && s.trim() !== ''
      );
    } else if (typeof certificate.serviceAreas === 'string') {
      try {
        const parsed = JSON.parse(certificate.serviceAreas);
        if (Array.isArray(parsed)) {
          serviceAreasArray = parsed.filter(
            (s: any) => typeof s === 'string' && s.trim() !== ''
          );
        } else if (parsed) {
          serviceAreasArray = [parsed.toString()];
        }
      } catch {
        serviceAreasArray = certificate.serviceAreas
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s !== '');
      }
    }

    this.certificateForm.patchValue({
      srtName: certificate.srtName || '',
      srtNumber: certificate.srtNumber || '',
      srtcomapnyId: certificate.srtcomapnyId || '',
      applicable: certificate.applicable || '',
      accreditation: certificate.accreditation || '',
      serviceAreas: serviceAreasArray,
      price: certificate.price || '',
      timeLine: certificate.timeLine || '',
      commission: certificate.commission || '',
      scope: certificate.scope || '',
      noOfVisit: certificate.noOfVisit || '',
    });

    if (
      certificate.applicable === 'For Selected Crops' &&
      certificate.cropIds
    ) {
      this.loadSelectedCrops(certificate.cropIds);
    }

    this.onApplicableChange();
  }

  // Logo file picker methods
  openLogoFilePicker(): void {
    if (this.logoInput && this.logoInput.nativeElement) {
      this.logoInput.nativeElement.click();
    } else {
      const el = document.getElementById('logo') as HTMLInputElement | null;
      if (el) el.click();
    }
  }

  onLogoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input || !input.files || input.files.length === 0) {
      this.logoError = 'Please select a valid image file.';
      this.uploadedLogo = null;
      this.logoPreview = null;
      return;
    }

    const file = input.files[0];

    // Validate file type (image only)
    if (!file.type.startsWith('image/')) {
      this.logoError =
        'Please select a valid image file (JPEG, JPG, PNG, WebP).';
      this.uploadedLogo = null;
      this.logoPreview = null;
      return;
    }

    // Check file size (5MB limit)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      this.logoError = 'Logo must be smaller than 5 MB.';
      this.uploadedLogo = null;
      this.logoPreview = null;
      return;
    }

    // All good
    this.logoError = '';
    this.uploadedLogo = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  removeLogo(): void {
    this.uploadedLogo = null;
    this.logoPreview = null;
    this.logoError = '';
    if (this.logoInput && this.logoInput.nativeElement) {
      this.logoInput.nativeElement.value = '';
    } else {
      const el = document.getElementById('logo') as HTMLInputElement | null;
      if (el) el.value = '';
    }
  }

  extractFileName(url: string): string {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1] || 'terms.pdf';
  }

  loadSelectedCrops(cropIds: number[]): void {
    if (cropIds && cropIds.length > 0) {
      const checkCropsLoaded = () => {
        if (this.cropDropdownOptions.length > 0) {
          this.selectedCrops = cropIds
            .map((id) => {
              const crop = this.cropDropdownOptions.find((c) => c.value === id);
              return {
                id: id,
                cropNameEnglish: crop ? crop.label : `Crop ${id}`,
              };
            })
            .filter((crop) => crop !== null);
        } else {
          setTimeout(checkCropsLoaded, 100);
        }
      };
      checkCropsLoaded();
    }
  }

  loadCropGroups(): void {
    this.cropCalendarService.getAllCropGroupNamesOnly().subscribe({
      next: (data) => {
        this.cropDropdownOptions = data.map((crop) => ({
          label: crop.cropNameEnglish,
          value: crop.id,
        }));

        // If we have certificate data already loaded, refresh crops
        if (this.certificateId && this.selectedCrops.length === 0) {
          this.loadCertificateData();
        }
      },
      error: (err) => {
        console.error('Error fetching crop groups:', err);
      },
    });
  }

  loadCompanies(): void {
    this.certificateCompanyService.getAllCompaniesNamesOnly().subscribe({
      next: (data) => {
        this.companies = data.map((c: CertificateCompany) => ({
          label: c.companyName,
          value: c.id || 0,
        }));
      },
      error: (err) => {
        console.error('Error fetching companies:', err);
      },
    });
  }

  onApplicableChange(): void {
    const applicable = this.certificateForm.get('applicable')?.value;

    this.isForSelectedCrops = applicable === 'For Selected Crops';
    this.showTargetCropsSection = !!applicable;

    if (!this.isForSelectedCrops) {
      this.selectedCrops = [];
    }
  }

  onFileUpload(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.uploadedFile = file;
      this.certificateForm.patchValue({ tearmsFile: file });
      this.certificateForm.get('tearmsFile')?.markAsTouched();
      this.existingFileName = '';
    } else if (file) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File',
        text: 'Please upload a PDF file only.',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });
    }
  }

  addCrop(): void {
    const selected = this.cropDropdownOptions.find(
      (c) => c.value === this.selectedCrop
    );
    if (selected && !this.selectedCrops.some((c) => c.id === selected.value)) {
      this.selectedCrops.push({
        id: selected.value,
        cropNameEnglish: selected.label,
      });
      this.selectedCrop = null;
    } else if (selected) {
      Swal.fire({
        icon: 'warning',
        title: 'Crop Already Added',
        text: 'This crop has already been selected.',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });
    }
  }

  removeCrop(index: number): void {
    this.selectedCrops.splice(index, 1);
  }

  onBack(): void {
    this.location.back();
  }

  // Enhanced crop search functionality
  onCropFilter(event: any): void {
    // PrimeNG handles the filtering automatically when filter=true
  }

  onCropSearchInput(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    if (searchTerm) {
      this.filteredCropOptions = this.cropDropdownOptions.filter((option) =>
        option.label.toLowerCase().includes(searchTerm)
      );
    } else {
      this.filteredCropOptions = [...this.cropDropdownOptions];
    }
  }

  // Get missing field names for the alert
  private getMissingFields(): string[] {
    const missingFields: string[] = [];

    if (this.certificateForm.get('srtName')?.errors?.['required']) {
      missingFields.push('Certificate Name');
    }

    if (this.certificateForm.get('srtNumber')?.errors?.['required']) {
      missingFields.push('Certificate Number');
    }

    if (this.certificateForm.get('srtcomapnyId')?.errors?.['required']) {
      missingFields.push('Company');
    }

    if (this.certificateForm.get('applicable')?.errors?.['required']) {
      missingFields.push('Applicable For');
    }

    if (this.certificateForm.get('accreditation')?.errors?.['required']) {
      missingFields.push('Accreditation');
    }

    if (this.certificateForm.get('serviceAreas')?.errors?.['required']) {
      missingFields.push('Service Areas');
    }

    if (this.certificateForm.get('price')?.errors?.['required']) {
      missingFields.push('Price');
    } else if (this.certificateForm.get('price')?.errors?.['min']) {
      missingFields.push('Price (must be greater than or equal to 0)');
    }

    if (this.certificateForm.get('timeLine')?.errors?.['required']) {
      missingFields.push('Timeline');
    } else if (this.certificateForm.get('timeLine')?.errors?.['min']) {
      missingFields.push('Timeline (must be at least 1 day)');
    }

    if (this.certificateForm.get('commission')?.errors?.['required']) {
      missingFields.push('Commission');
    } else if (this.certificateForm.get('commission')?.errors?.['min']) {
      missingFields.push('Commission (must be between 0% and 100%)');
    } else if (this.certificateForm.get('commission')?.errors?.['max']) {
      missingFields.push('Commission (must be between 0% and 100%)');
    }

    if (this.certificateForm.get('scope')?.errors?.['required']) {
      missingFields.push('Scope');
    }

    if (this.certificateForm.get('noOfVisit')?.errors?.['required']) {
    missingFields.push('Number of Visits');
  } else if (this.certificateForm.get('noOfVisit')?.errors?.['min']) {
    missingFields.push('Number of Visits (cannot be negative)');
  }

    return missingFields;
  }

  // Get validation errors for the alert
  private getValidationErrors(): string[] {
    const errors: string[] = [];
    const applicable = this.certificateForm.get('applicable')?.value;

    // Check for target crops validation
    if (
      applicable === 'For Selected Crops' &&
      this.selectedCrops.length === 0
    ) {
      errors.push(
        'Please select at least one target crop for "For Selected Crops" option.'
      );
    }

    return errors;
  }

  onSubmit(): void {
    this.certificateForm.markAllAsTouched();

    const missingFields = this.getMissingFields();
    const validationErrors = this.getValidationErrors();

    // If there are any missing fields or validation errors, show the warning
    if (missingFields.length > 0 || validationErrors.length > 0) {
      // Scroll to first error
      this.scrollToFirstError();

      let errorMessage = '';

      if (missingFields.length > 0) {
        errorMessage += missingFields.map((field) => `${field}`).join('<br>');
      }

      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        html: errorMessage,
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
          htmlContainer: 'text-left',
        },
        confirmButtonText: 'OK',
      });
      return;
    }

    // Add confirmation dialog before updating
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to update this certificate?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Update',
      cancelButtonText: 'No, Cancel',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-gray-800 dark:text-white',
        title: 'dark:text-white',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.updateCertificate();
      }
    });
  }

  private updateCertificate(): void {
    this.isLoading = true;

    const formValue = this.certificateForm.value;

    const formData = new FormData();

    // Use exact database field names
    formData.append('srtcomapnyId', formValue.srtcomapnyId.toString());
    formData.append('srtName', formValue.srtName);
    formData.append('srtNumber', formValue.srtNumber);
    formData.append('applicable', formValue.applicable);
    formData.append('accreditation', formValue.accreditation);

    // Service areas as JSON string (since it's stored as TEXT in DB)
    const serviceAreas = Array.isArray(formValue.serviceAreas)
      ? formValue.serviceAreas
      : [];
    formData.append('serviceAreas', JSON.stringify(serviceAreas));

    formData.append('price', formValue.price.toString());
    formData.append('timeLine', formValue.timeLine.toString());
    formData.append('commission', formValue.commission.toString());
    formData.append('scope', formValue.scope);

    // Add noOfVisit to formData
    if (formValue.noOfVisit) {
      formData.append('noOfVisit', formValue.noOfVisit.toString());
    } else {
      formData.append('noOfVisit', '');
    }

    // Append cropIds only if "For Selected Crops" is selected
    const applicable = formValue.applicable;
    if (applicable === 'For Selected Crops' && this.selectedCrops.length > 0) {
      const cropIds = this.selectedCrops.map((c) => c.id);
      formData.append('cropIds', JSON.stringify(cropIds));
    } else {
      formData.append('cropIds', JSON.stringify([]));
    }

    // Append PDF file only if a new one is uploaded
    if (this.uploadedFile) {
      formData.append('tearmsFile', this.uploadedFile);
    }

    // Append logo file only if a new one is uploaded
    if (this.uploadedLogo) {
      formData.append('logo', this.uploadedLogo);
    }

    this.certificateCompanyService
      .updateCertificate(this.certificateId, formData)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.status) {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: res.message || 'Certificate details updated successfully!',
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup:
                  'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold',
              },
            }).then(() => {
              this.router.navigate([
                '/plant-care/action/view-certificate-list',
              ]);
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text:
                res.message ||
                'Failed to update certificate details. Please try again.',
              customClass: {
                popup:
                  'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            });
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error updating certificate:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text:
              err.error?.message ||
              'Failed to update certificate details. Please try again.',
            customClass: {
              popup:
                'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
        },
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
      buttonsStyling: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.location.back()
      }
    });
  }



  onCancel(): void {
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
        this.location.back();
      }
    });
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

  trimLeadingSpaces(event: any, varibleName: string) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/^\s+/, '');
    this.certificateForm.get(varibleName)?.setValue(input.value);
  }
  preventDecimalInput(event: KeyboardEvent) {
    // Prevent decimal point, comma, and 'e' for exponential notation
    const forbiddenKeys = ['.', ',', 'e', 'E'];
    if (forbiddenKeys.includes(event.key)) {
      event.preventDefault();
    }
  }
}
