import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DistributionHubService } from '../../../services/distribution-hub/distribution-hub.service';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

interface Company {
  id: number;
  companyNameEnglish: string;
}

interface DistributionHeadDetails {
  id: number;
  empId: string;
  companyId: number;
  empType: string;
  jobRole: string;
  languages: string;
  firstNameEnglish: string;
  lastNameEnglish: string;
  phoneCode01: string;
  phoneNumber01: string;
  phoneCode02?: string;
  phoneNumber02?: string;
  nic: string;
  email: string;
  houseNumber: string;
  streetName: string;
  city: string;
  district: string;
  province: string;
  country: string;
  accHolderName: string;
  accNumber: string;
  bankName: string;
  branchName?: string;
  status: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: DistributionHeadDetails;
}

@Component({
  selector: 'app-view-head-portal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './view-head-portal.component.html',
  styleUrls: ['./view-head-portal.component.css'],
})
export class ViewHeadPortalComponent implements OnInit {
  headForm: FormGroup;
  isLoading = false;
  isView = false;
  headId: number | null = null;
  companyList: Company[] = [];
  phoneCodes = [
    { value: '+94', label: '+94 (Sri Lanka)' },
    // Add other phone codes as needed
  ];
  provinces = [
    'Central',
    'Eastern',
    'North Central',
    'Northern',
    'North Western',
    'Sabaragamuwa',
    'Southern',
    'Uva',
    'Western',
  ];
  districtsByProvince: { [key: string]: string[] } = {
    Central: ['Kandy', 'Matale', 'Nuwara Eliya'],
    Eastern: ['Ampara', 'Batticaloa', 'Trincomalee'],
    'North Central': ['Anuradhapura', 'Polonnaruwa'],
    Northern: ['Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya'],
    'North Western': ['Kurunegala', 'Puttalam'],
    Sabaragamuwa: ['Kegalle', 'Rathnapura'],
    Southern: ['Galle', 'Hambantota', 'Matara'],
    Uva: ['Badulla', 'Monaragala'],
    Western: ['Colombo', 'Gampaha', 'Kalutara'],
  };
  employeeTypes = ['Permanent', 'Contract', 'Part-Time'];
  languages = ['Sinhala', 'Tamil', 'English'];
  banks = ['Hongkong Shanghai Bank', 'Bank of Ceylon', 'Commercial Bank', 'Hatton National Bank'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private distributionHubService: DistributionHubService
  ) {
    this.headForm = this.fb.group({
      empId: ['', Validators.required],
      companyName: ['', Validators.required],
      staffEmployeeType: ['', Validators.required],
      jobRole: ['', Validators.required],
      preferredLanguages: [[], Validators.required],
      firstNameEnglish: ['', Validators.required],
      lastNameEnglish: ['', Validators.required],
      phoneCode01: ['+94', Validators.required],
      phoneNumber01: ['', [Validators.required, this.phoneValidator()]],
      phoneCode02: ['+94'],
      phoneNumber02: ['', this.phoneValidator()],
      nic: ['', [Validators.required, Validators.pattern(/^[0-9]{9}[vVxX]$|^[0-9]{12}$/)]],
      email: ['', [Validators.required, Validators.email]],
      houseNumber: ['', Validators.required],
      streetName: ['', Validators.required],
      city: ['', Validators.required],
      district: ['', Validators.required],
      province: ['', Validators.required],
      country: ['Sri Lanka', Validators.required],
      accHolderName: ['', Validators.required],
      accNumber: ['', Validators.required],
      bankName: ['', Validators.required],
      branchName: [''],
      status: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.headId = params.get('id') ? +params.get('id')! : null;
      this.route.queryParams.subscribe((queryParams) => {
        this.isView = queryParams['isView'] === 'true';
        console.log('Head ID:', this.headId, 'Is View:', this.isView);
        if (this.headId) {
          this.loadData(this.headId);
        } else {
          console.error('Invalid Head ID:', this.headId);
          Swal.fire({
            icon: 'error',
            title: 'Invalid Head ID',
            text: 'No valid distribution head ID provided.',
          });
          this.router.navigate(['/distribution-hub/action/view-distribution-head']);
        }
      });
    });
  }

