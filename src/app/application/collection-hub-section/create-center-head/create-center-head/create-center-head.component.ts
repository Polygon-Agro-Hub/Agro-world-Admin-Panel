import { Component, OnInit } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { Country, COUNTRIES } from '../../../../../assets/country-data';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CollectionOfficerService } from '../../../../services/collection-officer/collection-officer.service';
import { CollectionCenterService } from '../../../../services/collection-center/collection-center.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { EmailvalidationsService } from '../../../../services/email-validation/emailvalidations.service';

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

// Field configuration type
interface FieldConfig {
  regex: RegExp;
  shouldCapitalize: boolean;
  dataProperty: keyof InstanceType<typeof Personal>;
}

@Component({
  selector: 'app-create-center-head',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    DropdownModule, InputTextModule
  ],
  templateUrl: './create-center-head.component.html',
  styleUrl: './create-center-head.component.css',
})
export class CreateCenterHeadComponent implements OnInit {
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
  selectedImage: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  selectedFileName!: string;
  invalidFields: Set<string> = new Set();
  touchedFields: { [key in keyof Personal]?: boolean } = {};
  confirmAccountNumberError: boolean = false;
  confirmAccountNumberRequired: boolean = false;
  errorMessage: string = '';
  emailErrorMessage: string = '';
  isEmailTouched: boolean = false;
  districtOptions: any[] = [];

  allowedPrefixes = ['70', '71', '72', '75', '76', '77', '78'];
  isPhoneInvalidMap: { [key: string]: boolean } = {
    phone01: false,
    phone02: false,
  };

  countries: Country[] = COUNTRIES;
  selectedCountry1: Country | null = null;
  selectedCountry2: Country | null = null;
  // leadingSpaceError: boolean = false;
  // specialCharOrNumberError: boolean = false;

  // Component class properties - Similar to your phone validation approach
  isLeadingSpaceErrorMap: { [key: string]: boolean } = {
    firstNameEnglish: false,
    lastNameEnglish: false,
    firstNameSinhala: false,
    lastNameSinhala: false,
    firstNameTamil: false,
    lastNameTamil: false
  };

