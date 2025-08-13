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
  }).then((result) => {
    if (result.isConfirmed) {
      this.router.navigate(['/steckholders/action/sales-agents']);
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

      // console.log(this.selectedFile);
      // console.log(this.personalData.image);
      // console.log(this.selectedFileName);

      const reader = new FileReader();
      reader.onload = (e: any) => {
        // console.log(e.target.result);
        this.selectedImage = e.target.result;
      };
      reader.readAsDataURL(file);
      console.log(this.selectedImage);
    }
  }

  updateEmployeeType(selectedType: string): void {
    this.empType = selectedType;
    this.personalData.empType = selectedType; // Update personalData.empType dynamically
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
    // const currentCompanyId = this.personalData.companyId;

    let rolePrefix: string;

    // Map job roles to their respective prefixes
    // const rolePrefixes: { [key: string]: string } = {
    //   'Collection Center Head': 'CCH',

    // };

    // Get the prefix based on the job role
    rolePrefix = 'SA';

    // if (!rolePrefix) {
    //   console.error(`Invalid job role: ${this.personalData.jobRole}`);
    //   return; // Exit if the job role is invalid
    // }

    // Fetch the last ID and assign a new Employee ID
    this.getLastID()
      .then((lastID) => {
        this.personalData.empId = rolePrefix + lastID;
      })
      .catch((error) => {
        console.error('Error fetching last ID:', error);
      });
    // this.personalData.companyId = currentCompanyId;
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
          resolve(lastId); // Resolve the Promise with the empId
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



  isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^7\d{8}$/; // Allows only 9-digit numbers
    return phoneRegex.test(phone);
  }
  isFieldInvalid(fieldName: keyof Personal): boolean {
    return !!this.touchedFields[fieldName] && !this.personalData[fieldName];
  }
  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]@[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;


    if (!email || email.length === 0) return false;


    if (email.includes('..')) return false;

    if (email.startsWith('.')) return false;


    const atIndex = email.indexOf('@');
    if (atIndex > 0 && email.charAt(atIndex - 1) === '.') return false;


    if (atIndex < email.length - 1 && email.charAt(atIndex + 1) === '.') return false;


    const localPart = email.substring(0, atIndex);
    const domainPart = email.substring(atIndex + 1);


    const localPartRegex = /^[a-zA-Z0-9._-]+$/;
    if (!localPartRegex.test(localPart)) return false;


    const domainPartRegex = /^[a-zA-Z0-9.-]+$/;
    if (!domainPartRegex.test(domainPart)) return false;


    return emailRegex.test(email);
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
    const phonePattern = /^7\d{8}$/; // 9 digits starting with 7
    const accountPattern = /^[a-zA-Z0-9]+$/; // Only alphanumeric characters
    const englishNamePattern = /^[A-Z][a-z]*$/; // First letter capitalized, rest lowercase
    const namePattern = /^[A-Za-z\s'-]+$/; // For names with spaces, hyphens, apostrophes
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email pattern


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
    !/\d/.test(this.personalData.accHolderName); // Ensure no numbers

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

  onSubmit() {
    // Check if employee type is selected
    if (!this.personalData.empType) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Staff Employee Type is a required field',
      });
      return; // Exit the function if not selected
    }

    // Only proceed with the rest of the validation if employee type is selected
    if (!this.checkSubmitValidity()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill all required fields correctly',
      });
      return;
    }

    console.log(this.personalData, this.selectedImage);

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to create the Sales Agent?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, create it!',
      cancelButtonText: 'No, cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.salesAgentService
          .createSalesAgent(this.personalData, this.selectedImage)
          .subscribe(
            (res: any) => {
              this.isLoading = false;
              this.officerId = res.officerId;
              this.errorMessage = '';

              Swal.fire(
                'Success',
                'Sales Agent Profile Created Successfully',
                'success'
              );
              this.navigatePath('/steckholders/action/sales-agents');
            },
            (error: any) => {
              this.isLoading = false;
              this.errorMessage =
                error.error.error || 'An unexpected error occurred';
              Swal.fire('Error', this.errorMessage, 'error');
            }
          );
      } else {
        Swal.fire('Cancelled', 'Your action has been cancelled', 'info');
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
    }).then((result) => {
      if (result.isConfirmed) {
        this.navigatePath('/steckholders/action/sales-agents');
      }
    });
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }
  onFieldTouched(field: keyof Personal) {
    this.touchedFields[field] = true;
  }

  validateNameInput(event: KeyboardEvent, fieldName?: string): void {
  // Allow navigation and control keys
  const allowedKeys = [
    'Backspace',
    'Delete',
    'ArrowLeft',
    'ArrowRight',
    'Tab',
    'Home',
    'End',
    'Spacebar',
  ];

  // Allow these special keys
  if (allowedKeys.includes(event.key)) {
    return;
  }

  // Get the current input value (if fieldName is provided)
  const currentValue = fieldName
    ? (this.personalData[fieldName as keyof Personal] as string) || ''
    : '';

  // Block space if it's the first character
  if (event.key === ' ' && currentValue.length === 0) {
    event.preventDefault();
    return;
  }

  // For account holder name, only allow English letters, spaces, hyphens, and apostrophes
  if (fieldName === 'accHolderName') {
    const allowedPattern = /^[a-zA-Z\s'-]$/;
    if (!allowedPattern.test(event.key)) {
      event.preventDefault();
    }
  } 
  // For other name fields (first name, last name)
  else {
    const allowedPattern = /^[a-zA-Z\s'-]$/;
    if (!allowedPattern.test(event.key)) {
      event.preventDefault();
    }
  }
}

  capitalizeFirstLetter(fieldName: 'firstName' | 'lastName') {
    if (this.personalData[fieldName]) {
      // Capitalize first letter and make the rest lowercase
      this.personalData[fieldName] =
        this.personalData[fieldName].charAt(0).toUpperCase() +
        this.personalData[fieldName].slice(1).toLowerCase();
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
      return; // Allow these special keys
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
  // Allows only English letters, spaces, hyphens, and apostrophes
  const namePattern = /^[A-Za-z\s'-]+$/;
  return namePattern.test(name) && !/\d/.test(name); // Also check for numbers
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
      return; // Allow these special keys
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


    const currentValue =
      (this.personalData[fieldName as keyof Personal] as string) || '';


    if (event.key === ' ') {
      event.preventDefault();
      return;
    }


    if (event.key === '.' && currentValue.length === 0) {
      event.preventDefault();
      return;
    }


    if (event.key === '.' && currentValue.endsWith('.')) {
      event.preventDefault();
      return;
    }


    const atIndex = currentValue.indexOf('@');
    if (event.key === '.' && atIndex !== -1) {

      const cursorPosition = currentValue.length;
      if (cursorPosition === atIndex + 1) {
        event.preventDefault();
        return;
      }
    }


    if (event.key === '@' && currentValue.endsWith('.')) {
      event.preventDefault();
      return;
    }


    const emailPattern = /^[a-zA-Z0-9._@-]$/;
    if (!emailPattern.test(event.key)) {
      event.preventDefault();
      return;
    }


    if (event.key === '@' && currentValue.includes('@')) {
      event.preventDefault();
      return;
    }
  }

  validateEmailOnInput(): void {
    if (this.personalData.email) {
      this.personalData.email = this.personalData.email
        .replace(/\s/g, '')
        .replace(/\.{2,}/g, '.')
        .replace(/^\./, '')
        .replace(/\.@/, '@');


      this.personalData.email = this.personalData.email.replace(/[^a-zA-Z0-9._@-]/g, '');

      // Ensure only one @ symbol
      const atCount = (this.personalData.email.match(/@/g) || []).length;
      if (atCount > 1) {
        const firstAtIndex = this.personalData.email.indexOf('@');
        this.personalData.email =
          this.personalData.email.substring(0, firstAtIndex + 1) +
          this.personalData.email.substring(firstAtIndex + 1).replace(/@/g, '');
      }
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
