import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { CollectionOfficerService } from '../../../services/collection-officer/collection-officer.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import Swal from 'sweetalert2';
import { response } from 'express';
import { error } from 'console';

interface Bank {
  ID: number;
  name: string;
}

interface Branch {
  bankID: number;
  ID: number;
  name: string;
}

interface BranchesData {
  [key: string]: Branch[];
}

@Component({
  selector: 'app-create-company',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './create-company.component.html',
  styleUrl: './create-company.component.css',
})
export class CreateCompanyComponent {
  companyData: Company = new Company();
  userForm: FormGroup;
  selectedPage: 'pageOne' | 'pageTwo' = 'pageOne';
  itemId: number | null = null;
  touchedFields: { [key in keyof Company]?: boolean } = {};

  banks: Bank[] = [];
  branches: Branch[] = [];
  selectedBankId: number | null = null;
  selectedBranchId: number | null = null;
  allBranches: BranchesData = {};
  isView: boolean = false;
  isLoading = false;
  confirmAccountNumberError: boolean = false;
  confirmAccountNumberRequired: boolean = false;

  invalidFields: Set<string> = new Set();

  constructor(
    private fb: FormBuilder,
    private collectionCenterSrv: CollectionCenterService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      regNumber: ['', Validators.required],
      companyNameEnglish: ['', Validators.required],
      companyNameSinhala: ['', Validators.required],
      companyNameTamil: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      oicName: ['', Validators.required],
      oicEmail: ['', [Validators.required, Validators.email]],
      oicConCode1: ['', Validators.required],
      oicConNum1: ['', Validators.required],
      oicConCode2: [''],
      oicConNum2: [''],
      accHolderName: ['', Validators.required],
      accNumber: ['', Validators.required],
      bankName: ['', Validators.required],
      branchName: ['', Validators.required],
      foName: ['', Validators.required],
      foConCode: ['', Validators.required],
      foConNum: ['', Validators.required],
      foEmail: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.loadBanks();
    this.loadBranches();
    // Subscribe to form value changes
    this.route.queryParams.subscribe((params) => {
      this.itemId = params['id'] ? +params['id'] : null;
      this.isView = params['isView'] === 'true';
      console.log('Received item ID:', this.itemId);
      console.log('recieved view state: ', this.isView);
    });
    this.userForm.valueChanges.subscribe((formValues) => {
      this.companyData = { ...this.companyData, ...formValues };
    });
    this.getCompanyData();
  }

  loadBanks() {
    this.http.get<Bank[]>('assets/json/banks.json').subscribe(
      (data) => {
        this.banks = data;
        this.matchExistingBankToDropdown();
      },
      (error) => {
        console.error('Error loading banks:', error);
      }
    );
  }

  loadBranches() {
    this.http.get<BranchesData>('assets/json/branches.json').subscribe(
      (data) => {
        this.allBranches = data;
        this.matchExistingBankToDropdown();
      },
      (error) => {
        console.error('Error loading branches:', error);
      }
    );
  }

  onBankChange1() {
    if (this.selectedBankId) {
      // Update branches based on selected bank
      this.branches = this.allBranches[this.selectedBankId.toString()] || [];

      // Update company data with bank name
      const selectedBank = this.banks.find(
        (bank) => bank.ID === this.selectedBankId
      );
      if (selectedBank) {
        this.companyData.bankName = selectedBank.name;
        this.invalidFields.delete('bankName');
      }

      // Reset branch selection
      this.selectedBranchId = null;
      this.companyData.branchName = '';
    } else {
      this.branches = [];
      this.companyData.bankName = '';
    }
  }

  onBranchChange1() {
    if (this.selectedBranchId) {
      // Update company data with branch name
      const selectedBranch = this.branches.find(
        (branch) => branch.ID === this.selectedBranchId
      );
      if (selectedBranch) {
        this.companyData.branchName = selectedBranch.name;
        this.invalidFields.delete('branchName');
      }
    } else {
      this.companyData.branchName = '';
    }
  }

  matchExistingBankToDropdown() {
    // Only proceed if both banks and branches are loaded and we have existing data
    if (
      this.banks.length > 0 &&
      Object.keys(this.allBranches).length > 0 &&
      this.companyData &&
      this.companyData.bankName
    ) {
      console.log('hit 01', this.companyData.bankName);

      // Find the bank ID that matches the existing bank name
      const matchedBank = this.banks.find(
        (bank) => bank.name === this.companyData.bankName
      );

      if (matchedBank) {
        this.selectedBankId = matchedBank.ID;
        // Load branches for this bank
        this.branches = this.allBranches[this.selectedBankId.toString()] || [];

        // If we also have a branch name, try to match it
        if (this.companyData.branchName) {
          const matchedBranch = this.branches.find(
            (branch) => branch.name === this.companyData.branchName
          );
          if (matchedBranch) {
            this.selectedBranchId = matchedBranch.ID;
          }
        }
      }
    }
    console.log('hit 02');
  }

  onBankChange() {
    if (this.selectedBankId) {
      // Update branches based on selected bank
      this.branches = this.allBranches[this.selectedBankId.toString()] || [];

      // Update company data with bank name
      const selectedBank = this.banks.find(
        (bank) => bank.ID === this.selectedBankId
      );
      if (selectedBank) {
        this.companyData.bankName = selectedBank.name;
      }

      // Reset branch selection if the current selection doesn't belong to this bank
      const currentBranch = this.branches.find(
        (branch) => branch.ID === this.selectedBranchId
      );
      if (!currentBranch) {
        this.selectedBranchId = null;
        this.companyData.branchName = '';
      }
    } else {
      this.branches = [];
      this.companyData.bankName = '';
    }
  }

