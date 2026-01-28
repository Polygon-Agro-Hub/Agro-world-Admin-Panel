import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StakeholderService } from '../../../services/stakeholder/stakeholder.service';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

interface PhoneCode {
  code: string;
  dialCode: string;
  name: string;
}

interface Branch {
  bankID: number;
  ID: number;
  name: string;
}

interface Bank {
  ID: number;
  name: string;
}

interface BranchesData {
  [key: string]: Branch[];
}

@Component({
  selector: 'app-edit-fieald-officer',
  standalone: true,
  imports: [LoadingSpinnerComponent, CommonModule, DropdownModule, MultiSelectModule, FormsModule],
  templateUrl: './edit-fieald-officer.component.html',
  styleUrl: './edit-fieald-officer.component.css'
})
export class EditFiealdOfficerComponent implements OnInit {

  isLoading = false;
  selectedPage: 'pageOne' | 'pageTwo' | 'pageThree' = 'pageOne';
  itemId: number | null = null;
  selectedFile: File | null = null;
  personalData: Personal = new Personal();
  selectedFileName!: string;
  selectedImage: string | ArrayBuffer | null = null;
  empType!: string;
  languagesRequired: boolean = false;
  loaded = true;
  managerOptions: any[] = [];
  touchedFields: { [key in keyof Personal]?: boolean } = {};
  confirmAccountNumberRequired: boolean = false;
  confirmAccountNumberError: boolean = false;
  dropdownOpen = false;
  fiealdManagerData: fiealdManager[] = [];
  lastID!: string;
  languagesTouched: boolean = false;
  empTypeTouched: boolean = false;
  jobRoleTouched: boolean = false;
  selectedBankId: number | null = null;
  bankOptions: any[] = [];
  allBranches: BranchesData = {};
  branches: Branch[] = [];
  branchOptions: any[] = [];
  banks: Bank[] = [];
  invalidFields: Set<string> = new Set();
  selectedBranchId: number | null = null;
  selectedFrontNicFile: File | null = null;
  selectedBackNicFile: File | null = null;
  selectedPassbookFile: File | null = null;
  selectedContractFile: File | null = null;
  selectedFrontNicImage: string | ArrayBuffer | null = null;
  selectedBackNicImage: string | ArrayBuffer | null = null;
  selectedPassbookImage: string | ArrayBuffer | null = null;
  selectedContractImage: string | ArrayBuffer | null = null;

  // Add these properties for province-district functionality
  provinces: any[] = [];
  filteredDistricts: any[] = [];
  allDistricts = [
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
    private router: Router,
    private route: ActivatedRoute,
    private stakeHolderSrv: StakeholderService,
    private http: HttpClient,
  ) { }

  jobRoles = ['Field Officer', 'Chief Field Officer'];

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
  ];

  getFlagUrl(countryCode: string): string {
    return `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`;
  }

  // Initialize provinces
  initializeProvinces(): void {
    const uniqueProvinces = [...new Set(this.allDistricts.map(district => district.province))];
    this.provinces = uniqueProvinces.map(province => ({ name: province }));
    
    // If editing, filter districts based on existing province
    if (this.personalData.province) {
      this.filterDistrictsByProvince(this.personalData.province);
    }
  }
  
  isValidUrl(value: string): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

