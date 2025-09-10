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
import { DropdownModule } from 'primeng/dropdown';

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
    
     DropdownModule,
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
  companyNameError: string = '';
  isCheckingCompanyName: boolean = false;
  englishInputError: boolean = false;
  sinhalaInputError: boolean = false;
  tamilInputError: boolean = false;
  invalidCharError: boolean = false;
  accountNumberError: boolean = false;
  invalidFoName: boolean = false;
  contactNumberError1: boolean = false;
  contactNumberError2: boolean = false;
  logoSizeError: boolean = false;
  faviconSizeError: boolean = false;
 sameNumberError: boolean = false;
 emailValidationMessage: string = '';


  companyType: string = '';
countries = [
  { name: 'Sri Lanka', code: 'LK', dialCode: '+94' },
  { name: 'Vietnam', code: 'VN', dialCode: '+84' },
  { name: 'Cambodia', code: 'KH', dialCode: '+855' },
  { name: 'Bangladesh', code: 'BD', dialCode: '+880' },
  { name: 'India', code: 'IN', dialCode: '+91' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31' }
];
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
    if (!this.companyData.oicConCode1) {
    this.companyData.oicConCode1 = '+94';
  }
  if (!this.companyData.oicConCode2) {
    this.companyData.oicConCode2 = '+94';
  }

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

  getFlagUrl(countryCode: string): string {
  return `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`;
}


// Validate a given mobile number
isInvalidMobileNumber(numberField: 'oicConNum1' | 'oicConNum2'): boolean {
  const code = numberField === 'oicConNum1' ? this.companyData.oicConCode1 : this.companyData.oicConCode2;
  const number = numberField === 'oicConNum1' ? this.companyData.oicConNum1 : this.companyData.oicConNum2;

  // Skip validation if fields are empty or number is not 9 digits
  if (!code || !number || number.toString().length !== 9) {
    return false;
  }

  // Combine code + number
  const fullNumber = `${code}${number}`;

  // Validate: +947XXXXXXXX (Sri Lankan mobile format)
  const mobilePattern = /^\+947\d{8}$/;
  return !mobilePattern.test(fullNumber);
}


// Validate both numbers for duplication


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


// Method for English name validation (block numbers and special characters)
allowOnlyLetters(event: KeyboardEvent, inputValue: string) {
  const char = event.key;
  const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'];

  if (allowedKeys.includes(char)) return;

  // ❌ Block numbers (English + Tamil + Sinhala + Arabic + all Unicode digits)
  if (/\p{Nd}/u.test(char)) {
    event.preventDefault();
    this.englishInputError = true;
    setTimeout(() => {
      this.englishInputError = false;
    }, 2000);
    return;
  }

  // ❌ Block first space
  if (char === ' ' && inputValue.length === 0) {
    event.preventDefault();
    return;
  }

  // ❌ Block special characters (anything not a letter or space)
  if (!/^\p{L}$|^ $/u.test(char)) {
    event.preventDefault();
    this.englishInputError = true;
    setTimeout(() => {
      this.englishInputError = false;
    }, 2000);
  }
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
     window.history.back();
    }
  });
}

// Method for Sinhala name validation (block numbers and special characters)
allowOnlySinhala(event: KeyboardEvent, inputValue: string) {
  const char = event.key;
  const code = char.charCodeAt(0);
  const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'];

  // Allow control keys
  if (allowedKeys.includes(char)) return;

  // Block digits and special characters
  if (/^[0-9]$/.test(char) || /[^\w\s\u0D80-\u0DFF]/.test(char)) {
    event.preventDefault();
    this.sinhalaInputError = true;
    setTimeout(() => {
      this.sinhalaInputError = false;
    }, 2000);
    return;
  }

  // Block first space
  if (char === ' ' && inputValue.length === 0) {
    event.preventDefault();
    return;
  }

  // Sinhala Unicode range: U+0D80 to U+0DFF
  const isSinhala = code >= 0x0D80 && code <= 0x0DFF;

  if (!isSinhala && char !== ' ') {
    event.preventDefault();
    this.sinhalaInputError = true;
    setTimeout(() => {
      this.sinhalaInputError = false;
    }, 2000);
  }
}