  isSpecialCharErrorMap: { [key: string]: boolean } = {
    firstNameEnglish: false,
    lastNameEnglish: false,
    firstNameSinhala: false,
    lastNameSinhala: false,
    firstNameTamil: false,
    lastNameTamil: false
  };




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
    private location: Location,
    private emailValidationService: EmailvalidationsService

  ) {
    const defaultCountry = this.countries.find(c => c.code === 'lk') || null;
    this.selectedCountry1 = defaultCountry;
    this.selectedCountry2 = defaultCountry;
  }

  ngOnInit(): void {
    this.getAllCompanies();
    this.EpmloyeIdCreate();
    this.loadBanks();
    this.loadBranches();

    this.districtOptions = this.districts.map(district => ({
      label: district.name,
      value: district.name,
      province: district.province
    }));
  }

  getFlagUrl(code: string): string {
    return `https://flagcdn.com/24x18/${code}.png`;
  }

  isDuplicatePhone(): boolean {
    return (
      !!this.personalData.phoneNumber01 && // ensures it's truthy
      !!this.personalData.phoneNumber02 &&
      this.personalData.phoneNumber01 === this.personalData.phoneNumber02
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
        this.location.back();
      }
    });
  }


  // Field configurations
  private fieldConfigs: { [key: string]: FieldConfig } = {
    firstNameEnglish: {
      dataProperty: 'firstNameEnglish',
      regex: /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/g, // remove only numbers & special chars
      shouldCapitalize: true
    },
    lastNameEnglish: {
      dataProperty: 'lastNameEnglish',
      regex: /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/g,
      shouldCapitalize: true
    }
  };

  // Single reusable method - similar to your validateSriLankanPhone approach
  validateNameInput(input: string, fieldName: string): void {
    if (!input) {
      this.isLeadingSpaceErrorMap[fieldName] = false;
      this.isSpecialCharErrorMap[fieldName] = false;
      return;
    }

    const config = this.fieldConfigs[fieldName];
    if (!config) {
      console.error(`Field configuration not found for: ${fieldName}`);
      return;
    }

    // Reset errors
    this.isLeadingSpaceErrorMap[fieldName] = false;
    this.isSpecialCharErrorMap[fieldName] = false;

    // Check for leading space
    if (input.startsWith(' ')) {
      this.isLeadingSpaceErrorMap[fieldName] = true;
      return;
    }

    // Check for invalid characters
    const validInput = input.replace(config.regex, '');
    if (input !== validInput) {
      this.isSpecialCharErrorMap[fieldName] = true;
      return;
    }

    // If we reach here, input is valid
    this.isLeadingSpaceErrorMap[fieldName] = false;
    this.isSpecialCharErrorMap[fieldName] = false;
  }

  validateNIC(event: any) {
    let value: string = event.target.value.toUpperCase();

    // Remove all characters except digits and 'V'
    value = value.replace(/[^0-9V]/g, '');

    // If more than 12 digits, truncate digits
    if (value.length > 12) {
      // Keep last character if it's 'V'
      const lastChar = value[value.length - 1] === 'V' ? 'V' : '';
      const digitsOnly = value.replace(/V/g, '').slice(0, 12);
      value = digitsOnly + lastChar;
    }

    // Ensure only one 'V' at the end
    if (value.includes('V') && value[value.length - 1] !== 'V') {
      value = value.replace(/V/g, '') + 'V';
    }

    this.personalData.nic = value;
    event.target.value = value;
  }

  formatNIC(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.toUpperCase();

    // Remove all non-digit/V characters
    value = value.replace(/[^0-9V]/g, '');

    const hasV = value.includes('V');

    if (hasV) {
      // Keep only 9 digits + V
      const digits = value.replace(/[^0-9]/g, '').slice(0, 9);
      value = digits + 'V';
    } else {
      // If no V, limit to 12 digits
      value = value.slice(0, 12);
    }

    input.value = value;
    this.personalData.nic = value;
  }

  get isNICInvalid() {
    const nic = this.personalData.nic;
    return nic && !/^(\d{9}V|\d{12})$/.test(nic);
  }

  restrictInput(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const currentValue = input.value;
    const inputChar = event.key.toUpperCase();

    // Allow control keys
    if (event.ctrlKey || event.metaKey || event.key.length > 1) {
      return true;
    }

    // Allow digits if total digits < 12
    const digitsCount = currentValue.replace(/[^0-9]/g, '').length;
    if (/[0-9]/.test(inputChar) && digitsCount < 12) {
      return true;
    }

    // Allow 'V' only if not already present
    if (inputChar === 'V' && !currentValue.toUpperCase().includes('V')) {
      return true;
    }

    event.preventDefault();
    return false;
  }


  // Template validation


  // Input handler method - similar to your phone input approach
  onNameInput(event: Event, fieldName: string): void {
    const inputElement = event.target as HTMLInputElement;
    let input = inputElement.value;

    const config = this.fieldConfigs[fieldName];
    if (!config) {
      console.error(`Field configuration not found for: ${fieldName}`);
      return;
    }

    // Remove leading spaces and filter invalid characters
    const trimmedInput = input.trimStart();
    const validInput = trimmedInput.replace(config.regex, '');

    // Process the valid input
    let processedInput = validInput;

    // Apply capitalization if needed (for English fields)
    if (config.shouldCapitalize && processedInput.length > 0) {
      processedInput = processedInput.charAt(0).toUpperCase() + processedInput.slice(1);
    }

    // Update the data model
    (this.personalData as any)[config.dataProperty] = processedInput;

    // Update input element value to reflect filtered result
    inputElement.value = processedInput;

    // Validate the original input to set error flags
    this.validateNameInput(input, fieldName);
  }

  capitalizeAccHolderName(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value.trimStart().replace(/\s+/g, ' ');

    // Capitalize first letter
    if (value.length > 0) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }

    this.personalData.accHolderName = value;
    inputElement.value = value;
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
        this.location.back();
      }
    });
  }

  validateSriLankanPhone(input: string, key: string): void {
    if (!input) {
      this.isPhoneInvalidMap[key] = false;
      return;
    }

    const firstDigit = input.charAt(0);
    const prefix = input.substring(0, 2);
    const isValidPrefix = this.allowedPrefixes.includes(prefix);
    const isValidLength = input.length === 9;

    if (firstDigit !== '7') {
      this.isPhoneInvalidMap[key] = true;
      return;
    }

    if (!isValidPrefix && input.length >= 2) {
      this.isPhoneInvalidMap[key] = true;
      return;
    }

    if (input.length === 9 && isValidPrefix) {
      this.isPhoneInvalidMap[key] = false;
      return;
    }

    this.isPhoneInvalidMap[key] = false;
  }

  allowOnlyNumbers(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    // Only allow 0-9
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  onTrimInput(event: Event, modelRef: any, fieldName: string): void {
    const inputElement = event.target as HTMLInputElement;
    const trimmedValue = inputElement.value.trimStart();
    modelRef[fieldName] = trimmedValue;
    inputElement.value = trimmedValue;
  }

  onTrimInputFirstCapital(event: Event, modelRef: any, fieldName: string): void {
    const inputElement = event.target as HTMLInputElement;
    let trimmedValue = inputElement.value.trimStart();
  
    // Capitalize first letter
    if (trimmedValue.length > 0) {
      trimmedValue = trimmedValue.charAt(0).toUpperCase() + trimmedValue.slice(1);
    }
  
    modelRef[fieldName] = trimmedValue;
    inputElement.value = trimmedValue;
  }

  blockSpecialChars(event: KeyboardEvent) {
    // Allow letters (A-Z, a-z), space, backspace, delete, arrow keys
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '
    ];

    // Regex: Only allow alphabets and spaces
    const regex = /^[a-zA-Z\s]*$/;

    // Block if key is not allowed
    if (!allowedKeys.includes(event.key) && !regex.test(event.key)) {
      event.preventDefault();
    }
  }

  blockNonNumbers(event: KeyboardEvent) {
    // Allow: numbers (0-9), backspace, delete, arrow keys, tab
    const allowedKeys = [
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'
    ];

    // Block if key is not allowed
    if (!allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }


  getAllCompanies() {
    this.collectionCenterSrv.getAllCompanyList().subscribe({
      next: (res) => {
        console.log('API Response:', res);
        this.CompanyData = res;
      },
      error: (error) => {
        console.error('Error fetching companies:', error);
      }
    });
  }

  loadBanks() {
    this.http.get<Bank[]>('assets/json/banks.json').subscribe(
      (data) => {
        // Sort by bank name (A-Z)
        this.banks = data.sort((a, b) => a.name.localeCompare(b.name));
      },
      (error) => {
        console.error('Failed to load banks:', error);
      }
    );
  }


  loadBranches() {
    this.http.get<BranchesData>('assets/json/branches.json').subscribe(
      (data) => {
        // Loop through each bank ID and sort its branch array
        for (const bankId in data) {
          if (data.hasOwnProperty(bankId)) {
            data[bankId] = data[bankId].sort((a, b) =>
              a.name.localeCompare(b.name)
            );
          }
        }

        this.allBranches = data;
      },
      (error) => {
        console.error('Failed to load branches:', error);
      }
    );
  }


  triggerFileInput(event: Event): void {
    event.preventDefault();
    const fileInput = document.getElementById('imageUpload');
    fileInput?.click();
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
    }
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
    let rolePrefix = 'CCH';

    this.getLastID(rolePrefix)
      .then((lastID) => {
        this.personalData.empId = rolePrefix + lastID;
      })
      .catch((error) => { });
  }

  getLastID(role: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.collectionCenterSrv.getForCreateId(role).subscribe(
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

  nextFormCreate(page: 'pageOne' | 'pageTwo') {
    this.selectedPage = page;
  }

  updateProvince(event: any): void {
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

  onBankChange() {
    if (this.selectedBankId) {
      this.branches = this.allBranches[this.selectedBankId.toString()] || [];

      const selectedBank = this.banks.find(
        (bank) => bank.ID === this.selectedBankId
      );
      if (selectedBank) {
        this.personalData.bankName = selectedBank.name;
        this.invalidFields.delete('bankName');
      }

      this.selectedBranchId = null;
      this.personalData.branchName = '';
      this.personalData.bankName = selectedBank?.name || '';
    } else {
      this.branches = [];
      this.personalData.bankName = '';
      this.selectedBranchId = null;
      this.personalData.branchName = '';
    }
  }

  onBranchChange() {
    if (this.selectedBranchId) {
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

  onSubmit() {
    const missingFields: string[] = [];

    // Validation for pageOne fields
    if (!this.personalData.empType) {
      missingFields.push('Staff Employee Type');
    }

    if (!this.isAtLeastOneLanguageSelected()) {
      missingFields.push('Preferred Languages');
    }

    if (!this.personalData.companyId) {
      missingFields.push('Company Name');
    }

    if (!this.personalData.firstNameEnglish || this.isSpecialCharErrorMap['firstNameEnglish'] || this.isLeadingSpaceErrorMap['firstNameEnglish']) {
      missingFields.push('First Name (in English) - Must be valid and not contain leading spaces or special characters');
    }

    if (!this.personalData.lastNameEnglish || this.isSpecialCharErrorMap['lastNameEnglish'] || this.isLeadingSpaceErrorMap['lastNameEnglish']) {
      missingFields.push('Last Name (in English) - Must be valid and not contain leading spaces or special characters');
    }

    if (!this.personalData.firstNameSinhala || this.isSpecialCharErrorMap['firstNameSinhala'] || this.isLeadingSpaceErrorMap['firstNameSinhala']) {
      missingFields.push('First Name (in Sinhala) - Must be valid and not contain leading spaces or special characters');
    }

    if (!this.personalData.lastNameSinhala || this.isSpecialCharErrorMap['lastNameSinhala'] || this.isLeadingSpaceErrorMap['lastNameSinhala']) {
      missingFields.push('Last Name (in Sinhala) - Must be valid and not contain leading spaces or special characters');
    }

    if (!this.personalData.firstNameTamil || this.isSpecialCharErrorMap['firstNameTamil'] || this.isLeadingSpaceErrorMap['firstNameTamil']) {
      missingFields.push('First Name (in Tamil) - Must be valid and not contain leading spaces or special characters');
    }

    if (!this.personalData.lastNameTamil || this.isSpecialCharErrorMap['lastNameTamil'] || this.isLeadingSpaceErrorMap['lastNameTamil']) {
      missingFields.push('Last Name (in Tamil) - Must be valid and not contain leading spaces or special characters');
    }

    if (!this.personalData.phoneNumber01) {
      missingFields.push('Phone Number - 1');
    } else if (!/^[0-9]{9}$/.test(this.personalData.phoneNumber01) || this.isPhoneInvalidMap['phone01']) {
      missingFields.push('Phone Number - 1 - Must be a valid 9-digit number (e.g., 77XXXXXXX)');
    }

    if (this.personalData.phoneNumber02) {
      if (!/^[0-9]{9}$/.test(this.personalData.phoneNumber02) || this.isPhoneInvalidMap['phone02']) {
        missingFields.push('Phone Number - 2 - Must be a valid 9-digit number (e.g., 77XXXXXXX)');
      }
      if (this.personalData.phoneNumber01 === this.personalData.phoneNumber02) {
        missingFields.push('Phone Number - 2 - Must be different from Phone Number - 1');
      }
    }

    if (!this.personalData.nic) {
      missingFields.push('NIC Number');
    } else if (!/^(\d{9}V|\d{12})$/.test(this.personalData.nic)) {
      missingFields.push('NIC Number - Must be 9 digits followed by V or 12 digits');
    }

    if (!this.personalData.email) {
      missingFields.push('Email');
    } else {
      const emailValidation = this.emailValidationService.validateEmail(this.personalData.email);
      if (!emailValidation.isValid) {
        missingFields.push(`Email - ${emailValidation.errorMessage}`);
      }
    }

    // Validation for pageTwo fields
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
      missingFields.push('Account Holder’s Name');
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

    // Display errors if any
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

    // Confirmation dialog
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to create the collection centre head?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, create it!',
      cancelButtonText: 'No, cancel',
      reverseButtons: true,
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
        htmlContainer: 'text-left',
        confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.collectionOfficerService
          .createCenterHead(this.personalData, this.selectedImage)
          .subscribe({
            next: (res: any) => {
              this.isLoading = false;
              this.officerId = res.officerId;
              this.errorMessage = '';

              Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Collection Centre Head Profile Created Successfully',
                confirmButtonText: 'OK',
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold text-lg',
                  htmlContainer: 'text-left',
                  confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
                },
              }).then(() => {
                this.location.back();
              });
            },
            error: (error: any) => {
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
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: this.errorMessage,
                confirmButtonText: 'OK',
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold text-lg',
                  htmlContainer: 'text-left',
                  confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
                },
              });
            },
          });
      }
    });
  }

  validateFile(file: File): boolean {
    if (file.size > 5000000) {
      Swal.fire('Error', 'File size should not exceed 5MB', 'error');
      return false;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire('Error', 'Only JPEG, JPG and PNG files are allowed', 'error');
      return false;
    }

    return true;
  }

  isEmpTypeSelected(): boolean {
    return !!this.empType;
  }

  isAtLeastOneLanguageSelected(): boolean {
    return (
      !!this.personalData.languages && this.personalData.languages.length > 0
    );
  }

  onBlur(fieldName: keyof Personal): void {
    this.touchedFields[fieldName] = true;

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

  isFieldInvalid(fieldName: keyof Personal): boolean {
    return !!this.touchedFields[fieldName] && !this.personalData[fieldName];
  }

  isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^[0-9]{9}$/;
    return phoneRegex.test(phone);
  }

  isValidEmail(email: string): boolean {
    return this.emailValidationService.isEmailValid(email);
  }

  isValidNIC(nic: string): boolean {
    const nicRegex = /^(\d{9}V|\d{12})$/;
    return nicRegex.test(nic);
  }

  handleNextClick(): void {
    console.log('phone', this.personalData.phoneCode01, this.personalData.phoneCode02);
    if (this.checkFormValidity()) {
      this.navigateToPage('pageTwo');
    }
  }

  checkFormValidity(): boolean {
    console.log('personalData', this.personalData);
    const missingFields: string[] = [];
    const phonePattern = /^[0-9]{9}$/;

    // Name validations
    if (!this.personalData.firstNameEnglish) missingFields.push('First Name (English) is Required');
    if (!this.personalData.firstNameSinhala) missingFields.push('First Name (Sinhala) is Required');
    if (!this.personalData.firstNameTamil) missingFields.push('First Name (Tamil) is Required');
    if (!this.personalData.lastNameEnglish) missingFields.push('Last Name (English) is Required');
    if (!this.personalData.lastNameSinhala) missingFields.push('Last Name (Sinhala) is Required');
    if (!this.personalData.lastNameTamil) missingFields.push('Last Name (Tamil) is Required');

    // Phone validations
    if (!this.personalData.phoneNumber01) {
      missingFields.push('Phone Number 01 is Required');
    } else if (this.isPhoneInvalidMap['phone01'] || !phonePattern.test(this.personalData.phoneNumber01)) {
      missingFields.push('Phone Number 01 (format: +947XXXXXXXX, 9 digits)');
    }

    if (this.personalData.phoneNumber02) {
      if (this.personalData.phoneNumber01 === this.personalData.phoneNumber02) {
        missingFields.push('Phone Number 02 (Must not equal Phone Number 01)');
      } else if (this.isPhoneInvalidMap['phone02'] || !phonePattern.test(this.personalData.phoneNumber02)) {
        missingFields.push('Phone Number 02 (format: +947XXXXXXXX, 9 digits)');
      }
    }

    // Email validations
    if (!this.personalData.email) {
      missingFields.push('Email is Required');
    } else {
      const emailValidation = this.emailValidationService.validateEmail(this.personalData.email);
      if (!emailValidation.isValid) {
        missingFields.push(`Email - ${emailValidation.errorMessage}`);
      }
    }

    // NIC validations
    if (!this.personalData.nic) {
      missingFields.push('NIC is Required');
    } else if (!this.isValidNIC(this.personalData.nic)) {
      missingFields.push('NIC (Must be 12 digits or 9 digits followed by V)');
    }

    // Other required fields
    if (!this.empType) missingFields.push('Employment Type is Required');
    if (!this.isAtLeastOneLanguageSelected()) missingFields.push('Preferred Languages is Required');
    if (!this.personalData.companyId) missingFields.push('Company Name is Required');
    // if (!this.personalData.centerId) missingFields.push('Collection Centre Name is Required');
    if (!this.personalData.jobRole) missingFields.push('Job Role is Required');
    if (this.personalData.jobRole === 'Collection Officer' && !this.personalData.irmId) {
      missingFields.push('Manager Name is Required');
    }

    // Show SweetAlert if there are issues
    if (missingFields.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Missing or Invalid Information',
        html: `
        <div class="text-left">
          <p class="mb-2">Please fix the following issues:</p>
          <ul class="list-disc pl-5">
            ${missingFields.map(field => `<li>${field}</li>`).join('')}
          </ul>
        </div>`,
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
          htmlContainer: 'text-left',
        },
      });
      return false;
    }

    return true;
  }

  navigateToPage(page: 'pageOne' | 'pageTwo'): void {
    this.selectedPage = page;
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
    } = this.personalData;

    const isAddressValid =
      !!houseNumber && !!streetName && !!city && !!district;

    const isBankDetailsValid =
      !!accHolderName &&
      !!accNumber &&
      !!bankName &&
      !!branchName &&
      !!confirmAccNumber &&
      accNumber === confirmAccNumber;
    return isBankDetailsValid && isAddressValid;
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  validateEmail(): void {
    this.isEmailTouched = true;
    const email = this.personalData.email;

    if (!email) {
      this.emailErrorMessage = this.emailValidationService.validationMessages.required;
      return;
    }

    const validation = this.emailValidationService.validateEmail(email);

    if (!validation.isValid) {
      this.emailErrorMessage = validation.errorMessage!;
    } else {
      this.emailErrorMessage = '';
    }
  }

}



class Personal {
  jobRole: string = 'Collection Centre Head';
  empId!: string;
  centerId!: number;
  irmId!: number;
  empType!: string;
  firstNameEnglish!: string;
  firstNameSinhala!: string;
  firstNameTamil!: string;
  lastNameEnglish!: string;
  lastNameSinhala!: string;
  lastNameTamil!: string;
  phoneCode01: string = '+94';
  phoneNumber01!: string;
  phoneCode02: string = '+94';
  phoneNumber02!: string;
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
  companyId!: any;
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
