import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { DropdownModule } from 'primeng/dropdown';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
  selector: 'app-addacompany',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    DropdownModule,
  ],
  templateUrl: './addacompany.component.html',
  styleUrl: './addacompany.component.css'
})
export class AddacompanyComponent {
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

  countries = [
    { name: 'Sri Lanka', code: 'LK', dialCode: '+94' },
    { name: 'Vietnam', code: 'VN', dialCode: '+84' },
    { name: 'Cambodia', code: 'KH', dialCode: '+855' },
    { name: 'Bangladesh', code: 'BD', dialCode: '+880' },
    { name: 'India', code: 'IN', dialCode: '+91' },
    { name: 'Netherlands', code: 'NL', dialCode: '+31' }
  ];

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private http: HttpClient, private router: Router,) { }

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

    // Special handling for logo and favicon
    if (fieldName === 'logo') {
      return !!this.touchedFields[fieldName] && !value;
    }

    // For other fields
    return !!this.touchedFields[fieldName] && !value;
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

  capitalizeFirstLetter(field: 'companyName' | 'foName' | 'accHolderName'): void {
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
    console.log('Selected branch:', this.companyData.branch);
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

}

class Company {
  id!: number;
  RegNumber!: string;
  companyName!: string;
  accHolderName!: string;
  foName!: string;
  email!: string;
  financeOfficerName!: string;
  accName!: string;
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
}