// Method for Tamil name validation (block numbers and special characters)
allowOnlyTamil(event: KeyboardEvent, inputValue: string) {
  const char = event.key;
  const code = char.charCodeAt(0);
  const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'];

  // Allow control keys
  if (allowedKeys.includes(char)) return;

  // Block digits and special characters
  if (/^[0-9]$/.test(char) || /[^\w\s\u0B80-\u0BFF]/.test(char)) {
    event.preventDefault();
    this.tamilInputError = true;
    setTimeout(() => {
      this.tamilInputError = false;
    }, 2000);
    return;
  }

  // Block first space
  if (char === ' ' && inputValue.length === 0) {
    event.preventDefault();
    return;
  }

  // Tamil Unicode Range: U+0B80–U+0BFF
  const isTamil = code >= 0x0B80 && code <= 0x0BFF;

  if (!isTamil && char !== ' ') {
    event.preventDefault();
    this.tamilInputError = true;
    setTimeout(() => {
      this.tamilInputError = false;
    }, 2000);
  }
}

// Method for account holder name validation (only English letters and spaces)
allowOnlyEnglishLettersForAccountHolder(event: KeyboardEvent): void {
  const input = event.target as HTMLInputElement;
  const char = event.key;
  const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'];

  if (allowedKeys.includes(char)) return;

  // Prevent space at the start or multiple consecutive spaces
  if (char === ' ' && (input.selectionStart === 0 || input.value.endsWith(' '))) {
    event.preventDefault();
    return;
  }

  // Block digits and special characters, allow only English letters and spaces
  if (!/^[a-zA-Z\s]$/.test(char)) {
    event.preventDefault();
    this.invalidCharError = true;
    setTimeout(() => {
      this.invalidCharError = false;
    }, 2000);
  }
}

// Method for account number validation (only digits)
allowOnlyDigitsForAccountNumber(event: KeyboardEvent, field: 'accNumber' | 'confirmAccNumber' |'oicConNum1'|'oicConNum2'): void {
  const char = event.key;
  const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'];

  if (allowedKeys.includes(char)) return;

  if (!/^[0-9]$/.test(char)) {
    event.preventDefault();

    if (field === 'accNumber') {
      this.accountNumberError = true;
      setTimeout(() => (this.accountNumberError = false), 2000);
    } else if (field === 'confirmAccNumber') {
      this.confirmAccountNumberError = true;
      setTimeout(() => (this.confirmAccountNumberError = false), 2000);
    }
  }
}


// Updated contact number validation with SweetAlert
// validateContactNumbers(): void {
//   const num1 = this.companyData.oicConNum1?.toString() || '';
//   const num2 = this.companyData.oicConNum2?.toString() || '';

//   // Length validation errors (for UI messages)
//   this.contactNumberError1 = num1.length > 0 && num1.length !== 9;
//   this.contactNumberError2 = num2.length > 0 && num2.length !== 9;