  loadData(id: number): void {
    this.isLoading = true;
    forkJoin({
      companies: this.distributionHubService.getAllCompanyList(),
      headData: this.distributionHubService.getDistributionHeadDetailsById(id),
    }).subscribe({
      next: ({ companies, headData }) => {
        this.companyList = companies;
        console.log('Loaded Companies:', this.companyList);
        console.log('Raw API Response:', headData);
        const data = headData.data; // Access the nested 'data' field
        console.log('Fetched Distribution Head Data:', data);
        if (!data) {
          console.error('No data in API response');
          Swal.fire('Error', 'No distribution head data found.', 'error');
          this.router.navigate(['/distribution-hub/action/view-distribution-head']);
          this.isLoading = false;
          return;
        }
        this.headForm.patchValue({
          empId: data.empId || '',
          companyName: this.companyList.find((c) => c.id === data.companyId)?.companyNameEnglish || '',
          staffEmployeeType: data.empType || '',
          jobRole: data.jobRole || '',
          preferredLanguages: data.languages ? data.languages.split(',') : [],
          firstNameEnglish: data.firstNameEnglish || '',
          lastNameEnglish: data.lastNameEnglish || '',
          phoneCode01: data.phoneCode01 || '+94',
          phoneNumber01: data.phoneNumber01 || '',
          phoneCode02: data.phoneCode02 || '+94',
          phoneNumber02: data.phoneNumber02 || '',
          nic: data.nic || '',
          email: data.email || '',
          houseNumber: data.houseNumber || '',
          streetName: data.streetName || '',
          city: data.city || '',
          district: data.district || '',
          province: data.province || '',
          country: data.country || 'Sri Lanka',
          accHolderName: data.accHolderName || '',
          accNumber: data.accNumber || '',
          bankName: data.bankName || '',
          branchName: data.branchName || '',
          status: data.status || '',
        });
        console.log('Form Values After Patch:', this.headForm.value);
        if (this.isView) {
          this.headForm.disable();
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading data:', error);
        Swal.fire('Error', 'Failed to load data.', 'error');
        this.router.navigate(['/distribution-hub/action/view-distribution-head']);
      },
    });
  }

  phoneValidator() {
    return (control: any) => {
      if (!control.value) return null;
      const phoneRegex = /^[0-9]{9}$/;
      return phoneRegex.test(control.value) ? null : { invalidPhone: 'Enter a valid 9-digit phone number' };
    };
  }

  isFieldInvalid(field: string): boolean {
    const control = this.headForm.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  onProvinceChange(): void {
    const province = this.headForm.get('province')?.value;
    if (!province) {
      this.headForm.get('district')?.setValue('');
    }
  }

  getDistricts(): string[] {
    const province = this.headForm.get('province')?.value;
    return province ? this.districtsByProvince[province] || [] : [];
  }

  updateDistributionHead(): void {
    if (this.headForm.invalid || !this.headId) {
      console.log('Form Invalid or No Head ID:', this.headForm.errors, this.headId);
      Swal.fire('Error', 'Please fill all required fields correctly.', 'error');
      return;
    }
    this.isLoading = true;
    const formValue = {
      ...this.headForm.value,
      companyId: this.companyList.find((c) => c.companyNameEnglish === this.headForm.get('companyName')?.value)?.id || null,
      empType: this.headForm.get('staffEmployeeType')?.value,
      languages: this.headForm.get('preferredLanguages')?.value.join(','),
    };
    console.log('Update Payload:', formValue);
    this.distributionHubService.updateDistributionHeadDetails(this.headId, formValue).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire('Success', 'Distribution head updated successfully', 'success');
        this.router.navigate(['/distribution-hub/action/view-distribution-head']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error updating distribution head:', error);
        Swal.fire('Error', 'Failed to update distribution head', 'error');
      },
    });
  }
  back(): void {
    this.router.navigate(['/distribution-hub/action/view-distribution-company'], {
      queryParams: {
        id: 2,
        companyName: 'agroworld Distribution (Pvt) Ltd'
      }
    });
  }

}