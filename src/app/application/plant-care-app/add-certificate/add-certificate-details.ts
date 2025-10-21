import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
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
  selector: 'app-add-certificate-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownModule,
    MultiSelectModule,
    LoadingSpinnerComponent,
    FormsModule,
  ],
  templateUrl: './add-certificate-details.component.html',
  styleUrls: ['./add-certificate-details.component.css'],
})
export class AddCertificateDetailsComponent implements OnInit {
  certificateForm!: FormGroup;
  isLoading = false;
  uploadedFile: File | null = null;
  uploadedLogo: File | null = null;
  logoPreview: string | ArrayBuffer | null = null;
  logoError: string = '';

  @ViewChild('logoInput', { static: false })
  logoInput!: ElementRef<HTMLInputElement>;

  companies: { label: string; value: number }[] = [];
  applicableOptions = [
    { label: 'For Selected Crops', value: 'For Selected Crops' },
    { label: 'For Farm', value: 'For Farm' },
    { label: 'For Farm Cluster', value: 'For Farm Cluster' },
  ];

  serviceAreasOptions = [
    { name: 'Ampara', value: 'Ampara' },
    { name: 'Anuradhapura', value: 'Anuradhapura' },
    { name: 'Badulla', value: 'Badulla' },
    { name: 'Batticaloa', value: 'Batticaloa' },
    { name: 'Colombo', value: 'Colombo' },
    { name: 'Galle', value: 'Galle' },
    { name: 'Gampaha', value: 'Gampaha' },
    { name: 'Hambantota', value: 'Hambantota' },
    { name: 'Jaffna', value: 'Jaffna' },
    { name: 'Kalutara', value: 'Kalutara' },
    { name: 'Kandy', value: 'Kandy' },
    { name: 'Kegalle', value: 'Kegalle' },
    { name: 'Kilinochchi', value: 'Kilinochchi' },
    { name: 'Kurunegala', value: 'Kurunegala' },
    { name: 'Mannar', value: 'Mannar' },
    { name: 'Matale', value: 'Matale' },
    { name: 'Matara', value: 'Matara' },
    { name: 'Monaragala', value: 'Monaragala' },
    { name: 'Mullaitivu', value: 'Mullaitivu' },
    { name: 'Nuwara Eliya', value: 'Nuwara Eliya' },
    { name: 'Polonnaruwa', value: 'Polonnaruwa' },
    { name: 'Puttalam', value: 'Puttalam' },
    { name: 'Rathnapura', value: 'Rathnapura' },
    { name: 'Trincomalee', value: 'Trincomalee' },
    { name: 'Vavuniya', value: 'Vavuniya' },
  ];

  cropDropdownOptions: { label: string; value: number }[] = [];
  selectedCrop: number | null = null;
  selectedCrops: { id: number; cropNameEnglish: string }[] = [];

  // New properties for conditional logic
  showTargetCropsSection = false;
  isForSelectedCrops = false;

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private router: Router,
    private cropCalendarService: CropCalendarService,
    private certificateCompanyService: CertificateCompanyService
  ) {}

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
      tearmsFile: [null, Validators.required],
    });

    // Load crop groups for dropdown
    this.loadCropGroups();

    // Load certificate companies for dropdown
    this.loadCompanies();

    // Watch for applicable changes
    this.certificateForm.get('applicable')?.valueChanges.subscribe((value) => {
      this.onApplicableChange();
    });
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

  onLogoSelected(event: Event): void {
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
      this.logoError = 'Please select a valid image file (JPEG, JPG, PNG, WebP).';
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

  onFileUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate PDF file type
      if (file.type !== 'application/pdf') {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File',
          text: 'Please select a PDF file for Payment Terms.',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
        return;
      }

      this.uploadedFile = file;
      this.certificateForm.patchValue({ tearmsFile: file });
      this.certificateForm.get('tearmsFile')?.markAsTouched();
    }
  }

  loadCropGroups(): void {
    this.cropCalendarService.getAllCropGroupNamesOnly().subscribe({
      next: (data) => {
        this.cropDropdownOptions = data.map((crop) => ({
          label: crop.cropNameEnglish,
          value: crop.id,
        }));
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
    this.showTargetCropsSection = !!applicable; // Show the section if any option is selected

    if (this.isForSelectedCrops) {
      // For Selected Crops - user selects manually
      this.selectedCrops = [];
    } else if (applicable === 'For Farm' || applicable === 'For Farm Cluster') {
      // For Farm or Farm Cluster - do not send crop IDs, just show "All crops are selected"
      this.selectedCrops = [];
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
    }
  }

  removeCrop(index: number): void {
    this.selectedCrops.splice(index, 1);
  }

  onBack(): void {
    this.location.back();
  }

  onCancel(): void {
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
        this.location.back();
      }
    });
  }

  onSubmit(): void {
    this.certificateForm.markAllAsTouched();

    // Validate target crops based on applicable selection
    const applicable = this.certificateForm.get('applicable')?.value;

    if (
      applicable === 'For Selected Crops' &&
      this.selectedCrops.length === 0
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Please select at least one target crop for "For Selected Crops" option.',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        },
      });
      return;
    }

    if (this.certificateForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Please fill all required fields correctly.',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        },
      });
      return;
    }

    if (!this.uploadedFile) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please upload a PDF file for Payment Terms.',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });
      return;
    }

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
      ? formValue.serviceAreas.map((area: any) =>
          typeof area === 'object' ? area.value : area
        )
      : [];
    formData.append('serviceAreas', JSON.stringify(serviceAreas));

    formData.append('price', formValue.price.toString());
    formData.append('timeLine', formValue.timeLine.toString());
    formData.append('commission', formValue.commission.toString());
    formData.append('scope', formValue.scope);

    // Append cropIds only if "For Selected Crops" is selected
    if (applicable === 'For Selected Crops' && this.selectedCrops.length > 0) {
      const cropIds = this.selectedCrops.map(c => c.id);
      formData.append('cropIds', JSON.stringify(cropIds));
    }

    // PDF file - using the exact field name from backend route
    formData.append('tearmsFile', this.uploadedFile);

    // Logo file - append if uploaded
    if (this.uploadedLogo) {
      formData.append('logo', this.uploadedLogo);
    }

    this.certificateCompanyService.createCertificate(formData).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.status) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Certificate details saved successfully!',
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup:
                'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
            },
          }).then(() => {
            this.router.navigate(['/plant-care/action/view-certificate-list']);
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text:
              res.message ||
              'Failed to add certificate details. Please try again.',
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
        console.error('Error creating certificate:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text:
            err.error?.message ||
            'Failed to add certificate details. Please try again.',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
      },
    });
  }
}