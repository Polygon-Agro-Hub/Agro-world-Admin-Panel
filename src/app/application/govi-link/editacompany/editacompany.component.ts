import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { GoviLinkService } from '../../../services/govi-link/govi-link.service';
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
  selector: 'app-editacompany',
  standalone: true,
  imports: [LoadingSpinnerComponent, CommonModule, FormsModule, DropdownModule],
  templateUrl: './editacompany.component.html',
  styleUrl: './editacompany.component.css'
})
export class EditacompanyComponent {
  isLoading = false;
  isView: boolean = false;
  logoSizeError: boolean = false;
  selectedLogoFile: File | null = null;
  companyData: Company = new Company();
  touchedFields: { [key in keyof Company]?: boolean } = {};
  englishInputError: boolean = false;
  emailValidationMessage: string = '';
  invalidCharError: boolean = false;
  confirmAccountNumberError: boolean = false;
  accountNumberError: boolean = false;
  confirmAccountNumberRequired: boolean = false;
  selectedBankId: number | null = null;
  banks: Bank[] = [];
  branches: Branch[] = [];
  allBranches: BranchesData = {};
  selectedBranchId: number | null = null;
  invalidFields: Set<string> = new Set();
  contactNumberError1: boolean = false;
  contactNumberError2: boolean = false;
  sameNumberError: boolean = false;
  itemId: number | null = null;
  userForm: FormGroup;

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
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private goviLinkSrv: GoviLinkService
  ) {
    this.userForm = this.fb.group({
      RegNumber: ['', Validators.required],
      companyName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneCode1: ['', Validators.required],
      phoneNumber1: ['', Validators.required],
      phoneCode2: [''],
      phoneNumber2: [''],
      accHolderName: ['', Validators.required],
      accNumber: ['', Validators.required],
      bank: ['', Validators.required],
      branch: ['', Validators.required],
      financeOfficerName: ['', Validators.required],
    });


    // Initialize modifyBy with a default value
    this.companyData.modifyBy = 'system'; // You can get this from your auth service
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.itemId = params['id'] ? +params['id'] : null;
      this.isView = params['isView'] === 'true';
    });

    if (!this.companyData.phoneCode1) {
      this.companyData.phoneCode1 = '+94';
    }
    if (!this.companyData.phoneCode2) {
      this.companyData.phoneCode2 = '+94';
    }

    this.loadBanks();
    this.loadBranches();
    this.userForm.valueChanges.subscribe((formValues) => {
      this.companyData = { ...this.companyData, ...formValues };
    });

    if (this.itemId) {
      this.getCompanyData();
    }
  }

  getCompanyData() {
    if (this.itemId) {
      this.isLoading = true;
      this.goviLinkSrv.getCompanyById(this.itemId).subscribe(
        (response: any) => {
          this.isLoading = false;
          this.companyData = response;

          // Set default values for contact number codes if they don't exist
          if (!this.companyData.phoneCode1) {
            this.companyData.phoneCode1 = '+94';
          }
          if (!this.companyData.phoneCode2) {
            this.companyData.phoneCode2 = '+94';
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

  matchExistingBankToDropdown() {
    if (
      this.banks.length > 0 &&
      Object.keys(this.allBranches).length > 0 &&
      this.companyData &&
      this.companyData.bank
    ) {
      const matchedBank = this.banks.find(
        (bank) => bank.name === this.companyData.bank
      );

      if (matchedBank) {
        this.selectedBankId = matchedBank.ID;
        this.branches = this.allBranches[this.selectedBankId.toString()] || [];

        if (this.companyData.branch) {
          const matchedBranch = this.branches.find(
            (branch) => branch.name === this.companyData.branch
          );
          if (matchedBranch) {
            this.selectedBranchId = matchedBranch.ID;
          }
        }
      }
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

  isFieldInvalid(fieldName: keyof Company): boolean {
    const value = this.companyData[fieldName];

    // Special handling for logo
    if (fieldName === 'logo') {
      return !!this.touchedFields[fieldName] && !value;
    }

    // Special handling for bank and branch (they come from dropdowns)
    if (fieldName === 'bank') {
      return !!this.touchedFields[fieldName] && (!value || !this.selectedBankId);
    }

    if (fieldName === 'branch') {
      return !!this.touchedFields[fieldName] && (!value || !this.selectedBranchId);
    }

    // For other fields
    return !!this.touchedFields[fieldName] && (!value || value.toString().trim() === '');
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

    const numericFields = ['accNumber', 'confirmAccNumber', 'phoneNumber1', 'phoneNumber2'];
    const englishOnlyFields = ['accHolderName', 'financeOfficerName'];
    const emailFields = ['email'];
    const businessNameFields = ['companyName'];

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
      // Allow letters, numbers, spaces, and common business characters
      if (!/^[\p{L}\p{Nd} .'&\-()\/,#]$/u.test(key)) {
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

  trimLeadingSpaces(value: string): string {
    return value ? value.replace(/^\s+/, '') : value;
  }

  capitalizeFirstLetter(field: 'companyName' | 'financeOfficerName' | 'accHolderName'): void {
    const currentValue = this.companyData[field];
    if (currentValue && currentValue.length > 0) {
      this.companyData[field] = currentValue.charAt(0).toUpperCase() + currentValue.slice(1);
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

  validateAccNumber(): void {
    // Check if account numbers match
    if (this.companyData.accNumber && this.companyData.confirmAccNumber) {
      this.confirmAccountNumberError =
        this.companyData.accNumber !== this.companyData.confirmAccNumber;
    } else {
      this.confirmAccountNumberError = false;
    }
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

  allowOnlyDigitsForAccountNumber(event: KeyboardEvent, field: 'accNumber' | 'confirmAccNumber' | 'phoneNumber1' | 'phoneNumber2'): void {
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
        this.companyData.bank = selectedBank.name;
      }

      // Reset branch selection if the current selection doesn't belong to this bank
      const currentBranch = this.branches.find(
        (branch) => branch.ID === this.selectedBranchId
      );
      if (!currentBranch) {
        this.selectedBranchId = null;
        this.companyData.branch = '';
      }
    } else {
      this.branches = [];
      this.companyData.bank = '';
    }
  }

  onBranchChange() {
    if (this.selectedBranchId) {
      const selectedBranch = this.branches.find((branch) => branch.ID === this.selectedBranchId);
      if (selectedBranch) {
        this.companyData.branch = selectedBranch.name;
        this.invalidFields.delete('branch');
      } else {
        this.companyData.branch = '';
      }
    } else {
      this.companyData.branch = '';
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

  validateContactNumbers(): void {
    const num1 = this.companyData.phoneNumber1?.toString() || '';
    const num2 = this.companyData.phoneNumber2?.toString() || '';

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
      this.companyData.phoneNumber1 === this.companyData.phoneNumber2 &&
      this.companyData.phoneCode1 === this.companyData.phoneCode2
    ) {
      this.sameNumberError = true;
    }
  }

  getFlagUrl(countryCode: string): string {
    return `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`;
  }

  getContactNumber1ErrorMessage(): string {
    const num1 = this.companyData.phoneNumber1?.toString() || '';

    // Priority 1: Required validation
    if (!num1) {
      return 'Contact Number 1 is required.';
    }

    // Priority 2: Format validation
    if (this.isInvalidMobileNumber('phoneNumber1')) {
      return 'Please enter a valid Contact Number - 1 (format: +947XXXXXXXX)';
    }

    // Priority 3: Length validation
    if (this.contactNumberError1) {
      return 'Please enter a valid Contact Number - 1 (format: +947XXXXXXXX)';
    }

    return '';
  }

  isInvalidMobileNumber(numberField: 'phoneNumber1' | 'phoneNumber2'): boolean {
    const code = numberField === 'phoneNumber1' ? this.companyData.phoneCode1 : this.companyData.phoneCode2;
    const number = numberField === 'phoneNumber1' ? this.companyData.phoneNumber1 : this.companyData.phoneNumber2;

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

  getContactNumber2ErrorMessage(): string {
    const num2 = this.companyData.phoneNumber2?.toString() || '';

    // If no value, no error (this field is optional)
    if (!num2) {
      return '';
    }

    // Priority 1: Format validation
    if (this.isInvalidMobileNumber('phoneNumber2')) {
      return 'Please enter a valid Contact Number - 2 (format: +947XXXXXXXX)';
    }

    // Priority 2: Length validation
    if (this.contactNumberError2) {
      return 'Please enter a valid Contact Number - 2 (format: +947XXXXXXXX)';
    }

    // Priority 3: Duplicate validation
    if (this.sameNumberError) {
      return 'Contact number 2 cannot be the same as Contact number 1.';
    }

    return '';
  }

  // Helper method to convert file to base64
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // Form validation method
  isFormValid(): boolean {
    const requiredFields: (keyof Company)[] = [
      'RegNumber',
      'companyName',
      'email',
      'financeOfficerName',
      'accHolderName',
      'accNumber',
      'confirmAccNumber',
      'bank',
      'branch',
      'phoneCode1',
      'phoneNumber1'
    ];

    for (const field of requiredFields) {
      const fieldValue = this.companyData[field];
      if (!fieldValue || fieldValue.toString().trim() === '') {
        return false;
      }
    }

    // Additional validations
    if (!this.isValidEmail(this.companyData.email)) {
      return false;
    }

    if (this.companyData.accNumber !== this.companyData.confirmAccNumber) {
      return false;
    }

    if (this.contactNumberError1 || this.sameNumberError) {
      return false;
    }

    return true;
  }

  // Add this new method to get detailed validation errors
  getValidationErrors(): string[] {
    const errors: string[] = [];

    // Check required fields
    if (!this.companyData.RegNumber || this.companyData.RegNumber.trim() === '') {
      errors.push('Registration Number is required');
    }

    if (!this.companyData.companyName || this.companyData.companyName.trim() === '') {
      errors.push('Company Name is required');
    }

    if (!this.companyData.email || this.companyData.email.trim() === '') {
      errors.push('Email is required');
    } else if (!this.isValidEmail(this.companyData.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!this.companyData.financeOfficerName || this.companyData.financeOfficerName.trim() === '') {
      errors.push('Finance Officer Name is required');
    }

    if (!this.companyData.accHolderName || this.companyData.accHolderName.trim() === '') {
      errors.push('Account Holder Name is required');
    }

    if (!this.companyData.accNumber || this.companyData.accNumber.toString().trim() === '') {
      errors.push('Account Number is required');
    }

    if (!this.companyData.confirmAccNumber || this.companyData.confirmAccNumber.toString().trim() === '') {
      errors.push('Confirm Account Number is required');
    } else if (this.companyData.accNumber !== this.companyData.confirmAccNumber) {
      errors.push('Account Numbers do not match');
    }

    if (!this.companyData.bank || this.companyData.bank.trim() === '' || !this.selectedBankId) {
      errors.push('Bank Name is required');
    }

    if (!this.companyData.branch || this.companyData.branch.trim() === '' || !this.selectedBranchId) {
      errors.push('Branch Name is required');
    }

    if (!this.companyData.phoneNumber1 || this.companyData.phoneNumber1.toString().trim() === '') {
      errors.push('Contact Number 1 is required');
    } else if (this.getContactNumber1ErrorMessage()) {
      errors.push(this.getContactNumber1ErrorMessage());
    }

    const contactError2 = this.getContactNumber2ErrorMessage();
    if (contactError2) {
      errors.push(contactError2);
    }

    // Check logo
    if (!this.companyData.logo) {
      errors.push('Company Logo is required');
    }

    return errors;
  }

  async updateCompany(): Promise<void> {
  // Check if company ID exists
  if (!this.itemId) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No company ID found for update',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      }
    });
    return;
  }

  // Mark all fields as touched to show validation errors
  const fieldsToValidate: (keyof Company)[] = [
    'RegNumber', 'companyName', 'email', 'financeOfficerName',
    'accHolderName', 'accNumber', 'confirmAccNumber', 'bank',
    'branch', 'phoneCode1', 'phoneNumber1', 'logo'
  ];

  fieldsToValidate.forEach(key => {
    this.touchedFields[key] = true;
  });

  // Get validation errors
  const validationErrors = this.getValidationErrors();

  if (validationErrors.length > 0) {
    // Show detailed error messages in SweetAlert
    Swal.fire({
      icon: 'error',
      title: 'Validation Error',
      html: `
        <div class="text-left">
          <p class="mb-3 font-semibold">Please fix the following errors:</p>
          <ul class="list-disc list-inside space-y-1 max-h-60 overflow-y-auto">
            ${validationErrors.map(error => `<li class="text-sm">${error}</li>`).join('')}
          </ul>
        </div>
      `,
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      },
      confirmButtonText: 'OK',
      width: '600px'
    });
    return;
  }

  // If all validations pass, proceed with updating
  try {
    this.isLoading = true;

    // Prepare the data for API - map frontend fields to backend fields
    const companyDataToSend = {
      regNumber: this.companyData.RegNumber,
      companyName: this.companyData.companyName,
      email: this.companyData.email,
      financeOfficerName: this.companyData.financeOfficerName,
      accName: this.companyData.accHolderName,
      accNumber: this.companyData.accNumber,
      bank: this.companyData.bank,
      branch: this.companyData.branch,
      phoneCode1: this.companyData.phoneCode1,
      phoneNumber1: this.companyData.phoneNumber1,
      phoneCode2: this.companyData.phoneCode2,
      phoneNumber2: this.companyData.phoneNumber2,
      logo: this.companyData.logoFile ? await this.fileToBase64(this.companyData.logoFile) : this.companyData.logo,
      modifyBy: this.companyData.modifyBy || 'system'
    };

    // Use the updateCompany service method
    this.goviLinkSrv.updateCompany(companyDataToSend, this.itemId).subscribe(
      (response: any) => {
        this.isLoading = false;
        if (response.status) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: response.message || 'Company updated successfully!',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            }
          }).then(() => {
            this.router.navigate(['/govi-link/action/view-company-list']);
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.message || 'Failed to update company.',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            }
          });
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('Error updating company:', error);
        
        let errorMessage = 'Failed to update company. Please try again.';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 0) {
          errorMessage = 'Unable to connect to server. Please check your connection.';
        }

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          }
        });
      }
    );
  } catch (error) {
    this.isLoading = false;
    console.error('Error in updateCompany:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'An unexpected error occurred.',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      }
    });
  }
}
}

class Company {
  id!: number;
  RegNumber!: string;
  companyName!: string;
  accHolderName!: string;
  accName!: string;
  email!: string;
  financeOfficerName!: string;
  accNumber!: string;
  confirmAccNumber!: string;
  bank!: string;
  branch!: string;
  phoneCode1!: string;
  phoneNumber1!: string;
  phoneCode2!: string;
  phoneNumber2!: string;
  logo!: string;
  logoFile?: File;
  modifyBy!: string;
  createdAt!: string;

  constructor() {
    this.modifyBy = 'system'; // Default value
  }
}
