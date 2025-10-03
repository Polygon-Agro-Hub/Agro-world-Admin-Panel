import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { StakeholderService } from '../../../services/stakeholder/stakeholder.service';

interface PhoneCode {
  code: string;
  dialCode: string;
  name: string;
}

@Component({
  selector: 'app-add-fieald-officer',
  standalone: true,
  imports: [LoadingSpinnerComponent, CommonModule, DropdownModule, FormsModule],
  templateUrl: './add-fieald-officer.component.html',
  styleUrl: './add-fieald-officer.component.css',
})
export class AddFiealdOfficerComponent {
  isLoading = false;
  selectedPage: 'pageOne' | 'pageTwo' | 'pageThree' = 'pageTwo';
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

  constructor(
    private router: Router,
    private stakeHolderSrv: StakeholderService
  ) {}

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

    this.validateLanguages();
  }

  validateLanguages() {
    this.languagesRequired =
      !this.personalData.languages || this.personalData.languages.trim() === '';
  }

  isAtLeastOneLanguageSelected(): boolean {
    return (
      !!this.personalData.languages && this.personalData.languages.length > 0
    );
  }

  getAllCompanies() {
    this.loaded = false;
    this.personalData.companyId = '';
    this.personalData.irmId = ''; // Clear manager selection
    this.managerOptions = []; // Clear manager options

    this.stakeHolderSrv.getAllCompanies().subscribe(
      (res) => {
        this.companyData = res;
        this.companyOptions = this.companyData.map((company) => ({
          label: company.companyName,
          value: company.id,
        }));
        this.loaded = true;
      },
      (error) => {
        this.companyData = [];
        this.companyOptions = [];
        this.loaded = true;
      }
    );
  }

  isFieldInvalid(fieldName: keyof Personal): boolean {
    return !!this.touchedFields[fieldName] && !this.personalData[fieldName];
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectjobRole(role: string) {
    if (role === 'Collection Centre Manager') {
      this.personalData.jobRole = 'Collection Centre Manager';
      this.toggleDropdown();
      console.log('dropdownOpen', this.dropdownOpen);
    } else {
      this.personalData.jobRole = role;
      this.toggleDropdown();
      console.log('dropdownOpen', this.dropdownOpen);
    }
    console.log('personalData', this.personalData);

    this.EpmloyeIdCreate(); // call your method
  }

  EpmloyeIdCreate() {
    const currentCompanyId = this.personalData.companyId;

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
      .catch((error) => {});
    this.personalData.companyId = currentCompanyId;
  }

  getAllCollectionManagers() {
    this.stakeHolderSrv
      .getAllManagerList(this.personalData.companyId)
      .subscribe((res) => {
        this.fiealdManagerData = res;
        // Convert to dropdown options format
        this.managerOptions = this.fiealdManagerData.map((manager) => ({
          label: manager.firstNameEnglish + ' ' + manager.lastNameEnglish,
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
    // if (!/[a-zA-Z\s]/.test(char)) {
    //   event.preventDefault();
    // }
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
        this.navigatePath('/steckholders/action/collective-officer');
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

      if (!this.personalData.companyId) {
        missingFields.push('Company Name is Required');
      }

      if (
        !this.personalData.irmId &&
        this.personalData.jobRole === 'Collection Officer'
      ) {
        missingFields.push('Collection Centre Manager is Required');
      }

      if (!this.personalData.jobRole) {
        missingFields.push('Job Role is Required');
      }

      if (
        this.personalData.jobRole === 'Collection Officer' &&
        !this.personalData.irmId
      ) {
        missingFields.push('Manager Name is Required');
      }

      if (!this.personalData.firstName) {
        missingFields.push('First Name (in English) is Required');
      }

      if (!this.personalData.lastName) {
        missingFields.push('Last Name (in English) is Required');
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

  markPageOneFieldsAsTouched(): void {
    const pageOneFields: (keyof Personal)[] = [
      'firstName',
      'lastName',
      'firstName',
      'lastName',
      'phoneNumber1',
      'phoneNumber2',
      'nic',
      'email',
      'companyId',
      'jobRole',
      'irmId',
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

  hasInvalidAccountHolderCharacters(): boolean {
    const value = this.personalData.accName;
    if (!value) return false;
    // Check if contains numbers or special characters
    return /[^a-zA-Z\s]/.test(value);
  }
}

class Personal {
  id!: number;
  companyId!: any;
  irmId!: number | string;
  firstName!: string;
  lastName!: string;
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
  district!: string;
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
  assignDistrict!: string;
  status!: string;
  modifyBy!: string;
  createdAt!: Date;
  languages: string = '';
  email!: string;
}

class Company {
  id!: number;
  companyName!: string;
}

class fiealdManager {
  id!: number;
  firstNameEnglish!: string;
  lastNameEnglish!: string;
}
