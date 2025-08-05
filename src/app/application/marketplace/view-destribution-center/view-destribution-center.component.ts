import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router, ActivatedRoute } from '@angular/router';
import { DestributionService } from '../../../services/destribution-service/destribution-service.service';
import Swal from 'sweetalert2';
import {FormControl } from '@angular/forms';

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
  selector: 'app-view-destribution-center',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './view-destribution-center.component.html',
  styleUrl: './view-destribution-center.component.css',
})
export class ViewDestributionCenterComponent implements OnInit {
  distributionForm!: FormGroup;
  companyList: CompanyList[] = [];
  isLoading = false;
  distributionCenterDetails?: DistributionCenter;
  hasData = false;

  companyOptions: any[] = [];

 form = new FormGroup({
    company: new FormControl(null),
  });
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
  }

  back(): void {
    this.router.navigate(['/distribution-hub/action/view-destribition-center']);
  }

  fetchAllCompanies() {
    this.distributionService.getAllCompanies().subscribe(
      (res) => {
        this.companyList = res.data;
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

  getCompanyNameById(id: string | number | null): string | undefined {
  return this.companyList?.find(company => company.id === id)?.companyNameEnglish;
}


  populateForm(data: DistributionCenter): void {
    // Find the company ID that matches the company name from the response
    const matchingCompany = this.companyList.find(
      (company) => company.companyNameEnglish === data.company
    );

    this.distributionForm.patchValue({
      name: data.centerName,
      company: matchingCompany ? matchingCompany.id : null, // Use the ID if found
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

    // Disable the form for view-only mode
    this.distributionForm.disable();
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
}

class CompanyList {
  companyNameEnglish!: string;
  id!: number;
}
