import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import Swal from 'sweetalert2';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { CollectionOfficerService } from '../../../services/collection-officer/collection-officer.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { CollectionService } from '../../../services/collection.service';

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
  isApproved: boolean = false;

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
  managerRequiredError: boolean = false;

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
    { code: 'NL', dialCode: '+31', name: 'Netherlands' }
  ];

  jobRoleOptions = [
    { label: 'Collection Centre Manager', value: 'Collection Centre Manager' },
    { label: 'Collection Officer', value: 'Collection Officer' },
    { label: 'Customer Officer', value: 'Customer Officer' }
  ];

  isLanguageRequired = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private collectionCenterSrv: CollectionCenterService,
    private collectionOfficerService: CollectionOfficerService,
    private collectionService: CollectionService,
    private location: Location

  ) { }

  ngOnInit() {
    this.loadBanks();
    this.loadBranches();
    this.setupDropdownOptions();
    this.itemId = this.route.snapshot.params['id'];

    if (this.itemId) {
      this.fetchData();
    }

    this.getAllCompanies();
    this.EpmloyeIdCreate();
  }

  fetchData() {
    this.isLoading = true;
    this.collectionCenterSrv.getOfficerReportById(this.itemId).subscribe({
      next: (response: any) => {
        const officerData = response.officerData[0];

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

        this.personalData.companyId = officerData.companyId || null;
        this.personalData.centerId = officerData.centerId || null;
        this.personalData.irmId = officerData.irmId || null;

        this.personalData.bankName = officerData.bankName || '';
        this.personalData.branchName = officerData.branchName || '';
        this.personalData.accHolderName = officerData.accHolderName || '';
        this.personalData.accNumber = officerData.accNumber || '';
        this.personalData.confirmAccNumber = officerData.accNumber || '';
        this.personalData.empType = officerData.empType || '';
        this.personalData.image = officerData.image || '';
        this.personalData.status = officerData.status || '';

        // Check if status is "Approved"
        this.isApproved = this.personalData.status === 'Approved';

        this.selectedLanguages = this.personalData.languages
          ? this.personalData.languages.split(',')
          : [];
        this.empType = this.personalData.empType;
        this.lastID = this.personalData.empId.slice(-5);
        this.cenId = this.personalData.centerId || 0;
        this.comId = this.personalData.companyId || 0;
        this.initiateJobRole = officerData.jobRole || '';
        this.initiateId = officerData.empId.slice(-5);

        this.matchExistingBankToDropdown();
        this.getAllCollectionCetnter();
        this.getAllCollectionManagers();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching officer data:', error);
        this.isLoading = false;
      },
    });
  }

  onCompanyChange(event: any): void {

    this.personalData.centerId = null;
    this.personalData.irmId = null;
    this.personalData.jobRole = '';

    this.managerOptions = [];
    this.getAllCollectionCenters();
  }

  changeCenter(event: any): void {

    this.personalData.irmId = null;
    this.getAllCollectionManagers();
  }

  getFlagUrl(countryCode: string): string {
    return `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`;
  }

  preventNonNumeric(event: KeyboardEvent, fieldName: 'contact1' | 'contact2'): void {
    const input = event.target as HTMLInputElement;
    const char = String.fromCharCode(event.which);
    const currentValue = input.value;
    const cursorPosition = input.selectionStart || 0;

    if (!/[0-9]/.test(char)) {
      event.preventDefault();
      return;
    }

    if (cursorPosition === 0 && currentValue.length === 0 && char !== '7') {
      event.preventDefault();
      return;
    }

    if (cursorPosition === 0 && char !== '7') {
      event.preventDefault();
    }
  }

  formatPhoneNumber(fieldName: 'contact1' | 'contact2'): void {
    let value = this.personalData[fieldName];
    if (value) {
      value = value.replace(/[^0-9]/g, '');

      if (value.length > 0 && value.charAt(0) !== '7') {
        value = value.replace(/^[^7]*/, '');
      }

      if (value.length > 9) {
        value = value.substring(0, 9);
      }

      this.personalData[fieldName] = value;
    }
  }

  preventInvalidAccountHolderCharacters(event: KeyboardEvent): void {
    const char = event.key;

    if (event.ctrlKey || event.altKey || event.metaKey ||
      ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(char)) {
      return;
    }

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
    const regex = /^[\p{L} ]$/u;
    if (!regex.test(char)) {
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
      buttonsStyling: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.location.back();
      }
    });
  }

  loadBanks() {
    this.http.get<Bank[]>('assets/json/banks.json').subscribe((data) => {
      this.banks = data.sort((a, b) => a.name.localeCompare(b.name));
      this.bankOptions = this.banks.map(bank => ({
        label: bank.name,
        value: bank.name
      }));
    });
  }

  onBankChange() {
    const selectedBankName = this.personalData.bankName;

    if (selectedBankName) {
      const selectedBank = this.banks.find((bank) => bank.name === selectedBankName);

      if (selectedBank) {
        this.selectedBankId = selectedBank.ID;
        this.branches = this.allBranches[this.selectedBankId.toString()] || [];

        this.branchOptions = this.branches.map(branch => ({
          label: branch.name,
          value: branch.name
        }));
        this.personalData.branchName = '';
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

      if (matchedBank) {
        this.selectedBankId = matchedBank.ID;
        this.branches = this.allBranches[this.selectedBankId.toString()] || [];
        this.branchOptions = this.branches.map(branch => ({
          label: branch.name,
          value: branch.name
        }));

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
      this.formatName(fieldName);
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

  isFieldInvalid(fieldName: string): boolean {
    const value = this.personalData[fieldName as keyof Personal];
    return !value || value.trim() === '';
  }

  isValidEmail(email: string): boolean {
    if (!email) return false;

    const emailRegex = /^[a-zA-Z0-9]+([._%+-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-]?[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;

    if (email.includes('..')) {
      return false;
    }
    if (email.startsWith('.') || email.endsWith('.')) {
      return false;
    }
    if (/[!#$%^&*()=<>?\/\\]/.test(email)) {
      return false;
    }

    return emailRegex.test(email);
  }

  isValidNIC(nic: string): boolean {
    if (!nic) return false;
    const nicRegex = /^(?:\d{12}|\d{9}[V])$/;
    return nicRegex.test(nic);
  }

  isValidPhoneNumber(phone: string): boolean {
    if (!phone) return false;
    const phoneRegex = /^7\d{8}$/;
    return phoneRegex.test(phone);
  }

  formatTextInput(fieldName: keyof Personal): void {
    const value = this.personalData[fieldName];
    if (typeof value === 'string') {
      const cleanedValue = value.replace(/^\s+/, '');
      (this.personalData[fieldName] as string) = cleanedValue;
    }
  }

  preventLeadingSpace(event: KeyboardEvent, fieldName: keyof Personal): void {
    const input = event.target as HTMLInputElement;
    const fieldValue = this.personalData[fieldName];
    if (event.key === ' ' && (input.selectionStart === 0 || !fieldValue)) {
      event.preventDefault();
    }
  }

  onTrimInput(event: Event, modelRef: any, fieldName: string): void {
    const inputElement = event.target as HTMLInputElement;
    const trimmedValue = inputElement.value.trimStart();
    modelRef[fieldName] = trimmedValue;
    inputElement.value = trimmedValue;
  }

  onManagerChange(): void {
    this.validateManager();
  }

  onJobRoleChange(): void {
    this.validateManager();
    if (this.personalData.jobRole !== 'Collection Officer') {
      this.personalData.irmId = null;
      this.managerRequiredError = false;
    }
    this.EpmloyeIdCreate();
  }

  formatAccountHolderName(): void {
    let value = this.personalData.accHolderName;
    if (value) {
      value = value.replace(/^\s+/, '').replace(/[^a-zA-Z\s]/g, '');
      value = value.replace(/\s{2,}/g, ' ');
      value = value.replace(/\w\S*/g, (txt: string) =>
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
      this.personalData.accHolderName = value;
    }
  }

  formatName(fieldName: 'firstNameEnglish' | 'lastNameEnglish'): void {
    let value = this.personalData[fieldName];
    if (value) {
      value = value.replace(/[^A-Za-z\u0D80-\u0DFF\s]/g, '');
      value = value.replace(/^\s+/, '');
      value = value.replace(/\s{2,}/g, ' ');
      if (/^[A-Za-z]/.test(value)) {
        value = value.charAt(0).toUpperCase() + value.slice(1);
      }
      this.personalData[fieldName] = value;
    }
  }

  formatSinhalaName(fieldName: 'firstNameSinhala' | 'lastNameSinhala'): void {
    let value = this.personalData[fieldName];
    if (value) {
      value = value.replace(/[^\u0D80-\u0DFF\s]/g, '');
      value = value.replace(/^\s+/, '');
      value = value.replace(/\s{2,}/g, ' ');
      this.personalData[fieldName] = value;
    }
  }

  formatTamilName(fieldName: 'firstNameTamil' | 'lastNameTamil'): void {
    let value = this.personalData[fieldName];
    if (value) {
      value = value.replace(/[^\u0B80-\u0BFF\s]/g, '');
      value = value.replace(/^\s+/, '');
      value = value.replace(/\s{2,}/g, ' ');
      this.personalData[fieldName] = value;
    }
  }

  preventInvalidEnglishCharacters(event: KeyboardEvent): void {
    const char = event.key;

    if (event.ctrlKey || event.altKey || event.metaKey ||
      ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(char)) {
      return;
    }

    const regex = /^[^0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]+$/;
    if (!regex.test(char)) {
      event.preventDefault();
    }
  }

  preventInvalidSinhalaCharacters(event: KeyboardEvent): void {
    const char = event.key;

    if (event.ctrlKey || event.altKey || event.metaKey ||
      char === 'Backspace' || char === 'Delete' || char === 'Tab' ||
      char === 'Escape' || char === 'Enter' || char === 'ArrowLeft' ||
      char === 'ArrowRight' || char === 'ArrowUp' || char === 'ArrowDown' ||
      char === 'Home' || char === 'End') {
      return;
    }

    const sinhalaRegex = /^[\u0D80-\u0DFF\s]$/;
    if (!sinhalaRegex.test(char)) {
      event.preventDefault();
    }
  }

  preventInvalidTamilCharacters(event: KeyboardEvent): void {
    const char = event.key;

    if (event.ctrlKey || event.altKey || event.metaKey ||
      char === 'Backspace' || char === 'Delete' || char === 'Tab' ||
      char === 'Escape' || char === 'Enter' || char === 'ArrowLeft' ||
      char === 'ArrowRight' || char === 'ArrowUp' || char === 'ArrowDown' ||
      char === 'Home' || char === 'End') {
      return;
    }

    const tamilRegex = /^[\u0B80-\u0BFF\s]$/;
    if (!tamilRegex.test(char)) {
      event.preventDefault();
    }
  }

  hasInvalidNameCharacters(fieldName: 'firstNameEnglish' | 'lastNameEnglish'): boolean {
    const value = this.personalData[fieldName];
    if (!value) return false;
    return /[^a-zA-Z\s]/.test(value);
  }

  hasInvalidSinhalaCharacters(fieldName: 'firstNameSinhala' | 'lastNameSinhala'): boolean {
    const value = this.personalData[fieldName];
    if (!value) return false;
    return /[^\u0D80-\u0DFF\s]/.test(value);
  }

  hasInvalidTamilCharacters(fieldName: 'firstNameTamil' | 'lastNameTamil'): boolean {
    const value = this.personalData[fieldName];
    if (!value) return false;
    return /[^\u0B80-\u0BFF\s]/.test(value);
  }

  hasInvalidAccountHolderName(): boolean {
    const value = this.personalData.accHolderName;
    if (!value) return false;
    return /[^a-zA-Z\s]/.test(value);
  }

  arePhoneNumbersSame(): boolean {
    if (!this.personalData.contact1 || !this.personalData.contact2) {
      return false;
    }
    return this.personalData.contact1 === this.personalData.contact2;
  }

  isAtLeastOneLanguageSelected(): boolean {
    return this.selectedLanguages && this.selectedLanguages.length > 0;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  isValidPassword(password: string): boolean {
    if (!password) return true;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  doPasswordsMatch(): boolean {
    if (!this.personalData.password || !this.personalData.confirmPassword) return true;
    return this.personalData.password === this.personalData.confirmPassword;
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

    const isContact1Valid = this.isValidPhoneNumber(this.personalData.contact1);
    const isEmailValid = this.isValidEmail(this.personalData.email);
    const isEmpTypeSelected = !!this.empType;
    const isLanguagesSelected = this.isAtLeastOneLanguageSelected();
    const isCompanySelected = !!this.personalData.companyId;
    const isCenterSelected = !!this.personalData.centerId;
    const isJobRoleSelected = !!this.personalData.jobRole;
    const isNicValid = this.isValidNIC(this.personalData.nic);

    const isPasswordValid = !this.personalData.password ||
      (this.isValidPassword(this.personalData.password) && this.doPasswordsMatch());

    return (
      isFirstNameValid &&
      isLastNameValid &&
      isContact1Valid &&
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
      'Collection Centre Head': 'CCH',
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
        this.location.back();
      }
    });
  }

  validateManager(): void {
    if (this.personalData.jobRole === 'Collection Officer') {
      this.managerRequiredError = !this.personalData.irmId;
    } else {
      this.managerRequiredError = false;
    }
  }

  nextFormCreate(page: 'pageOne' | 'pageTwo') {
    if (page === 'pageTwo') {
      this.validateManager();

      const missingFields: string[] = [];

      if (!this.personalData.empType) {
        missingFields.push('Staff Employee Type is Required');
      }

      if (!this.isAtLeastOneLanguageSelected()) {
        missingFields.push('Preferred Languages is Required');
      }

      if (!this.personalData.companyId) {
        missingFields.push('Company Name is Required');
      }

      if (!this.personalData.centerId) {
        missingFields.push('Collection Centre Name is Required');
      }

      if (!this.personalData.jobRole) {
        missingFields.push('Job Role is Required');
      }

      if (this.personalData.jobRole === 'Collection Officer' && !this.personalData.irmId) {
        missingFields.push('Manager Name is Required');
      }

      if (!this.personalData.firstNameEnglish) {
        missingFields.push('First Name (in English) is Required');
      }

      if (!this.personalData.lastNameEnglish) {
        missingFields.push('Last Name (in English) is Required');
      }

      if (!this.personalData.firstNameSinhala) {
        missingFields.push('First Name (in Sinhala) is Required');
      }

      if (!this.personalData.lastNameSinhala) {
        missingFields.push('Last Name (in Sinhala) is Required');
      }

      if (!this.personalData.firstNameTamil) {
        missingFields.push('First Name (in Tamil) is Required');
      }

      if (!this.personalData.lastNameTamil) {
        missingFields.push('Last Name (in Tamil) is Required');
      }

      if (!this.personalData.contact1) {
        missingFields.push('Mobile Number - 01 is Required');
      } else if (!this.isValidPhoneNumber(this.personalData.contact1)) {
        missingFields.push('Mobile Number - 01 - Must be 9 digits starting with 7');
      }

      if (this.personalData.contact2 && !this.isValidPhoneNumber(this.personalData.contact2)) {
        missingFields.push('Mobile Number - 02 - Must be 9 digits starting with 7');
      }

      if (this.personalData.contact1 && this.personalData.contact2 && this.personalData.contact1 === this.personalData.contact2) {
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
        missingFields.push('Email - Invalid format (e.g., example@domain.com)');
      }

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

    this.selectedPage = page;

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
    } else {
      if (selected) {
        this.personalData.province = selected.province;
      }
    }
  }

  getAllCompanies() {
    this.collectionCenterSrv.getAllCompanyList().subscribe((res) => {
      this.CompanyData = res;
      this.companyOptions = this.CompanyData.map(company => ({
        label: company.companyNameEnglish,
        value: company.id
      }));
    });
  }

  getAllCollectionCetnter() {
  this.collectionCenterSrv
    .getAllCentreList(this.personalData.companyId)
    .subscribe((res) => {
      this.collectionCenterData = res;
      this.centerOptions = this.collectionCenterData.map((center) => ({
        label: `${center.regCode ? center.regCode + ' - ' : ''}${center.centerName}`, // Combine regCode with name
        value: center.id,
        regCode: center.regCode // Keep regCode if needed
      }));
    });
}

  getAllCollectionCenters() {
  this.collectionCenterData = [];
  this.personalData.centerId = null;
  this.managerOptions = [];
  this.personalData.irmId = null;
  
  this.collectionCenterSrv
    .getAllCentreList(this.personalData.companyId)
    .subscribe((res) => {
      this.collectionCenterData = res;
      this.centerOptions = this.collectionCenterData.map((center) => ({
        label: `${center.regCode ? center.regCode + ' - ' : ''}${center.centerName}`, // Combine regCode with name
        value: center.id,
        regCode: center.regCode // Keep regCode if needed
      }));
    });
}


  getAllCollectionManagers() {
    if (this.personalData.companyId && this.personalData.centerId) {
      this.collectionCenterSrv
        .getAllManagerList(
          this.personalData.companyId,
          this.personalData.centerId
        )
        .subscribe((res) => {
          this.collectionManagerData = res;
          this.managerOptions = this.collectionManagerData.map(manager => ({
            label: manager.firstNameEnglish,
            value: manager.id
          }));
        });
    } else {
      this.managerOptions = [];
    }
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

    this.personalData.languages = this.selectedLanguages.join(',');
    this.isLanguageRequired = this.selectedLanguages.length === 0;
  }

  onSubmit() {


    const missingFields: string[] = [];

    if (!this.personalData.empType) {
      missingFields.push('Staff Employee Type is Required');
    }

    if (!this.isAtLeastOneLanguageSelected()) {
      missingFields.push('Preferred Languages is Required');
    }

    if (!this.personalData.companyId) {
      missingFields.push('Company Name is Required');
    }

    if (!this.personalData.centerId) {
      missingFields.push('Collection Centre Name is Required');
    }

    if (!this.personalData.jobRole) {
      missingFields.push('Job Role is Required');
    }

    if (this.personalData.jobRole === 'Collection Officer' && !this.personalData.irmId) {
      missingFields.push('Manager Name is Required');
    }

    if (!this.personalData.firstNameEnglish) {
      missingFields.push('First Name (in English) is Required');
    }

    if (!this.personalData.lastNameEnglish) {
      missingFields.push('Last Name (in English) is Required');
    }

    if (!this.personalData.firstNameSinhala) {
      missingFields.push('First Name (in Sinhala) is Required');
    }

    if (!this.personalData.lastNameSinhala) {
      missingFields.push('Last Name (in Sinhala) is Required');
    }

    if (!this.personalData.firstNameTamil) {
      missingFields.push('First Name (in Tamil) is Required');
    }

    if (!this.personalData.lastNameTamil) {
      missingFields.push('Last Name (in Tamil) is Required');
    }

    if (!this.personalData.contact1) {
      missingFields.push('Mobile Number - 01 is Required');
    } else if (!this.isValidPhoneNumber(this.personalData.contact1)) {
      missingFields.push('Mobile Number - 01 - Must be 9 digits starting with 7');
    }

    if (this.personalData.contact2 && !this.isValidPhoneNumber(this.personalData.contact2)) {
      missingFields.push('Mobile Number - 02 - Must be 9 digits starting with 7');
    }

    if (this.personalData.contact1 && this.personalData.contact2 && this.personalData.contact1 === this.personalData.contact2) {
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

    if (!this.personalData.houseNumber) {
      missingFields.push('House Number is Required');
    }

    if (!this.personalData.streetName) {
      missingFields.push('Street Name is Required');
    }

    if (!this.personalData.city) {
      missingFields.push('City is Required');
    }

    if (!this.personalData.district) {
      missingFields.push('District is Required');
    }

    if (!this.personalData.province) {
      missingFields.push('Province is Required');
    }

    if (!this.personalData.accHolderName && this.personalData.companyId === 1) {
      missingFields.push("Account Holder's Name is Required");
    }

    if (!this.personalData.accNumber && this.personalData.companyId === 1) {
      missingFields.push('Account Number is Required');
    }

    if (!this.personalData.confirmAccNumber && this.personalData.companyId === 1) {
      missingFields.push('Confirm Account Number is Required');
    } else if (this.personalData.accNumber !== this.personalData.confirmAccNumber) {
      missingFields.push('Confirm Account Number - Must match Account Number');
    }

    if (!this.selectedBankId && this.personalData.companyId === 1) {
      missingFields.push('Bank Name is Required');
    }

    if (!this.selectedBranchId && this.personalData.companyId === 1) {
      missingFields.push('Branch Name is Required');
    }

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
          confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
        },
      });
      this.isLoading = false;
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to update the collection officer?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Save it!',
      cancelButtonText: 'No, cancel',
      reverseButtons: true,
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
        confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
        cancelButton: 'bg-gray-500 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-700',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;

        const payload = {
          ...this.personalData,
          phoneNumber01: this.personalData.contact1,
          phoneCode01: this.personalData.contact1Code || '+94',
          phoneNumber02: this.personalData.contact2,
          phoneCode02: this.personalData.contact2Code || this.personalData.contact1Code || '+94',
        };



        this.collectionOfficerService
          .editCollectiveOfficer(payload, this.itemId, this.selectedImage)
          .subscribe(
            (res: any) => {
              this.isLoading = false;
              Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Collection Officer Updated Successfully',
                confirmButtonText: 'OK',
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold text-lg',
                  confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
                },
              });
              this.navigatePath('/steckholders/action/collective-officer');
            },
            (error: any) => {
              this.isLoading = false;
              let errorMessage = 'An unexpected error occurred';
              let messages: string[] = [];

              if (error.error && Array.isArray(error.error.errors)) {
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
                    confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
                  },
                });
                return;
              }
            }
          );
      }
    });
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  formatHouseNumber(): void {
    if (this.personalData.houseNumber) {
      this.personalData.houseNumber = this.personalData.houseNumber
        .replace(/^\s+/, '')
        .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }
  }

  formatStreetName(): void {
    if (this.personalData.streetName) {
      this.personalData.streetName = this.personalData.streetName
        .replace(/^\s+/, '')
        .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }
  }

  formatCity(): void {
    if (this.personalData.city) {
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

  setupDropdownOptions() {
    this.districts = this.districts.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    this.districtOptions = this.districts.map(district => ({
      label: district.name,
      value: district.name
    }));
  }

  resetPassword() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to reset the Collection Officer password. This action cannot be undone.',
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

        this.collectionService.ChangeStatus(this.itemId, 'Approved').subscribe(
          (res) => {
            this.isLoading = false;
            if (res.status) {
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'The Collection Officer password reset successfully.',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold text-lg',
                },
              });
              this.fetchData();
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
  jobRole!: string;
  empId!: any;
  centerId!: number | null;
  irmId!: number | null;
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
  companyId!: number | null;
  image!: string;
  accHolderName!: any;
  accNumber!: any;
  confirmAccNumber!: any;
  bankName!: string;
  branchName!: string;
  confirmPassword!: string;
  status!: string;
}

class CollectionCenter {
  id!: number;
  centerName!: string;
  regCode!: string;
}

class CollectionManager {
  id!: number;
  firstNameEnglish!: string;
}

class Company {
  id!: number;
  companyNameEnglish!: string;
}