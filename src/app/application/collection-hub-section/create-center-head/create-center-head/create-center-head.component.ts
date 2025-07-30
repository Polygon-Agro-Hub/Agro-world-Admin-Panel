import { Component, OnInit } from '@angular/core';

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

  allowedPrefixes = ['70', '71', '72', '75', '76', '77', '78'];
  isPhoneInvalidMap: { [key: string]: boolean } = {
  phone01: false,
  phone02: false,
};
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
    private location: Location
  ) {}

  ngOnInit(): void {
    this.getAllCompanies();
    this.EpmloyeIdCreate();
    this.loadBanks();
    this.loadBranches();
  }

  // Field configurations
private fieldConfigs: { [key: string]: FieldConfig } = {
  'firstNameEnglish': {
    regex: /[^A-Za-z ]/g,
    shouldCapitalize: true,
    dataProperty: 'firstNameEnglish'
  },
  'lastNameEnglish': {
    regex: /[^A-Za-z ]/g,
    shouldCapitalize: true,
    dataProperty: 'lastNameEnglish'
  },
  'firstNameSinhala': {
    regex: /[^\u0D80-\u0DFF ]/g,
    shouldCapitalize: false,
    dataProperty: 'firstNameSinhala'
  },
  'lastNameSinhala': {
    regex: /[^\u0D80-\u0DFF ]/g,
    shouldCapitalize: false,
    dataProperty: 'lastNameSinhala'
  },
  'firstNameTamil': {
    regex: /[^\u0B80-\u0BFF ]/g,
    shouldCapitalize: false,
    dataProperty: 'firstNameTamil'
  },
  'lastNameTamil': {
    regex: /[^\u0B80-\u0BFF ]/g,
    shouldCapitalize: false,
    dataProperty: 'lastNameTamil'
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

capitalizeAccHolderName(): void {
  let value = this.personalData.accHolderName || '';

  // Trim leading and trailing spaces, and collapse multiple spaces inside
  value = value.replace(/\s+/g, ' ').trim();

  // Capitalize the first letter if value is not empty
  if (value.length > 0) {
    this.personalData.accHolderName = value.charAt(0).toUpperCase() + value.slice(1);
  } else {
    this.personalData.accHolderName = '';
  }
  console.log('sd', this.personalData.accHolderName)
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
    this.collectionCenterSrv.getAllCompanyList().subscribe((res) => {
      this.CompanyData = res;
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
      .catch((error) => {});
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

  updateProvince(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedDistrict = target.value;
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
    } else {
      this.branches = [];
      this.personalData.bankName = '';
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
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to create the collection centre head?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, create it!',
      cancelButtonText: 'No, cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.collectionOfficerService
          .createCenterHead(this.personalData, this.selectedImage)
          .subscribe(
            (res: any) => {
              this.isLoading = false;
              this.officerId = res.officerId;
              this.errorMessage = '';

              Swal.fire(
                'Success',
                'Collection centre Head Profile Created Successfully',
                'success'
              );
              this.location.back();
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
        this.location.back();
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
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  isValidNIC(nic: string): boolean {
    const nicRegex = /^(\d{9}V|\d{12})$/;
    return nicRegex.test(nic);
  }

  // checkFormValidity(): boolean {
  //   console.log('personalData', this.personalData)
  //   const isFirstNameValid =
  //     !!this.personalData.firstNameEnglish &&
  //     !!this.personalData.firstNameSinhala &&
  //     !!this.personalData.firstNameTamil;
  //   const isLastNameValid =
  //     !!this.personalData.lastNameEnglish &&
  //     !!this.personalData.lastNameSinhala &&
  //     !!this.personalData.lastNameTamil;
  //   const isPhoneNumber01Valid = !!this.personalData.phoneNumber01;
  //   const isEmailValid = this.isValidEmail(this.personalData.email);
  //   const isNicValid = this.isValidNIC(this.personalData.nic);
  //   const isEmpTypeSelected = !!this.empType;
  //   const isLanguagesSelected = !!this.personalData.languages;
  //   const isCompanySelected = !!this.personalData.companyId;
  //   const isNicSelected = !!this.personalData.nic;
  //   const isEmailSelected = !!this.personalData.email;
  //   const isLanguageSelected = !!this.personalData.languages;
    

  //   return (
  //     isFirstNameValid &&
  //     isLastNameValid &&
  //     isPhoneNumber01Valid &&
  //     isEmailValid &&
  //     isEmpTypeSelected &&
  //     isLanguagesSelected &&
  //     isCompanySelected &&
  //     isNicSelected &&
  //     isNicValid &&
  //     isEmailSelected &&
  //     isLanguageSelected
  //   );
    
  // }

  handleNextClick(): void {
    if (this.checkFormValidity()) {
      this.nextFormCreate('pageTwo');
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
  
    // Phone validations using isPhoneInvalidMap
    if (!this.personalData.phoneNumber01) {
      missingFields.push('Phone Number 01 is Required');
    } else if (this.isPhoneInvalidMap['phone01']) {
      missingFields.push('Phone Number 01  (e.g., 77XXXXXXX, 72XXXXXXX, etc )');
    } else if (!phonePattern.test(this.personalData.phoneNumber01)) {
      missingFields.push('Phone Number (Must be 9 digits)');
    }
  
    if (this.personalData.phoneNumber02) {
      if (this.personalData.phoneNumber01 === this.personalData.phoneNumber02) {
        missingFields.push('Phone Number 02 (Phone Number 2 Must Not Equal to Phone Number 01)');
      } else if (this.isPhoneInvalidMap['phone02']) {
        missingFields.push('Phone Number 02  (e.g., 77XXXXXXX, 72XXXXXXX, etc )');
      } else if (!phonePattern.test(this.personalData.phoneNumber02)) {
        missingFields.push('Phone Number (Must be 9 digits)');
      }
    }
  
    // Email validations
    if (!this.personalData.email) {
      missingFields.push('Email is Required');
    } else if (!this.isValidEmail(this.personalData.email)) {
      missingFields.push('Email (Please Enter a Valid Email Address)');
    }
  
    // NIC validations
    if (!this.personalData.nic) {
      missingFields.push('NIC is Required');
    } else if (!this.isValidNIC(this.personalData.nic)) {
      missingFields.push('NIC (Please Enter a Valid NIC Number)');
    }
  
    // Other required fields
    if (!this.empType) missingFields.push('Employment Type is Required');
    if (!this.personalData.languages) missingFields.push('Language is Required');
    if (!this.personalData.companyId) missingFields.push('Company is Required');
  
    // Show SweetAlert if any issues
    if (missingFields.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing or Invalid Fields',
        html: `
          <ul style="text-align: center;">
            ${missingFields.map(field => `<li>• ${field}</li>`).join('')}
          </ul>
        `,
      });
      return false;
    }
  
    return true;
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
}

class Personal {
  jobRole: string = 'Collection Center Head';
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