//   // Duplicate number check with country codes
//   if (
//     num1.length === 9 &&
//     num2.length === 9 &&
//     this.companyData.oicConNum1 &&
//     this.companyData.oicConNum2 &&
//     this.companyData.oicConNum1 === this.companyData.oicConNum2 &&
//     this.companyData.oicConCode1 === this.companyData.oicConCode2
//   ) {
//     Swal.fire({
//       icon: 'error',
//       title: 'Duplicate Numbers',
//       text: 'Company Contact Number 1 and 2 cannot be the same',
//     }).then(() => {
//       // Clear the second number
//       this.companyData.oicConNum2 = '';
//       this.contactNumberError2 = false;
//     });
//   }
// }


  handleInputWithSpaceTrimming(event: KeyboardEvent, fieldName: keyof Company): void {
  const input = event.target as HTMLInputElement;
  const key = event.key;
  const currentValue = input.value;
  const cursorPosition = input.selectionStart || 0;

  const controlKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
  if (controlKeys.includes(key)) {
    return;
  }

  if (key === ' ' && cursorPosition === 0) {
    event.preventDefault();
    return;
  }

  const numericFields = ['accNumber', 'confirmAccNumber', 'oicConNum1', 'oicConNum2'];
  const englishOnlyFields = ['companyNameEnglish', 'accHolderName', 'foName'];
  const emailFields = ['email'];
  const sinhalaFields = [''];
  const tamilFields = [''];

  if (numericFields.includes(fieldName)) {
    if (!/^[0-9]$/.test(key)) {
      event.preventDefault();
      return;
    }
  }

  if (englishOnlyFields.includes(fieldName)) {
    if (!/^[A-Za-z\s'-]$/.test(key)) {
      event.preventDefault();
      this.englishInputError = true;
      setTimeout(() => {
        this.englishInputError = false;
      }, 2000);
      return;
    }
  }

  // Allow all characters in email fields (validation happens on blur/submit)
  if (emailFields.includes(fieldName)) {
    return; // Allow any character input for email
  }

  if (sinhalaFields.includes(fieldName)) {
    const charCode = key.charCodeAt(0);
    if ((charCode < 0x0D80 || charCode > 0x0DFF) && key !== ' ') {
      event.preventDefault();
      this.sinhalaInputError = true;
      setTimeout(() => {
        this.sinhalaInputError = false;
      }, 2000);
      return;
    }
  }

  if (tamilFields.includes(fieldName)) {
    const charCode = key.charCodeAt(0);
    if ((charCode < 0x0B80 || charCode > 0x0BFF) && key !== ' ') {
      event.preventDefault();
      this.tamilInputError = true;
      setTimeout(() => {
        this.tamilInputError = false;
      }, 2000);
      return;
    }
  }

  if (!numericFields.includes(fieldName) && key === ' ') {
    const hasLetters = /[a-zA-Z\u0D80-\u0DFF\u0B80-\u0BFF]/.test(currentValue);
    const charBeforeCursor = currentValue.charAt(cursorPosition - 1);

    if (cursorPosition === 0 || charBeforeCursor === ' ' || !hasLetters) {
      event.preventDefault();
      return;
    }
  }

  if (!numericFields.includes(fieldName)) {
    setTimeout(() => {
      let trimmedValue = input.value;
      trimmedValue = this.trimLeadingSpaces(trimmedValue);
      trimmedValue = trimmedValue.replace(/^\s+/, '');
      trimmedValue = trimmedValue.replace(/\s{2,}/g, ' ');

      if (input.value !== trimmedValue) {
        input.value = trimmedValue;
        (this.companyData as any)[fieldName] = trimmedValue;

        const newCursorPosition = Math.min(cursorPosition, trimmedValue.length);
        input.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  }
}

  async onLogoChange(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  // Reset size error when a new file is selected
  this.logoSizeError = false;
  
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const maxSize = 1024 * 1024; // 1MB
    
    if (file.size > maxSize) {
      this.logoSizeError = true;
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'Logo must be less than 1MB'
      });
      input.value = '';
      return;
    }

    try {
      this.isLoading = true;
      const compressedFile = await this.compressImage(file, 800, 800, 0.7);
      this.selectedLogoFile = compressedFile;
      this.companyData.logoFile = compressedFile;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.companyData.logo = e.target?.result as string;
        this.isLoading = false;
        // Mark the field as touched to show validation if needed
        this.touchedFields['logo'] = true;
      };
      reader.readAsDataURL(this.selectedLogoFile);
    } catch (error) {
      this.isLoading = false;
      console.error('Error compressing logo:', error);
    }
  }
}

  // Updated onFaviconChange method
  async onFaviconChange(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  // Reset size error when a new file is selected
  this.faviconSizeError = false;
  
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const maxSize = 1024 * 1024; // 1MB
    
    if (file.size > maxSize) {
      this.faviconSizeError = true;
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'Favicon must be less than 1MB'
      });
      input.value = '';
      return;
    }

    try {
      this.isLoading = true;
      const compressedFile = await this.compressImage(file, 800, 800, 0.7);
      this.selectedFaviconFile = compressedFile;
      this.companyData.faviconFile = compressedFile;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.companyData.favicon = e.target?.result as string;
        this.isLoading = false;
        // Mark the field as touched to show validation if needed
        this.touchedFields['favicon'] = true;
      };
      reader.readAsDataURL(this.selectedFaviconFile);
    } catch (error) {
      this.isLoading = false;
      console.error('Error compressing favicon:', error);
    }
  }
}

  removeLogo(event: Event): void {
  event.stopPropagation();
  this.companyData.logo = '';
  this.selectedLogoFile = null;
  this.companyData.logoFile = undefined;
  const logoInput = document.getElementById('logoUploadEdit') as HTMLInputElement;
  if (logoInput) logoInput.value = '';
  this.touchedFields['logo'] = true;
}

  removeFavicon(event: Event): void {
  event.stopPropagation();
  this.companyData.favicon = '';
  this.selectedFaviconFile = null;
  const faviconInput = document.getElementById('faviconUploadEdit') as HTMLInputElement;
  if (faviconInput) faviconInput.value = '';
  this.touchedFields['favicon'] = true;
}

  loadBanks() {
    this.http.get<Bank[]>('assets/json/banks.json').subscribe(
      (data) => {
        // Sort banks alphabetically by name (case-insensitive)
        this.banks = data.sort((a, b) => a.name.localeCompare(b.name));
        this.matchExistingBankToDropdown();
      },
      (error) => { }
    );
  }

  loadBranches() {
    this.http.get<BranchesData>('assets/json/branches.json').subscribe(
      (data) => {
        this.allBranches = data;
        this.matchExistingBankToDropdown();
      },
      (error) => { }
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
    const selectedBranch = this.branches.find((branch) => branch.ID === this.selectedBranchId);
    if (selectedBranch) {
      this.companyData.branchName = selectedBranch.name;
      this.invalidFields.delete('branchName');
    } else {
      this.companyData.branchName = '';
    }
  } else {
    this.companyData.branchName = '';
  }
  console.log('Selected branch:', this.companyData.branchName);
}

