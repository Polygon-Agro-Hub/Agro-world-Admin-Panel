import { Component, OnInit } from '@angular/core';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CollectionOfficerService } from '../../../services/collection-officer/collection-officer.service';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { SalesAgentsService } from '../../../services/dash/sales-agents.service';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';

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
  selector: 'app-create-sales-agents',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    DropdownModule,
  ],
  templateUrl: './create-sales-agents.component.html',
  styleUrl: './create-sales-agents.component.css',
})
export class CreateSalesAgentsComponent implements OnInit {
  isLoading = false;
  empType!: string;
  personalData: Personal = new Personal();
  selectedLanguages: string[] = [];
  CompanyData: Company[] = [];
  lastID!: string;
  selectedPage: 'pageOne' | 'pageTwo' = 'pageOne';
  itemId: number | null = null;
  officerId: number | null = null;
  emailError: string = '';

  banks: Bank[] = [];
  branches: Branch[] = [];
  selectedBankId: number | null = null;
  selectedBranchId: number | null = null;
  allBranches: BranchesData = {};

  selectedImage: File | null = null;
  selectedFile: File | null = null;
  selectedFileName!: string;
  invalidFields: Set<string> = new Set();

  touchedFields: { [key in keyof Personal]?: boolean } = {};
  confirmAccountNumberError: boolean = false;
  confirmAccountNumberRequired: boolean = false;
  errorMessage: string = '';
  isLeadingSpaceErrorMap: { [key: string]: boolean } = {};
  isSpecialCharErrorMap: { [key: string]: boolean } = {};

  // New properties for duplicate validation
  duplicateErrors: string[] = [];
  isCheckingDuplicates: boolean = false;

  getFlagUrl(countryCode: string): string {
    return `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`;
  }

  districts = [
    { name: 'Ampara', province: 'Eastern' },
    { name: 'Anuradhapura', province: 'North Central' },
    { name: 'Badulla', province: 'Uva' },
    { name: 'Batticaloa', province: 'Eastern' },
    { name: 'Colombo', province: 'Western' },
    { name: 'Galle', province: 'Southern' },
    { name: 'Gampaha', province: 'Western' },
    { name: 'Hambantota', province: 'Southern' },
    { name: 'Jaffna', province: 'Northern' },
    { name: 'Kalutara', province: 'Western' },
    { name: 'Kandy', province: 'Central' },
    { name: 'Kegalle', province: 'Sabaragamuwa' },
    { name: 'Kilinochchi', province: 'Northern' },
    { name: 'Kurunegala', province: 'North Western' },
    { name: 'Mannar', province: 'Northern' },
    { name: 'Matale', province: 'Central' },
    { name: 'Matara', province: 'Southern' },
    { name: 'Monaragala', province: 'Uva' },
    { name: 'Mullaitivu', province: 'Northern' },
    { name: 'Nuwara Eliya', province: 'Central' },
    { name: 'Polonnaruwa', province: 'North Central' },
    { name: 'Puttalam', province: 'North Western' },
    { name: 'Rathnapura', province: 'Sabaragamuwa' },
    { name: 'Trincomalee', province: 'Eastern' },
    { name: 'Vavuniya', province: 'Northern' },
  ];

  countries: PhoneCode[] = [
    { code: 'LK', dialCode: '+94', name: 'Sri Lanka' },
    { code: 'VN', dialCode: '+84', name: 'Vietnam' },
    { code: 'KH', dialCode: '+855', name: 'Cambodia' },
    { code: 'BD', dialCode: '+880', name: 'Bangladesh' },
    { code: 'IN', dialCode: '+91', name: 'India' },
    { code: 'NL', dialCode: '+31', name: 'Netherlands' },
    { code: 'UK', dialCode: '+44', name: 'United Kingdom' },
    { code: 'US', dialCode: '+1', name: 'United States' }
  ];

  constructor(
    private collectionOfficerService: CollectionOfficerService,
    private fb: FormBuilder,
    private collectionCenterSrv: CollectionCenterService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private salesAgentService: SalesAgentsService
  ) { }

  ngOnInit(): void {
    this.EpmloyeIdCreate();
    this.loadBanks();
    this.loadBranches();
  }

