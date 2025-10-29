import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { StakeholderService } from '../../../services/stakeholder/stakeholder.service';
import { HttpClient } from '@angular/common/http';
import { MultiSelectModule } from 'primeng/multiselect';

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
  selector: 'app-add-fieald-officer',
  standalone: true,
  imports: [LoadingSpinnerComponent, CommonModule, DropdownModule, FormsModule, MultiSelectModule],
  templateUrl: './add-fieald-officer.component.html',
  styleUrl: './add-fieald-officer.component.css',
})
export class AddFiealdOfficerComponent implements OnInit {
  isLoading = false;
  selectedPage: 'pageOne' | 'pageTwo' | 'pageThree' = 'pageOne';
  itemId: number | null = null;
  selectedFile: File | null = null;
  personalData: Personal = new Personal();
  selectedFileName!: string;
  selectedImage: string | ArrayBuffer | null = null;
  empType!: string;
  languagesRequired: boolean = false;
  companyOptions: any[] = [];
  loaded = true;
  managerOptions: any[] = [];
  companyData: Company[] = [];
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

  constructor(
    private router: Router,
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

  markFieldAsTouched(fieldName: keyof Personal): void {
  this.touchedFields[fieldName] = true;
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

  getAllCompanies() {
    this.stakeHolderSrv.getAllCompanies().subscribe((res) => {
      this.companyData = res;
      this.companyOptions = this.companyData.map(company => ({
        label: company.companyName,
        value: company.id
      }));
    });
  }

  isFieldInvalid(fieldName: keyof Personal): boolean {
  const isTouched = !!this.touchedFields[fieldName];
  
  if (!isTouched) {
    return false;
  }
  
  const value = this.personalData[fieldName];
  
  // Special handling for assignDistrict array
  if (fieldName === 'assignDistrict') {
    return !value || (Array.isArray(value) && value.length === 0);
  }
  
  // Default validation for other fields
  return !value;
}

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectjobRole(role: string) {
    this.personalData.jobRole = role;
    this.toggleDropdown();
    
    // Reset irmId when job role changes
    if (role !== 'Field Officer') {
      this.personalData.irmId = '';
    }
    
    this.EpmloyeIdCreate();
  }

  EpmloyeIdCreate() {
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
        label: manager.firstName + ' ' + manager.lastName,
        value: manager.id,
      }));
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
    if (!/[a-zA-Z\s]/.test(char)) {
      event.preventDefault();
    }
  }

  // New methods for Sinhala and Tamil character validation
  allowSinhalaCharacters(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const char = String.fromCharCode(event.which);

    // Block space if it's at the start (cursor at position 0)
    if (char === ' ' && input.selectionStart === 0) {
      event.preventDefault();
      return;
    }

    // Allow Sinhala Unicode range: \u0D80-\u0DFF
    if (!/[\u0D80-\u0DFF\s]/.test(char)) {
      event.preventDefault();
    }
  }

  allowTamilCharacters(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const char = String.fromCharCode(event.which);

    // Block space if it's at the start (cursor at position 0)
    if (char === ' ' && input.selectionStart === 0) {
      event.preventDefault();
      return;
    }

    // Allow Tamil Unicode range: \u0B80-\u0BFF
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

      // Company validation removed as per HTML comment
      // if (!this.personalData.companyId) {
      //   missingFields.push('Company Name is Required');
      // }

    //   if (!this.personalData.assignDistrict || 
    //     (Array.isArray(this.personalData.assignDistrict) && this.personalData.assignDistrict.length === 0)) {
    //   missingFields.push('Assigned Districts is Required');
    // }

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

      // Validate Sinhala and Tamil names
      if (!this.personalData.firstNameSinhala) {
        missingFields.push('First Name in Sinhala is Required');
      }

      if (!this.personalData.lastNameSinhala) {
        missingFields.push('Last Name in Sinhala is Required');
      }

      if (!this.personalData.firstNameTamil) {
        missingFields.push('First Name in Tamil is Required');
      }

      if (!this.personalData.lastNameTamil) {
        missingFields.push('Last Name in Tamil is Required');
      }

      // Validate assigned districts
      if (!this.personalData.assignDistrict || this.personalData.assignDistrict.length === 0) {
        missingFields.push('Assigned Districts is Required');
      }

      if (!this.personalData.phoneNumber1) {
        missingFields.push('Mobile Number - 01 is Required');
      } else if (!this.isValidPhoneNumber(this.personalData.phoneNumber1)) {
        missingFields.push('Mobile Number - 01 - Must be 9 digits starting with 7');
      }

      if (
        this.personalData.phoneNumber2 &&
        !this.isValidPhoneNumber(this.personalData.phoneNumber2)
      ) {
        missingFields.push('Mobile Number - 02 - Must be 9 digits starting with 7');
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

  updateProvince(event: DropdownChangeEvent): void {
    const selectedDistrict = event.value;

    const selected = this.districts.find(
      (district) => district.name === selectedDistrict
    );

    if (this.itemId === null) {
      if (selected) {
        this.personalData.province = selected.province;
      } else {
        this.personalData.province = '';
      }
    }
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

  formatAmount(event: KeyboardEvent): void {
  const input = event.target as HTMLInputElement;
  let value = input.value;

  // Allow control keys (backspace, delete, arrows, tab, etc.)
  if ([8, 9, 46, 37, 39, 116].includes(event.which)) {
    return;
  }

  const char = String.fromCharCode(event.which);

  // Allow only numbers and decimal point
  if (!/[0-9.]/.test(char)) {
    event.preventDefault();
    return;
  }

  // Prevent multiple decimal points
  if (char === '.' && value.includes('.')) {
    event.preventDefault();
    return;
  }

  // Check if adding this character would exceed 100
  const testValue = value + char;
  const numericValue = parseFloat(testValue);
  
  if (!isNaN(numericValue) && numericValue > 100) {
    event.preventDefault();
    return;
  }

  // If adding decimal point, automatically add .00
  if (char === '.' && !value.includes('.')) {
    // Let the decimal point be added naturally, then format
    setTimeout(() => {
      if (!value.endsWith('.00')) {
        input.value = value + '00';
        // Move cursor before the zeros
        const position = value.length + 1;
        input.setSelectionRange(position, position);
      }
    }, 0);
  }

  // Limit to 2 decimal places
  if (value.includes('.')) {
    const decimalPart = value.split('.')[1];
    if (decimalPart && decimalPart.length >= 2) {
      event.preventDefault();
    }
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
    // this.getAllCompanies(); // Commented out as per HTML
    this.EpmloyeIdCreate();
    // Pre-fill country with Sri Lanka
    this.personalData.country = 'Sri Lanka';
    
    // Initialize assignDistrict as array
    this.personalData.assignDistrict = [];
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

    if (!this.personalData.distrct) {
      errors.push('District is required');
    }

    return errors;
  }

  validateBankDetails(): string[] {
    const errors: string[] = [];

    if (!this.personalData.comAmount || this.personalData.comAmount <= 0) {
      errors.push('Commission Amount is required and must be greater than 0');
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

  isValidCommissionAmount(): boolean {
    const amount = this.personalData.comAmount;
    return amount !== null && amount !== undefined && amount > 0;
  }

  markPageTwoFieldsAsTouched(): void {
    const pageTwoFields: (keyof Personal)[] = [
      'house',
      'street',
      'city',
      'distrct',
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

    // Company validation removed as per HTML comment
    // if (!this.personalData.companyId) {
    //   missingFields.push('Company Name is Required');
    // }

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

    // Validate Sinhala and Tamil names
    if (!this.personalData.firstNameSinhala) {
      missingFields.push('First Name in Sinhala is Required');
    }

    if (!this.personalData.lastNameSinhala) {
      missingFields.push('Last Name in Sinhala is Required');
    }

    if (!this.personalData.firstNameTamil) {
      missingFields.push('First Name in Tamil is Required');
    }

    if (!this.personalData.lastNameTamil) {
      missingFields.push('Last Name in Tamil is Required');
    }

    // Validate assigned districts
    if (!this.personalData.assignDistrict || this.personalData.assignDistrict.length === 0) {
      missingFields.push('Assigned Districts is Required');
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

    if (!this.personalData.distrct) {
      missingFields.push('District is Required');
    }

    if (!this.personalData.province) {
      missingFields.push('Province is Required');
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

    if (!this.personalData.comAmount || this.personalData.comAmount <= 0) {
      missingFields.push('Commission Amount is required and must be greater than 0');
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

        // Convert assignDistrict array to string for database storage
        let assignDistrictString = '';
        if (this.personalData.assignDistrict && Array.isArray(this.personalData.assignDistrict)) {
          assignDistrictString = this.personalData.assignDistrict.join(',');
        }
        // Ensure assignDistrict string is included in personalData for backend processing
        this.personalData.assignDistrict = assignDistrictString as any;

        // Call the service method with up to 6 arguments (personalData and up to 5 files)
        this.stakeHolderSrv.createFieldOfficer(
          this.personalData,
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
  }

}

class Personal {
  id!: number;
  irmId!: number | string;
  firstName!: string;
  firstNameSinhala!: string;
  firstNameTamil!: string;
  lastName!: string;
  lastNameSinhala!: string
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
  assignDistrict!: any;
  status!: string;
  modifyBy!: string;
  createdAt!: Date;
  language: string = '';
  email!: string;
}

class Company {
  id!: number;
  companyName!: string;
}

class fiealdManager {
  id!: number;
  firstName!: string;
  lastName!: string;
}