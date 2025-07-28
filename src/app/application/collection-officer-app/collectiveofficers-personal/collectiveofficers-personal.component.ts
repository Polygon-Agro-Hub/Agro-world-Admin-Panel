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
import { DropdownModule } from 'primeng/dropdown';

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
  selector: 'app-collectiveofficers-personal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    DropdownModule 
  ],
  templateUrl: './collectiveofficers-personal.component.html',
  styleUrls: ['./collectiveofficers-personal.component.css'],
})
export class CollectiveofficersPersonalComponent implements OnInit {
  officerId: number | null = null;
  selectedFile: File | null = null;
  languages: string[] = ['Sinhala', 'English', 'Tamil'];
  selectedPage: 'pageOne' | 'pageTwo' = 'pageOne';
  personalData: Personal = new Personal();

  collectionCenterData: CollectionCenter[] = [];
  CompanyData: Company[] = [];
  collectionManagerData: CollectionManager[] = [];
  itemId: number | null = null;
  isLoading = false;
  selectedFileName!: string;
  selectedImage: string | ArrayBuffer | null = null;
  lastID!: string;
  UpdatelastID!: string;
  selectJobRole!: string;
  upateEmpID!: string;
  empType!: string;

  loaded = true;

  banks: Bank[] = [];
  branches: Branch[] = [];
  selectedBankId: number | null = null;
  selectedBranchId: number | null = null;
  allBranches: BranchesData = {};

  confirmAccountNumberError: boolean = false;
  confirmAccountNumberRequired: boolean = false;
  companyOptions: any[] = [];
  centerOptions: any[] = [];
  managerOptions: any[] = [];
  bankOptions: any[] = [];
  branchOptions: any[] = [];

  invalidFields: Set<string> = new Set();

  languagesRequired: boolean = false;

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

  touchedFields: { [key in keyof Personal]?: boolean } = {};
  languagesTouched: boolean = false;
  empTypeTouched: boolean = false;
  errorMessage: string = '';