  loadBanks() {
    this.http.get<Bank[]>('assets/json/banks.json').subscribe(
      (data) => {
        // Sort banks alphabetically by name
        this.banks = data.sort((a, b) => a.name.localeCompare(b.name));
      },
      (error) => {
        console.error('Error loading banks:', error);
      }
    );
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
        this.router.navigate(['/steckholders/action/sales-agents']);
      }
    });
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
        this.navigatePath('/steckholders/action/sales-agents');
      }
    });
  }

  loadBranches() {
    this.http.get<BranchesData>('assets/json/branches.json').subscribe(
      (data) => {
        // If data is { bank1: Branch[], bank2: Branch[], ... }
        Object.keys(data).forEach((key) => {
          data[key] = data[key].sort((a, b) => a.name.localeCompare(b.name));
        });
        this.allBranches = data;
      },
      (error) => {
        console.error('Error loading branches:', error);
      }
    );
  }

  triggerFileInput(event: Event): void {
    event.preventDefault();
    const fileInput = document.getElementById('imageUpload');
    fileInput?.click();
    console.log('file input triggered');
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        Swal.fire('Error', 'File size should not exceed 5MB', 'error');
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire('Error', 'Only JPEG, JPG and PNG files are allowed', 'error');
        return;
      }

      this.selectedFile = file;
      this.personalData.image = file;
      this.selectedFileName = file.name;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage = e.target.result;
      };
      reader.readAsDataURL(file);
      console.log(this.selectedImage);
    }
  }

  updateEmployeeType(selectedType: string): void {
    this.empType = selectedType;
    this.personalData.empType = selectedType;
    console.log('Selected Employee Type:', this.personalData.empType);
  }

  updateProvince(event: DropdownChangeEvent): void {
    const selectedDistrict = event.value;
    const selected = this.districts.find(
      (district) => district.name === selectedDistrict
    );

    if (this.itemId === null) {
      this.personalData.province = selected ? selected.province : '';
    }
  }

  EpmloyeIdCreate() {
    let rolePrefix: string;
    rolePrefix = 'SA';

    this.getLastID()
      .then((lastID) => {
        this.personalData.empId = rolePrefix + lastID;
      })
      .catch((error) => {
        console.error('Error fetching last ID:', error);
      });
  }

  validateFirstName(value: string): void {
    const field = 'firstName';
    this.personalData[field] = value;

    // Check for leading space
    this.isLeadingSpaceErrorMap[field] = /^\s/.test(value);

    // Check for valid English name (starts with capital, rest are letters/spaces)
    this.isSpecialCharErrorMap[field] = !/^[A-Z][a-zA-Z\s]*$/.test(value.trim());
  }

  getLastID(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.salesAgentService.getForCreateId().subscribe(
        (res) => {
          this.lastID = res.result.empId;
          const lastId = res.result.empId;
          resolve(lastId);
        },
        (error) => {
          console.error('Error fetching last ID:', error);
          reject(error);
        }
      );
    });
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
        this.personalData.bankName = selectedBank.name;
        this.invalidFields.delete('bankName');
      }

      // Reset branch selection
      this.selectedBranchId = null;
      this.personalData.branchName = '';
    } else {
      this.branches = [];
      this.personalData.bankName = '';
    }
  }

  onBranchChange() {
    if (this.selectedBranchId) {
      // Update company data with branch name
      const selectedBranch = this.branches.find(
        (branch) => branch.ID === this.selectedBranchId
      );
      if (selectedBranch) {
        this.personalData.branchName = selectedBranch.name;
        this.invalidFields.delete('branchName');
      }
    } else {
      this.personalData.branchName = '';
    }
  }

  isEmpTypeSelected(): boolean {
    return !!this.touchedFields.empType;
  }

  onBlur(fieldName: keyof Personal): void {
    this.touchedFields[fieldName] = true;

    if (fieldName === 'email') {
      if (this.personalData.email) {
        this.personalData.email = this.personalData.email.trim();
        this.isValidEmail(this.personalData.email);
      }
    }

    // Trim leading spaces
    if (this.personalData[fieldName]) {
      this.personalData[fieldName] = (
        this.personalData[fieldName] as string
      ).trimStart();
    }

    if (fieldName === 'confirmAccNumber') {
      this.validateConfirmAccNumber();
    }

    // Add this to mark empType as touched when interacting with radio buttons
    if (fieldName === 'firstName' || fieldName === 'lastName') {
      this.touchedFields['empType'] = true;
    }
  }

  validateConfirmAccNumber(): void {
    this.confirmAccountNumberRequired = !this.personalData.confirmAccNumber;

    // Check if account numbers match
    if (this.personalData.accNumber && this.personalData.confirmAccNumber) {
      this.confirmAccountNumberError =
        this.personalData.accNumber !== this.personalData.confirmAccNumber;
    } else {
      this.confirmAccountNumberError = false;
    }
  }

  validateAccNumber(): void {
    // Check if account numbers match
    if (this.personalData.accNumber && this.personalData.confirmAccNumber) {
      this.confirmAccountNumberError =
        this.personalData.accNumber !== this.personalData.confirmAccNumber;
    } else {
      this.confirmAccountNumberError = false;
    }
  }

  isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^7\d{8}$/;
    return phoneRegex.test(phone);
  }

  isFieldInvalid(fieldName: keyof Personal): boolean {
    return !!this.touchedFields[fieldName] && !this.personalData[fieldName];
  }

  isValidEmail(email: string): boolean {
    if (!email) {
      this.emailError = 'Email is required.';
      return false;
    }

    // Check for consecutive dots
    if (email.includes('..')) {
      this.emailError = 'Email cannot contain consecutive dots (..)';
      return false;
    }

    // Check for leading dot
    if (email.startsWith('.')) {
      this.emailError = 'Email cannot start with a dot';
      return false;
    }

    // Check for trailing dot
    if (email.endsWith('.')) {
      this.emailError = 'Email cannot end with a dot';
      return false;
    }

    // Check for dot right before @
    if (email.includes('.@')) {
      this.emailError = 'Email cannot have a dot right before the @ symbol';
      return false;
    }

    // Check for dot right after @
    if (email.includes('@.')) {
      this.emailError = 'Email cannot have a dot right after the @ symbol';
      return false;
    }

    // Check for invalid characters (but allow +)
    const invalidChars = /[!#$%^&*()=<>?\/\\]/;
    if (invalidChars.test(email)) {
      this.emailError = 'Email contains invalid special characters (only +, -, _, and . are allowed)';
      return false;
    }

    // Check basic format (allowing + in the local part)
    const emailRegex = /^[a-zA-Z0-9.+_-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      this.emailError = 'Please enter a valid email in the format: example@domain.com or user+tag@domain.com';
      return false;
    }

    this.emailError = '';
    return true;
  }

  isValidNIC(nic: string): boolean {
    // 12 digits only (new format)
    const newFormat = /^\d{12}$/;

    // 9 digits + V (old format)
    const oldFormat = /^\d{9}[V]$/;

    return newFormat.test(nic) || oldFormat.test(nic);
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  checkSubmitValidity(): boolean {
    // Regular expressions for validation
    const phonePattern = /^7\d{8}$/;
    const accountPattern = /^[a-zA-Z0-9]+$/;
    const englishNamePattern = /^[A-Z][a-z]*$/;
    const namePattern = /^[A-Za-z\s'-]+$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Destructure personalData for easier access
    const {
      firstName,
      lastName,
      phoneNumber1,
      phoneNumber2,
      email,
      empType,
      nic,
      accHolderName,
      accNumber,
      confirmAccNumber,
      bankName,
      branchName,
      houseNumber,
      streetName,
      city,
      district,
    } = this.personalData;

    // Name validations
    const isFirstNameValid = !!firstName && englishNamePattern.test(firstName);
    const isLastNameValid = !!lastName && englishNamePattern.test(lastName);
    const isAccHolderNameValid =
      !!this.personalData.accHolderName &&
      this.isValidName(this.personalData.accHolderName) &&
      !/\d/.test(this.personalData.accHolderName);

    // Contact validations
    const isPhoneNumber1Valid =
      !!phoneNumber1 && phonePattern.test(phoneNumber1);
    const isEmailValid = !!email && this.isValidEmail(email) &&
      !email.includes('..') &&
      !email.startsWith('.') &&
      !email.includes('.@') &&
      !email.includes('@.');
    const isEmpTypeSelected = !!empType;
    const isNicValid = !!nic && this.isValidNIC(nic);

    // Phone number 2 validation (optional)
    let isPhoneNumber2Valid = true;
    if (phoneNumber2) {
      isPhoneNumber2Valid =
        phoneNumber2 !== phoneNumber1 && phonePattern.test(phoneNumber2);
    }

    // Address validations
    const isAddressValid =
      !!houseNumber && !!streetName && !!city && !!district;

    // Bank details validations
    const isAccNumberValid = !!accNumber && accountPattern.test(accNumber);

    const isConfirmAccNumberValid =
      !!confirmAccNumber &&
      accountPattern.test(confirmAccNumber) &&
      accNumber === confirmAccNumber;

    const isBankDetailsValid =
      isAccHolderNameValid &&
      isAccNumberValid &&
      !!bankName &&
      !!branchName &&
      isConfirmAccNumberValid;

    // Final validation combining all checks
    return (
      isFirstNameValid &&
      isLastNameValid &&
      isPhoneNumber1Valid &&
      isEmailValid &&
      isEmpTypeSelected &&
      isNicValid &&
      isPhoneNumber2Valid &&
      isAddressValid &&
      isBankDetailsValid
    );
  }

  // New method to check for duplicates before submission
  checkForDuplicates(): Promise<string[]> {
    return new Promise((resolve) => {
      this.isCheckingDuplicates = true;
      
      // Simulate API call to check duplicates
      setTimeout(() => {
        const duplicates: string[] = [];
        
        // In a real implementation, you would make API calls here
        // For now, we'll rely on the backend validation
        
        this.isCheckingDuplicates = false;
        resolve(duplicates);
      }, 500);
    });
  }

  async onSubmit() {
    // Clear previous duplicate errors
    this.duplicateErrors = [];

    // Mark all fields as touched
    this.touchedFields = {
      empType: true,
      firstName: true,
      lastName: true,
      phoneNumber1: true,
      phoneNumber2: !!this.personalData.phoneNumber2,
      email: true,
      nic: true,
      houseNumber: true,
      streetName: true,
      city: true,
      district: true,
      province: true,
      accHolderName: true,
      accNumber: true,
      confirmAccNumber: true,
      bankName: true,
      branchName: true,
    };

    const missingFields: string[] = [];

    // Validation patterns
    const englishNamePattern = /^[A-Z][a-zA-Z\s]*$/;
    const phonePattern = /^7\d{8}$/;
    const nicPattern = /(^\d{12}$)|(^\d{9}[V]$)/;
    const accountPattern = /^[a-zA-Z0-9]+$/;

    // Field Validations
    if (!this.personalData.empType) missingFields.push('Staff Employee Type is Required');

    if (!this.personalData.firstName) missingFields.push('First Name is Required');

    if (!this.personalData.lastName) missingFields.push('Last Name is Required');

    if (!this.personalData.phoneNumber1) missingFields.push('Contact Number 1 is Required');
    else if (!phonePattern.test(this.personalData.phoneNumber1))
      missingFields.push('Contact Number 1 - Must be 9 digits starting with 7');

    if (this.personalData.phoneNumber2) {
      if (!phonePattern.test(this.personalData.phoneNumber2))
        missingFields.push('Contact Number 2 - Must be 9 digits starting with 7');
      if (this.personalData.phoneNumber1 === this.personalData.phoneNumber2)
        missingFields.push('Contact Number 2 - Cannot be the same as Contact Number 1');
    }

    if (!this.personalData.email) missingFields.push('Email is Required');
    else if (!this.isValidEmail(this.personalData.email))
      missingFields.push('Email - Invalid format (e.g., example@domain.com)');

    if (!this.personalData.nic) missingFields.push('NIC is Required');
    else if (!nicPattern.test(this.personalData.nic))
      missingFields.push('NIC - Must be 12 digits or 9 digits followed by V');

    if (!this.personalData.houseNumber) missingFields.push('House Number is Required');
    if (!this.personalData.streetName) missingFields.push('Street Name is Required');
    if (!this.personalData.city) missingFields.push('City is Required');
    if (!this.personalData.district) missingFields.push('District is Required');
    if (!this.personalData.province) missingFields.push('Province is Required');

    if (!this.personalData.accHolderName) missingFields.push("Account Holder's Name is Required");
    else if (!this.isValidName(this.personalData.accHolderName))
      missingFields.push('Account Holder Name - Only English letters, spaces, hyphens, and apostrophes allowed');

    if (!this.personalData.accNumber) missingFields.push('Account Number is Required');
    else if (!accountPattern.test(this.personalData.accNumber))
      missingFields.push('Account Number - Only alphanumeric characters allowed');

    if (!this.personalData.confirmAccNumber) missingFields.push('Confirm Account Number is Required');
    else if (this.personalData.accNumber !== this.personalData.confirmAccNumber)
      missingFields.push('Confirm Account Number - Must match Account Number');
    else if (!accountPattern.test(this.personalData.confirmAccNumber))
      missingFields.push('Confirm Account Number - Only alphanumeric characters allowed');

    if (!this.personalData.bankName) missingFields.push('Bank Name is Required');
    if (!this.personalData.branchName) missingFields.push('Branch Name is Required');

    // Show errors if any
    if (missingFields.length > 0) {
      let errorMessage = '<div class="text-left"><p class="mb-2">Please fix the following issues:</p><ul class="list-disc pl-5">';
      missingFields.forEach(field => errorMessage += `<li>${field}</li>`);
      errorMessage += '</ul></div>';

      Swal.fire({
        icon: 'error',
        title: 'Missing or Invalid Information',
        html: errorMessage,
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
          htmlContainer: 'text-left',
        },
      });
      return;
    }

    // Confirm submission if valid
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to create the Sales Agent?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, create it!',
      cancelButtonText: 'No, cancel',
      reverseButtons: true,
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
        htmlContainer: 'text-left',
        confirmButton: 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700',
        cancelButton: 'bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.salesAgentService.createSalesAgent(this.personalData, this.selectedImage)
          .subscribe(
            (res: any) => {
              this.isLoading = false;
              this.officerId = res.officerId;
              this.errorMessage = '';
              Swal.fire({
                title: 'Success',
                text: 'Sales Agent Profile Created Successfully',
                icon: 'success',
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold text-lg',
                  confirmButton: 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700',
                },
              });
              this.navigatePath('/steckholders/action/sales-agents');
            },
            (error: any) => {
              this.isLoading = false;
              
              // Handle duplicate field errors from backend
              if (error.error && error.error.errors && Array.isArray(error.error.errors)) {
                this.duplicateErrors = error.error.errors;
                this.showDuplicateErrors();
              } else {
                this.errorMessage = error.error.error || 'An unexpected error occurred';
                Swal.fire({
                  title: 'Error',
                  text: this.errorMessage,
                  icon: 'error',
                  customClass: {
                    popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                    title: 'font-semibold text-lg',
                    confirmButton: 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
                  },
                });
              }
            }
          );
      }
    });
  }

  // New method to display duplicate errors in a user-friendly way
  showDuplicateErrors(): void {
    if (this.duplicateErrors.length === 0) return;

    let errorMessage = '<div class="text-left"><p class="mb-2">The following fields already exist in the system:</p><ul class="list-disc pl-5">';
    
    this.duplicateErrors.forEach(error => {
      errorMessage += `<li>${error}</li>`;
    });
    
    errorMessage += '</ul><p class="mt-2 text-sm">Please use different values for these fields.</p></div>';

    Swal.fire({
      icon: 'error',
      title: 'Duplicate Information Found',
      html: errorMessage,
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
        htmlContainer: 'text-left',
        confirmButton: 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
      },
    });
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  onFieldTouched(field: keyof Personal) {
    this.touchedFields[field] = true;
  }

  validateNameInput(event: KeyboardEvent): void {
    // Allow navigation and control keys
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
    if (allowedKeys.includes(event.key)) return;

    const target = event.target as HTMLInputElement;
    const fieldName = target.getAttribute('name') as keyof Personal;

    // Block leading spaces for firstName and lastName
    if (['firstName', 'lastName'].includes(fieldName)) {
      const currentValue = this.personalData[fieldName] as string || '';
      if (event.key === ' ' && (!currentValue || target.selectionStart === 0)) {
        event.preventDefault();
        return;
      }
    }

    // Allow only letters (English, Sinhala, Tamil), spaces, hyphens, apostrophes
    const allowedPattern = /^[a-zA-Z\u0D80-\u0DFF\u0B80-\u0BFF\s'-]$/;

    // Block numbers (English, Sinhala, Tamil) and special characters
    if (!allowedPattern.test(event.key)) {
      event.preventDefault();
    }
  }

  capitalizeFirstLetter(field: 'firstName' | 'lastName' | 'houseNumber' | 'streetName' | 'city' | 'accHolderName' | 'bankName' | 'branchName', event?: any) {
    let value = this.personalData[field];
    if (!value) return;

    const inputElement = event?.target as HTMLInputElement;
    const caretPos = inputElement?.selectionStart || 0;

    const firstNonSpaceIndex = value.search(/\S/);
    if (firstNonSpaceIndex === -1) return;

    const before = value.slice(0, firstNonSpaceIndex);
    const firstChar = value.charAt(firstNonSpaceIndex);
    const after = value.slice(firstNonSpaceIndex + 1);

    this.personalData[field] = before + firstChar.toUpperCase() + after;

    // Restore caret position
    if (inputElement) {
      setTimeout(() => {
        inputElement.selectionStart = inputElement.selectionEnd = caretPos;
      });
    }
  }

  blockLeadingSpace(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;

    // If cursor is at position 0 and user typed a space, prevent it
    if (input.selectionStart === 0 && event.key === ' ') {
      event.preventDefault();
    }
  }

  onBranchTouched(field: keyof Personal) {
    this.touchedFields[field] = true;
  }

  validateNICInput(event: KeyboardEvent) {
    // Allow navigation keys
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'Home',
      'End',
    ];

    if (allowedKeys.includes(event.key)) {
      return;
    }

    // Allow only numbers or uppercase V (but not lowercase v)
    const nicInputPattern = /^[0-9V]$/;
    if (!nicInputPattern.test(event.key.toUpperCase())) {
      event.preventDefault();
    }
  }

  formatNIC() {
    if (this.personalData.nic) {
      // Convert to uppercase and remove any spaces
      this.personalData.nic = this.personalData.nic
        .toUpperCase()
        .replace(/\s/g, '');

      // If it ends with 'v', convert to 'V'
      if (this.personalData.nic.endsWith('v')) {
        this.personalData.nic = this.personalData.nic.slice(0, -1) + 'V';
      }
    }
  }

  capitalizeName(fieldName: keyof Personal): void {
    if (!this.personalData[fieldName]) return;

    // Convert to lowercase first
    let name = this.personalData[fieldName].toLowerCase();
    let result = '';
    let capitalizeNext = true;

    for (let i = 0; i < name.length; i++) {
      const char = name[i];

      // Skip any numbers or special characters that might have slipped through
      if (!/[a-zA-Z\s'-]/.test(char)) continue;

      if (capitalizeNext && /[a-z]/.test(char)) {
        result += char.toUpperCase();
        capitalizeNext = false;
      } else {
        result += char;
      }

      // Set flag to capitalize next letter if current character is a separator
      if ([' ', '-', "'"].includes(char)) {
        capitalizeNext = true;
      }
    }

    this.personalData[fieldName] = result;
  }

  isValidName(name: string): boolean {
    // Allows only English letters, spaces, and apostrophes (NO HYPHENS)
    const namePattern = /^[A-Za-z\s']+$/;
    return namePattern.test(name) && !/\d/.test(name);
  }

  allowOnlyAlphanumeric(event: KeyboardEvent): void {
    // Allow navigation keys
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'Home',
      'End',
    ];

    if (allowedKeys.includes(event.key)) {
      return;
    }

    // Allow only alphanumeric characters (A-Z, a-z, 0-9)
    const alphanumericPattern = /^[0-9]$/;

    if (!alphanumericPattern.test(event.key)) {
      event.preventDefault();
    }
  }

  isValidAccountNumber(accountNumber: string): boolean {
    const accountPattern = /^[a-zA-Z0-9]+$/;
    return accountPattern.test(accountNumber);
  }

  validateGeneralInput(
    event: KeyboardEvent,
    fieldName: string,
    allowSpace: boolean = false
  ): void {
    const currentValue =
      (this.personalData[fieldName as keyof Personal] as string) || '';

    // Block space if it's the first character
    if (event.key === ' ' && currentValue.length === 0) {
      event.preventDefault();
      return;
    }
  }

  validateEmailInput(event: KeyboardEvent, fieldName: string): void {
    // Allow navigation and control keys
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight',
      'Tab', 'Home', 'End'
    ];

    if (allowedKeys.includes(event.key)) {
      return;
    }

    // Allow only typical email characters
    const allowedChars = /^[a-zA-Z0-9@._+-]$/;
    if (!allowedChars.test(event.key)) {
      event.preventDefault();
    }
  }

  validateEmailOnInput(): void {
    if (this.personalData.email) {
      // Trim whitespace
      this.personalData.email = this.personalData.email.trim();

      // Validate the email
      this.isValidEmail(this.personalData.email);
    }
  }

  validateAddressInput(event: KeyboardEvent, fieldName: string): void {
    // Allow navigation and control keys
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'Home',
      'End',
    ];

    // Allow these special keys
    if (allowedKeys.includes(event.key)) {
      return;
    }

    // Get current value
    const currentValue =
      (this.personalData[fieldName as keyof Personal] as string) || '';

    // Block space if it's the first character
    if (event.key === ' ' && currentValue.length === 0) {
      event.preventDefault();
      return;
    }
  }

  onPaste(event: ClipboardEvent, fieldName: keyof Personal): void {
    event.preventDefault();
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text');

    // Clean the pasted text - remove any non-allowed characters
    const cleanedText = pastedText.replace(/[^a-zA-Z\s'-]/g, '');

    // Update the model with cleaned text
    this.personalData[fieldName] = cleanedText;

    // Trigger the capitalize function
    this.capitalizeName(fieldName);
  }

  formatAccountHolderName(): void {
    if (this.personalData.accHolderName) {
      // Remove leading spaces and any non-English characters and hyphens
      let value = (this.personalData.accHolderName as string)
        .replace(/^\s+/, '')
        .replace(/[^a-zA-Z\s']/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      // Capitalize first letter of each word
      value = value.replace(/(^|\s|')[a-z]/g, (char) => char.toUpperCase());

      this.personalData.accHolderName = value;
    }
  }

  validateAccountHolderNameInput(event: KeyboardEvent): void {
    // Allow navigation and control keys
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight',
      'Tab', 'Home', 'End'
    ];

    if (allowedKeys.includes(event.key)) {
      return;
    }

    // Get current value and cursor position
    const target = event.target as HTMLInputElement;
    const currentValue = target.value || '';
    const cursorPosition = target.selectionStart || 0;

    // Block leading space - if field is empty or cursor is at beginning
    if (event.key === ' ') {
      if (currentValue.length === 0 || cursorPosition === 0) {
        event.preventDefault();
        return;
      }

      // Also block if current value only contains spaces
      if (currentValue.trim().length === 0) {
        event.preventDefault();
        return;
      }
    }

    // Block hyphen (-) character
    if (event.key === '-') {
      event.preventDefault();
      return;
    }

    // Allow only English letters, space, apostrophe (no hyphen)
    const englishNamePattern = /^[a-zA-Z\s']$/;

    if (!englishNamePattern.test(event.key)) {
      event.preventDefault();
    }
  }
}

class Personal {
  empId!: string;
  empType!: string;
  firstName!: string;
  lastName!: string;
  phoneCode1: string = '+94';
  phoneNumber1!: string;
  phoneCode2: string = '+94';
  phoneNumber2!: string;
  nic!: string;
  email!: string;
  new!: string;
  password!: string;
  passwordUpdated!: string;
  houseNumber!: string;
  streetName!: string;
  city!: string;
  district!: string;
  province!: string;
  country: string = 'Sri Lanka';
  image!: any;
  accHolderName!: any;
  accNumber!: any;
  confirmAccNumber!: any;
  bankName!: string;
  branchName!: string;
}

class Company {
  id!: number;
  companyNameEnglish!: string;
}

interface PhoneCode {
  code: string;
  dialCode: string;
  name: string;
}