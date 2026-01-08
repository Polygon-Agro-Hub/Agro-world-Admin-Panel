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


  isInvalidMobileNumber(numberField: 'oicConNum1' | 'oicConNum2'): boolean {
    const code = numberField === 'oicConNum1' ? this.companyData.oicConCode1 : this.companyData.oicConCode2;
    const number = numberField === 'oicConNum1' ? this.companyData.oicConNum1 : this.companyData.oicConNum2;

    if (!code || !number || number.toString().length !== 9) {
      return false;
    }

    const fullNumber = `${code}${number}`;

    const mobilePattern = /^\+947\d{8}$/;
    return !mobilePattern.test(fullNumber);
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


  allowOnlyLetters(event: KeyboardEvent, inputValue: string, fieldName: string) {
    const char = event.key;
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'];

    if (allowedKeys.includes(char)) return;

    if (fieldName === 'companyNameEnglish') {
      if (!/^[\p{L}\p{Nd} .'&-]$/u.test(char)) {
        event.preventDefault();
        this.englishInputError = true;
        setTimeout(() => {
          this.englishInputError = false;
        }, 2000);
      }
      return;
    }

    if (/\p{Nd}/u.test(char)) {
      event.preventDefault();
      this.englishInputError = true;
      setTimeout(() => {
        this.englishInputError = false;
      }, 2000);
      return;
    }

    if (char === ' ' && inputValue.length === 0) {
      event.preventDefault();
      return;
    }

    if (!/^\p{L}$|^ $/u.test(char)) {
      event.preventDefault();
      this.englishInputError = true;
      setTimeout(() => {
        this.englishInputError = false;
      }, 2000);
    }
  }

  back(): void {
    if (!this.isView) {
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
    } else {
      window.history.back();
    }
  }

  allowOnlySinhala(event: KeyboardEvent, inputValue: string) {
    const char = event.key;
    const code = char.charCodeAt(0);
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'];

    if (allowedKeys.includes(char)) return;

    if (/^[0-9]$/.test(char) || /[^\w\s\u0D80-\u0DFF]/.test(char)) {
      event.preventDefault();
      this.sinhalaInputError = true;
      setTimeout(() => {
        this.sinhalaInputError = false;
      }, 2000);
      return;
    }

    if (char === ' ' && inputValue.length === 0) {
      event.preventDefault();
      return;
    }

    const isSinhala = code >= 0x0D80 && code <= 0x0DFF;

    if (!isSinhala && char !== ' ') {
      event.preventDefault();
      this.sinhalaInputError = true;
      setTimeout(() => {
        this.sinhalaInputError = false;
      }, 2000);
    }
  }

  allowOnlyTamil(event: KeyboardEvent, inputValue: string) {
    const char = event.key;
    const code = char.charCodeAt(0);
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'];

    if (allowedKeys.includes(char)) return;

    if (/^[0-9]$/.test(char) || /[^\w\s\u0B80-\u0BFF]/.test(char)) {
      event.preventDefault();
      this.tamilInputError = true;
      setTimeout(() => {
        this.tamilInputError = false;
      }, 2000);
      return;
    }

    if (char === ' ' && inputValue.length === 0) {
      event.preventDefault();
      return;
    }

    const isTamil = code >= 0x0B80 && code <= 0x0BFF;

    if (!isTamil && char !== ' ') {
      event.preventDefault();
      this.tamilInputError = true;
      setTimeout(() => {
        this.tamilInputError = false;
      }, 2000);
    }
  }

  allowOnlyEnglishLettersForAccountHolder(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const char = event.key;
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'];

    if (allowedKeys.includes(char)) return;

    if (char === ' ' && (input.selectionStart === 0 || input.value.endsWith(' '))) {
      event.preventDefault();
      return;
    }

    if (!/^[a-zA-Z\s]$/.test(char)) {
      event.preventDefault();
      this.invalidCharError = true;
      setTimeout(() => {
        this.invalidCharError = false;
      }, 2000);
    }
  }

  allowOnlyDigitsForAccountNumber(event: KeyboardEvent, field: 'accNumber' | 'confirmAccNumber' | 'oicConNum1' | 'oicConNum2'): void {
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
    const englishOnlyFields = ['accHolderName', 'foName'];
    const emailFields = ['email'];
    const sinhalaFields = [''];
    const tamilFields = [''];
    const businessNameFields = ['companyNameEnglish'];

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

    if (businessNameFields.includes(fieldName)) {
  if (!/^[\p{L}\p{Nd} .'&\-()\/,#]$/u.test(key)) {
    event.preventDefault();
    this.englishInputError = true;
    setTimeout(() => {
      this.englishInputError = false;
    }, 2000);
    return;
  }
}

    if (emailFields.includes(fieldName)) {
      return;
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
    this.logoSizeError = false;

    if (input.files && input.files[0]) {
      const file = input.files[0];
      const maxSize = 1024 * 1024; 

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
          this.touchedFields['logo'] = true;
        };
        reader.readAsDataURL(this.selectedLogoFile);
      } catch (error) {
        this.isLoading = false;
        console.error('Error compressing logo:', error);
      }
    }
  }

  async onFaviconChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    this.faviconSizeError = false;

    if (input.files && input.files[0]) {
      const file = input.files[0];
      const maxSize = 1024 * 1024;

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
    const logoInput = document.getElementById('logoUpload') as HTMLInputElement;
    if (logoInput) logoInput.value = '';
    this.touchedFields['logo'] = true;
  }

  removeFavicon(event: Event): void {
    event.stopPropagation();
    this.companyData.favicon = '';
    this.selectedFaviconFile = null;
    const faviconInput = document.getElementById('faviconUpload') as HTMLInputElement;
    if (faviconInput) faviconInput.value = '';
    this.touchedFields['favicon'] = true;
  }

  loadBanks() {
    this.http.get<Bank[]>('assets/json/banks.json').subscribe(
      (data) => {
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
  }

  onBankChange() {
    if (this.selectedBankId) {
      this.branches = (
        this.allBranches[this.selectedBankId.toString()] || []
      ).sort((a, b) => a.name.localeCompare(b.name));

      const selectedBank = this.banks.find(
        (bank) => bank.ID === this.selectedBankId
      );
      if (selectedBank) {
        this.companyData.bankName = selectedBank.name;
      }

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
  }

  getCompanyData() {
    if (this.itemId) {
      this.isLoading = true;
      this.collectionCenterSrv.getCompanyById(this.itemId).subscribe(
        (response: any) => {
          this.isLoading = false;
          this.companyData = response;

          if (!this.companyData.oicConCode1) {
            this.companyData.oicConCode1 = '+94';
          }
          if (!this.companyData.oicConCode2) {
            this.companyData.oicConCode2 = '+94';
          }

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

  isValidLocalMobile(number: string | number): boolean {
    if (!number) return false;
  
    const numStr = number.toString();
    const pattern = /^7\d{8}$/;
    return pattern.test(numStr);
  }

  saveCompanyData() {
  if (this.companyNameError) {
    Swal.fire({
      icon: 'error',
      title: 'Company Name Exists',
      text: 'Please choose a different company name',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
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
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    });
    return;
  }

  if (this.companyData.accNumber !== this.companyData.confirmAccNumber) {
    Swal.fire({
      icon: 'error',
      title: 'Account Numbers Mismatch',
      text: 'Account number and confirm account number do not match',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    });
    return;
  }

  const missingFields: string[] = [];
  if (!this.companyData.regNumber) missingFields.push('Registration Number is Required') ;
  if (!this.companyData.companyNameEnglish) missingFields.push('Company Name (English) is Required');
  if (!this.companyData.companyNameSinhala) missingFields.push('Company Name (Sinhala) is Required');
  if (!this.companyData.companyNameTamil) missingFields.push('Company Name (Tamil) is Required');
  if (!this.companyData.email) missingFields.push('Email is Required');
  if (!this.companyData.accHolderName) missingFields.push(`Account Holder's Name is Required`);
  if (!this.companyData.accNumber) missingFields.push('Account Number is Required');
  if (!this.companyData.confirmAccNumber) missingFields.push('Confirm Account Number is Required');
  if (!this.companyData.bankName) missingFields.push('Bank Name is Required');
  if (!this.companyData.branchName) missingFields.push('Branch Name is Required');
  if (!this.companyData.foName) missingFields.push('Finance Officer Name is Required');
  if (!this.companyData.oicConNum1) missingFields.push('Contact Number 1 is Required');
  if (this.companyData.oicConNum1 && !this.isValidLocalMobile(this.companyData.oicConNum1)) {
    missingFields.push('Please enter a valid Contact Number - 1 (format: 7XXXXXXXX)');
  }
  if (this.companyData.oicConNum2 && !this.isValidLocalMobile(this.companyData.oicConNum2)) {
    missingFields.push('Please enter a valid Contact Number - 2 (format: 7XXXXXXXX)');
  }
  if (!this.companyData.logo) missingFields.push('Company Logo (must be an image <1MB)');
  if (!this.companyData.favicon) missingFields.push('Company Favicon (must be an image <1MB)');

  if (missingFields.length > 0) {
    Swal.fire({
      icon: 'error',
      title: 'Missing Required Information',
      html: `<div class="text-left"><p class="mb-2">Please fill in the following fields:</p><ul class="list-disc pl-5">${missingFields.map(f => `<li>${f}</li>`).join('')}</ul></div>`,
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
        htmlContainer: 'text-left',
      },
    });
    return;
  }

  if (!this.isValidEmail(this.companyData.email)) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Email',
      text: 'Please enter a valid email address (e.g., example@domain.com)',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    });
    return;
  }

  this.isLoading = true;
  const formData = new FormData();
  Object.entries(this.companyData).forEach(([key, value]) => {
    if (key !== 'logoFile' && key !== 'faviconFile' && value != null) {
      formData.append(key, String(value));
    }
  });
  if (this.companyData.logoFile) formData.append('logo', this.companyData.logoFile);
  if (this.companyData.faviconFile) formData.append('favicon', this.companyData.faviconFile);

  this.collectionCenterSrv.createCompany(this.companyData, this.companyType).subscribe(
    (response) => {
      this.isLoading = false;
      if (response.status) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Company created successfully',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        }).then(() => {
          if (this.companyType === 'distribution') {
            this.router.navigate(['/distribution-hub/action/view-companies']);
          } else {
            this.router.navigate(['/collection-hub/manage-company']);
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.message,
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
      }
    },
    (error) => {
      this.isLoading = false;
      let errorMessage = 'Failed to create company. Please try again.';
      if (error.error?.message) errorMessage = error.error.message;
      else if (error.status === 0) errorMessage = 'Unable to connect to server. Please check your connection.';

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });
    }
  );
}

  nextFormCreate(page: 'pageOne' | 'pageTwo') {
    if (page === 'pageTwo') {
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

      if (!this.companyData.regNumber) missingFields.push('Company Register Number is Required');
      if (!this.companyData.companyNameEnglish) missingFields.push('Company Name (English) is Required');
      if (!this.companyData.companyNameSinhala) missingFields.push('Company Name (Sinhala) is Required');
      if (!this.companyData.companyNameTamil) missingFields.push('Company Name (Tamil) is Required');
      if (!this.companyData.email) missingFields.push('Company Email is Required');
      if (!this.companyData.logo) missingFields.push('Company Logo is Required');
      if (!this.companyData.favicon) missingFields.push('Company Favicon is Required');

      if (this.companyData.email && !this.isValidEmail(this.companyData.email)) {
        missingFields.push('Valid Email Address');
      }

      if (missingFields.length > 0) {
        let errorMessage = '<div class="text-left"><p class="mb-2">Please fix the following issues:</p><ul class="list-disc pl-5">';

        missingFields.forEach(field => {
          errorMessage += `<li>${field}</li>`;

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

    this.contactNumberError1 = false;
    this.contactNumberError2 = false;
    this.sameNumberError = false;

    if (num1.length > 0 && num1.length !== 9) {
      this.contactNumberError1 = true;
    }

    if (num2.length > 0 && num2.length !== 9) {
      this.contactNumberError2 = true;
    }

    
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
  
  if (!this.itemId) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No company ID found for update',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    });
    return;
  }

  
  const missingFields: string[] = [];
  if (!this.companyData.regNumber) missingFields.push('Registration Number is Required');
  if (!this.companyData.companyNameEnglish) missingFields.push('Company Name (English) is Required');
  if (!this.companyData.companyNameSinhala) missingFields.push('Company Name (Sinhala) is Required');
  if (!this.companyData.companyNameTamil) missingFields.push('Company Name (Tamil) is Required');
  if (!this.companyData.email) missingFields.push('Email is Required');
  if (!this.companyData.accHolderName) missingFields.push(`Account Holder's Name is Required`);
  if (!this.companyData.accNumber) missingFields.push('Account Number is Required');
  if (!this.companyData.confirmAccNumber) missingFields.push('Confirm Account Number is Required');
  if (!this.companyData.bankName) missingFields.push('Bank Name is Required');
  if (!this.companyData.branchName) missingFields.push('Branch Name is Required');
  if (!this.companyData.foName) missingFields.push('Finance Officer Name is Required');
  if (!this.companyData.oicConNum1) missingFields.push('Contact Number 1 is Required');
  if (this.companyData.oicConNum1 && !this.isValidLocalMobile(this.companyData.oicConNum1)) {
    missingFields.push('Please enter a valid Contact Number - 1 (format: 7XXXXXXXX)');
  }
  if (this.companyData.oicConNum2 && !this.isValidLocalMobile(this.companyData.oicConNum2)) {
    missingFields.push('Please enter a valid Contact Number - 2 (format: 7XXXXXXXX)');
  }
  if (!this.companyData.logo) missingFields.push('Company Logo is Required');
  if (!this.companyData.favicon) missingFields.push('Company Favicon is Required');

  if (missingFields.length > 0) {
    Swal.fire({
      icon: 'error',
      title: 'Missing Required Information',
      html: `<div class="text-left"><ul class="list-disc pl-5">${missingFields
        .map(f => `<li>${f}</li>`)
        .join('')}</ul></div>`,
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
        htmlContainer: 'text-left',
      },
    });
    return;
  }

  
  if (this.companyData.email && !this.isValidEmail(this.companyData.email)) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Email',
      text: this.emailValidationMessage || 'Please enter a valid email address (e.g., example@domain.com)',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    });
    return;
  }

  
  const contactNumberErrors: string[] = [];
  if (this.isInvalidMobileNumber('oicConNum1')) {
    contactNumberErrors.push('Please enter a valid Contact Number - 1 (format: +947XXXXXXXX)');
  }
  if (this.companyData.oicConNum2 && this.isInvalidMobileNumber('oicConNum2')) {
    contactNumberErrors.push('Please enter a valid Contact Number - 2 (format: +947XXXXXXXX)');
  }


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
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    });
    return;
  }

  if (contactNumberErrors.length > 0) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Contact Numbers',
      html: `<div class="text-left"><ul class="list-disc pl-5">${contactNumberErrors
        .map(msg => `<li>${msg}</li>`)
        .join('')}</ul></div>`,
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
        htmlContainer: 'text-left',
      },
    });
    return;
  }

  
  if (this.companyData.accNumber !== this.companyData.confirmAccNumber) {
    Swal.fire({
      icon: 'error',
      title: 'Account Numbers Mismatch',
      text: 'Account number and confirm account number do not match',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    });
    return;
  }

  
  this.isLoading = true;
  const formData = new FormData();
  Object.entries(this.companyData).forEach(([key, value]) => {
    if (key !== 'logoFile' && key !== 'faviconFile' && value != null) {
      formData.append(key, String(value));
    }
  });
  if (this.companyData.logoFile) formData.append('logo', this.companyData.logoFile);
  if (this.companyData.faviconFile) formData.append('favicon', this.companyData.faviconFile);

  
  this.collectionCenterSrv.updateCompany(this.companyData, this.itemId!).subscribe(
    (response) => {
      this.isLoading = false;
      if (response.status) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Company Updated Successfully',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        }).then(() => {
          if (this.companyType === 'distribution') {
            this.router.navigate(['/distribution-hub/action/view-companies']);
          } else {
            this.router.navigate(['/collection-hub/manage-company']);
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.message || 'Failed to update company',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
      }
    },
    (error) => {
      this.isLoading = false;
      let errorMessage = 'Failed to update company. Please try again.';
      if (error.error?.message) errorMessage = error.error.message;
      else if (error.status === 0) errorMessage = 'Unable to connect to server. Please check your connection.';

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });
    }
  );
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

    if (fieldName === 'logo' || fieldName === 'favicon') {
      return !!this.touchedFields[fieldName] && !value;
    }

    return !!this.touchedFields[fieldName] && !value;
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

  validateAccNumber(): void {

   
    if (this.companyData.accNumber && this.companyData.confirmAccNumber) {
      this.confirmAccountNumberError =
        this.companyData.accNumber !== this.companyData.confirmAccNumber;
    } else {
      this.confirmAccountNumberError = false;
    }
  }


  isValidEmail(email: string): boolean {
    
    this.emailValidationMessage = '';

    if (!email) {
      return false;
    }

    const trimmedEmail = email.trim();

    if (trimmedEmail === '') {
      this.emailValidationMessage = 'Email is required.';
      return false;
    }

    if (trimmedEmail.includes('..')) {
      this.emailValidationMessage = 'Email cannot contain consecutive dots.';
      return false;
    }

    if (trimmedEmail.startsWith('.')) {
      this.emailValidationMessage = 'Email cannot start with a dot.';
      return false;
    }

    if (trimmedEmail.endsWith('.')) {
      this.emailValidationMessage = 'Email cannot end with a dot.';
      return false;
    }

    if (trimmedEmail.endsWith('.@')) {
      this.emailValidationMessage = 'Email cannot end with a dot.@';
      return false;
    }

    const invalidCharRegex = /[^a-zA-Z0-9@._%+-]/;
    if (invalidCharRegex.test(trimmedEmail)) {
      this.emailValidationMessage = 'Email contains invalid characters. Only letters, numbers, and @ . _ % + - are allowed.';
      return false;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(trimmedEmail)) {
      this.emailValidationMessage = 'Please enter a valid email in the format: example@domain.com';
      return false;
    }

    const domainPart = trimmedEmail.split('@')[1];
    if (!domainPart || domainPart.indexOf('.') === -1) {
      this.emailValidationMessage = 'Please enter a valid email domain.';
      return false;
    }

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
        window.history.back();
      }
    });
  }




  numberOnly(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;

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

      setTimeout(() => {
        this.accountNumberError = false;
      }, 2000);
    }
  }



  allowOnlySinhalaLetters(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
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

    if (!num1) {
      return 'Contact Number 1 is required.';
    }

    if (this.isInvalidMobileNumber('oicConNum1')) {
      return 'Please enter a valid Contact Number - 1 (format: +947XXXXXXXX)';
    }

    if (this.contactNumberError1) {
      return 'Please enter a valid Contact Number - 1 (format: +947XXXXXXXX)';
    }

    return '';
  }

  getContactNumber2ErrorMessage(): string {
    const num2 = this.companyData.oicConNum2?.toString() || '';

    if (!num2) {
      return '';
    }

    if (this.isInvalidMobileNumber('oicConNum2')) {
      return 'Please enter a valid Contact Number - 2 (format: +947XXXXXXXX)';
    }

    if (this.contactNumberError2) {
      return 'Please enter a valid Contact Number - 2 (format: +947XXXXXXXX)';
    }

    if (this.sameNumberError) {
      return 'Contact number 2 cannot be the same as Contact number 1.';
    }

    return '';
  }

  onTrimInput(event: Event, modelRef: any, fieldName: string): void {
    const inputElement = event.target as HTMLInputElement;
  
    const trimmedValue = inputElement.value.replace(/^\s+/, '');
  
    modelRef[fieldName] = trimmedValue;
    inputElement.value = trimmedValue;
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
  status!: number;
  isCollection!: number;
  isDistributed!: number;
  createdAt!: string;
}