// Updated getCompanyData method to properly handle the response
getCompanyData() {
  if (this.itemId) {
    this.isLoading = true;
    this.collectionCenterSrv.getCompanyById(this.itemId).subscribe(
      (response: any) => {
        this.isLoading = false;
        this.companyData = response;
        
        // Set default values for contact number codes if they don't exist
        if (!this.companyData.oicConCode1) {
          this.companyData.oicConCode1 = '+94';
        }
        if (!this.companyData.oicConCode2) {
          this.companyData.oicConCode2 = '+94';
        }
        
        // Set confirmAccNumber to match accNumber for editing
        if (!this.companyData.confirmAccNumber && this.companyData.accNumber) {
          this.companyData.confirmAccNumber = this.companyData.accNumber;
        }
        
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
    if (this.companyNameError) {
      Swal.fire({
        icon: 'error',
        title: 'Company Name Exists',
        text: 'Please choose a different company name',
      });
      return;
    }
 // Validate contact numbers format and collect errors
  const contactNumberErrors: string[] = [];

  if (this.isInvalidMobileNumber('oicConNum1')) {
    contactNumberErrors.push('Please enter a valid Contact Number - 1 (format: +947XXXXXXXX)');
  }

  if (this.companyData.oicConNum2 && this.isInvalidMobileNumber('oicConNum2')) {
    contactNumberErrors.push('Please enter a valid Contact Number - 2 (format: +947XXXXXXXX)');
  }

  if (contactNumberErrors.length > 0) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Contact Numbers',
      html: contactNumberErrors.map((msg) => `<p>${msg}</p>`).join(''),
    });
    return;
  }
    if (
      this.companyData.oicConNum1 &&
      this.companyData.oicConNum2 &&
      this.companyData.oicConNum1 === this.companyData.oicConNum2 &&
      this.companyData.oicConCode1 === this.companyData.oicConCode2
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Duplicate Numbers',
        text: 'Contact Number - 1 and Contact Number - 2 cannot be the same',
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
          if (response.status) {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Company created successfully',
              timer: 2000,
              showConfirmButton: false,
            }).then(() => {
              // this.location.back();
              if (this.companyType === 'distribution') {
                this.router.navigate([
                  '/distribution-hub/action/view-companies',
                ]);
              } else {
                this.router.navigate(['/collection-hub/manage-company']);
              }
            });
          } else {
            Swal.fire('Error!', response.message, 'error');
          }
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
    // Mark all fields as touched to show validation messages
    this.touchedFields = {
      regNumber: true,
      companyNameEnglish: true,
      companyNameSinhala: true,
      companyNameTamil: true,
      email: true,
      logo: true,
      favicon: true
    };

    const missingFields: string[] = [];

    if (!this.companyData.regNumber) missingFields.push('Company Register Number');
    if (!this.companyData.companyNameEnglish) missingFields.push('Company Name (English)');
    if (!this.companyData.companyNameSinhala) missingFields.push('Company Name (Sinhala)');
    if (!this.companyData.companyNameTamil) missingFields.push('Company Name (Tamil)');
    if (!this.companyData.email) missingFields.push('Company Email');
    if (!this.companyData.logo) missingFields.push('Company Logo');
    if (!this.companyData.favicon) missingFields.push('Company Favicon');

    // Validate email format if email exists
    if (this.companyData.email && !this.isValidEmail(this.companyData.email)) {
      missingFields.push('Valid Email Address');
    }

    if (missingFields.length > 0) {
      // Create a more detailed error message
      let errorMessage = '<div class="text-left"><p class="mb-2">Please fix the following issues:</p><ul class="list-disc pl-5">';
      
      missingFields.forEach(field => {
        errorMessage += `<li>${field} is required</li>`;
        
        // Add specific guidance for certain fields
        if (field === 'Company Logo' || field === 'Company Favicon') {
          errorMessage += ` (must be an image less than 1MB)`;
        } else if (field === 'Valid Email Address') {
          errorMessage = errorMessage.replace('Valid Email Address is required', 'Please enter a valid email address (e.g., example@domain.com)');
        }
      });
      
      errorMessage += '</ul></div>';

      Swal.fire({
        icon: 'error',
        title: 'Missing Required Information',
        html: errorMessage,
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
          htmlContainer: 'text-left'
        }
      });
      return;
    }

    // Validate language-specific names
    if (this.englishInputError || this.sinhalaInputError || this.tamilInputError) {
      let languageError = '';
      if (this.englishInputError) languageError += 'English name contains invalid characters. ';
      if (this.sinhalaInputError) languageError += 'Sinhala name contains invalid characters. ';
      if (this.tamilInputError) languageError += 'Tamil name contains invalid characters.';
      
      Swal.fire({
        icon: 'error',
        title: 'Invalid Characters',
        text: languageError.trim(),
        confirmButtonText: 'OK'
      });
      return;
    }
  }

    this.selectedPage = page;
  }

  

  validateContactNumbers(): void {
  const num1 = this.companyData.oicConNum1?.toString() || '';
  const num2 = this.companyData.oicConNum2?.toString() || '';

  // Reset all error flags first
  this.contactNumberError1 = false;
  this.contactNumberError2 = false;
  this.sameNumberError = false;

  // Validate number 1 - only check length if there's content
  if (num1.length > 0 && num1.length !== 9) {
    this.contactNumberError1 = true;
  }

  // Validate number 2 - only check length if there's content
  if (num2.length > 0 && num2.length !== 9) {
    this.contactNumberError2 = true;
  }

  // Check for duplicate numbers ONLY if both numbers are complete and valid
  if (
    num1.length === 9 &&
    num2.length === 9 &&
    !this.contactNumberError1 &&
    !this.contactNumberError2 &&
    this.companyData.oicConNum1 === this.companyData.oicConNum2 &&
    this.companyData.oicConCode1 === this.companyData.oicConCode2
  ) {
    this.sameNumberError = true;
  }
}

  allowOnlyEnglishLetterss(event: KeyboardEvent): void {
    const key = event.key;
    const pattern = /^[a-zA-Z\s]$/;

    // Allow essential control keys
    if (
      key === 'Backspace' ||
      key === 'Delete' ||
      key === 'Tab' ||
      key === 'ArrowLeft' ||
      key === 'ArrowRight'
    ) {
      return;
    }

    if (!pattern.test(key)) {
      event.preventDefault();
    }
  }


  updateCompanyData() {
  // Validate email format
  if (this.companyData.email && !this.isValidEmail(this.companyData.email)) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Email',
      text: this.emailValidationMessage || 'Please enter a valid email address',
    });
    return;
  }

   // Validate contact numbers format and collect errors
  const contactNumberErrors: string[] = [];

  if (this.isInvalidMobileNumber('oicConNum1')) {
    contactNumberErrors.push('Please enter a valid Contact Number - 1 (format: +947XXXXXXXX)');
  }

  if (this.companyData.oicConNum2 && this.isInvalidMobileNumber('oicConNum2')) {
    contactNumberErrors.push('Please enter a valid Contact Number - 2 (format: +947XXXXXXXX)');
  }
  // Check for duplicate contact numbers
  if (
    this.companyData.oicConNum1 &&
    this.companyData.oicConNum2 &&
    this.companyData.oicConNum1 === this.companyData.oicConNum2 &&
    this.companyData.oicConCode1 === this.companyData.oicConCode2
  ) {
    Swal.fire({
      icon: 'error',
      title: 'Duplicate Contact Numbers',
      text: 'Contact Number 2 cannot be the same as Contact Number 1',
    });
    return;
  }
  if (contactNumberErrors.length > 0) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Contact Numbers',
      html: contactNumberErrors.map((msg) => `<p>${msg}</p>`).join(''),
    });
    return;
  }
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
          if (this.companyType === 'distribution') {
            this.router.navigate(['/distribution-hub/action/view-companies']);
          } else {
            this.router.navigate(['/collection-hub/manage-company']);
          }
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

    if (fieldName === 'email' && this.companyData.email) {
    this.isValidEmail(this.companyData.email);
  }

    if (fieldName === 'accHolderName' && this.companyData.accHolderName) {
    this.companyData.accHolderName = this.companyData.accHolderName.trim();
  }

    if (fieldName === 'confirmAccNumber') {
      this.validateConfirmAccNumber();
    }

    if (fieldName === 'foName') {
      const value = this.companyData.foName || '';
      const isValid = /^[a-zA-Z\s]+$/.test(value.trim());

      this.invalidFoName = !isValid;

      if (isValid) {
        this.companyData.foName = this.capitalizeFirstLetters(value);
      }
    }
  }
  capitalizeFirstLetters(value: string): string {
    return value
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }


  isFieldInvalid(fieldName: keyof Company): boolean {
  const value = this.companyData[fieldName];
  
  // Special handling for logo and favicon
  if (fieldName === 'logo' || fieldName === 'favicon') {
    return !!this.touchedFields[fieldName] && !value;
  }
  
  // For other fields
  return !!this.touchedFields[fieldName] && !value;
}

  // validateConfirmAccNumber(): void {
  //   // Reset both flags initially
  //   this.confirmAccountNumberRequired = false;
  //   this.confirmAccountNumberError = false;

  //   // Check if confirmAccNumber is empty
  //   if (
  //     !this.companyData.confirmAccNumber ||
  //     this.companyData.confirmAccNumber.toString().trim() === ''
  //   ) {
  //     this.confirmAccountNumberRequired = true;
  //     return;
  //   }

  //   // Check if both account numbers exist and match
  //   if (this.companyData.accNumber && this.companyData.confirmAccNumber) {
  //     this.confirmAccountNumberError =
  //       this.companyData.accNumber.toString() !==
  //       this.companyData.confirmAccNumber.toString();
  //   }
  // }

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

      validateAccNumber(): void {
   
    // Check if account numbers match
    if (this.companyData.accNumber && this.companyData.confirmAccNumber) {
      this.confirmAccountNumberError =
        this.companyData.accNumber !== this.companyData.confirmAccNumber;
    } else {
      this.confirmAccountNumberError = false;
    }
  }


