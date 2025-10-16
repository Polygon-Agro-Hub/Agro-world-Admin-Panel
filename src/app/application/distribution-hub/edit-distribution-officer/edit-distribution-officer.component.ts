import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { ActivatedRoute, Router } from '@angular/router';
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

interface PhoneCode {
  code: string;
  dialCode: string;
  name: string;
}

interface BranchesData {
  [key: string]: Branch[];
}

interface DistributionHeadResponse {
  id: number;
  companyId: number;
  centerName: string;
  irmId: number | null;
  firstNameEnglish: string;
  lastNameEnglish: string;
  jobRole: string;
  empId: string;
  empType: string;
  phoneCode01: string;
  phoneNumber01: string;
  phoneCode02: string;
  phoneNumber02: string | null;
  nic: string;
  email: string;
  houseNumber: string;
  streetName: string;
  city: string;
  district: string;
  province: string;
  country: string;
  languages: string;
  accHolderName: string;
  accNumber: string;
  bankName: string;
  branchName: string;
  image: string | null;
  status: string;
  claimStatus: number;
  onlineStatus: number;
}

@Component({
  selector: 'app-edit-distribution-officer',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    DropdownModule,
  ],
  templateUrl: './edit-distribution-officer.component.html',
  styleUrl: './edit-distribution-officer.component.css',
})
export class EditDistributionOfficerComponent implements OnInit {
  isResetPasswordModalOpen: boolean = false;
  newPassword: string = '';
  confirmPassword: string = '';
  public duplicatePhoneError = false;
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
  languagesRequired: boolean = false;
  touchedFields: { [key in keyof Personal]?: boolean } = {};
  confirmAccountNumberError: boolean = false;
  confirmAccountNumberRequired: boolean = false;
  distributionHeadData: DistributionHead[] = [];
  invalidFields: Set<string> = new Set();

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

