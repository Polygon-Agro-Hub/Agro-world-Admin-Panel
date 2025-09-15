import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { CollectionOfficerService } from '../../../services/collection-officer/collection-officer.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
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

interface PhoneCode {
  code: string;
  dialCode: string;
  name: string;
}

@Component({
  selector: 'app-collectiveofficers-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    DropdownModule,
  ],
  templateUrl: './collectiveofficers-edit.component.html',
  styleUrl: './collectiveofficers-edit.component.css',
})
export class CollectiveofficersEditComponent {
userForm: FormGroup = new FormGroup({});

  itemId!: number;
  selectedPage: 'pageOne' | 'pageTwo' = 'pageOne';
  selectedFile: File | null = null;
  selectedFileName!: string;
  selectedImage: string | ArrayBuffer | null = null;
  isLoading = true;
  selectedLanguages: string[] = [];
  selectJobRole!: string;
  personalData: Personal = new Personal();
  CompanyData: Company[] = [];
  collectionCenterData: CollectionCenter[] = [];
  collectionManagerData: CollectionManager[] = [];
  lastID!: string;
  empType!: string;
  cenId!: number;
  comId!: number;
  initiateJobRole!: string;
  initiateId!: string;
  errorMessage: string = '';
  img!: string;

  banks: Bank[] = [];
  branches: Branch[] = [];
  selectedBankId: number | null = null;
  selectedBranchId: number | null = null;
  allBranches: BranchesData = {};
  touchedFields: { [key in keyof Personal]?: boolean } = {};
  confirmAccountNumberError: boolean = false;
  confirmAccountNumberRequired: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  companyOptions: any[] = [];
  centerOptions: any[] = [];
  managerOptions: any[] = [];
  bankOptions: any[] = [];
  branchOptions: any[] = [];
  districtOptions: any[] = [];
  invalidFields: Set<string> = new Set();

// Remove the redundant `district` array
// Keep only the `districts` array
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

// Update the setupDropdownOptions method to use `districts`
setupDropdownOptions() {
  this.districts = this.districts.sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  this.districtOptions = this.districts.map(district => ({
    label: district.name,
    value: district.name
  }));
}
  countries: PhoneCode[] = [
    { code: 'LK', dialCode: '+94', name: 'Sri Lanka' },
    { code: 'VN', dialCode: '+84', name: 'Vietnam' },
    { code: 'KH', dialCode: '+855', name: 'Cambodia' },
    { code: 'BD', dialCode: '+880', name: 'Bangladesh' },
    { code: 'IN', dialCode: '+91', name: 'India' },
    { code: 'NL', dialCode: '+31', name: 'Netherlands' }
  ];

  