getFileName(value: string): string {
  if (!value) return '';
  
  // If it's a URL, extract the filename
  if (this.isValidUrl(value)) {
    try {
      const url = new URL(value);
      const pathname = url.pathname;
      const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
    
      return decodeURIComponent(filename);
    } catch {
      return value;
    }
  }
  
  // If it's just a filename, return it as-is
  return value;
}

  // Handle province change
  onProvinceChange(event: DropdownChangeEvent): void {
    const selectedProvince = event.value;
    this.personalData.province = selectedProvince;
    
    // Filter districts based on selected province
    this.filterDistrictsByProvince(selectedProvince);
    
    // Clear district selection when province changes
    this.personalData.distrct = '';
  }

  // Filter districts by province
  filterDistrictsByProvince(province: string): void {
    if (province) {
      this.filteredDistricts = this.allDistricts.filter(district => district.province === province);
    } else {
      this.filteredDistricts = [];
    }
  }

  // Handle district change
  onDistrictChange(event: DropdownChangeEvent): void {
    const selectedDistrict = event.value;
    this.personalData.distrct = selectedDistrict;
  }

  // Add this method to handle commission amount input
  onCommissionAmountInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    // Ensure proper decimal formatting
    if (value.includes('.')) {
      const parts = value.split('.');
      if (parts[1].length > 2) {
        // Limit to 2 decimal places
        value = parts[0] + '.' + parts[1].substring(0, 2);
        input.value = value;
        this.personalData.comAmount = parseFloat(value);
      }
    }
  }

  // Replace the existing formatAmount method with this one
  allowDecimalNumbers(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const char = String.fromCharCode(event.which);
    const currentValue = input.value;
    
    // Allow control keys: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(event.keyCode) !== -1 ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (event.keyCode === 65 && event.ctrlKey === true) ||
      (event.keyCode === 67 && event.ctrlKey === true) ||
      (event.keyCode === 86 && event.ctrlKey === true) ||
      (event.keyCode === 88 && event.ctrlKey === true) ||
      // Allow: home, end, left, right
      (event.keyCode >= 35 && event.keyCode <= 39)) {
      return;
    }

    // Allow numbers (0-9)
    if ((event.keyCode >= 48 && event.keyCode <= 57) ||
        (event.keyCode >= 96 && event.keyCode <= 105)) {
      return;
    }

    // Allow decimal point (.) but only one
    if (event.keyCode === 190 || event.keyCode === 110) {
      // Check if decimal point already exists
      if (currentValue.includes('.')) {
        event.preventDefault();
        return;
      }
      // Don't allow decimal point at the beginning
      if (currentValue.length === 0) {
        event.preventDefault();
        return;
      }
      return;
    }

    // Prevent any other key
    event.preventDefault();
  }

  // Update the validation method for commission amount
  isValidCommissionAmount(): boolean {
    const amount = this.personalData.comAmount;
    return amount !== null && 
           amount !== undefined && 
           amount >= 0 && 
           amount <= 100;
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
        this.router.navigate(['/steckholders/action/field-inspectors']);
      }
    });
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
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
      this.personalData.profile = file;
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

  isEmpTypeSelected(): boolean {
    return !!this.empType;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  onCheckboxChange(lang: string, event: any) {
    if (event.target.checked) {
      if (this.personalData.language) {
        if (!this.personalData.language.includes(lang)) {
          this.personalData.language += this.personalData.language
            ? `,${lang}`
            : lang;
        }
      } else {
        this.personalData.language = lang;
      }
    } else {
      const languagesArray = this.personalData.language.split(',');
      const index = languagesArray.indexOf(lang);
      if (index !== -1) {
        languagesArray.splice(index, 1);
      }
      this.personalData.language = languagesArray.join(',');
    }

    this.validateLanguages();
  }

  validateLanguages() {
    this.languagesRequired =
      !this.personalData.language || this.personalData.language.trim() === '';
  }

  isAtLeastOneLanguageSelected(): boolean {
    return (
      !!this.personalData.language && this.personalData.language.length > 0
    );
  }

  isFieldInvalid(fieldName: keyof Personal): boolean {
    const value = this.personalData[fieldName];
    
    if (fieldName === 'assignDistrict') {
      // For arrays, check if it's empty or null/undefined
      return !!this.touchedFields[fieldName] && (!value || (Array.isArray(value) && value.length === 0));
    }
    
    return !!this.touchedFields[fieldName] && !value;
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectjobRole(role: string) {
  this.personalData.jobRole = role;
  
  // Clear CFO if job role is not 'Field Officer'
  if (role !== 'Field Officer') {
    this.clearChiefFieldOfficer();
  }
  
  this.toggleDropdown();
  this.EpmloyeIdCreate(); // call your method
}

  EpmloyeIdCreate() {
    this.getAllCollectionManagers();
    let rolePrefix: string | undefined;

    const rolePrefixes: { [key: string]: string } = {
      'Field Officer': 'FIO',
      'Chief Field Officer': 'CFO',
    };

    rolePrefix = rolePrefixes[this.personalData.jobRole];

    if (!rolePrefix) {
      return;
    }

    this.getLastID(rolePrefix)
      .then((lastID) => {
        this.personalData.empId = rolePrefix + lastID;
      })
      .catch((error) => { });
  }

  getAllCollectionManagers() {
  this.stakeHolderSrv
    .getAllManagerList()
    .subscribe((res) => {
      this.fiealdManagerData = res;
      // Convert to dropdown options format
      this.managerOptions = this.fiealdManagerData.map((manager) => ({
        label: manager.empId + ' - ' + manager.firstName + ' ' + manager.lastName,
        value: manager.id,
      }));

      // Debug log to verify managers are loaded
      console.log('Loaded managers:', this.managerOptions);
      console.log('Selected irmId:', this.personalData.irmId);
      
      // Check if the selected manager exists in the options
      if (this.personalData.irmId) {
        const selectedManager = this.managerOptions.find(option => option.value == this.personalData.irmId);
        console.log('Found selected manager:', selectedManager);
      }
    });
}

  getLastID(role: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.stakeHolderSrv.getForCreateId(role).subscribe(
        (res) => {
          this.lastID = res.result.empId;
          const lastId = res.result.empId;
          resolve(lastId);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  capitalizeNames() {
    if (this.personalData.firstName) {
      this.personalData.firstName =
        this.personalData.firstName.charAt(0).toUpperCase() +
        this.personalData.firstName.slice(1);
    }
    if (this.personalData.lastName) {
      this.personalData.lastName =
        this.personalData.lastName.charAt(0).toUpperCase() +
        this.personalData.lastName.slice(1);
    }
  }

  preventSpecialCharacters(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const char = String.fromCharCode(event.which);

    // Block space if it's at the start (cursor at position 0)
    if (char === ' ' && input.selectionStart === 0) {
      event.preventDefault();
      return;
    }

    // Allow only letters (a-z, A-Z) and spaces elsewhere
    // if (!/[a-zA-Z\s]/.test(char)) {
    //   event.preventDefault();
    // }
  }

  // New method for Sinhala character validation
  allowSinhalaCharacters(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const char = String.fromCharCode(event.which);

    // Block space if it's at the start (cursor at position 0)
    if (char === ' ' && input.selectionStart === 0) {
      event.preventDefault();
      return;
    }

    // Allow Sinhala Unicode range: \u0D80-\u0DFF
    // Also allow spaces and basic punctuation
    if (!/[\u0D80-\u0DFF\s]/.test(char)) {
      event.preventDefault();
    }
  }

  // New method for Tamil character validation
  allowTamilCharacters(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const char = String.fromCharCode(event.which);

    // Block space if it's at the start (cursor at position 0)
    if (char === ' ' && input.selectionStart === 0) {
      event.preventDefault();
      return;
    }

    // Allow Tamil Unicode range: \u0B80-\u0BFF
    // Also allow spaces and basic punctuation
    if (!/[\u0B80-\u0BFF\s]/.test(char)) {
      event.preventDefault();
    }
  }

  isValidPhoneNumber(phone: string): boolean {
    if (!phone) return false;

    // Must start with 7 and have exactly 9 digits total
    const phoneRegex = /^7\d{8}$/;
    return phoneRegex.test(phone);
  }

  formatPhoneNumber(fieldName: 'phoneNumber1' | 'phoneNumber2'): void {
    let value = this.personalData[fieldName];
    if (value) {
      // Remove non-numeric characters
      value = value.replace(/[^0-9]/g, '');

      // Ensure it starts with 7
      if (value.length > 0 && value.charAt(0) !== '7') {
        // If first digit is not 7, remove it
        value = value.replace(/^[^7]*/, '');
      }

      // Limit to 9 digits
      if (value.length > 9) {
        value = value.substring(0, 9);
      }

      this.personalData[fieldName] = value;
    }
  }

  preventNonNumeric(
    event: KeyboardEvent,
    fieldName: 'phoneNumber1' | 'phoneNumber2'
  ): void {
    const input = event.target as HTMLInputElement;
    const char = String.fromCharCode(event.which);
    const currentValue = input.value;
    const cursorPosition = input.selectionStart || 0;

    // Allow only numbers (0-9)
    if (!/[0-9]/.test(char)) {
      event.preventDefault();
      return;
    }

    // If this is the first character, it must be '7'
    if (cursorPosition === 0 && currentValue.length === 0 && char !== '7') {
      event.preventDefault();
      return;
    }

    // If user tries to insert a character at position 0 that's not '7'
    if (cursorPosition === 0 && char !== '7') {
      event.preventDefault();
    }
  }

  areDuplicatePhoneNumbers(): boolean {
    const phone1 = this.personalData.phoneNumber1;
    const phone2 = this.personalData.phoneNumber2;

    if (!phone1 || !phone2) return false;

    return phone1 === phone2;
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

  isValidNIC(nic: string): boolean {
    if (!nic) return false;
    // Allow 12 digits or 9 digits followed by 'V' (case insensitive)
    const nicRegex = /^(?:\d{12}|\d{9}[vV])$/;
    return nicRegex.test(nic);
  }

  preventEmailInvalidCharacters(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    const char = String.fromCharCode(charCode);

    // Block spaces entirely for email
    if (charCode === 32) {
      event.preventDefault();
      return;
    }

    // Updated to allow alphanumeric, @, ., -, _, and +
    if (!/[a-zA-Z0-9@.\-_+]/.test(char)) {
      event.preventDefault();
    }
  }

  formatEmail(): void {
    let value = this.personalData.email;
    if (value) {
      // Remove all spaces and invalid characters
      value = value.replace(/[^a-zA-Z0-9@.\-_]/g, '');

      // Convert to lowercase for consistency
      value = value.toLowerCase();

      this.personalData.email = value;
    }
  }

  isValidEmail(email: string): boolean {
    if (!email) return false;

    // Updated email regex to allow + character
    const emailRegex =
      /^[a-zA-Z0-9]+([._%+-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-]?[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;

    // Check for invalid patterns
    if (email.includes('..')) {
      return false; // Consecutive dots
    }
    if (email.startsWith('.') || email.endsWith('.')) {
      return false; // Leading or trailing dot
    }
    // Updated special characters check to exclude + from invalid characters
    if (/[!#$%^&*()=<>?\/\\]/.test(email.replace(/\+/g, ''))) {
      return false; // Invalid special characters (excluding +)
    }

    return emailRegex.test(email);
  }

  getEmailErrorMessage(email: string): string {
    if (!email) {
      return 'Email is required';
    }

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
    if (!/@/.test(email)) {
      return 'Email must contain an @ symbol';
    }
    if (!/\./.test(email.split('@')[1])) {
      return 'Email domain must contain a dot (.)';
    }

    return 'Please enter a valid email in the format: example@domain.com';
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
        this.navigatePath('/steckholders/action/field-inspectors');
      }
    });
  }

  nextFormCreate(page: 'pageOne' | 'pageTwo' | 'pageThree') {
    console.log('personalData', this.personalData);
    if (page === 'pageTwo') {
      // Mark page one fields as touched to show validation messages
      this.markPageOneFieldsAsTouched();

      const missingFields: string[] = [];

      // Validate pageOne fields
      if (!this.personalData.empType) {
        missingFields.push('Staff Employee Type is Required');
      }

      if (!this.isAtLeastOneLanguageSelected()) {
        missingFields.push('Preferred Language is Required');
      }

      if (!this.personalData.jobRole) {
        missingFields.push('Job Role is Required');
      }

      if (this.personalData.jobRole === 'Field Officer' && !this.personalData.irmId) {
        missingFields.push('Chief Field Officer is Required');
      }

      if (!this.personalData.firstName) {
        missingFields.push('First Name in English is Required');
      }

      if (!this.personalData.lastName) {
        missingFields.push('Last Name in English is Required');
      }

      // Validate Sinhala names
      if (!this.personalData.firstNameSinhala) {
        missingFields.push('First Name in Sinhala is Required');
      }

      if (!this.personalData.lastNameSinhala) {
        missingFields.push('Last Name in Sinhala is Required');
      }

      // Validate Tamil names
      if (!this.personalData.firstNameTamil) {
        missingFields.push('First Name in Tamil is Required');
      }

      if (!this.personalData.lastNameTamil) {
        missingFields.push('Last Name in Tamil is Required');
      }

      if (!this.personalData.phoneNumber1) {
        missingFields.push('Mobile Number - 01 is Required');
      } else if (!this.isValidPhoneNumber(this.personalData.phoneNumber1)) {
        missingFields.push('Mobile Number - 01 - Must be 9 digits ');
      }

      if (
        this.personalData.phoneNumber2 &&
        !this.isValidPhoneNumber(this.personalData.phoneNumber2)
      ) {
        missingFields.push('Mobile Number - 02 - Must be 9 digits');
      }

      if (
        this.personalData.phoneNumber1 &&
        this.personalData.phoneNumber2 &&
        this.personalData.phoneNumber1 === this.personalData.phoneNumber2
      ) {
        missingFields.push(
          'Mobile Number - 02 - Cannot be the same as Mobile Number - 01'
        );
      }

      if (!this.personalData.nic) {
        missingFields.push('NIC Number is Required');
      } else if (!this.isValidNIC(this.personalData.nic)) {
        missingFields.push(
          'NIC Number - Must be 12 digits or 9 digits followed by V'
        );
      }

      if (!this.personalData.email) {
        missingFields.push('Email is Required');
      } else if (!this.isValidEmail(this.personalData.email)) {
        missingFields.push(
          `Email - ${this.getEmailErrorMessage(this.personalData.email)}`
        );
      }

      // Validate assigned districts
      if (!this.personalData.assignDistrict || this.personalData.assignDistrict.length === 0) {
        missingFields.push('At least one Assigned District is required');
      }

      // If errors exist, the validation messages will now be visible due to touched fields
      // Show popup and stop navigation
      if (missingFields.length > 0) {
        let errorMessage =
          '<div class="text-left"><p class="mb-2">Please fix the following issues:</p><ul class="list-disc pl-5">';
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

  nextFormCreate2(page: 'pageOne' | 'pageTwo' | 'pageThree') {
    console.log('personalData', this.personalData);

    if (page === 'pageThree') {
      // Mark page two fields as touched to show validation messages
      this.markPageTwoFieldsAsTouched();

      const missingFields: string[] = [];

      // Validate residential details
      const residentialErrors = this.validateResidentialDetails();
      missingFields.push(...residentialErrors);

      // Validate bank details
      const bankErrors = this.validateBankDetails();
      missingFields.push(...bankErrors);

      // If errors exist, show popup and stop navigation
      if (missingFields.length > 0) {
        let errorMessage =
          '<div class="text-left"><p class="mb-2">Please fix the following issues:</p><ul class="list-disc pl-5">';
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

    // Navigate to the selected page if validation passes
    this.selectedPage = page;
  }

  markPageOneFieldsAsTouched(): void {
    const pageOneFields: (keyof Personal)[] = [
      'firstName',
      'lastName',
      'firstNameSinhala',
      'lastNameSinhala',
      'firstNameTamil',
      'lastNameTamil',
      'phoneNumber1',
      'phoneNumber2',
      'nic',
      'email',
      'jobRole',
      'irmId',
      'assignDistrict'
    ];

    pageOneFields.forEach((field) => {
      this.touchedFields[field] = true;
    });

    this.languagesTouched = true;
    this.empTypeTouched = true;
    this.jobRoleTouched = true;
  }

  onTrimInput(event: Event, modelRef: any, fieldName: string): void {
    const inputElement = event.target as HTMLInputElement;
    let trimmedValue = inputElement.value.trimStart();

    // ✅ Capitalize the first letter (if not empty)
    if (trimmedValue.length > 0) {
      trimmedValue =
        trimmedValue.charAt(0).toUpperCase() + trimmedValue.slice(1);
    }

    modelRef[fieldName] = trimmedValue;
    inputElement.value = trimmedValue;
  }

  preventAddressSpecialCharacters(event: KeyboardEvent): void {
    // Handle space restrictions first
    if (!this.handleSpaceRestrictions(event)) {
      return;
    }

    const char = String.fromCharCode(event.which);
    // Allow letters, numbers, and space for address fields
    if (!/[a-zA-Z0-9\s\-\/\\#]/.test(char)) {
      event.preventDefault();
    }
  }

  handleSpaceRestrictions(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    const currentValue = (event.target as HTMLInputElement).value;

    if (charCode === 32) {
      if (currentValue.length === 0) {
        event.preventDefault();
        return false;
      }

      if (!/[a-zA-Z\u0D80-\u0DFF\u0B80-\u0BFF]/.test(currentValue)) {
        event.preventDefault();
        return false;
      }
      if (currentValue.charAt(currentValue.length - 1) === ' ') {
        event.preventDefault();
        return false;
      }
    }

    return true;
  }

  preventAccountHolderSpecialCharacters(event: KeyboardEvent): void {
    // Handle space restrictions first
    if (!this.handleSpaceRestrictions(event)) {
      return;
    }

    const char = String.fromCharCode(event.which);
    // Allow only letters (a-z, A-Z) and space
    if (!/[a-zA-Z\s]/.test(char)) {
      event.preventDefault();
    }
  }

  hasInvalidAccountHolderCharacters(): boolean {
    const value = this.personalData.accName;
    if (!value) return false;
    // Check if contains numbers or special characters
    return /[^a-zA-Z\s]/.test(value);
  }

  preventAccountNumberInvalidCharacters(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;

    // Block spaces entirely for account numbers
    if (charCode === 32) {
      event.preventDefault();
      return;
    }

    // Allow only numbers
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  formatAccountNumber(fieldName: 'accNumber'): void {
    let value = this.personalData[fieldName];
    if (value) {
      // Remove all spaces and non-numeric characters
      value = value.replace(/[^0-9]/g, '');
      this.personalData[fieldName] = value;
    }
  }

  onBankChange() {
    if (this.selectedBankId) {
      const branchesForBank = this.allBranches[this.selectedBankId.toString()] || [];
      // Sort branches alphabetically
      this.branches = branchesForBank.sort((a, b) => a.name.localeCompare(b.name));

      // Convert to dropdown options format
      this.branchOptions = this.branches.map(branch => ({
        label: branch.name,
        value: branch.ID
      }));

      const selectedBank = this.banks.find(
        (bank) => bank.ID === this.selectedBankId
      );
      if (selectedBank) {
        this.personalData.bank = selectedBank.name;
        this.invalidFields.delete('bank');
      }
      this.selectedBranchId = null;
      this.personalData.branch = '';
    } else {
      this.branches = [];
      this.branchOptions = [];
      this.personalData.bank = '';
    }
  }

  onBranchChange() {
    if (this.selectedBranchId) {
      const selectedBranch = this.branches.find(
        (branch) => branch.ID === this.selectedBranchId
      );
      if (selectedBranch) {
        this.personalData.branch = selectedBranch.name;
        this.invalidFields.delete('branch');
      }
    } else {
      this.personalData.branch = '';
    }
  }

  loadBanks() {
    this.http.get<Bank[]>('assets/json/banks.json').subscribe(
      (data) => {
        // Sort banks alphabetically by name
        this.banks = data.sort((a, b) => a.name.localeCompare(b.name));

        // Convert to dropdown options format
        this.bankOptions = this.banks.map(bank => ({
          label: bank.name,
          value: bank.ID
        }));
      },
      (error) => { }
    );
  }

  loadBranches() {
    this.http.get<BranchesData>('assets/json/branches.json').subscribe(
      (data) => {
        this.allBranches = data;
      },
      (error) => { }
    );
  }

  ngOnInit(): void {
    this.loadBanks();
    this.loadBranches();
    this.initializeProvinces();
    
    // Get the ID from route parameters
    this.route.params.subscribe(params => {
      this.itemId = +params['id']; // Convert to number
      if (this.itemId) {
        this.loadFieldOfficerData(this.itemId);
      } else {
        // If no ID, it's a create operation
        this.EpmloyeIdCreate();
      }
    });
    
    // Pre-fill country with Sri Lanka
    this.personalData.country = 'Sri Lanka';
  }

  // Add this method to load field officer data
  loadFieldOfficerData(id: number): void {
  this.isLoading = true;
  this.stakeHolderSrv.getFiealdOfficerById(id).subscribe(
    (response: any) => {
      this.isLoading = false;
      console.log('Full API Response:', response); // Debug log
      
      if (response && response.officerData) {
        // Try different possible response structures
        const officerData = response.officerData.fieldOfficer || response.officerData;
        
        if (officerData) {
          this.populateFormData(officerData);
          
          // Small delay to ensure dropdown is properly initialized
          setTimeout(() => {
            console.log('Final personalData:', this.personalData);
            console.log('Final managerOptions:', this.managerOptions);
          }, 500);
        } else {
          this.showErrorAndRedirect('Field officer data not found in response');
        }
      } else {
        this.showErrorAndRedirect('Invalid response structure');
      }
    },
    (error) => {
      this.isLoading = false;
      this.showErrorAndRedirect('Failed to load field officer data');
      console.error('Error loading field officer:', error);
    }
  );
}

// Helper method for error handling
private showErrorAndRedirect(message: string): void {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: message,
    confirmButtonText: 'OK',
  });
  this.router.navigate(['/steckholders/action/field-inspectors']);
}

  // Add this method to populate form with existing data
  // Add this method to populate form with existing data
populateFormData(officerData: any): void {
  // Personal Details
  this.personalData.id = officerData.id;
  this.personalData.firstName = officerData.firstName;
  this.personalData.lastName = officerData.lastName;
  this.personalData.status = officerData.status;
  
  // FIXED: Check for different possible field names for Sinhala and Tamil names
  this.personalData.firstNameSinhala = officerData.firstNameSinhala || officerData.firstnameSinhala || officerData.first_name_sinhala || '';
  this.personalData.lastNameSinhala = officerData.lastNameSinhala || officerData.lastnameSinhala || officerData.last_name_sinhala || '';
  this.personalData.firstNameTamil = officerData.firstNameTamil || officerData.firstnameTamil || officerData.first_name_tamil || '';
  this.personalData.lastNameTamil = officerData.lastNameTamil || officerData.lastnameTamil || officerData.last_name_tamil || '';
  
  // Contact Details
  this.personalData.phoneNumber1 = officerData.phoneNumber01 || officerData.phoneNumber1;
  this.personalData.phoneNumber2 = officerData.phoneNumber02 || officerData.phoneNumber2;
  this.personalData.phoneCode1 = officerData.phoneCode01 || officerData.phoneCode1 || '+94';
  this.personalData.phoneCode2 = officerData.phoneCode02 || officerData.phoneCode2 || '+94';
  this.personalData.nic = officerData.nic;
  this.personalData.email = officerData.email;
  
  // Employment Details
  this.empType = officerData.employeeType || officerData.empType;
  this.personalData.empType = officerData.employeeType || officerData.empType;
  this.personalData.jobRole = officerData.jobRole;
  this.personalData.empId = officerData.empId;
  
  // FIXED: Set Chief Field Officer ID - Check multiple possible field names
  this.personalData.irmId = officerData.irmId || officerData.chiefFieldOfficerId || officerData.managerId || null;
  
  // Languages
  if (officerData.language) {
    this.personalData.language = officerData.language;
  }
  
  // Residential Details
  this.personalData.house = officerData.houseNumber || officerData.house;
  this.personalData.street = officerData.streetName || officerData.street;
  this.personalData.city = officerData.city;
  this.personalData.distrct = officerData.district || officerData.distrct;
  this.personalData.province = officerData.province;
  this.personalData.country = officerData.country || 'Sri Lanka';
  
  // Bank Details
  this.personalData.comAmount = officerData.comAmount ? parseFloat(officerData.comAmount) : 0;
  this.personalData.accName = officerData.accHolderName || officerData.accName;
  this.personalData.accNumber = officerData.accNumber;
  this.personalData.bank = officerData.bankName || officerData.bank;
  this.personalData.branch = officerData.branchName || officerData.branch;
  
  // Assign Districts
  if (officerData.assignDistricts || officerData.assignDistrict) {
    const districtsData = officerData.assignDistricts || officerData.assignDistrict;
    
    if (Array.isArray(districtsData)) {
      this.personalData.assignDistrict = districtsData
        .map((districtName: string) => 
          this.districts.find(d => d.name === districtName)
        )
        .filter((d: any) => d !== undefined);
    } else if (typeof districtsData === 'string') {
      this.personalData.assignDistrict = districtsData
        .split(',')
        .map((districtName: string) => districtName.trim())
        .filter((districtName: string) => districtName.length > 0)
        .map((districtName: string) => 
          this.districts.find(d => d.name === districtName)
        )
        .filter((d: any) => d !== undefined);
    } else {
      this.personalData.assignDistrict = [];
    }
  } else {
    this.personalData.assignDistrict = [];
  }
  
  // Load images if available
  this.loadExistingImages(officerData);
  
  // Set bank and branch dropdowns
  this.setBankAndBranch(
    officerData.bankName || officerData.bank, 
    officerData.branchName || officerData.branch
  );
  
  // FIXED: Load managers first, then set the selected value
  this.getAllCollectionManagers();
  
  // Set profile image if available
  if (officerData.image || officerData.profile) {
    this.selectedImage = officerData.image || officerData.profile;
  }

  // Filter districts based on the loaded province
  setTimeout(() => {
    if (this.personalData.province) {
      this.filterDistrictsByProvince(this.personalData.province);
    }
  }, 100);

  // Debug log to verify data
  console.log('Populated Chief Field Officer ID:', this.personalData.irmId);
  console.log('Full populated data:', this.personalData);
}

  // Add method to load existing images
  loadExistingImages(officerData: any): void {
    // You can implement this to load existing images from URLs
    // For now, we'll just set the file names
    if (officerData.frontNic) {
      this.personalData.frontNic = officerData.frontNic;
    }
    if (officerData.backNic) {
      this.personalData.backNic = officerData.backNic;
    }
    if (officerData.backPassbook) {
      this.personalData.backPassbook = officerData.backPassbook;
    }
    if (officerData.contract) {
      this.personalData.contract = officerData.contract;
    }
  }

  // Add method to set bank and branch dropdowns
  setBankAndBranch(bankName: string, branchName: string): void {
    // Find bank by name
    const bank = this.banks.find(b => b.name === bankName);
    if (bank) {
      this.selectedBankId = bank.ID;
      this.onBankChange();
      
      // After banks are loaded, find and select the branch
      setTimeout(() => {
        const branch = this.branches.find(b => b.name === branchName);
        if (branch) {
          this.selectedBranchId = branch.ID;
          this.onBranchChange();
        }
      }, 100);
    }
  }

  validateResidentialDetails(): string[] {
    const errors: string[] = [];

    if (!this.personalData.house) {
      errors.push('House / Plot Number is required');
    }

    if (!this.personalData.street) {
      errors.push('Street Name is required');
    }

    if (!this.personalData.city) {
      errors.push('City is required');
    }

    if (!this.personalData.province) {
      errors.push('Province is required');
    }

    if (!this.personalData.distrct) {
      errors.push('District is required');
    }

    return errors;
  }

  validateBankDetails(): string[] {
    const errors: string[] = [];

    if (!this.personalData.comAmount && this.personalData.comAmount !== 0) {
      errors.push('Commission Amount is required');
    } else if (!this.isValidCommissionAmount()) {
      errors.push('Commission Amount must be between 0 and 100');
    }

    if (!this.personalData.accName) {
      errors.push('Account Holder\'s Name is required');
    } else if (this.hasInvalidAccountHolderCharacters()) {
      errors.push('Account Holder\'s Name should only contain English letters');
    }

    if (!this.personalData.accNumber) {
      errors.push('Account Number is required');
    } else if (this.personalData.accNumber.length < 8 || this.personalData.accNumber.length > 16) {
      errors.push('Account Number must be between 8 and 16 digits');
    }

    if (!this.personalData.bank) {
      errors.push('Bank Name is required');
    }

    if (!this.personalData.branch) {
      errors.push('Branch Name is required');
    }

    return errors;
  }

  isValidAccountNumber(): boolean {
    const accNumber = this.personalData.accNumber;
    if (!accNumber) return false;

    // Account number should be between 8-16 digits
    const accountRegex = /^\d{8,16}$/;
    return accountRegex.test(accNumber);
  }

  markPageTwoFieldsAsTouched(): void {
    const pageTwoFields: (keyof Personal)[] = [
      'house',
      'street',
      'city',
      'distrct',
      'province',
      'comAmount',
      'accName',
      'accNumber',
      'bank',
      'branch'
    ];

    pageTwoFields.forEach((field) => {
      this.touchedFields[field] = true;
    });
  }

  uploadFrontImage() {
    this.triggerFileInputForType('frontNic');
  }

  uploadBackImage() {
    this.triggerFileInputForType('backNic');
  }

  uploadPassbookImage() {
    this.triggerFileInputForType('passbook');
  }

  uploadContractImage() {
    this.triggerFileInputForType('contract');
  }

  triggerFileInputForType(fileType: 'frontNic' | 'backNic' | 'passbook' | 'contract'): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/jpeg,image/png,image/jpg';
    fileInput.style.display = 'none';

    fileInput.onchange = (event: any) => {
      const file: File = event.target.files[0];
      if (file) {
        this.handleFileUpload(file, fileType);
      }

      // Clean up
      document.body.removeChild(fileInput);
    };

    document.body.appendChild(fileInput);
    fileInput.click();
  }

  handleFileUpload(file: File, fileType: 'frontNic' | 'backNic' | 'passbook' | 'contract'): void {
  // Validate file size (5MB limit)
  if (file.size > 5000000) {
    Swal.fire('Error', 'File size should not exceed 5MB', 'error');
    return;
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    Swal.fire('Error', 'Only JPEG, JPG and PNG files are allowed', 'error');
    return;
  }

  // Mark field as touched
  this.touchedDocumentFields[fileType] = true;

  // Set the file and file name based on type
  switch (fileType) {
    case 'frontNic':
      this.selectedFrontNicFile = file;
      this.personalData.frontNic = file.name;
      break;
    case 'backNic':
      this.selectedBackNicFile = file;
      this.personalData.backNic = file.name;
      break;
    case 'passbook':
      this.selectedPassbookFile = file;
      this.personalData.backPassbook = file.name;
      break;
    case 'contract':
      this.selectedContractFile = file;
      this.personalData.contract = file.name;
      break;
  }

  // Preview the image
  const reader = new FileReader();
  reader.onload = (e: any) => {
    switch (fileType) {
      case 'frontNic':
        this.selectedFrontNicImage = e.target.result;
        break;
      case 'backNic':
        this.selectedBackNicImage = e.target.result;
        break;
      case 'passbook':
        this.selectedPassbookImage = e.target.result;
        break;
      case 'contract':
        this.selectedContractImage = e.target.result;
        break;
    }
  };
  reader.readAsDataURL(file);
}

  getFileTypeLabel(fileType: string): string {
    const labels: { [key: string]: string } = {
      'frontNic': 'NIC Front Image',
      'backNic': 'NIC Back Image',
      'passbook': 'Bank Passbook',
      'contract': 'Signed Contract'
    };
    return labels[fileType] || 'File';
  }

  removeUploadedFile(fileType: 'frontNic' | 'backNic' | 'passbook' | 'contract'): void {
  Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: 'You will need to upload this file again',
    showCancelButton: true,
    confirmButtonText: 'Yes, Remove',
    cancelButtonText: 'Cancel',
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
    },
  }).then((result) => {
    if (result.isConfirmed) {
      // Mark field as touched
      this.touchedDocumentFields[fileType] = true;

      switch (fileType) {
        case 'frontNic':
          this.selectedFrontNicFile = null;
          this.selectedFrontNicImage = null;
          this.personalData.frontNic = '';
          break;
        case 'backNic':
          this.selectedBackNicFile = null;
          this.selectedBackNicImage = null;
          this.personalData.backNic = '';
          break;
        case 'passbook':
          this.selectedPassbookFile = null;
          this.selectedPassbookImage = null;
          this.personalData.backPassbook = '';
          break;
        case 'contract':
          this.selectedContractFile = null;
          this.selectedContractImage = null;
          this.personalData.contract = '';
          break;
      }
    }
  });
}


  onSubmit() {
  this.markAllFieldsAsTouched();
  
  // For both create and update, ensure we're on pageThree and validate documents
  if (this.selectedPage !== 'pageThree') {
    this.selectedPage = 'pageThree';
    return;
  }

  if (this.itemId) {
    this.updateFieldOfficer();
  } else {
    this.createFieldOfficer();
  }
}

  // Updated update method with new fields
  updateFieldOfficer(): void {
  // Mark all fields as touched to show validation messages
  this.markAllFieldsAsTouched();

  const missingFields: string[] = [];

  // Check required fields for pageOne
  if (!this.personalData.empType) {
    missingFields.push('Staff Employee Type is Required');
  }

  if (!this.isAtLeastOneLanguageSelected()) {
    missingFields.push('Preferred Languages is Required');
  }

  if (!this.personalData.jobRole) {
    missingFields.push('Job Role is Required');
  }

  if (this.personalData.jobRole === 'Field Officer' && !this.personalData.irmId) {
    missingFields.push('Chief Field Officer is Required');
  }

  if (!this.personalData.firstName) {
    missingFields.push('First Name (in English) is Required');
  }

  if (!this.personalData.lastName) {
    missingFields.push('Last Name (in English) is Required');
  }

  // Validate Sinhala names
  if (!this.personalData.firstNameSinhala) {
    missingFields.push('First Name in Sinhala is Required');
  }

  if (!this.personalData.lastNameSinhala) {
    missingFields.push('Last Name in Sinhala is Required');
  }

  // Validate Tamil names
  if (!this.personalData.firstNameTamil) {
    missingFields.push('First Name in Tamil is Required');
  }

  if (!this.personalData.lastNameTamil) {
    missingFields.push('Last Name in Tamil is Required');
  }

  if (!this.personalData.phoneNumber1) {
    missingFields.push('Mobile Number - 01 is Required');
  } else if (!this.isValidPhoneNumber(this.personalData.phoneNumber1)) {
    missingFields.push('Mobile Number - 01 - Must be 9 digits starting with 7');
  }

  if (this.personalData.phoneNumber2 && !this.isValidPhoneNumber(this.personalData.phoneNumber2)) {
    missingFields.push('Mobile Number - 02 - Must be 9 digits starting with 7');
  }

  if (this.areDuplicatePhoneNumbers()) {
    missingFields.push('Mobile Number - 02 - Cannot be the same as Mobile Number - 01');
  }

  if (!this.personalData.nic) {
    missingFields.push('NIC Number is Required');
  } else if (!this.isValidNIC(this.personalData.nic)) {
    missingFields.push('NIC Number - Must be 12 digits or 9 digits followed by V');
  }

  if (!this.personalData.email) {
    missingFields.push('Email is Required');
  } else if (!this.isValidEmail(this.personalData.email)) {
    missingFields.push(`Email - ${this.getEmailErrorMessage(this.personalData.email)}`);
  }

  // Check required fields for pageTwo
  if (!this.personalData.house) {
    missingFields.push('House / Plot Number is Required');
  }

  if (!this.personalData.street) {
    missingFields.push('Street Name is Required');
  }

  if (!this.personalData.city) {
    missingFields.push('City is Required');
  }

  if (!this.personalData.province) {
    missingFields.push('Province is Required');
  }

  if (!this.personalData.distrct) {
    missingFields.push('District is Required');
  }

  if (!this.personalData.accName) {
    missingFields.push("Account Holder's Name is Required");
  } else if (this.hasInvalidAccountHolderCharacters()) {
    missingFields.push("Account Holder's Name should only contain English letters");
  }

  if (!this.personalData.accNumber) {
    missingFields.push('Account Number is Required');
  } else if (!this.isValidAccountNumber()) {
    missingFields.push('Account Number must be between 8 and 16 digits');
  }

  if (!this.personalData.bank) {
    missingFields.push('Bank Name is Required');
  }

  if (!this.personalData.branch) {
    missingFields.push('Branch Name is Required');
  }

  if (!this.personalData.comAmount && this.personalData.comAmount !== 0) {
    missingFields.push('Commission Amount is required');
  } else if (!this.isValidCommissionAmount()) {
    missingFields.push('Commission Amount must be between 0 and 100');
  }

  // Check assigned districts
  if (!this.personalData.assignDistrict || this.personalData.assignDistrict.length === 0) {
    missingFields.push('At least one Assigned District is required');
  }

  // ✅ ADDED: Check required documents for pageThree in UPDATE mode
  // For update, check if documents exist (either existing files or newly uploaded files)
  const documentErrors = this.validateDocumentFieldsForUpdate();
  missingFields.push(...documentErrors);

  // If errors, show list and stop - validation messages will now be visible
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

  // If valid, confirm update
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to update the field officer?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, update it!',
    cancelButtonText: 'No, cancel',
    reverseButtons: true,
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
    },
  }).then((result) => {
    if (result.isConfirmed) {
      this.isLoading = true;

      // Prepare the officer data object for the API with CORRECT field names including new fields
      const officerData = {
        // Personal Details - using correct field names that match backend
        firstName: this.personalData.firstName,
        lastName: this.personalData.lastName,
        firstNameSinhala: this.personalData.firstNameSinhala,
        lastNameSinhala: this.personalData.lastNameSinhala,
        firstNameTamil: this.personalData.firstNameTamil,
        lastNameTamil: this.personalData.lastNameTamil,
        phoneNumber1: this.personalData.phoneNumber1,
        phoneNumber2: this.personalData.phoneNumber2,
        phoneCode1: this.personalData.phoneCode1,
        phoneCode2: this.personalData.phoneCode2,
        nic: this.personalData.nic,
        email: this.personalData.email,
        
        // Employment Details - using correct field names
        empType: this.personalData.empType,
        jobRole: this.personalData.jobRole,
        empId: this.personalData.empId,
        irmId: this.personalData.irmId,
        
        // Languages
        language: this.personalData.language,
        
        // Residential Details - using correct field names
        house: this.personalData.house,
        street: this.personalData.street,
        city: this.personalData.city,
        distrct: this.personalData.distrct,
        province: this.personalData.province,
        country: this.personalData.country,
        
        // Bank Details - using correct field names
        comAmount: this.personalData.comAmount,
        accName: this.personalData.accName,
        accNumber: this.personalData.accNumber,
        bank: this.personalData.bank,
        branch: this.personalData.branch,
        
        // Assign Districts - FIXED: Convert district objects to comma-separated names
        assignDistrict: this.personalData.assignDistrict.map(d => d.name).join(','),
        
        // Status
        status: "Not Approved"
      };

      console.log('Sending update data:', officerData);

      // Call the update service method
      this.stakeHolderSrv.editFieldOfficer(
        officerData,
        this.itemId!,
        this.selectedFile || undefined, // profile image (optional)
        this.selectedFrontNicFile || undefined, // nicFront (optional)
        this.selectedBackNicFile || undefined, // nicBack (optional)
        this.selectedPassbookFile || undefined, // passbook (optional)
        this.selectedContractFile || undefined // contract (optional)
      ).subscribe(
        (res: any) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Field Officer Updated Successfully',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            },
          });
          this.navigatePath('/steckholders/action/field-inspectors');
        },
        (error: any) => {
          this.isLoading = false;
          let errorMessage = 'An unexpected error occurred';
          let messages: string[] = [];

          if (error.error && Array.isArray(error.error.errors)) {
            // Map backend error keys to user-friendly messages
            messages = error.error.errors.map((err: string) => {
              switch (err) {
                case 'NIC':
                  return 'The NIC number is already registered.';
                case 'Email':
                  return 'Email already exists.';
                case 'PhoneNumber1':
                  return 'Mobile Number 1 already exists.';
                case 'PhoneNumber2':
                  return 'Mobile Number 2 already exists.';
                default:
                  return 'Validation error: ' + err;
              }
            });
          }

          if (messages.length > 0) {
            errorMessage = '<div class="text-left"><p class="mb-2">Please fix the following Duplicate field issues:</p><ul class="list-disc pl-5">';
            messages.forEach(m => {
              errorMessage += `<li>${m}</li>`;
            });
            errorMessage += '</ul></div>';

            Swal.fire({
              icon: 'error',
              title: 'Duplicate Information',
              html: errorMessage,
              confirmButtonText: 'OK',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
                htmlContainer: 'text-left',
              },
            });
          } else {
            // Generic error message
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to update field officer. Please try again.',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              },
            });
          }
          console.error('Error updating field officer:', error);
        }
      );
    }
  });
}

  // Keep your existing createFieldOfficer logic (updated with new fields)
  createFieldOfficer(): void {
    // Mark all fields as touched to show validation messages
    this.markAllFieldsAsTouched();

    const missingFields: string[] = [];

    // Check required fields for pageOne
    if (!this.personalData.empType) {
      missingFields.push('Staff Employee Type is Required');
    }

    if (!this.isAtLeastOneLanguageSelected()) {
      missingFields.push('Preferred Languages is Required');
    }

    if (!this.personalData.jobRole) {
      missingFields.push('Job Role is Required');
    }

    if (this.personalData.jobRole === 'Field Officer' && !this.personalData.irmId) {
      missingFields.push('Chief Field Officer is Required');
    }

    if (!this.personalData.firstName) {
      missingFields.push('First Name (in English) is Required');
    }

    if (!this.personalData.lastName) {
      missingFields.push('Last Name (in English) is Required');
    }

    // Validate Sinhala names
    if (!this.personalData.firstNameSinhala) {
      missingFields.push('First Name in Sinhala is Required');
    }

    if (!this.personalData.lastNameSinhala) {
      missingFields.push('Last Name in Sinhala is Required');
    }

    // Validate Tamil names
    if (!this.personalData.firstNameTamil) {
      missingFields.push('First Name in Tamil is Required');
    }

    if (!this.personalData.lastNameTamil) {
      missingFields.push('Last Name in Tamil is Required');
    }

    if (!this.personalData.phoneNumber1) {
      missingFields.push('Mobile Number - 01 is Required');
    } else if (!this.isValidPhoneNumber(this.personalData.phoneNumber1)) {
      missingFields.push('Mobile Number - 01 - Must be 9 digits starting with 7');
    }

    if (this.personalData.phoneNumber2 && !this.isValidPhoneNumber(this.personalData.phoneNumber2)) {
      missingFields.push('Mobile Number - 02 - Must be 9 digits starting with 7');
    }

    if (this.areDuplicatePhoneNumbers()) {
      missingFields.push('Mobile Number - 02 - Cannot be the same as Mobile Number - 01');
    }

    if (!this.personalData.nic) {
      missingFields.push('NIC Number is Required');
    } else if (!this.isValidNIC(this.personalData.nic)) {
      missingFields.push('NIC Number - Must be 12 digits or 9 digits followed by V');
    }

    if (!this.personalData.email) {
      missingFields.push('Email is Required');
    } else if (!this.isValidEmail(this.personalData.email)) {
      missingFields.push(`Email - ${this.getEmailErrorMessage(this.personalData.email)}`);
    }

    // Check required fields for pageTwo
    if (!this.personalData.house) {
      missingFields.push('House / Plot Number is Required');
    }

    if (!this.personalData.street) {
      missingFields.push('Street Name is Required');
    }

    if (!this.personalData.city) {
      missingFields.push('City is Required');
    }

    if (!this.personalData.province) {
      missingFields.push('Province is Required');
    }

    if (!this.personalData.distrct) {
      missingFields.push('District is Required');
    }

    if (!this.personalData.accName) {
      missingFields.push("Account Holder's Name is Required");
    } else if (this.hasInvalidAccountHolderCharacters()) {
      missingFields.push("Account Holder's Name should only contain English letters");
    }

    if (!this.personalData.accNumber) {
      missingFields.push('Account Number is Required');
    } else if (!this.isValidAccountNumber()) {
      missingFields.push('Account Number must be between 8 and 16 digits');
    }

    if (!this.personalData.bank) {
      missingFields.push('Bank Name is Required');
    }

    if (!this.personalData.branch) {
      missingFields.push('Branch Name is Required');
    }

    if (!this.personalData.comAmount && this.personalData.comAmount !== 0) {
      missingFields.push('Commission Amount is required');
    } else if (!this.isValidCommissionAmount()) {
      missingFields.push('Commission Amount must be between 0 and 100');
    }

    // Check assigned districts
    if (!this.personalData.assignDistrict || this.personalData.assignDistrict.length === 0) {
      missingFields.push('At least one Assigned District is required');
    }

    // Check required documents for pageThree
    if (!this.selectedFrontNicFile) {
      missingFields.push('NIC Front Image is Required');
    }

    if (!this.selectedBackNicFile) {
      missingFields.push('NIC Back Image is Required');
    }

    if (!this.selectedPassbookFile) {
      missingFields.push('Bank Passbook is Required');
    }

    if (!this.selectedContractFile) {
      missingFields.push('Signed Contract is Required');
    }

    // If errors, show list and stop - validation messages will now be visible
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

    // If valid, confirm creation
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to create the field officer?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, create it!',
      cancelButtonText: 'No, cancel',
      reverseButtons: true,
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;

        // Prepare officer data for creation with new fields
        const officerData = {
          // Personal Details
          firstName: this.personalData.firstName,
          lastName: this.personalData.lastName,
          firstNameSinhala: this.personalData.firstNameSinhala,
          lastNameSinhala: this.personalData.lastNameSinhala,
          firstNameTamil: this.personalData.firstNameTamil,
          lastNameTamil: this.personalData.lastNameTamil,
          phoneNumber1: this.personalData.phoneNumber1,
          phoneNumber2: this.personalData.phoneNumber2,
          phoneCode1: this.personalData.phoneCode1,
          phoneCode2: this.personalData.phoneCode2,
          nic: this.personalData.nic,
          email: this.personalData.email,
          
          // Employment Details
          empType: this.personalData.empType,
          jobRole: this.personalData.jobRole,
          empId: this.personalData.empId,
          irmId: this.personalData.irmId,
          
          // Languages
          language: this.personalData.language,
          
          // Residential Details
          house: this.personalData.house,
          street: this.personalData.street,
          city: this.personalData.city,
          distrct: this.personalData.distrct,
          province: this.personalData.province,
          country: this.personalData.country,
          
          // Bank Details
          comAmount: this.personalData.comAmount,
          accName: this.personalData.accName,
          accNumber: this.personalData.accNumber,
          bank: this.personalData.bank,
          branch: this.personalData.branch,
          
          // Assign Districts - FIXED: Convert district objects to comma-separated names
          assignDistrict: this.personalData.assignDistrict.map(d => d.name).join(','),
          
          // Status
          status: "Not Approved"
        };

        // Call the service method with all the files
        this.stakeHolderSrv.createFieldOfficer(
          officerData,
          this.selectedFile, // profile image
          this.selectedFrontNicFile,
          this.selectedBackNicFile,
          this.selectedPassbookFile,
          this.selectedContractFile
        ).subscribe(
          (res: any) => {
            this.isLoading = false;

            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Field Officer Created Successfully',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              },
            });
            this.navigatePath('/steckholders/action/field-inspectors');
          },
          (error: any) => {
            this.isLoading = false;
            let errorMessage = 'An unexpected error occurred';
            let messages: string[] = [];

            if (error.error && Array.isArray(error.error.errors)) {
              // Map backend error keys to user-friendly messages
              messages = error.error.errors.map((err: string) => {
                switch (err) {
                  case 'NIC':
                    return 'The NIC number is already registered.';
                  case 'Email':
                    return 'Email already exists.';
                  case 'PhoneNumber01':
                    return 'Mobile Number 1 already exists.';
                  case 'PhoneNumber02':
                    return 'Mobile Number 2 already exists.';
                  default:
                    return 'Validation error: ' + err;
                }
              });
            }

            if (messages.length > 0) {
              errorMessage = '<div class="text-left"><p class="mb-2">Please fix the following Duplicate field issues:</p><ul class="list-disc pl-5">';
              messages.forEach(m => {
                errorMessage += `<li>${m}</li>`;
              });
              errorMessage += '</ul></div>';

              Swal.fire({
                icon: 'error',
                title: 'Duplicate Information',
                html: errorMessage,
                confirmButtonText: 'OK',
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold text-lg',
                  htmlContainer: 'text-left',
                },
              });
            } else {
              // Generic error message
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to create field officer. Please try again.',
                confirmButtonText: 'OK',
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                },
              });
            }
          }
        );
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Cancelled',
          text: 'Your action has been cancelled',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          },
        });
      }
    });
  }

  markAllFieldsAsTouched(): void {
    // Mark page one fields
    const pageOneFields: (keyof Personal)[] = [
      'empType', 'language', 'jobRole', 'irmId',
      'firstName', 'lastName', 'firstNameSinhala', 'lastNameSinhala',
      'firstNameTamil', 'lastNameTamil', 'phoneNumber1', 'phoneNumber2',
      'nic', 'email', 'distrct', 'assignDistrict'
    ];

    pageOneFields.forEach((field) => {
      this.touchedFields[field] = true;
    });

    // Mark page two fields
    const pageTwoFields: (keyof Personal)[] = [
      'house', 'street', 'city', 'distrct', 'province',
      'comAmount', 'accName', 'accNumber', 'bank', 'branch'
    ];

    pageTwoFields.forEach((field) => {
      this.touchedFields[field] = true;
    });

    // Mark special fields
    this.languagesTouched = true;
    this.empTypeTouched = true;
    this.jobRoleTouched = true;
    this.markAllDocumentFieldsAsTouched();
  }

  resetPassword() {
      Swal.fire({
        title: 'Are you sure?',
        text: 'You are about to reset the Field Officer password. This action cannot be undone.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, reset password!',
        cancelButtonText: 'Cancel',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg',
          cancelButton: 'bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          this.isLoading = true;
  
          // Use the component's known id property (itemId) or fallback to personalData.id
          this.stakeHolderSrv.changeInspectorStatus(this.itemId || this.personalData.id, 'Approved').subscribe(
            (res) => {
              this.isLoading = false;
              if (res.status) {
                Swal.fire({
                  icon: 'success',
                  title: 'Success!',
                  text: 'The Field Officer password reset successfully.',
                  showConfirmButton: false,
                  timer: 3000,
                  customClass: {
                    popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                    title: 'font-semibold text-lg',
                  },
                });
                // Reload the currently loaded field officer data
                this.loadFieldOfficerData(this.itemId || this.personalData.id);
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Error!',
                  text: 'Something went wrong. Please try again.',
                  showConfirmButton: false,
                  timer: 3000,
                  customClass: {
                    popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                    title: 'font-semibold text-lg',
                  },
                });
              }
            },
            () => {
              this.isLoading = false;
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'An error occurred while resetting password. Please try again.',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold text-lg',
                },
              });
            }
          );
        }
      });
    }

  touchedDocumentFields: { [key: string]: boolean } = {
  frontNic: false,
  backNic: false,
  passbook: false,
  contract: false
};

    isDocumentFieldInvalid(fieldType: 'frontNic' | 'backNic' | 'passbook' | 'contract'): boolean {
  if (!this.touchedDocumentFields[fieldType]) {
    return false;
  }

  switch (fieldType) {
    case 'frontNic':
      return !this.selectedFrontNicFile && !this.personalData.frontNic;
    case 'backNic':
      return !this.selectedBackNicFile && !this.personalData.backNic;
    case 'passbook':
      return !this.selectedPassbookFile && !this.personalData.backPassbook;
    case 'contract':
      return !this.selectedContractFile && !this.personalData.contract;
    default:
      return false;
  }
}