  onBranchChange() {
    if (this.selectedBranchId) {
      // Update company data with branch name
      const selectedBranch = this.branches.find(
        (branch) => branch.ID === this.selectedBranchId
      );
      if (selectedBranch) {
        this.companyData.branchName = selectedBranch.name;
      }
    } else {
      this.companyData.branchName = '';
    }
  }

  getCompanyData() {
    if (this.itemId) {
      this.isLoading = true;
      this.collectionCenterSrv.getCompanyById(this.itemId).subscribe(
        (response: any) => {
          this.isLoading = false;
          console.log('Fetched company data:', response);

          this.companyData = response;
          console.log('--check--', this.companyData);
          this.matchExistingBankToDropdown();
        },
        (error) => {
          this.isLoading = false;
          console.error('Error fetching company data:', error);
          this.isLoading = false;
          Swal.fire(
            'Error',
            'Failed to fetch company data. Please try again.',
            'error'
          );
        }
      );
    }
  }

  saveCompanyData() {
    console.log(this.companyData);

    this.collectionCenterSrv.createCompany(this.companyData).subscribe(
      (response) => {
        console.log('Data saved successfully:', response);
        Swal.fire('Success', 'Company Created Successfully', 'success');
        this.router.navigate(['/collection-hub/manage-company']);
      },
      (error) => {
        console.error('Error saving data:', error);
        Swal.fire('Error', error, 'error');
      }
    );
  }

  nextFormCreate(page: 'pageOne' | 'pageTwo') {
    if (page === 'pageTwo') {
      const missingFields: string[] = [];

      if (!this.companyData.regNumber)
        missingFields.push('Company Register Number');
      if (!this.companyData.companyNameEnglish)
        missingFields.push('Company Name (English)');
      if (!this.companyData.companyNameSinhala)
        missingFields.push('Company Name (Sinhala)');
      if (!this.companyData.companyNameTamil)
        missingFields.push('Company Name (Tamil)');

      if (!this.companyData.email) missingFields.push('Company Email');
      // if (!this.companyData.oicName) missingFields.push('Officer In Charge Name');
      // if (!this.companyData.oicEmail) missingFields.push('Officer In Charge Email');
      // if (!this.companyData.oicConCode1) missingFields.push('Phone Number 01 Code');
      // if (!this.companyData.oicConNum1) missingFields.push('Phone Number 02');

      if (missingFields.length > 0) {
        Swal.fire({
          icon: 'error',
          title: 'Please fill all fields',
          html: `The following fields are missing:<br><ul>${missingFields
            .map((field) => `<li>${field}</li>`)
            .join('')}</ul>`,
        });
        return;
      }
    }

    this.selectedPage = page;
  }

  updateCompanyData() {
    if (this.itemId) {
      this.collectionCenterSrv
        .updateCompany(this.companyData, this.itemId)
        .subscribe(
          (response) => {
            console.log('Company updated successfully:', response);
            Swal.fire('Success', 'Company Updated Successfully', 'success');
            this.router.navigate(['/collection-hub/manage-company']);
          },
          (error) => {
            console.error('Error updating company:', error);
            Swal.fire(
              'Error',
              'Failed to update company. Please try again.',
              'error'
            );
          }
        );
    } else {
      Swal.fire('Error', 'No company ID found for update', 'error');
    }
  }

  onBlur(fieldName: keyof Company): void {
    this.touchedFields[fieldName] = true;

    if (fieldName === 'confirmAccNumber') {
      this.validateConfirmAccNumber();
    }
  }

  isFieldInvalid(fieldName: keyof Company): boolean {
    return !!this.touchedFields[fieldName] && !this.companyData[fieldName];
  }

  validateConfirmAccNumber(): void {
    this.confirmAccountNumberRequired = !this.companyData.confirmAccNumber;

    // Check if account numbers match
    if (this.companyData.accNumber && this.companyData.confirmAccNumber) {
      this.confirmAccountNumberError =
        this.companyData.accNumber !== this.companyData.confirmAccNumber;
    } else {
      this.confirmAccountNumberError = false;
    }
  }

  isValidEmail(email: string): boolean {
    const emailPattern =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|lk|co)$/i;
    return emailPattern.test(email);
  }

  back(): void {
    this.router.navigate(['collection-hub']);
  }

  onCancel() {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after canceling!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'No, Keep Editing',
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/collection-hub/manage-company']);
      }
    });
  }
}

class Company {
  id!: number;
  regNumber!: string;
  companyNameEnglish!: string;
  companyNameSinhala!: string;
  companyNameTamil!: string;
  email!: string;
  oicName!: string;
  oicEmail!: string;
  oicConCode1!: string;
  oicConNum1!: string;
  oicConCode2!: string;
  oicConNum2!: string;
  accHolderName!: string;
  accNumber!: string;
  confirmAccNumber!: string;
  bankName!: string;
  branchName!: string;
  foName!: string;
  foConCode!: string;
  foConNum!: string;
  foEmail!: string;
}