  isLanguageRequired = false;

  

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private collectionCenterSrv: CollectionCenterService,
    private collectionOfficerService: CollectionOfficerService
  ) { }

  ngOnInit() {
  this.loadBanks();
  this.loadBranches();
  this.setupDropdownOptions(); // Ensure district dropdown is set up
  this.itemId = this.route.snapshot.params['id'];

  if (this.itemId) {
    this.isLoading = true;
    this.collectionCenterSrv.getOfficerReportById(this.itemId).subscribe({
      next: (response: any) => {
        console.log('Officer Data Response:', response); // Debug API response
        const officerData = response.officerData[0];

        // Populate personalData with API response or fallback to defaults
        this.personalData.empId = officerData.empId || '';
        this.personalData.jobRole = officerData.jobRole || '';
        this.personalData.firstNameEnglish = officerData.firstNameEnglish || '';
        this.personalData.firstNameSinhala = officerData.firstNameSinhala || '';
        this.personalData.firstNameTamil = officerData.firstNameTamil || '';
        this.personalData.lastNameEnglish = officerData.lastNameEnglish || '';
        this.personalData.lastNameSinhala = officerData.lastNameSinhala || '';
        this.personalData.lastNameTamil = officerData.lastNameTamil || '';
        this.personalData.contact1Code = officerData.phoneCode01 || '+94';
        this.personalData.contact1 = officerData.phoneNumber01 || '';
        this.personalData.contact2Code = officerData.phoneCode02 || '+94';
        this.personalData.contact2 = officerData.phoneNumber02 || '';
        this.personalData.nic = officerData.nic || '';
        this.personalData.email = officerData.email || '';
        this.personalData.houseNumber = officerData.houseNumber || '';
        this.personalData.streetName = officerData.streetName || '';
        this.personalData.city = officerData.city || '';
        this.personalData.district = officerData.district || '';
        this.personalData.province = officerData.province || '';
        this.personalData.languages = officerData.languages || '';
        this.personalData.companyId = officerData.companyId || '';
        this.personalData.centerId = officerData.centerId || '';
        this.personalData.bankName = officerData.bankName || '';
        this.personalData.branchName = officerData.branchName || '';
        this.personalData.accHolderName = officerData.accHolderName || '';
        this.personalData.accNumber = officerData.accNumber || '';
        this.personalData.confirmAccNumber = officerData.accNumber || '';
        this.personalData.empType = officerData.empType || '';
        this.personalData.irmId = officerData.irmId || '';
        this.personalData.image = officerData.image || '';

        this.selectedLanguages = this.personalData.languages
          ? this.personalData.languages.split(',')
          : [];
        this.empType = this.personalData.empType;
        this.lastID = this.personalData.empId.slice(-5);
        this.cenId = this.personalData.centerId;
        this.comId = this.personalData.companyId;
        this.initiateJobRole = officerData.jobRole || '';
        this.initiateId = officerData.empId.slice(-5);

        console.log('Assigned Contact1Code:', this.personalData.contact1Code); // Debug
        console.log('Assigned Contact1:', this.personalData.contact1); // Debug
        console.log('Assigned Contact2Code:', this.personalData.contact2Code); // Debug
        console.log('Assigned Contact2:', this.personalData.contact2); // Debug
        this.matchExistingBankToDropdown();
        this.getAllCollectionManagers();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching officer data:', error);
        this.isLoading = false;
      },
    });
  }

  this.getAllCollectionCetnter();
  this.getAllCompanies();
  this.EpmloyeIdCreate();
}
  getFlagUrl(countryCode: string): string {
    return `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`;
  }

  preventInvalidAccountHolderCharacters(event: KeyboardEvent): void {
  const char = event.key;

  // Allow control keys (backspace, delete, tab, etc.)
  if (event.ctrlKey || event.altKey || event.metaKey ||
      ['Backspace','Delete','Tab','Escape','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(char)) {
    return;
  }

  // Allow only letters (both uppercase and lowercase) and spaces
  const regex = /^[A-Za-z\s]$/;
  if (!regex.test(char)) {
    event.preventDefault();
  }
}

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
onLetterKeyPress(event: KeyboardEvent) {
  const char = event.key;
  // Allow all letters (\p{L}) and space, block numbers and special characters
  const regex = /^[\p{L} ]$/u;
  if (!regex.test(char)) {
    event.preventDefault(); // block the key
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
      this.router.navigate(['/steckholders/action/collective-officer']);
    }
  });
}


  loadBanks() {
    this.http.get<Bank[]>('assets/json/banks.json').subscribe((data) => {
      this.banks = data.sort((a, b) => a.name.localeCompare(b.name));

      // Convert to dropdown options format
      this.bankOptions = this.banks.map(bank => ({
        label: bank.name,
        value: bank.name
      }));
    });
  }

  // Update the onBankChange method
onBankChange() {
  const selectedBankName = this.personalData.bankName;
  console.log('Selected Bank Name:', selectedBankName); // Debug
  if (selectedBankName) {
    const selectedBank = this.banks.find((bank) => bank.name === selectedBankName);
    console.log('Selected Bank:', selectedBank); // Debug
    if (selectedBank) {
      this.selectedBankId = selectedBank.ID;
      this.branches = this.allBranches[this.selectedBankId.toString()] || [];
      console.log('Branches for Bank:', this.branches); // Debug
      this.branchOptions = this.branches.map(branch => ({
        label: branch.name,
        value: branch.name
      }));
      this.personalData.branchName = ''; // Reset branch
    }
  } else {
    this.branches = [];
    this.branchOptions = [];
    this.selectedBankId = null;
    this.personalData.branchName = '';
  }
}

  loadBranches() {
    this.http
      .get<BranchesData>('assets/json/branches.json')
      .subscribe((data) => {
        Object.keys(data).forEach((bankID) => {
          data[bankID].sort((a, b) => a.name.localeCompare(b.name));
        });
        this.allBranches = data;
      });
  }

 matchExistingBankToDropdown() {
  if (
    this.banks.length > 0 &&
    Object.keys(this.allBranches).length > 0 &&
    this.personalData &&
    this.personalData.bankName
  ) {
    const matchedBank = this.banks.find(
      (bank) => bank.name === this.personalData.bankName
    );
    console.log('Matched Bank:', matchedBank); // Debug
    if (matchedBank) {
      this.selectedBankId = matchedBank.ID;
      this.branches = this.allBranches[this.selectedBankId.toString()] || [];
      this.branchOptions = this.branches.map(branch => ({
        label: branch.name,
        value: branch.name
      }));
      console.log('Branch Options:', this.branchOptions); // Debug
      if (this.personalData.branchName) {
        const matchedBranch = this.branches.find(
          (branch) => branch.name === this.personalData.branchName
        );
        if (matchedBranch) {
          this.selectedBranchId = matchedBranch.ID;
          this.personalData.branchName = matchedBranch.name;
        }
      }
    }
  }
}
onBranchChange(event: DropdownChangeEvent): void {
    const selectedBranchName = event.value;
    if (selectedBranchName) {
      const selectedBranch = this.branches.find((branch) => branch.name === selectedBranchName);
      if (selectedBranch) {
        this.personalData.branchName = selectedBranch.name;
        this.selectedBranchId = selectedBranch.ID;
      }
    } else {
      this.personalData.branchName = '';
      this.selectedBranchId = null;
    }
  }
