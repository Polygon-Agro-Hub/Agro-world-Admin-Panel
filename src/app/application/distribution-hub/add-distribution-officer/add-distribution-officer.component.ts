import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { DistributionHubService } from '../../../services/distribution-hub/distribution-hub.service';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { EmailvalidationsService } from '../../../services/email-validation/emailvalidations.service';

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
  selector: 'app-add-distribution-officer',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    DropdownModule
  ],
  templateUrl: './add-distribution-officer.component.html',
  styleUrl: './add-distribution-officer.component.css',
})
export class AddDistributionOfficerComponent implements OnInit {
  duplicatePhoneError: boolean = false;

  id: number | null = null;
  companyName: string | null = null;

  officerId: number | null = null;
  isLoading = false;
  selectedFile: File | null = null;
  selectedPage: 'pageOne' | 'pageTwo' = 'pageOne';
  personalData: Personal = new Personal();

  distributionCenterData: DistributionCenter[] = [];
  CompanyData: Company[] = [];
  itemId: number | null = null;
  selectedFileName!: string;
  selectedImage: string | ArrayBuffer | null = null;
  lastID!: string;
  empType!: string;
  companyOptions: any[] = [];
  centerOptions: any[] = [];

  languagesRequired: boolean = false;

  touchedFields: { [key in keyof Personal]?: boolean } = {};

  confirmAccountNumberError: boolean = false;
  confirmAccountNumberRequired: boolean = false;

  distributionHeadData: DistributionHead[] = [];

  invalidFields: Set<string> = new Set();
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

  loaded = true;

  banks: Bank[] = [];
  branches: Branch[] = [];
  selectedBankId: number | null = null;
  selectedBranchId: number | null = null;
  allBranches: BranchesData = {};
  errorMessage: string = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private collectionCenterSrv: CollectionCenterService,
    private distributionHubSrv: DistributionHubService,
    private location: Location,
    private route: ActivatedRoute,
    private emailValidationService: EmailvalidationsService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      this.id = idParam ? +idParam : null;
  
      const companyNameParam = params.get('companyName');
      this.companyName = companyNameParam ? companyNameParam : null;
  
      console.log('Received ID:', this.id);
      console.log('Received Company Name:', this.companyName);

      this.personalData.companyId = this.id;
      console.log('personalData', this.personalData)
    });
  
    this.loadBanks();
    this.loadBranches();
    this.getAllCompanies();
  
    if (!this.id) {
      this.EpmloyeIdCreate();
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
  }).then((result) => {
    if (result.isConfirmed) {
      history.back(); // ✅ go to previous page in history
    }
  });
}


  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  // Capitalize first letter and remove invalid characters for name fields
  capitalizeWhileTyping(field: 'firstNameEnglish' | 'lastNameEnglish'| 'accHolderName'|'houseNumber'|'streetName' | 'city'): void {
    let value = this.personalData[field] || '';

    // Remove non-English letters/spaces
    value = value.replace(/[^A-Za-z ]/g, '');

    // Remove leading spaces
    value = value.replace(/^\s+/, '');

    // Capitalize first letter
    if (value.length > 0) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }

    this.personalData[field] = value;
  }

