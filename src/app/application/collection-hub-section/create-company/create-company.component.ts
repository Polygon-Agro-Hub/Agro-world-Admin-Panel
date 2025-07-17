import { CommonModule, Location } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
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
export class CreateCompanyComponent implements OnInit {
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
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  selectedLogoFile: File | null = null;
  selectedFaviconFile: File | null = null;

  companyType: string = '';

  constructor(
    private fb: FormBuilder,
    private collectionCenterSrv: CollectionCenterService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private location: Location
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
    this.route.queryParams.subscribe((params) => {
      this.companyType = params['type'];
      console.log('Received type:', this.companyType);
    });

    this.loadBanks();
    this.loadBranches();
    this.route.queryParams.subscribe((params) => {
      this.itemId = params['id'] ? +params['id'] : null;
      this.isView = params['isView'] === 'true';
    });
    this.userForm.valueChanges.subscribe((formValues) => {
      this.companyData = { ...this.companyData, ...formValues };
    });
    this.getCompanyData();
  }

  async compressImage(
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality: number
  ): Promise<File> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            quality
          );
        };
      };
      reader.readAsDataURL(file);
    });
  }

  async onLogoChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      try {
        this.isLoading = true;
        const compressedFile = await this.compressImage(
          input.files[0],
          800,
          800,
          0.7
        );
        this.selectedLogoFile = compressedFile;
        this.companyData.logoFile = compressedFile;

        const reader = new FileReader();
        reader.onload = (e) => {
          this.companyData.logo = e.target?.result as string;
          this.isLoading = false;
        };
        reader.readAsDataURL(this.selectedLogoFile);
      } catch (error) {
        this.isLoading = false;
        console.error('Error compressing image:', error);
      }
    }
  }

  async onFaviconChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      try {
        this.isLoading = true;
        const compressedFile = await this.compressImage(
          input.files[0],
          800,
          800,
          0.7
        );
        this.selectedFaviconFile = compressedFile;
        this.companyData.faviconFile = compressedFile;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.companyData.favicon = e.target?.result as string;
          this.isLoading = false;
        };
        reader.readAsDataURL(this.selectedFaviconFile);
      } catch (error) {
        this.isLoading = false;
        console.error('Error compressing image:', error);
      }
    }
  }

  removeLogo(event: Event): void {
    event.stopPropagation();
    this.companyData.logo = '';
    this.selectedLogoFile = null;
    this.companyData.logoFile = undefined;

    const logoInput = document.getElementById('logoUpload') as HTMLInputElement;
    if (logoInput) {
      logoInput.value = '';
    }

    this.touchedFields['logo'] = true;
  }

  removeFavicon(event: Event): void {
    event.stopPropagation();
    this.companyData.favicon = '';
    this.selectedFaviconFile = null;

    const faviconInput = document.getElementById(
      'faviconUpload'
    ) as HTMLInputElement;
    if (faviconInput) {
      faviconInput.value = '';
    }

    this.touchedFields['favicon'] = true;
  }

  loadBanks() {
    this.http.get<Bank[]>('assets/json/banks.json').subscribe(
      (data) => {
        // Sort banks alphabetically by name (case-insensitive)
        this.banks = data.sort((a, b) => a.name.localeCompare(b.name));
        this.matchExistingBankToDropdown();
      },
      (error) => {}
    );
  }

  loadBranches() {
    this.http.get<BranchesData>('assets/json/branches.json').subscribe(
      (data) => {
        this.allBranches = data;
        this.matchExistingBankToDropdown();
      },
      (error) => {}
    );
  }

  onBankChange1() {
    if (this.selectedBankId) {
      this.branches = this.allBranches[this.selectedBankId.toString()] || [];
      const selectedBank = this.banks.find(
        (bank) => bank.ID === this.selectedBankId
      );
      if (selectedBank) {
        this.companyData.bankName = selectedBank.name;
        this.invalidFields.delete('bankName');
      }
      this.selectedBranchId = null;
      this.companyData.branchName = '';
    } else {
      this.branches = [];
      this.companyData.bankName = '';
    }
  }

  onBranchChange1() {
    if (this.selectedBranchId) {
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
    if (
      this.banks.length > 0 &&
      Object.keys(this.allBranches).length > 0 &&
      this.companyData &&
      this.companyData.bankName
    ) {
      const matchedBank = this.banks.find(
        (bank) => bank.name === this.companyData.bankName
      );

      if (matchedBank) {
        this.selectedBankId = matchedBank.ID;
        this.branches = this.allBranches[this.selectedBankId.toString()] || [];

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
    console.log('hit 02', console.log(this.companyData.bankName));
  }

  onBankChange() {
    if (this.selectedBankId) {
      // Update and sort branches based on selected bank
      this.branches = (
        this.allBranches[this.selectedBankId.toString()] || []
      ).sort((a, b) => a.name.localeCompare(b.name));

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
          this.companyData = response;
          this.matchExistingBankToDropdown();
        },
        (error) => {
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
    // Validate contact numbers first
    if (
      this.companyData.oicConNum1 &&
      this.companyData.oicConNum2 &&
      this.companyData.oicConNum1 === this.companyData.oicConNum2 &&
      this.companyData.oicConCode1 === this.companyData.oicConCode2
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Duplicate Numbers',
        text: 'Company Contact Number 1 and 2 cannot be the same',
      });
      return;
    }

    // Validate account numbers match
    if (this.companyData.accNumber !== this.companyData.confirmAccNumber) {
      Swal.fire({
        icon: 'error',
        title: 'Account Numbers Mismatch',
        text: 'Account number and confirm account number do not match',
      });
      return;
    }

    // Check required fields
    const missingFields: string[] = [];

    if (!this.companyData.regNumber) missingFields.push('Registration Number');
    if (!this.companyData.companyNameEnglish)
      missingFields.push('Company Name (English)');
    if (!this.companyData.companyNameSinhala)
      missingFields.push('Company Name (Sinhala)');
    if (!this.companyData.companyNameTamil)
      missingFields.push('Company Name (Tamil)');
    if (!this.companyData.email) missingFields.push('Email');
    if (!this.companyData.accHolderName)
      missingFields.push('Account Holder Name');
    if (!this.companyData.accNumber) missingFields.push('Account Number');
    if (!this.companyData.confirmAccNumber)
      missingFields.push('Confirm Account Number');
    if (!this.companyData.bankName) missingFields.push('Bank Name');
    if (!this.companyData.branchName) missingFields.push('Branch Name');
    if (!this.companyData.foName) missingFields.push('Finance Officer Name');
    if (!this.companyData.oicConNum1) missingFields.push('Contact Number 1');
    if (!this.companyData.logo) missingFields.push('Company Logo');
    if (!this.companyData.favicon) missingFields.push('Company Favicon');

    if (missingFields.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Required Fields',
        html: `Please fill in the following fields:<br><ul>${missingFields
          .map((field) => `<li>${field}</li>`)
          .join('')}</ul>`,
      });
      return;
    }

    // Validate email format
    if (!this.isValidEmail(this.companyData.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Please enter a valid email address',
      });
      return;
    }

    this.isLoading = true;
    const formData = new FormData();

    // Append all non-file fields
    Object.entries(this.companyData).forEach(([key, value]) => {
      if (
        key !== 'logoFile' &&
        key !== 'faviconFile' &&
        value !== null &&
        value !== undefined
      ) {
        formData.append(key, String(value));
      }
    });

    // Append logo file if exists
    if (this.companyData.logoFile) {
      formData.append('logo', this.companyData.logoFile);
    }

    // Append favicon file if exists
    if (this.companyData.faviconFile) {
      formData.append('favicon', this.companyData.faviconFile);
    }

    this.collectionCenterSrv
      .createCompany(this.companyData, this.companyType)
      .subscribe(
        (response) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Company created successfully',
            timer: 2000,
            showConfirmButton: false,
          }).then(() => {
            this.location.back();
          });
        },
        (error) => {
          this.isLoading = false;
          console.error('Error saving data:', error);
          let errorMessage = 'Failed to create company. Please try again.';

          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.status === 0) {
            errorMessage =
              'Unable to connect to server. Please check your connection.';
          }

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage,
          });
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
      this.isLoading = true;

      const formData = new FormData();

      Object.entries(this.companyData).forEach(([key, value]) => {
        if (
          key !== 'logoFile' &&
          key !== 'faviconFile' &&
          value !== null &&
          value !== undefined
        ) {
          formData.append(key, String(value));
        }
      });

      if (this.companyData.logoFile) {
        formData.append('logo', this.companyData.logoFile);
      }

      if (this.companyData.faviconFile) {
        formData.append('favicon', this.companyData.faviconFile);
      }

      this.collectionCenterSrv
        .updateCompany(this.companyData, this.itemId)
        .subscribe(
          (response) => {
            this.isLoading = false;
            Swal.fire('Success', 'Company Updated Successfully', 'success');
            this.router.navigate(['/collection-hub/manage-company']);
          },
          (error) => {
            this.isLoading = false;
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

  numberOnly(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;

    // Allow only numbers (0-9)
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  onPaste(event: ClipboardEvent, fieldName: string): void {
    event.preventDefault();
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text');

    // Only allow paste if the text contains numbers only
    if (/^\d+$/.test(pastedText)) {
      if (fieldName === 'accNumber') {
        this.companyData.accNumber =
          (this.companyData.accNumber || '') + pastedText;
      } else if (fieldName === 'confirmAccNumber') {
        this.companyData.confirmAccNumber =
          (this.companyData.confirmAccNumber || '') + pastedText;
      }
    }
  }

  validateContactNumbers(): void {
    if (
      this.companyData.oicConNum1 &&
      this.companyData.oicConNum2 &&
      this.companyData.oicConNum1 === this.companyData.oicConNum2 &&
      this.companyData.oicConCode1 === this.companyData.oicConCode2
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Duplicate Numbers',
        text: 'Company Contact Number 1 and 2 cannot be the same',
      });
      // Clear the second number
      this.companyData.oicConNum2 = '';
    }
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
  logo!: string;
  favicon!: string;
  logoFile?: File;
  faviconFile?: File;
}