markAllDocumentFieldsAsTouched(): void {
  this.touchedDocumentFields = {
    frontNic: true,
    backNic: true,
    passbook: true,
    contract: true
  };
}

validateDocumentFields(): string[] {
  const errors: string[] = [];

  if (!this.selectedFrontNicFile && !this.personalData.frontNic) {
    errors.push('NIC Front Image is required');
  }

  if (!this.selectedBackNicFile && !this.personalData.backNic) {
    errors.push('NIC Back Image is required');
  }

  if (!this.selectedPassbookFile && !this.personalData.backPassbook) {
    errors.push('Bank Passbook is required');
  }

  if (!this.selectedContractFile && !this.personalData.contract) {
    errors.push('Signed Contract is required');
  }

  return errors;
}

validateDocumentFieldsForUpdate(): string[] {
  const errors: string[] = [];

  // For update, we need to check if documents exist (either existing or newly uploaded)
  
  // Check NIC Front Image - must have either existing file or newly uploaded file
  if (!this.selectedFrontNicFile && !this.personalData.frontNic) {
    errors.push('NIC Front Image is required');
  }

  // Check NIC Back Image - must have either existing file or newly uploaded file
  if (!this.selectedBackNicFile && !this.personalData.backNic) {
    errors.push('NIC Back Image is required');
  }

  // Check Bank Passbook - must have either existing file or newly uploaded file
  if (!this.selectedPassbookFile && !this.personalData.backPassbook) {
    errors.push('Bank Passbook is required');
  }

  // Check Signed Contract - must have either existing file or newly uploaded file
  if (!this.selectedContractFile && !this.personalData.contract) {
    errors.push('Signed Contract is required');
  }

  return errors;
}