  loaded = true;
  banks: Bank[] = [];
  branches: Branch[] = [];
  selectedBankId: number | null = null;
  selectedBranchId: number | null = null;
  allBranches: BranchesData = {};
  errorMessage: string = '';
  bankTouched: boolean = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private collectionCenterSrv: CollectionCenterService,
    private distributionHubSrv: DistributionHubService,
    private route: ActivatedRoute,
    private location: Location,
    private cdr: ChangeDetectorRef,
    public emailValidationService: EmailvalidationsService
  ) { }

  ngOnInit(): void {
    this.loadBanksAndBranches().then(() => {
      this.getAllCompanies();
      this.route.params.subscribe((params) => {
        if (params['id']) {
          this.itemId = +params['id'];
          this.loadDistributionHeadData(this.itemId);
        }
      });
    });
  }

  loadBanksAndBranches(): Promise<void> {
    return new Promise((resolve) => {
      this.loadBanks();
      this.loadBranches();
      setTimeout(() => {
        resolve();
      }, 200);
    });
  }

  loadBanks() {
    this.http.get<Bank[]>('assets/json/banks.json').subscribe(
      (data) => {
        this.banks = data.slice().sort((a, b) => a.name.localeCompare(b.name));
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

  loadDistributionHeadData(id: number | null): void {
    this.isLoading = true;
    this.distributionHubSrv.getDistributionHeadDetailsById(id).subscribe(
      (res: any) => {
        if (!res.data) {
          this.isLoading = false;
          Swal.fire('Error', 'No data returned from server', 'error');
          return;
        }

        const data = res.data;
        this.personalData = new Personal();

        // Map fields from API response to personalData
        this.personalData.id = data.id;
        this.personalData.companyId = data.companyId;
        this.personalData.centerId = data.centerId || null; // Ensure centerId is set if available
        this.personalData.centerName = data.centerName || '';
        this.personalData.irmId = data.irmId || null;
        this.personalData.firstNameEnglish = data.firstNameEnglish || '';
        this.personalData.lastNameEnglish = data.lastNameEnglish || '';
        this.personalData.jobRole = data.jobRole || 'Distribution Centre Head';
        this.personalData.empId = data.empId ? data.empId.replace(/^DCH/, '') : '';
        this.personalData.empType = data.empType || '';
        this.personalData.phoneCode01 = data.phoneCode01 || '+94';
        this.personalData.phoneNumber01 = data.phoneNumber01 || '';
        this.personalData.phoneCode02 = data.phoneCode02 || '+94';
        this.personalData.phoneNumber02 = data.phoneNumber02 || '';
        this.personalData.nic = data.nic || '';
        this.personalData.email = data.email || '';
        this.personalData.houseNumber = data.houseNumber || '';
        this.personalData.streetName = data.streetName || '';
        this.personalData.city = data.city || '';
        this.personalData.district = data.district || '';
        this.personalData.province = data.province || '';
        this.personalData.country = data.country || 'Sri Lanka';
        this.personalData.languages = data.languages || '';
        this.personalData.accHolderName = data.accHolderName || '';
        this.personalData.accNumber = data.accNumber || '';
        this.personalData.confirmAccNumber = data.accNumber || '';
        this.personalData.bankName = data.bankName || '';
        this.personalData.branchName = data.branchName || '';
        this.personalData.image = data.image || null;
        this.personalData.status = data.status || 'Not Approved';
        this.personalData.claimStatus = data.claimStatus || 1;
        this.personalData.onlineStatus = data.onlineStatus || 0;

        // Set company data
        if (data.companyId) {
          this.getAllDistributedCenters(data.companyId);
        }

        // Set bank and branch
        this.setBankAndBranch(data.bankName, data.branchName);

        // Set image for preview
        if (data.image) {
          this.selectedImage = data.image;
        }

        // Set empType
        this.empType = data.empType;

        // Validate phone numbers for duplicates
        this.checkDuplicatePhoneNumbers();

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      (error) => {
        this.isLoading = false;
        Swal.fire('Error', 'Failed to load distribution head data', 'error');
      }
    );
  }

  setBankAndBranch(bankName: string, branchName: string): void {
    if (bankName) {
      const bank = this.banks.find((b) => b.name === bankName);
      if (bank) {
        this.selectedBankId = bank.ID;
        this.onBankChange();
        setTimeout(() => {
          if (branchName) {
            const branch = this.branches.find((b) => b.name === branchName);
            if (branch) {
              this.selectedBranchId = branch.ID;
              this.personalData.branchName = branch.name;
            }
          }
        }, 50);
      }
    }
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

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
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
        this.location.back();
      }
    });
  }

  blockLeadingSpace(event: KeyboardEvent, field: string) {
    const input = event.target as HTMLInputElement;
    const key = event.key;
    const value = input.value;

    if (field === 'email' && key === ' ') {
      event.preventDefault();
      return;
    }

    if (key === ' ' && value.length === 0) {
      event.preventDefault();
    }
  }

  trimTrailingSpace(event: Event) {
    const input = event.target as HTMLInputElement;
    const cursorPos = input.selectionStart || 0;
    if (input.value.endsWith(' ')) {
      input.value = input.value.trimEnd();
      input.setSelectionRange(cursorPos, cursorPos);
      this.personalData.email = input.value;
    }
  }

  sanitizePastedEmail(event: ClipboardEvent) {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    const sanitizedText = pastedText.replace(/\s/g, '');
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const newValue = input.value.substring(0, start) + sanitizedText + input.value.substring(end);
    input.value = newValue;
    this.personalData.email = newValue;
    const newCursorPos = start + sanitizedText.length;
    input.setSelectionRange(newCursorPos, newCursorPos);
  }

  trimLeadingSpace(event: Event) {
    const input = event.target as HTMLInputElement;
    const cursorPos = input.selectionStart || 0;
    if (input.value.startsWith(' ')) {
      input.value = input.value.trimStart();
      const newCursorPos = Math.max(0, cursorPos - (input.value.length - input.value.trimStart().length));
      input.setSelectionRange(newCursorPos, newCursorPos);
      this.personalData.email = input.value;
    }
  }

  blockLeadingChars(event: KeyboardEvent, field: string) {
    const value = this.personalData[field] || '';
    if (value.length === 0 && [' ', '+', '-'].includes(event.key)) {
      event.preventDefault();
    }
  }

  fixPastedLeadingChars(event: Event, field: string) {
    let value = (event.target as HTMLInputElement).value;
    value = value.replace(/^[\+\-\s]+/, '');
    this.personalData[field] = value;
  }

  capitalizeWhileTyping(field: 'firstNameEnglish' | 'lastNameEnglish' | 'accHolderName' | 'houseNumber' | 'streetName' | 'city'): void {
    let value = this.personalData[field] || '';

    if (field === 'houseNumber') {
      // Allow letters, numbers, spaces, and special characters like /, -, #
      value = value.replace(/[^A-Za-z0-9\/\-\# ]/g, '');
    } else {
      // For name-related fields, only allow letters and spaces
      value = value.replace(/[^A-Za-z ]/g, '');
    }

    // Remove leading spaces
    value = value.replace(/^\s+/, '');

    // Capitalize first letter if applicable (skip for house number)
    if (field !== 'houseNumber' && value.length > 0 && /[A-Za-z]/.test(value.charAt(0))) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }

    this.personalData[field] = value;
  }


  blockPhoneLength(event: KeyboardEvent, value: string) {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
    if (allowedKeys.includes(event.key)) return;
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      return;
    }
    if (value && value.length >= 9) {
      event.preventDefault();
    }
  }

  enforcePhoneLength(event: any, field: 'phoneNumber01' | 'phoneNumber02') {
    const value = event.target.value || '';
    if (value.length > 9) {
      this.personalData[field] = value.slice(0, 9);
    }
  }

  blockInvalidNameInput(event: KeyboardEvent, currentValue: string) {
    const key = event.key;
    if (!/^\p{L}$/u.test(key)) {
      event.preventDefault();
    }
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
          this.personalData.languages += this.personalData.languages ? `,${lang}` : lang;
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
    this.languagesRequired = !this.personalData.languages || this.personalData.languages.trim() === '';
  }

  isAtLeastOneLanguageSelected(): boolean {
    return !!this.personalData.languages && this.personalData.languages.length > 0;
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
      this.confirmAccountNumberError = this.personalData.accNumber !== this.personalData.confirmAccNumber;
    } else {
      this.confirmAccountNumberError = false;
    }
  }

  validateAccNumber(): void {
    if (this.personalData.accNumber && this.personalData.confirmAccNumber) {
      this.confirmAccountNumberError = this.personalData.accNumber !== this.personalData.confirmAccNumber;
    } else {
      this.confirmAccountNumberError = false;
    }
  }

  isFieldInvalid(fieldName: keyof Personal): boolean {
    const value = this.personalData[fieldName];
    // Show error only if field is touched and empty (ignores numbers or non-empty values)
    return !!this.touchedFields[fieldName] && (!value || value.toString().trim() === '');
  }


  EpmloyeIdCreate() {
    const currentCompanyId = this.personalData.companyId;
    const currentCenterId = this.personalData.centerId;
    this.getAllCollectionManagers();
    const rolePrefixes: { [key: string]: string } = {
      'Distribution Centre Head': 'DCH',
    };
    const rolePrefix = rolePrefixes[this.personalData.jobRole];
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
      .getAllManagerList(this.personalData.companyId, this.personalData.centerId)
      .subscribe((res) => {
        this.distributionHeadData = res;
      });
  }

  isValidPhoneNumber(phone: string, code: string = this.personalData.phoneCode01): boolean {
    if (!phone || !code) return false;
    const fullNumber = `${code}${phone}`;
    const mobilePattern = /^\+947\d{8}$/;
    return mobilePattern.test(fullNumber);
  }

  checkDuplicatePhoneNumbers(): void {
    const phone1 = `${this.personalData.phoneCode01 || ''}${this.personalData.phoneNumber01 || ''}`.trim();
    const phone2 = `${this.personalData.phoneCode02 || ''}${this.personalData.phoneNumber02 || ''}`.trim();
    if (phone1 && phone2 && phone1 === phone2) {
      const isPhone1Valid = this.isValidPhoneNumber(this.personalData.phoneNumber01, this.personalData.phoneCode01);
      const isPhone2Valid = this.isValidPhoneNumber(this.personalData.phoneNumber02, this.personalData.phoneCode02);
      this.duplicatePhoneError = isPhone1Valid && isPhone2Valid;
    } else {
      this.duplicatePhoneError = false;
    }
  }

  isValidNIC(nic: string): boolean {
    const nicRegex = /^(?:\d{12}|\d{9}[a-zA-Z])$/;
    return nicRegex.test(nic);
  }

  isValidEmail(email: string): boolean {
    return this.emailValidationService.isEmailValid(email);
  }

  getEmailErrorMessage(email: string): string | null {
    return this.emailValidationService.getErrorMessage(email);
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
        this.location.back();
      }
    });
  }

  nextFormCreate(page: 'pageOne' | 'pageTwo') {
    this.checkDuplicatePhoneNumbers();
    if (this.duplicatePhoneError) {
      Swal.fire('Error', "Company Mobile Number - 1 and Mobile Number - 2 can't be the same", 'error');
      return;
    }
    if (!this.checkFormValidity()) {
      const errors = this.getFormValidationErrors();
      this.showValidationErrors(errors);
      return;
    }
    this.selectedPage = page;
  }

  getFormValidationErrors(): string[] {
    const errors: string[] = [];
    const namePattern = /^[A-Za-z ]+$/;
    if (!this.personalData.firstNameEnglish || !namePattern.test(this.personalData.firstNameEnglish)) {
      errors.push('First Name is required and should contain only letters');
    }
    if (!this.personalData.lastNameEnglish || !namePattern.test(this.personalData.lastNameEnglish)) {
      errors.push('Last Name is required and should contain only letters');
    }
    if (!this.isValidPhoneNumber(this.personalData.phoneNumber01, this.personalData.phoneCode01)) {
      errors.push('Mobile Number - 1 is required and should be valid');
    }
    if (!this.personalData.email || !this.isValidEmail(this.personalData.email)) {
      errors.push('Email is required and should be valid');
    }
    if (!this.personalData.languages) {
      errors.push('At least one language must be selected');
    }
    if (!this.personalData.companyId) {
      errors.push('Company Name is required');
    }
    if (!this.personalData.jobRole) {
      errors.push('Job Role is required');
    }
    if (!this.personalData.nic || !this.isValidNIC(this.personalData.nic)) {
      errors.push('NIC is required and should be valid');
    }
    return errors;
  }

  checkFormValidity(): boolean {
    const namePattern = /^[A-Za-z ]+$/;
    const isFirstNameValid = !!this.personalData.firstNameEnglish && namePattern.test(this.personalData.firstNameEnglish);
    const isLastNameValid = !!this.personalData.lastNameEnglish && namePattern.test(this.personalData.lastNameEnglish);
    const isPhoneNumberValid = this.isValidPhoneNumber(this.personalData.phoneNumber01, this.personalData.phoneCode01);
    const isEmailValid = this.personalData.email ? this.emailValidationService.isEmailValid(this.personalData.email) : false;
    const isLanguagesSelected = !!this.personalData.languages;
    const isCompanySelected = !!this.personalData.companyId;
    const isJobRoleSelected = !!this.personalData.jobRole;
    const isNicSelected = !!this.personalData.nic && this.isValidNIC(this.personalData.nic);
    return (
      isFirstNameValid &&
      isLastNameValid &&
      isPhoneNumberValid &&
      isEmailValid &&
      isLanguagesSelected &&
      isCompanySelected &&
      isJobRoleSelected &&
      isNicSelected
    );
  }

  updateProvince(event: DropdownChangeEvent): void {
    const selectedDistrict = event.value;
    const selected = this.districts.find((district) => district.name === selectedDistrict);
    if (selected) {
      this.personalData.province = selected.province;
    } else {
      this.personalData.province = '';
    }
  }

  blockNicInput(event: KeyboardEvent) {
    const value = this.personalData.nic || '';
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
    if (allowedKeys.includes(event.key)) return;
    if (value.length >= 12) {
      event.preventDefault();
    }
  }

  enforceNicLength(event: any) {
    const value = event.target.value || '';
    if (value.length > 12) {
      this.personalData.nic = value.slice(0, 12);
    }
  }

  onBankChange() {
    if (this.selectedBankId) {
      const branches = this.allBranches[this.selectedBankId.toString()] || [];
      this.branches = branches.slice().sort((a, b) => a.name.localeCompare(b.name));
      const selectedBank = this.banks.find((bank) => bank.ID === this.selectedBankId);
      if (selectedBank) {
        this.personalData.bankName = selectedBank.name;
        this.invalidFields.delete('bankName');
      }
      this.selectedBranchId = null;
      this.personalData.branchName = '';
      this.cdr.detectChanges();
    } else {
      this.branches = [];
      this.personalData.bankName = '';
      this.cdr.detectChanges();
    }
  }

  onBranchChange() {
    if (this.selectedBranchId) {
      const selectedBranch = this.branches.find((branch) => branch.ID === this.selectedBranchId);
      if (selectedBranch) {
        this.personalData.branchName = selectedBranch.name;
        this.invalidFields.delete('branchName');
      }
    } else {
      this.personalData.branchName = '';
    }
  }

  onSubmit() {
    this.checkDuplicatePhoneNumbers();
    if (this.duplicatePhoneError) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Company Phone Number - 1 and 2 can't be the same",
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        },
      });
      return;
    }

    if (!this.checkSubmitValidity()) {
      const errors = this.getSubmitValidationErrors();
      this.showValidationErrors(errors);
      return;
    }

    if (!this.personalData.confirmAccNumber || this.personalData.confirmAccNumber.toString().trim() === '') {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please fill the confirm account number',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        },
      });
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to update the Distribution Centre Head?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, update it!',
      cancelButtonText: 'No, cancel',
      reverseButtons: true,
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        const updateData = {
          ...this.personalData,
          empId: 'DCH' + this.personalData.empId,
          image: this.selectedImage,
        };

        this.distributionHubSrv.updateDistributionHeadDetails(this.itemId!, updateData)
          .subscribe(
            (res: any) => {
              this.isLoading = false;
              this.errorMessage = '';
              Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Updated Distribution Centre Head Successfully',
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold',
                },
              }).then(() => {
                this.location.back();
              });
            },
            (error: any) => {
              this.isLoading = false;
              this.errorMessage = error.error.error || 'An unexpected error occurred';
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: this.errorMessage,
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold',
                },
              });
            }
          );
      }
    });
  }


  getSubmitValidationErrors(): string[] {
    const errors: string[] = [];
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
    if (this.personalData.companyId === '1') {
      if (!this.personalData.confirmAccNumber || this.personalData.confirmAccNumber.toString().trim() === '') {
        errors.push('Confirm Account Number is required');
      }
      const accNumbersMatch = this.personalData.accNumber.toString() === this.personalData.confirmAccNumber.toString();
      if (!accNumbersMatch) {
        errors.push('Account Numbers do not match');
      }
      if (!this.personalData.accHolderName || !/^[A-Za-z ]+$/.test(this.personalData.accHolderName)) {
        errors.push('Account Holder Name is required and should contain only letters');
      }
      if (!this.personalData.accNumber) {
        errors.push('Account Number is required');
      }
      if (!this.personalData.bankName) {
        errors.push('Bank Name is required');
      }
      if (!this.personalData.branchName) {
        errors.push('Branch Name is required');
      }
    }
    return errors;
  }

  checkSubmitValidity(): boolean {
    const isAddressValid =
      !!this.personalData.houseNumber &&
      !!this.personalData.streetName &&
      !!this.personalData.city &&
      !!this.personalData.district;
    if (this.personalData.companyId === '1') {
      if (!this.personalData.confirmAccNumber || this.personalData.confirmAccNumber.toString().trim() === '') {
        return false;
      }
      const accNumbersMatch = this.personalData.accNumber.toString() === this.personalData.confirmAccNumber.toString();
      const isBankDetailsValid =
        !!this.personalData.accHolderName &&
        /^[A-Za-z ]+$/.test(this.personalData.accHolderName) &&
        !!this.personalData.accNumber &&
        !!this.personalData.bankName &&
        !!this.personalData.branchName &&
        accNumbersMatch;
      return isAddressValid && isBankDetailsValid;
    }
    return isAddressValid;
  }

  getAllCompanies() {
    this.distributionHubSrv.getAllCompanyList().subscribe((res) => {
      this.CompanyData = res;
    });
  }

  getAllDistributedCenters(id: number) {
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

  capitalizeV(): void {
    if (this.personalData.nic) {
      this.personalData.nic = this.personalData.nic.replace(/v/g, 'V');
    }
  }

  showValidationErrors(errors: string[]): void {
    let errorMessage = '<ul style="text-align: left; margin-left: 20px;">';
    errors.forEach((error) => {
      errorMessage += `<li>${error}</li>`;
    });
    errorMessage += '</ul>';
    Swal.fire({
      icon: 'error',
      title: 'Validation Errors',
      html: errorMessage,
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    });
  }

  getPhoneNumber02ErrorType(): string | null {
    if (!this.personalData.phoneNumber02) {
      return null;
    }
    if (this.duplicatePhoneError && this.personalData.phoneNumber01 && this.personalData.phoneNumber02) {
      return 'duplicate';
    }
    if (!this.isValidPhoneNumber(this.personalData.phoneNumber02, this.personalData.phoneCode02)) {
      return 'invalid';
    }
    return null;
  }

  getFlagUrl(countryCode: string): string {
    return `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`;
  }

  openResetPasswordModal() {
    this.isResetPasswordModalOpen = true;
  }

  saveNewPassword() {
    // Implement password reset logic
    throw new Error('Method not implemented.');
  }



  resetPassword() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to reset the Distribution Centre Head password. This action cannot be undone.',
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

        this.distributionHubSrv.ChangeStatus(this.itemId, 'Approved').subscribe(
          (res) => {
            this.isLoading = false;
            if (res.status) {
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'The Distribution Centre Head password reset successfully.',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold text-lg',
                },
              });
              this.loadDistributionHeadData(this.itemId);
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
}

class Personal {
  [key: string]: any;
  id?: number;
  jobRole: string = 'Distribution Centre Head';
  empId!: string;
  centerId!: number;
  centerName!: string;
  irmId!: number | null;
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
  status!: string;
  claimStatus!: number;
  onlineStatus!: number;
}

class DistributionCenter {
  id!: number;
  centerName!: string;
  centerNameEnglish!: string; // Added to match dropdown binding
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