  constructor(
    private collectionOfficerService: CollectionOfficerService,
    private fb: FormBuilder,
    private collectionCenterSrv: CollectionCenterService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  selectedLanguages: string[] = [];

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

onSubmit() {
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to create the collection officer?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, create it!',
    cancelButtonText: 'No, cancel',
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      this.isLoading = true;
      this.collectionOfficerService
        .createCollectiveOfficer(this.personalData, this.selectedImage)
        .subscribe(
          (res: any) => {
            this.isLoading = false;
            this.officerId = res.officerId;
            this.errorMessage = '';

            Swal.fire(
              'Success',
              'Collection Officer Created Successfully',
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
        this.navigatePath('/steckholders/action/collective-officer');
      }
    });
  }

  nextFormCreate(page: 'pageOne' | 'pageTwo') {
    this.selectedPage = page;
  }

  ngOnInit(): void {
    this.loadBanks();
    this.loadBranches();
    this.getAllCompanies();
    this.EpmloyeIdCreate();
    // Pre-fill country with Sri Lanka
    this.personalData.country = 'Sri Lanka';
  }

  loadBanks() {
    this.http.get<Bank[]>('assets/json/banks.json').subscribe(
      (data) => {
        // Sort banks alphabetically
        this.banks = data.sort((a, b) => a.name.localeCompare(b.name));
      },
      (error) => {}
    );
  }

  loadBranches() {
    this.http.get<BranchesData>('assets/json/branches.json').subscribe(
      (data) => {
        this.allBranches = data;
      },
      (error) => {}
    );
  }

  onBankChange() {
    if (this.selectedBankId) {
      const branchesForBank = this.allBranches[this.selectedBankId.toString()] || [];
      // Sort branches alphabetically
      this.branches = branchesForBank.sort((a, b) => a.name.localeCompare(b.name));
      
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

  getAllCollectionCetnter(id: number) {
    this.loaded = false;
    this.collectionCenterSrv.getAllCollectionCenterByCompany(id).subscribe(
      (res) => {
        this.collectionCenterData = res;
        this.loaded = true;
      },
      (error) => {
        this.collectionCenterData = [];
        this.loaded = true;
      }
    );
  }

  getAllCompanies() {
    this.collectionCenterSrv.getAllCompanyList().subscribe((res) => {
      this.CompanyData = res;
    });
  }

  getAllCollectionManagers() {
    this.collectionCenterSrv
      .getAllManagerList(
        this.personalData.companyId,
        this.personalData.centerId
      )
      .subscribe((res) => {
        this.collectionManagerData = res;
      });
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

  EpmloyeIdCreate() {
    const currentCompanyId = this.personalData.companyId;
    const currentCenterId = this.personalData.centerId;

    this.getAllCollectionManagers();
    let rolePrefix: string | undefined;

    const rolePrefixes: { [key: string]: string } = {
      'Collection Center Head': 'CCH',
      'Collection Center Manager': 'CCM',
      'Customer Officer': 'CUO',
      'Collection Officer': 'COO',
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

  updateEmployeeType(selectedType: string): void {
    this.empType = selectedType;
    this.personalData.empType = selectedType;
  }

  // Format name to capitalize first letter and block special characters/numbers
  formatName(fieldName: 'firstNameEnglish' | 'lastNameEnglish'): void {
    let value = this.personalData[fieldName];
    if (value) {
      // Remove special characters and numbers, keep only letters and spaces
      value = value.replace(/[^a-zA-Z\s]/g, '');
      // Capitalize first letter and make rest lowercase
      value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      this.personalData[fieldName] = value;
    }
  }

  // Format Sinhala names
  formatSinhalaName(fieldName: 'firstNameSinhala' | 'lastNameSinhala'): void {
    let value = this.personalData[fieldName];
    if (value) {
      // Allow only Sinhala unicode characters and spaces
      value = value.replace(/[^\u0D80-\u0DFF\s]/g, '');
      this.personalData[fieldName] = value;
    }
  }

  // Format Tamil names
  formatTamilName(fieldName: 'firstNameTamil' | 'lastNameTamil'): void {
    let value = this.personalData[fieldName];
    if (value) {
      // Allow only Tamil unicode characters and spaces
      value = value.replace(/[^\u0B80-\u0BFF\s]/g, '');
      this.personalData[fieldName] = value;
    }
  }

  // Format Account Holder's Name
  formatAccountHolderName(): void {
    let value = this.personalData.accHolderName;
    if (value) {
      // Remove special characters and numbers, keep only letters and spaces
      value = value.replace(/[^a-zA-Z\s]/g, '');
      // Capitalize first letter and make rest lowercase
      value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      this.personalData.accHolderName = value;
    }
  }

  // Check if name has invalid characters (numbers or special characters)
  hasInvalidNameCharacters(fieldName: 'firstNameEnglish' | 'lastNameEnglish'): boolean {
    const value = this.personalData[fieldName];
    if (!value) return false;
    // Check if contains numbers or special characters
    return /[^a-zA-Z\s]/.test(value);
  }

  // Check if Sinhala name has invalid characters
  hasInvalidSinhalaCharacters(fieldName: 'firstNameSinhala' | 'lastNameSinhala'): boolean {
    const value = this.personalData[fieldName];
    if (!value) return false;
    // Check if contains non-Sinhala characters
    return /[^\u0D80-\u0DFF\s]/.test(value);
  }

  // Check if Tamil name has invalid characters
  hasInvalidTamilCharacters(fieldName: 'firstNameTamil' | 'lastNameTamil'): boolean {
    const value = this.personalData[fieldName];
    if (!value) return false;
    // Check if contains non-Tamil characters
    return /[^\u0B80-\u0BFF\s]/.test(value);
  }

  // Check if account holder name has invalid characters
  hasInvalidAccountHolderCharacters(): boolean {
    const value = this.personalData.accHolderName;
    if (!value) return false;
    // Check if contains numbers or special characters
    return /[^a-zA-Z\s]/.test(value);
  }

  isFormValid(): boolean {
    if (
      !this.personalData.firstNameEnglish ||
      !this.personalData.lastNameEnglish
    ) {
      return false;
    }
    if (
      !this.personalData.email ||
      !this.isValidEmail(this.personalData.email)
    ) {
      return false;
    }
    if (
      !this.personalData.phoneNumber01 ||
      !this.isValidPhoneNumber(this.personalData.phoneNumber01)
    ) {
      return false;
    }
    if (this.selectedFile && !this.validateFile(this.selectedFile)) {
      return false;
    }
    return true;
  }

  isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Updated NIC validation
  isValidNIC(nic: string): boolean {
    if (!nic) return false;
    // Allow 12 digits or 9 digits followed by 'V' (case insensitive)
    const nicRegex = /^(?:\d{12}|\d{9}[vV])$/;
    return nicRegex.test(nic);
  }

  isAtLeastOneLanguageSelected(): boolean {
    return (
      !!this.personalData.languages && this.personalData.languages.length > 0
    );
  }

  isValidPhoneNumber(phone: string): boolean {
    if (!phone) return false;
    const phoneRegex = /^[0-9]{9}$/;
    return phoneRegex.test(phone);
  }

  // Check if phone numbers are duplicate
  areDuplicatePhoneNumbers(): boolean {
    const phone1 = this.personalData.phoneNumber01;
    const phone2 = this.personalData.phoneNumber02;
    
    if (!phone1 || !phone2) return false;
    
    return phone1 === phone2;
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

  onLanguagesBlur(): void {
    this.languagesTouched = true;
  }

  onEmpTypeBlur(): void {
    this.empTypeTouched = true;
  }

  isEmpTypeSelected(): boolean {
    return !!this.empType;
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
    
    const isPhoneNumberValid = this.isValidPhoneNumber(
      this.personalData.phoneNumber01
    );
    const isEmailValid = this.isValidEmail(this.personalData.email);
    const isEmpTypeSelected = !!this.empType;
    const isLanguagesSelected = !!this.personalData.languages;
    const isCompanySelected = !!this.personalData.companyId;
    const isCenterSelected = !!this.personalData.centerId;
    const isJobRoleSelected = !!this.personalData.jobRole;
    const isNicValid = this.isValidNIC(this.personalData.nic);
    const arePhoneNumbersNotDuplicate = !this.areDuplicatePhoneNumbers();

    return (
      isFirstNameValid &&
      isLastNameValid &&
      isPhoneNumberValid &&
      isEmailValid &&
      isEmpTypeSelected &&
      isLanguagesSelected &&
      isCompanySelected &&
      isCenterSelected &&
      isJobRoleSelected &&
      isNicValid &&
      arePhoneNumbersNotDuplicate
    );
  }

  // Updated submit validity check
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

    const isAddressValid =
      !!houseNumber && !!streetName && !!city && !!district;

    if (companyId === '1') {
      const isBankDetailsValid =
        !!accHolderName &&
        !!accNumber &&
        !!bankName &&
        !!branchName &&
        !!confirmAccNumber &&
        accNumber === confirmAccNumber &&
        !this.hasInvalidAccountHolderCharacters();
      return isBankDetailsValid && isAddressValid && !this.areDuplicatePhoneNumbers();
    } else {
      return isAddressValid && !this.areDuplicatePhoneNumbers();
    }
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
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

  preventSpecialCharacters(event: KeyboardEvent): void {
  const char = String.fromCharCode(event.which);
  // Allow only letters (a-z, A-Z) and space
  if (!/[a-zA-Z\s]/.test(char)) {
    event.preventDefault();
  }
}

// Prevent non-Sinhala characters
preventNonSinhalaCharacters(event: KeyboardEvent): void {
  const char = String.fromCharCode(event.which);
  // Allow Sinhala unicode characters and space
  if (!/[\u0D80-\u0DFF\s]/.test(char)) {
    event.preventDefault();
  }
}

// Prevent non-Tamil characters
preventNonTamilCharacters(event: KeyboardEvent): void {
  const char = String.fromCharCode(event.which);
  // Allow Tamil unicode characters and space
  if (!/[\u0B80-\u0BFF\s]/.test(char)) {
    event.preventDefault();
  }
}

// Prevent non-numeric characters for phone numbers
preventNonNumeric(event: KeyboardEvent): void {
  const char = String.fromCharCode(event.which);
  // Allow only numbers (0-9)
  if (!/[0-9]/.test(char)) {
    event.preventDefault();
  }
}

formatPhoneNumber(fieldName: 'phoneNumber01' | 'phoneNumber02'): void {
  let value = this.personalData[fieldName];
  if (value) {
    // Remove non-numeric characters
    value = value.replace(/[^0-9]/g, '');
    // Limit to 9 digits
    if (value.length > 9) {
      value = value.substring(0, 9);
    }
    this.personalData[fieldName] = value;
  }
}
}

class Personal {
  jobRole: string = 'Collection Center Manager';
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

class CollectionCenter {
  id!: number;
  centerName!: string;
}

class CollectionManager {
  id!: number;
  firstNameEnglish!: string;
  lastNameEnglish!: string;
}

class Company {
  id!: number;
  companyNameEnglish!: string;
}