isValidEmail(email: string): boolean {
  // Reset validation message
  this.emailValidationMessage = '';
  
  // Check if email is empty
  if (!email) {
    return false;
  }
  
  // Trim the email
  const trimmedEmail = email.trim();
  
  // Check for empty string after trimming
  if (trimmedEmail === '') {
    this.emailValidationMessage = 'Email is required.';
    return false;
  }
  
  // Check for consecutive dots
  if (trimmedEmail.includes('..')) {
    this.emailValidationMessage = 'Email cannot contain consecutive dots.';
    return false;
  }
  
  // Check for leading dot
  if (trimmedEmail.startsWith('.')) {
    this.emailValidationMessage = 'Email cannot start with a dot.';
    return false;
  }
  
  // Check for trailing dot
  if (trimmedEmail.endsWith('.')) {
    this.emailValidationMessage = 'Email cannot end with a dot.';
    return false;
  }

  if (trimmedEmail.endsWith('.@')) {
    this.emailValidationMessage = 'Email cannot end with a dot.@';
    return false;
  }
  
  // Check for invalid characters (allow letters, numbers, plus sign, and specific special characters)
  const invalidCharRegex = /[^a-zA-Z0-9@._%+-]/;
  if (invalidCharRegex.test(trimmedEmail)) {
    this.emailValidationMessage = 'Email contains invalid characters. Only letters, numbers, and @ . _ % + - are allowed.';
    return false;
  }
  
  // Basic email format validation
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailPattern.test(trimmedEmail)) {
    this.emailValidationMessage = 'Please enter a valid email in the format: example@domain.com';
    return false;
  }
  
  // Check domain has at least one dot
  const domainPart = trimmedEmail.split('@')[1];
  if (!domainPart || domainPart.indexOf('.') === -1) {
    this.emailValidationMessage = 'Please enter a valid email domain.';
    return false;
  }
  
  // NEW: Validate top-level domain - only allow .com and .lk
  const tld = domainPart.split('.').pop()?.toLowerCase();
  const allowedTlds = ['com', 'lk'];
  
  if (!tld || !allowedTlds.includes(tld)) {
    this.emailValidationMessage = 'Only .com and .lk domains are allowed.';
    return false;
  }
  
  return true;
}