onBlur(fieldName: keyof Personal): void {
  this.touchedFields[fieldName] = true;
  if (fieldName === 'firstNameEnglish' || fieldName === 'lastNameEnglish') {
    this.formatName(fieldName); // Ensure formatting is applied on blur
  }
  if (fieldName === 'confirmAccNumber') {
    this.validateConfirmAccNumber();
  }
}

  validateConfirmAccNumber(): void {
    this.confirmAccountNumberRequired = !this.personalData.confirmAccNumber;

    if (this.personalData.accNumber && this.personalData.confirmAccNumber) {
      this.confirmAccountNumberError =
        this.personalData.accNumber !== this.personalData.confirmAccNumber;
    } else {
      this.confirmAccountNumberError = false;
    }
  }

    validateAccNumber(): void {
   

    if (this.personalData.accNumber && this.personalData.confirmAccNumber) {
      this.confirmAccountNumberError =
        this.personalData.accNumber !== this.personalData.confirmAccNumber;
    } else {
      this.confirmAccountNumberError = false;
    }
  }


  // 6. ADD FIELD VALIDATION METHODS
isFieldInvalid(fieldName: string): boolean {
  const value = this.personalData[fieldName as keyof Personal];
  // Show error only if the field is empty
  return !value || value.trim() === '';
}


  isValidEmail(email: string): boolean {
  if (!email) return false;
  
  // Basic email regex pattern
  const emailRegex = /^[a-zA-Z0-9]+([._%+-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-]?[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;
  
  // Check for specific invalid patterns
  if (email.includes('..')) {
    return false; // Consecutive dots
  }
  if (email.startsWith('.') || email.endsWith('.')) {
    return false; // Leading or trailing dots
  }
  if (/[!#$%^&*()=<>?\/\\]/.test(email)) {
    return false; // Invalid special characters
  }
  
  return emailRegex.test(email);
}

  isValidNIC(nic: string): boolean {
    if (!nic) return false;
    // Updated regex to exclude simple 'v' and only allow 'V' at the end
    const nicRegex = /^(?:\d{12}|\d{9}[V])$/;
    return nicRegex.test(nic);
  }

  isValidPhoneNumber(phone: string): boolean {
    if (!phone) return false;
    const phoneRegex = /^[0-9]{9}$/;
    return phoneRegex.test(phone);
  }



  formatTextInput(fieldName: keyof Personal): void {
    const value = this.personalData[fieldName];
    if (typeof value === 'string') {
      // Remove leading spaces
      const cleanedValue = value.replace(/^\s+/, '');
      (this.personalData[fieldName] as string) = cleanedValue;
    }
  }

  preventLeadingSpace(event: KeyboardEvent, fieldName: keyof Personal): void {
    const input = event.target as HTMLInputElement;
    const fieldValue = this.personalData[fieldName];
    // Prevent space if it's the first character or if the field is empty
    if (event.key === ' ' && (input.selectionStart === 0 || !fieldValue)) {
      event.preventDefault();
    }
  }


  // Update existing formatAccountHolderName method
  formatAccountHolderName(): void {
  let value = this.personalData.accHolderName;
  if (value) {
    // Remove leading spaces and any remaining special characters/numbers
    value = value.replace(/^\s+/, '').replace(/[^a-zA-Z\s]/g, '');
    
    // Replace multiple spaces with single space
    value = value.replace(/\s{2,}/g, ' ');
    
    // Capitalize first letter of each word
    value = value.replace(/\w\S*/g, (txt: string) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
    
    this.personalData.accHolderName = value;
  }
}

formatName(fieldName: 'firstNameEnglish' | 'lastNameEnglish'): void {
  let value = this.personalData[fieldName];
  if (value) {
    // Remove only numbers and special characters, allow letters from all languages
    value = value.replace(/[^A-Za-z\u0D80-\u0DFF\s]/g, ''); // \u0D80-\u0DFF is Tamil Unicode block

    // Remove leading spaces
    value = value.replace(/^\s+/, '');

    // Replace multiple spaces with a single space
    value = value.replace(/\s{2,}/g, ' ');

    // Capitalize first letter (only works for English)
    if (/^[A-Za-z]/.test(value)) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }

    this.personalData[fieldName] = value;
  }
}

  // Updated formatSinhalaName function
  formatSinhalaName(fieldName: 'firstNameSinhala' | 'lastNameSinhala'): void {
    let value = this.personalData[fieldName];
    if (value) {
      // Allow only Sinhala unicode characters and spaces
      value = value.replace(/[^\u0D80-\u0DFF\s]/g, '');

      // Remove leading spaces
      value = value.replace(/^\s+/, '');

      // Replace multiple consecutive spaces with single space
      value = value.replace(/\s{2,}/g, ' ');

      this.personalData[fieldName] = value;
    }
  }

  // Updated formatTamilName function
  formatTamilName(fieldName: 'firstNameTamil' | 'lastNameTamil'): void {
    let value = this.personalData[fieldName];
    if (value) {
      // Allow only Tamil unicode characters and spaces
      value = value.replace(/[^\u0B80-\u0BFF\s]/g, '');

      // Remove leading spaces
      value = value.replace(/^\s+/, '');

      // Replace multiple consecutive spaces with single space
      value = value.replace(/\s{2,}/g, ' ');

      this.personalData[fieldName] = value;
    }
  }

  // Add these methods to your component class

  // Prevent invalid English characters (only allow letters and spaces)
preventInvalidEnglishCharacters(event: KeyboardEvent): void {
  const char = event.key;

  // Allow control keys
  if (event.ctrlKey || event.altKey || event.metaKey ||
      ['Backspace','Delete','Tab','Escape','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(char)) {
    return;
  }

  // Block numbers and special characters
  const regex = /^[^0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]+$/;
  if (!regex.test(char)) {
    event.preventDefault();
  }
}



  // Prevent invalid Sinhala characters (only allow Sinhala unicode range and spaces)
  preventInvalidSinhalaCharacters(event: KeyboardEvent): void {
    const char = event.key;

    // Allow control keys
    if (event.ctrlKey || event.altKey || event.metaKey ||
      char === 'Backspace' || char === 'Delete' || char === 'Tab' ||
      char === 'Escape' || char === 'Enter' || char === 'ArrowLeft' ||
      char === 'ArrowRight' || char === 'ArrowUp' || char === 'ArrowDown' ||
      char === 'Home' || char === 'End') {
      return;
    }

    // Allow Sinhala characters (U+0D80-U+0DFF) and space
    const sinhalaRegex = /^[\u0D80-\u0DFF\s]$/;
    if (!sinhalaRegex.test(char)) {
      event.preventDefault();
    }
  }

  // Prevent invalid Tamil characters (only allow Tamil unicode range and spaces)
  preventInvalidTamilCharacters(event: KeyboardEvent): void {
    const char = event.key;

    // Allow control keys
    if (event.ctrlKey || event.altKey || event.metaKey ||
      char === 'Backspace' || char === 'Delete' || char === 'Tab' ||
      char === 'Escape' || char === 'Enter' || char === 'ArrowLeft' ||
      char === 'ArrowRight' || char === 'ArrowUp' || char === 'ArrowDown' ||
      char === 'Home' || char === 'End') {
      return;
    }

    // Allow Tamil characters (U+0B80-U+0BFF) and space
    const tamilRegex = /^[\u0B80-\u0BFF\s]$/;
    if (!tamilRegex.test(char)) {
      event.preventDefault();
    }
  }


  hasInvalidNameCharacters(fieldName: 'firstNameEnglish' | 'lastNameEnglish'): boolean {
    const value = this.personalData[fieldName];
    if (!value) return false;
    // Check if contains numbers or special characters
    return /[^a-zA-Z\s]/.test(value);
  }

  hasInvalidSinhalaCharacters(fieldName: 'firstNameSinhala' | 'lastNameSinhala'): boolean {
    const value = this.personalData[fieldName];
    if (!value) return false;
    // Check if contains non-Sinhala characters
    return /[^\u0D80-\u0DFF\s]/.test(value);
  }



  hasInvalidTamilCharacters(fieldName: 'firstNameTamil' | 'lastNameTamil'): boolean {
    const value = this.personalData[fieldName];
    if (!value) return false;
    // Check if contains non-Tamil characters
    return /[^\u0B80-\u0BFF\s]/.test(value);
  }

  hasInvalidAccountHolderName(): boolean {
  const value = this.personalData.accHolderName;
  if (!value) return false;
  
  // Check if contains numbers or special characters (excluding spaces)
  return /[^a-zA-Z\s]/.test(value);
}

  arePhoneNumbersSame(): boolean {
    if (!this.personalData.contact1 || !this.personalData.contact2) {
      return false;
    }
    const fullPhone1 = this.personalData.contact1Code + this.personalData.contact1;
    const fullPhone2 = this.personalData.contact2Code + this.personalData.contact2;
    return fullPhone1 === fullPhone2;
  }

  isAtLeastOneLanguageSelected(): boolean {
    return this.selectedLanguages && this.selectedLanguages.length > 0;
  }

  // Add these methods to the component class

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  isValidPassword(password: string): boolean {
    if (!password) return true; // Optional field
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  doPasswordsMatch(): boolean {
    if (!this.personalData.password || !this.personalData.confirmPassword) return true;
    return this.personalData.password === this.personalData.confirmPassword;
  }

  // Update the checkFormValidity method to include password validation
  checkFormValidity(): boolean {
    const isFirstNameValid =
      !!this.personalData.firstNameEnglish &&
      !!this.personalData.firstNameSinhala &&
      !!this.personalData.firstNameTamil &&
      !this.hasInvalidNameCharacters('firstNameEnglish') &&
      !this.hasInvalidSinhalaCharacters('firstNameSinhala') &&
      !this.hasInvalidTamilCharacters('firstNameTamil');

    const isLastNameValid =
      !!this.personalData.lastNameEnglish &&
      !!this.personalData.lastNameSinhala &&
      !!this.personalData.lastNameTamil &&
      !this.hasInvalidNameCharacters('lastNameEnglish') &&
      !this.hasInvalidSinhalaCharacters('lastNameSinhala') &&
      !this.hasInvalidTamilCharacters('lastNameTamil');

    const isContact1Valid = this.isValidPhoneNumber(this.personalData.contact1);
    const isEmailValid = this.isValidEmail(this.personalData.email);
    const isEmpTypeSelected = !!this.empType;
    const isLanguagesSelected = this.isAtLeastOneLanguageSelected();
    const isCompanySelected = !!this.personalData.companyId;
    const isCenterSelected = !!this.personalData.centerId;
    const isJobRoleSelected = !!this.personalData.jobRole;
    const isNicValid = this.isValidNIC(this.personalData.nic);

    // Password validation - only validate if password is provided
    const isPasswordValid = !this.personalData.password ||
      (this.isValidPassword(this.personalData.password) && this.doPasswordsMatch());

    return (
      isFirstNameValid &&
      isLastNameValid &&
      isContact1Valid && // Replace isPhoneNumberValid with this
      isEmailValid &&
      isEmpTypeSelected &&
      isLanguagesSelected &&
      isCompanySelected &&
      isCenterSelected &&
      isJobRoleSelected &&
      isNicValid &&
      isPasswordValid &&
      !this.arePhoneNumbersSame()
    );
  }

  onInputChange(event: any, type: string): void {
    if (type === 'phone') {
      const value = event.target.value;
      // Only allow numbers
      event.target.value = value.replace(/[^0-9]/g, '');
    }
  }


  getFieldError(fieldName: string): string {
    if (fieldName === 'contact1') {
      return 'Contact Number 01 is required';
    }
    if (fieldName === 'contact2') {
      return 'Contact Number 02 is required';
    }
    return `${fieldName} is required`;
  }


  checkSubmitValidity(): boolean {
    const {
      accHolderName,
      accNumber,
      confirmAccNumber,
      bankName,
      branchName,
      houseNumber,
      streetName,
      city,
      district,
      companyId,
    } = this.personalData;

    const isAddressValid = !!houseNumber && !!streetName && !!city && !!district;

    if (companyId == 1) {
      const isBankDetailsValid =
        !!accHolderName &&
        !!accNumber &&
        !!bankName &&
        !!branchName &&
        !!confirmAccNumber &&
        accNumber === confirmAccNumber &&
        !this.hasInvalidAccountHolderName();
      return isBankDetailsValid && isAddressValid && !this.arePhoneNumbersSame();
    } else {
      return isAddressValid && !this.arePhoneNumbersSame();
    }
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
      this.selectedFileName = file.name;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFileInput(event: Event): void {
    event.preventDefault();
    const fileInput = document.getElementById('imageUpload');
    fileInput?.click();
  }

  updateEmployeeType(selectedType: string): void {
    this.empType = selectedType;
    this.personalData.empType = selectedType;
  }

  onCheckboxChange1(lang: string, event: any) {
    if (event.target.checked) {
      if (this.personalData.languages) {
        if (!this.personalData.languages.includes(lang)) {
          this.personalData.languages += this.personalData.languages
            ? `,${lang}`
            : lang;
        }
      } else {
        this.personalData.languages = lang;
      }
    } else {
      const languagesArray = this.personalData.languages.split(',');
      const index = languagesArray.indexOf(lang);
      if (index !== -1) {
        languagesArray.splice(index, 1);
      }
      this.personalData.languages = languagesArray.join(',');
    }
  }

  EpmloyeIdCreate() {
    let rolePrefix: string | undefined;

    const rolePrefixes: { [key: string]: string } = {
      'Collection Center Head': 'CCH',
      'Collection Centre Manager': 'CCM',
      'Customer Officer': 'CUO',
      'Collection Officer': 'COO',
    };

    rolePrefix = rolePrefixes[this.personalData.jobRole];

    if (this.personalData.jobRole === this.initiateJobRole) {
      this.lastID = this.initiateId;
    } else {
      if (!rolePrefix) {
        return;
      }

      this.getLastID(rolePrefix).then((lastID) => {
        this.personalData.empId = rolePrefix + lastID;
      });
    }
  }

  getLastID(role: string): Promise<string> {
    return new Promise((resolve) => {
      this.collectionCenterSrv.getForCreateId(role).subscribe((res) => {
        this.lastID = res.result.empId;
        const lastId = res.result.empId;
        resolve(lastId);
      });
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
      this.navigatePath('/steckholders/action/collective-officer');
    }
  });
}


nextFormCreate(page: 'pageOne' | 'pageTwo') {
  if (page === 'pageTwo') {
    const missingFields: string[] = [];

    // Validate pageOne fields
    if (!this.personalData.empType) {
      missingFields.push('Staff Employee Type');
    }

    if (!this.isAtLeastOneLanguageSelected()) {
      missingFields.push('Preferred Languages');
    }

    if (!this.personalData.companyId) {
      missingFields.push('Company Name');
    }

    if (!this.personalData.centerId) {
      missingFields.push('Collection Centre Name');
    }

    if (!this.personalData.jobRole) {
      missingFields.push('Job Role');
    }

    if (this.personalData.jobRole === 'Collection Officer' && !this.personalData.irmId) {
      missingFields.push('Manager Name');
    }

    if (!this.personalData.firstNameEnglish) {
      missingFields.push('First Name (in English)');
    }

    if (!this.personalData.lastNameEnglish) {
      missingFields.push('Last Name (in English)');
    }

    if (!this.personalData.firstNameSinhala) {
      missingFields.push('First Name (in Sinhala)');
    }

    if (!this.personalData.lastNameSinhala) {
      missingFields.push('Last Name (in Sinhala)');
    }

    if (!this.personalData.firstNameTamil) {
      missingFields.push('First Name (in Tamil)');
    }

    if (!this.personalData.lastNameTamil) {
      missingFields.push('Last Name (in Tamil)');
    }

    if (!this.personalData.contact1) {
      missingFields.push('Mobile Number - 01');
    } else if (!this.isValidPhoneNumber(this.personalData.contact1)) {
      missingFields.push('Mobile Number - 01 - Must be 9 digits');
    }

    if (this.personalData.contact2 && !this.isValidPhoneNumber(this.personalData.contact2)) {
      missingFields.push('Mobile Number - 02 - Must be 9 digits');
    }

    if (this.personalData.contact1 && this.personalData.contact2 && this.personalData.contact1 === this.personalData.contact2) {
      missingFields.push('Mobile Number - 02 - Cannot be the same as Mobile Number - 01');
    }

    if (!this.personalData.nic) {
      missingFields.push('NIC Number');
    } else if (!this.isValidNIC(this.personalData.nic)) {
      missingFields.push('NIC Number - Must be 12 digits or 9 digits followed by V');
    }

    if (!this.personalData.email) {
      missingFields.push('Email');
    } else if (!this.isValidEmail(this.personalData.email)) {
      missingFields.push('Email - Invalid format (e.g., example@domain.com)');
    }

    // If errors, show popup and stop navigation
    if (missingFields.length > 0) {
      let errorMessage = '<div class="text-left"><p class="mb-2">Please fix the following issues:</p><ul class="list-disc pl-5">';
      missingFields.forEach((field) => {
        errorMessage += `<li>${field}</li>`;
      });
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
  }

  // Navigate to the selected page
  this.selectedPage = page;
}
updateProvince(event: DropdownChangeEvent): void {
  const selectedDistrict = event.value;  // Get selected district name directly

  const selected = this.districts.find(
    (district) => district.name === selectedDistrict
  );

  if (this.itemId === null) {
    if (selected) {
      this.personalData.province = selected.province;
    } else {
      this.personalData.province = '';
    }
  } else {
    if (selected) {
      this.personalData.province = selected.province;
    }
  }
}

  getAllCompanies() {
    this.collectionCenterSrv.getAllCompanyList().subscribe((res) => {
      this.CompanyData = res;

      // Convert to dropdown options format
      this.companyOptions = this.CompanyData.map(company => ({
        label: company.companyNameEnglish,
        value: company.id
      }));
    });
  }

  // Update getAllCollectionCetnter method
  getAllCollectionCetnter() {
    this.collectionCenterSrv.getAllCollectionCenter().subscribe((res) => {
      this.collectionCenterData = res;

      // Convert to dropdown options format
      this.centerOptions = this.collectionCenterData.map(center => ({
        label: center.centerName,
        value: center.id
      }));
    });
  }

  // Update getAllCollectionManagers method
  getAllCollectionManagers() {
    this.collectionCenterSrv
      .getAllManagerList(
        this.personalData.companyId,
        this.personalData.centerId
      )
      .subscribe((res) => {
        this.collectionManagerData = res;

        // Convert to dropdown options format
        this.managerOptions = this.collectionManagerData.map(manager => ({
          label: manager.firstNameEnglish,
          value: manager.id
        }));
      });
  }
  onCheckboxChange(language: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      if (!this.selectedLanguages.includes(language)) {
        this.selectedLanguages.push(language);
      }
    } else {
      this.selectedLanguages = this.selectedLanguages.filter(
        (lang) => lang !== language
      );
    }

    // Update personalData.languages string
    this.personalData.languages = this.selectedLanguages.join(',');
    this.isLanguageRequired = this.selectedLanguages.length === 0;
  }

onSubmit() {
  // Log personalData to verify phone numbers
  console.log('personalData before submit:', {
    contact1: this.personalData.contact1,
    contact1Code: this.personalData.contact1Code,
    contact2: this.personalData.contact2,
    contact2Code: this.personalData.contact2Code
  });

  const missingFields: string[] = [];

  if (!this.personalData.email) {
    missingFields.push('Email');
  } else if (!this.isValidEmail(this.personalData.email)) {
    missingFields.push(`Email - ${this.getEmailErrorMessage(this.personalData.email)}`);
  }

  // Check required fields for pageOne
  if (!this.personalData.empType) {
    missingFields.push('Staff Employee Type');
  }

  if (!this.isAtLeastOneLanguageSelected()) {
    missingFields.push('Preferred Languages');
  }

  if (!this.personalData.companyId) {
    missingFields.push('Company Name');
  }

  if (!this.personalData.centerId) {
    missingFields.push('Collection Centre Name');
  }

  if (!this.personalData.jobRole) {
    missingFields.push('Job Role');
  }

  if (this.personalData.jobRole === 'Collection Officer' && !this.personalData.irmId) {
    missingFields.push('Manager Name');
  }

  if (!this.personalData.firstNameEnglish) {
    missingFields.push('First Name (in English)');
  }

  if (!this.personalData.lastNameEnglish) {
    missingFields.push('Last Name (in English)');
  }

  if (!this.personalData.firstNameSinhala) {
    missingFields.push('First Name (in Sinhala)');
  }

  if (!this.personalData.lastNameSinhala) {
    missingFields.push('Last Name (in Sinhala)');
  }

  if (!this.personalData.firstNameTamil) {
    missingFields.push('First Name (in Tamil)');
  }

  if (!this.personalData.lastNameTamil) {
    missingFields.push('Last Name (in Tamil)');
  }

  if (!this.personalData.contact1) {
    missingFields.push('Mobile Number - 01');
  } else if (!this.isValidPhoneNumber(this.personalData.contact1)) {
    missingFields.push('Mobile Number - 01 - Must be 9 digits');
  }

  if (this.personalData.contact2 && !this.isValidPhoneNumber(this.personalData.contact2)) {
    missingFields.push('Mobile Number - 02 - Must be 9 digits');
  }

  if (this.personalData.contact1 && this.personalData.contact2 && this.personalData.contact1 === this.personalData.contact2) {
    missingFields.push('Mobile Number - 02 - Cannot be the same as Mobile Number - 01');
  }

  if (!this.personalData.nic) {
    missingFields.push('NIC Number');
  } else if (!this.isValidNIC(this.personalData.nic)) {
    missingFields.push('NIC Number - Must be 12 digits or 9 digits followed by V');
  }

  if (!this.personalData.email) {
    missingFields.push('Email');
  } else if (!this.isValidEmail(this.personalData.email)) {
    missingFields.push('Email - Invalid format (e.g., example@domain.com)');
  }

  // Check required fields for pageTwo
  if (!this.personalData.houseNumber) {
    missingFields.push('House Number');
  }

  if (!this.personalData.streetName) {
    missingFields.push('Street Name');
  }

  if (!this.personalData.city) {
    missingFields.push('City');
  }

  if (!this.personalData.district) {
    missingFields.push('District');
  }

  if (!this.personalData.province) {
    missingFields.push('Province');
  }

  if (!this.personalData.accHolderName) {
    missingFields.push('Account Holder Name');
  }

  if (!this.personalData.accNumber) {
    missingFields.push('Account Number');
  }

  if (!this.personalData.confirmAccNumber) {
    missingFields.push('Confirm Account Number');
  } else if (this.personalData.accNumber !== this.personalData.confirmAccNumber) {
    missingFields.push('Confirm Account Number - Must match Account Number');
  }

  if (!this.selectedBankId) {
    missingFields.push('Bank Name');
  }

  if (!this.selectedBranchId) {
    missingFields.push('Branch Name');
  }

  // If errors, show list and stop
  if (missingFields.length > 0) {
    let errorMessage = '<div class="text-left"><p class="mb-2">Please fix the following issues:</p><ul class="list-disc pl-5">';
    missingFields.forEach((field) => {
      errorMessage += `<li>${field}</li>`;
    });
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
    this.isLoading = false;
    return;
  }

  // If valid, confirm update
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to update the collection officer?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Save it!',
    cancelButtonText: 'No, cancel',
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      this.isLoading = true;

      // Map phone number fields to backend expected names
      const payload = {
        ...this.personalData,
        phoneNumber01: this.personalData.contact1 || '',
        phoneCode01: this.personalData.contact1Code || '+94',
        phoneNumber02: this.personalData.contact2 || '',
        phoneCode02: this.personalData.contact2Code || this.personalData.contact1Code || '+94',
      };

      console.log('Payload sent to backend:', {
        phoneNumber01: payload.phoneNumber01,
        phoneCode01: payload.phoneCode01,
        phoneNumber02: payload.phoneNumber02,
        phoneCode02: payload.phoneCode02,
      });

      this.collectionOfficerService
        .editCollectiveOfficer(payload, this.itemId, this.selectedImage)
        .subscribe(
          (res: any) => {
            this.isLoading = false;
            Swal.fire(
              'Success',
              'Collection Officer Updated Successfully',
              'success'
            );
            this.navigatePath('/steckholders/action/collective-officer');
          },
          (error: any) => {
            this.isLoading = false;
            let errorMessage = 'An unexpected error occurred';

            if (error.error && error.error.error) {
              switch (error.error.error) {
                case 'NIC already exists':
                  errorMessage = 'The NIC number is already registered.';
                  break;
                case 'Email already exists':
                  errorMessage = 'The email address is already in use.';
                  break;
                case 'Primary phone number already exists':
                  errorMessage = 'The primary phone number is already registered.';
                  break;
                case 'Secondary phone number already exists':
                  errorMessage = 'The secondary phone number is already registered.';
                  break;
                case 'Invalid file format or file upload error':
                  errorMessage = 'Invalid file format or error uploading the file.';
                  break;
                default:
                  errorMessage = error.error.error || 'An unexpected error occurred';
              }
            }

            this.errorMessage = errorMessage;
            Swal.fire('Error', this.errorMessage, 'error');
          }
        );
    } else {
      this.isLoading = false;
      Swal.fire('Cancelled', 'Your action has been cancelled', 'info');
    }
  });
}

  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  formatHouseNumber(): void {
  if (this.personalData.houseNumber) {
    // Remove leading spaces and capitalize first letter
    this.personalData.houseNumber = this.personalData.houseNumber
      .replace(/^\s+/, '')
      .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
}

formatStreetName(): void {
  if (this.personalData.streetName) {
    // Remove leading spaces and capitalize first letter
    this.personalData.streetName = this.personalData.streetName
      .replace(/^\s+/, '')
      .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
}

formatCity(): void {
  if (this.personalData.city) {
    // Remove leading spaces and capitalize first letter
    this.personalData.city = this.personalData.city
      .replace(/^\s+/, '')
      .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
}

getEmailErrorMessage(email: string): string {
  if (!email) return 'Email is required';
  
  if (email.includes('..')) {
    return 'Email cannot contain consecutive dots';
  }
  if (email.startsWith('.')) {
    return 'Email cannot start with a dot';
  }
  if (email.endsWith('.')) {
    return 'Email cannot end with a dot';
  }
  if (/[!#$%^&*()=<>?\/\\]/.test(email)) {
    return 'Email contains invalid special characters';
  }
  
  return 'Please enter a valid email in the format: example@domain.com';
}

}

class Personal {
  jobRole!: string;
  empId!: any;
  centerId!: number;
  irmId!: number;
  empType!: string;
  firstNameEnglish!: string;
  firstNameSinhala!: string;
  firstNameTamil!: string;
  lastNameEnglish!: string;
  lastNameSinhala!: string;
  lastNameTamil!: string;
  contact1Code: string = '+94';
  contact1!: string;
  contact2Code: string = '+94';
  contact2!: string;
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
  languages: string = '';
  companyId!: number;
  image!: string;
  accHolderName!: any;
  accNumber!: any;
  confirmAccNumber!: any;
  bankName!: string;
  branchName!: string;
  confirmPassword!: string; // Confirm password field
}

class CollectionCenter {
  id!: number;
  centerName!: string;
}

class CollectionManager {
  id!: number;
  firstNameEnglish!: string;
}

class Company {
  id!: number;
  companyNameEnglish!: string;
}