blockInvalidNameInput(event: KeyboardEvent, currentValue: string) {
  const key = event.key;

  // Allow only letters from any language (Unicode letters)
  if (!/^\p{L}$/u.test(key)) {
    event.preventDefault();
  }
}


  getAllDistributionCetnter(id: number) {
    this.loaded = false;
    this.personalData.centerId = '';
    this.distributionHubSrv.getAllDistributionCenterByCompany(id).subscribe(
      (res) => {
        this.distributionCenterData = res;
        // Convert to dropdown options format
        this.centerOptions = this.distributionCenterData.map(center => ({
          label: center.centerName,
          value: center.id
        }));
        this.loaded = true;
      },
      (error) => {
        this.distributionCenterData = [];
        this.centerOptions = [];
        this.loaded = true;
      }
    );
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

  onBlur(fieldName: keyof Personal): void {
    this.touchedFields[fieldName] = true;

    if (fieldName === 'confirmAccNumber') {
      this.validateConfirmAccNumber();
    }

    if (fieldName === 'email' && this.personalData.email) {
    // This will trigger the error message display in template
    this.isValidEmail(this.personalData.email);
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

  isFieldInvalid(fieldName: keyof Personal): boolean {
    return !!this.touchedFields[fieldName] && !this.personalData[fieldName];
  }


  EpmloyeIdCreate() {
    const currentCompanyId = this.personalData.companyId;
    const currentCenterId = this.personalData.centerId;

    this.getAllCollectionManagers();
    let rolePrefix: string | undefined;

    const rolePrefixes: { [key: string]: string } = {
      'Distribution Center Head': 'DCH',
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
    this.personalData.companyId = currentCompanyId;
    this.personalData.centerId = currentCenterId;
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

  getAllCollectionManagers() {
    this.collectionCenterSrv
      .getAllManagerList(
        this.personalData.companyId,
        this.personalData.centerId
      )
      .subscribe((res) => {
        this.distributionHeadData = res;
      });
  }

  isValidPhoneNumber(phone: string, code: string = this.personalData.phoneCode01): boolean {
    if (!phone || !code) return false;

    const fullNumber = `${code}${phone}`;
    const mobilePattern = /^\+947\d{8}$/; // Sri Lanka +947XXXXXXXX
    return mobilePattern.test(fullNumber); // true if valid
  }

  isValidNIC(nic: string): boolean {
    const nicRegex = /^(?:\d{12}|\d{9}[a-zA-Z])$/;
    return nicRegex.test(nic);
  }

  isValidEmail(email: string): boolean {
    return this.emailValidationService.isEmailValid(email);
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
    }).then((result) => {
    if (result.isConfirmed) {
      history.back(); // ✅ go to previous page in history
    }
    });
  }

  nextFormCreate(page: 'pageOne' | 'pageTwo') {
    // Validate pageOne before navigating to pageTwo
    if (page === 'pageTwo') {
      const validation = this.validatePageOne();
      
      if (!validation.isValid) {
        this.showValidationErrors(validation.errors);
        return;
      }
    }
    
    this.selectedPage = page;
  }

  // Add this method to validate all fields on pageOne
  validatePageOne(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Employee type validation
    if (!this.isEmpTypeSelected()) {
      errors.push('Please select an employee type');
    }
    
    // Languages validation
    if (!this.isAtLeastOneLanguageSelected()) {
      errors.push('Please select at least one preferred language');
    }
    


  
    
    // Phone validation
    if (!this.personalData.phoneNumber01 || !this.isValidPhoneNumber(this.personalData.phoneNumber01)) {
      errors.push('Mobile Number - 1 is required and must be valid');
    }
    
    // NIC validation
    if (!this.personalData.nic || !this.isValidNIC(this.personalData.nic)) {
      errors.push('NIC is required and must be valid (12 digits or 10 digits followed by V)');
    }
    
    // Email validation
    if (!this.personalData.email || !this.isValidEmail(this.personalData.email)) {
      errors.push('Email is required and must be valid');
    }
    
    // Duplicate phone check
    if (this.duplicatePhoneError) {
      errors.push('Mobile Number - 01 and Mobile Number - 02 cannot be the same');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Add this method to validate all fields on pageTwo
  validatePageTwo(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Address validation
    if (!this.personalData.houseNumber) {
      errors.push('House Number is required');
    }
    
    if (!this.personalData.streetName) {
      errors.push('Street Name is required');
    }
    
    if (!this.personalData.city) {
      errors.push('City is required');
    }
    
    if (!this.personalData.district) {
      errors.push('District is required');
    }
    
    // Bank details validation
    const namePattern = /^([A-Z][a-z]*)( [A-Z][a-z]*)*$/;
    if (!this.personalData.accHolderName || !namePattern.test(this.personalData.accHolderName)) {
      errors.push('Account Holder\'s Name is required and must be valid');
    }
    
    if (!this.personalData.accNumber) {
      errors.push('Account Number is required');
    }
    
    if (!this.personalData.confirmAccNumber) {
      errors.push('Confirm Account Number is required');
    }
    
    if (this.personalData.accNumber !== this.personalData.confirmAccNumber) {
      errors.push('Account Numbers do not match');
    }
    
    if (!this.personalData.bankName) {
      errors.push('Bank Name is required');
    }
    
    if (!this.personalData.branchName) {
      errors.push('Branch Name is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Add this method to show validation errors in SweetAlert
  showValidationErrors(errors: string[]): void {
    let errorMessage = '<ul style="text-align: left; margin-left: 20px;">';
    errors.forEach(error => {
      errorMessage += `<li>• ${error}</li>`;
    });
    errorMessage += '</ul>';
    
    Swal.fire({
      icon: 'error',
      title: 'Validation Error',
      html: `Please fix the following issues: ${errorMessage}`,
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    });
  }

  // Add this method to mark all fields as touched
  markAllFieldsAsTouched(): void {
    const fields: (keyof Personal)[] = [
      'firstNameEnglish', 'lastNameEnglish', 'phoneNumber01', 'phoneNumber02', 
      'nic', 'email', 'houseNumber', 'streetName', 'city', 'district',
      'accHolderName', 'accNumber', 'confirmAccNumber'
    ];
    
    fields.forEach(field => {
      this.touchedFields[field] = true;
    });
    
    // Also mark checkboxes/radio as touched
    this.touchedFields['empType'] = true;
    this.touchedFields['languages'] = true;
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

  onBankChange() {
    if (this.selectedBankId) {
      // Get branches for this bank, default to empty array
      const bankBranches = this.allBranches[this.selectedBankId.toString()] || [];

      // Sort alphabetically by branch name
      this.branches = bankBranches.slice().sort((a, b) => a.name.localeCompare(b.name));

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

  // Prevent entering more than 12 characters for NIC
  blockNicInput(event: KeyboardEvent) {
    const value = this.personalData.nic || '';

    // Allow control keys
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
    if (allowedKeys.includes(event.key)) return;

    // Block input if already 12 characters
    if (value.length >= 12) {
      event.preventDefault();
    }
  }

  // Trim NIC input after paste/autofill
  enforceNicLength(event: any) {
    const value = event.target.value || '';
    if (value.length > 12) {
      this.personalData.nic = value.slice(0, 12);
    }
  }

  // Capitalize 'v' to 'V' for 10-digit NIC
  capitalizeV(): void {
    if (this.personalData.nic) {
      this.personalData.nic = this.personalData.nic.replace(/v/g, 'V');
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
    // Validate pageTwo before submitting
    this.markAllFieldsAsTouched();
    const validation = this.validatePageTwo();
    
    if (!validation.isValid) {
      this.showValidationErrors(validation.errors);
      return;
    }

    // Duplicate check for phone numbers
    this.duplicatePhoneError = false;
    if (
      this.personalData.phoneNumber01 &&
      this.personalData.phoneNumber02 &&
      this.personalData.phoneCode01 === this.personalData.phoneCode02 &&
      this.personalData.phoneNumber01 === this.personalData.phoneNumber02
    ) {
      this.duplicatePhoneError = true;
      Swal.fire('Error', 'Mobile Number - 01 and Mobile Number - 02 cannot be the same', 'error');
      return;
    }

    console.log('PERSONAL', this.personalData);
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to create the Distribution Centre Head?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, create it!',
      cancelButtonText: 'No, cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.distributionHubSrv
          .createDistributionHead(this.personalData, this.selectedImage)
          .subscribe(
            (res: any) => {
              this.isLoading = false;
              this.officerId = res.officerId;
              this.errorMessage = '';

              Swal.fire(
                'Success',
                'Created Distribution Centre Head Successfully',
                'success'
              ).then(() => {
                this.location.back();
              });
            },
            (error: any) => {
              this.isLoading = false;
              this.errorMessage =
                error.error.error || 'An unexpected error occurred';
              Swal.fire('Error', this.errorMessage, 'error');
            }
          );
      } else {
        Swal.fire('Cancelled', 'Your action has been cancelled', 'info').then(
          () => {
            this.location.back();
          }
        );
      }
    });
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
  
    const namePattern = /^[A-Za-z ]+$/;
  
    // Validate address fields
    const isAddressValid =
      !!houseNumber && !!streetName && !!city && !!district;
  
    // If accHolderName exists, validate it with the pattern
    const isNameValid = accHolderName ? namePattern.test(accHolderName) : false;
  
    // Validate bank details
    const isBankDetailsValid =
      !!accHolderName &&
      isNameValid &&
      !!accNumber &&
      !!confirmAccNumber &&
      !!bankName &&
      !!branchName &&
      accNumber === confirmAccNumber;
  
    return isBankDetailsValid && isAddressValid;
  }

  getAllCompanies() {
    this.distributionHubSrv.getAllCompanyList().subscribe((res) => {
      this.CompanyData = res;
      this.companyOptions = this.CompanyData.map(company => ({
        label: company.companyNameEnglish,
        value: company.id
      }));
    });
  }

  getAllDistributedCenters(id: number) {
    console.log('id', id)
    this.loaded = false;
    this.distributionHubSrv.getAllDistributedCentersByCompany(id).subscribe(
      (res) => {
        this.distributionCenterData = res;
        this.loaded = true;
      },
      (error) => {
        this.distributionCenterData = [];
        this.loaded = true;
      }
    );
  }

  loadBanks() {
    this.http.get<Bank[]>('assets/json/banks.json').subscribe(
      (data) => {
      this.banks = data.slice().sort((a, b) => a.name.localeCompare(b.name));
      },
      (error) => { }
    );
  }

  blockPhoneLength(event: KeyboardEvent, value: string) {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];

    // Allow navigation keys
    if (allowedKeys.includes(event.key)) return;

    // Block non-numeric keys
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      return;
    }

    // Block input if already 9 digits
    if (value && value.length >= 9) {
      event.preventDefault();
    }
  }

  // Trim input to 9 digits after input (for paste or autofill)
  enforcePhoneLength(event: any, field: 'phoneNumber01' | 'phoneNumber02') {
    const value = event.target.value || '';
    if (value.length > 9) {
      this.personalData[field] = value.slice(0, 9);
    }
  }

  checkDuplicatePhoneNumbers(): void {
  const phone1 = this.personalData.phoneNumber01?.trim() || '';
  const phone2 = this.personalData.phoneNumber02?.trim() || '';
  const code1 = this.personalData.phoneCode01;
  const code2 = this.personalData.phoneCode02;
  
  // Only show duplicate error if:
  // 1. Both phone numbers exist and are not empty
  // 2. Phone codes are the same
  // 3. Phone numbers are exactly the same
  if (phone1 && phone2 && code1 === code2 && phone1 === phone2) {
    this.duplicatePhoneError = true;
  } else {
    this.duplicatePhoneError = false;
  }
}

  blockLeadingSpace(event: KeyboardEvent, field: string) {
    const value = this.personalData[field] || '';

    // If the first character is empty and user presses space, block it
    if (value.length === 0 && event.key === ' ') {
      event.preventDefault();
    }
  }


  trimLeadingSpace(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.value.startsWith(' ')) {
    const cursorPos = input.selectionStart || 0;
    input.value = input.value.trimStart();
    input.setSelectionRange(cursorPos - 1, cursorPos - 1); // keep cursor in place
  }
}
  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  loadBranches() {
    this.http.get<BranchesData>('assets/json/branches.json').subscribe(
      (data) => {
        this.allBranches = data; // store all branches
        // If you want to populate initial branches for selected bank:
        if (this.selectedBankId) {
          this.branches = (data[this.selectedBankId.toString()] || []).slice()
            .sort((a, b) => a.name.localeCompare(b.name));
        }
      },
      (error) => {
        console.error('Failed to load branches', error);
      }
    );
  }

  getEmailErrorMessage(email: string): string | null {
    return this.emailValidationService.getErrorMessage(email);
  }

  getPhoneValidationMessage(field: 'phoneNumber01' | 'phoneNumber02'): string | null {
  const phoneValue = this.personalData[field];
  const phoneCode = field === 'phoneNumber01' ? this.personalData.phoneCode01 : this.personalData.phoneCode02;
  
  // Priority 1: Check if field is required and empty (for phoneNumber01 only)
  if (field === 'phoneNumber01') {
    if (this.touchedFields[field] && !phoneValue) {
      return 'Mobile Number - 1 is required.';
    }
  }
  
  // Priority 2: Check for duplicate phone numbers (only if both numbers exist)
  if (phoneValue && this.duplicatePhoneError) {
    return 'Mobile Number - 01 and Mobile Number - 02 cannot be the same.';
  }
  
  // Priority 3: Check format validation (only if phone number exists)
  if (phoneValue && !this.isValidPhoneNumber(phoneValue, phoneCode)) {
    return 'Please enter a valid mobile number (format: +947XXXXXXXX).';
  }
  
  return null;
}

getPhone1ValidationMessage(field: 'phoneNumber01' | 'phoneNumber02'): string | null {
  const phoneValue = this.personalData[field];
  const phoneCode = field === 'phoneNumber01' ? this.personalData.phoneCode01 : this.personalData.phoneCode02;
  
  // Priority 1: Check if field is required and empty (for phoneNumber01 only)
  if (field === 'phoneNumber01') {
    if (this.touchedFields[field] && !phoneValue) {
      return 'Mobile Number - 1 is required.';
    }
  }
  
  // Priority 3: Check format validation (only if phone number exists)
  if (phoneValue && !this.isValidPhoneNumber(phoneValue, phoneCode)) {
    return 'Please enter a valid mobile number (format: +947XXXXXXXX).';
  }
  
  return null;
}
}

class Personal {
  [key: string]: any;
  jobRole: string = 'Distribution Center Head';
  empId!: string;
  centerId!: number | string;
  irmId!: number;
  empType!: string;
  firstNameEnglish!: string;
  lastNameEnglish!: string;
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

class DistributionCenter {
  id!: number;
  centerName!: string;
}

class Company {
  id!: number;
  companyNameEnglish!: string;
}

class DistributionHead {
  id!: number;
  firstNameEnglish!: string;
  lastNameEnglish!: string;
}