onCancel() {
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
    buttonsStyling: true,
  }).then((result) => {
    if (result.isConfirmed) {
      // Navigate back to the previous page
      window.history.back();
      
      // Alternative if you need more control:
      // this.location.back();
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





allowOnlyEnglishLetters(event: KeyboardEvent): void {
  const regex = /^[^\d]$/;

  const key = event.key;

    if (!regex.test(key) && key.length === 1) {
      event.preventDefault();
      this.englishInputError = true;

      // Automatically hide the error after 2 seconds
      setTimeout(() => {
        this.englishInputError = false;
      }, 2000);
    }
  }

  capitalizeFirstLetter(field: 'companyNameEnglish' | 'foName' | 'accHolderName'): void {
    const currentValue = this.companyData[field];
    if (currentValue && currentValue.length > 0) {
      this.companyData[field] = currentValue.charAt(0).toUpperCase() + currentValue.slice(1);
    }
  }

  

allowOnlyValidNameCharacters(event: KeyboardEvent): void {
  const allowedPattern = /^[a-zA-Z\s]$/;

    const key = event.key;

    // Allow control keys like Backspace, Delete, Arrow keys, etc.
    if (
      key === 'Backspace' ||
      key === 'Delete' ||
      key === 'ArrowLeft' ||
      key === 'ArrowRight' ||
      key === 'Tab'
    ) {
      this.invalidCharError = false;
      return;
    }

    // If not matching allowed pattern
    if (!allowedPattern.test(key)) {
      event.preventDefault();
      this.invalidCharError = true;
    } else {
      this.invalidCharError = false;
    }
  }

  allowOnlyDigits(event: KeyboardEvent): void {
    const key = event.key;
    const isDigit = /^[0-9]$/.test(key);

    if (!isDigit && key.length === 1) {
      event.preventDefault();
      this.accountNumberError = true;

      // Hide error after 2 seconds
      setTimeout(() => {
        this.accountNumberError = false;
      }, 2000);
    }
  }



  allowOnlySinhalaLetters(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    // Sinhala Unicode range: U+0D80 - U+0DFF
    if ((charCode < 0x0D80 || charCode > 0x0DFF) && event.key.length === 1) {
      event.preventDefault();
      this.sinhalaInputError = true;

      setTimeout(() => {
        this.sinhalaInputError = false;
      }, 2000);
    }
  }

  allowOnlyTamilLetters(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    // Tamil Unicode range: U+0B80 - U+0BFF
    if ((charCode < 0x0B80 || charCode > 0x0BFF) && event.key.length === 1) {
      event.preventDefault();
      this.tamilInputError = true;

      setTimeout(() => {
        this.tamilInputError = false;
      }, 2000);
    }
  }





  


  validateContactNumberss() {
    const num1 = this.companyData.oicConNum1?.toString() || '';
    const num2 = this.companyData.oicConNum2?.toString() || '';

    this.contactNumberError1 = num1.length !== 9 && num1.length > 0;
    this.contactNumberError2 = num2.length !== 9 && num2.length > 0;
  }


  checkCompanyName(): void {
    const companyName = this.companyData.companyNameEnglish;

    if (!companyName) {
      this.companyNameError = '';
      return;
    }

    this.isCheckingCompanyName = true;
    this.companyNameError = '';

    this.collectionCenterSrv.checkCompanyNameExists(companyName).subscribe({
      next: (exists) => {
        this.isCheckingCompanyName = false;
        if (exists) {
          this.companyNameError = 'This company name already exists';
        }
      },
      error: () => {
        this.isCheckingCompanyName = false;
        this.companyNameError = 'Error checking company name availability';
      },
    });
  }

  trimLeadingSpaces(value: string): string {
  return value ? value.replace(/^\s+/, '') : value;
}

getContactNumber1ErrorMessage(): string {
  const num1 = this.companyData.oicConNum1?.toString() || '';
  
  // Priority 1: Required validation
  if (!num1) {
    return 'Contact Number 1 is required.';
  }
  
  // Priority 2: Format validation
  if (this.isInvalidMobileNumber('oicConNum1')) {
    return 'Please enter a valid Contact Number - 1 (format: +947XXXXXXXX)';
  }
  
  // Priority 3: Length validation
  if (this.contactNumberError1) {
    return 'Contact number must be exactly 9 digits.';
  }
  
  return '';
}

getContactNumber2ErrorMessage(): string {
  const num2 = this.companyData.oicConNum2?.toString() || '';
  
  // If no value, no error (this field is optional)
  if (!num2) {
    return '';
  }
  
  // Priority 1: Format validation
  if (this.isInvalidMobileNumber('oicConNum2')) {
    return 'Please enter a valid Contact Number - 2 (format: +947XXXXXXXX)';
  }
  
  // Priority 2: Length validation
  if (this.contactNumberError2) {
    return 'Contact number must be exactly 9 digits.';
  }
  
  // Priority 3: Duplicate validation
  if (this.sameNumberError) {
    return 'Contact number 2 cannot be the same as Contact number 1.';
  }
  
  return '';
}

}

// Updated Company class to match the JSON response structure
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
  status!: number;
  isCollection!: number;
  isDistributed!: number;
  createdAt!: string;
}