clearJobRole(event: Event): void {
  event.stopPropagation(); // Prevent dropdown from opening
  
  // Clear job role
  this.personalData.jobRole = '';
  
  // Also clear Chief Field Officer when job role is cleared
  this.clearChiefFieldOfficer();
  
  // Mark field as touched for validation
  this.touchedFields['jobRole'] = true;
}

clearChiefFieldOfficer(): void {
  this.personalData.irmId = null;
  this.touchedFields['irmId'] = true;
}

onAssignedDistrictsChange(): void {
  // Check if assignDistrict is cleared (empty array)
  if (!this.personalData.assignDistrict || this.personalData.assignDistrict.length === 0) {
    // Clear Job Role
    this.personalData.jobRole = '';
    this.touchedFields['jobRole'] = true;
    
    // Clear Chief Field Officer
    this.clearChiefFieldOfficer();
    
    // Also reset the employee ID
    this.personalData.empId = '';
  }
}

}

class Personal {
  id!: number;
  irmId!: number | string | null;
  firstName!: string;
  lastName!: string;
  firstNameSinhala!: string;
  lastNameSinhala!: string;
  firstNameTamil!: string;
  lastNameTamil!: string;
  empType!: string;
  empId!: string;
  jobRole!: string;
  phoneCode1: string = '+94';
  phoneNumber1!: string;
  phoneCode2: string = '+94';
  phoneNumber2!: string;
  nic!: string;
  house!: string;
  street!: string;
  city!: string;
  distrct!: string;
  province!: string;
  country: string = 'Sri Lanka';
  comAmount!: number;
  accName!: string;
  accNumber!: any;
  bank!: string;
  branch!: string;
  profile!: any;
  frontNic!: string;
  backNic!: string;
  backPassbook!: string;
  contract!: string;
  assignDistrict!: any[]; // Changed to store district objects
  status!: string;
  modifyBy!: string;
  createdAt!: Date;
  language: string = '';
  email!: string;
}

class fiealdManager {
  id!: number;
  empId!: string;
  firstName!: string;
  lastName!: string;
}