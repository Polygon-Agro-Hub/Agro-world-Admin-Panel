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
import { SalesAgentsService } from '../../../services/dash/sales-agents.service';
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
  selector: 'app-create-sales-agents',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    DropdownModule,
  ],
  templateUrl: './create-sales-agents.component.html',
  styleUrl: './create-sales-agents.component.css',
})
export class CreateSalesAgentsComponent implements OnInit {
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

  selectedImage: File | null = null;
  selectedFile: File | null = null;
  selectedFileName!: string;
  invalidFields: Set<string> = new Set();

  touchedFields: { [key in keyof Personal]?: boolean } = {};
  confirmAccountNumberError: boolean = false;
  confirmAccountNumberRequired: boolean = false;
  errorMessage: string = '';

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
    private salesAgentService: SalesAgentsService
  ) {}

  ngOnInit(): void {
    this.EpmloyeIdCreate();
    this.loadBanks();
    this.loadBranches();
  }

  loadBanks() {
    this.http.get<Bank[]>('assets/json/banks.json').subscribe(
      (data) => {
        // Sort banks alphabetically by name
        this.banks = data.sort((a, b) => a.name.localeCompare(b.name));
      },
      (error) => {
        console.error('Error loading banks:', error);
      }
    );
  }

  loadBranches() {
    this.http.get<BranchesData>('assets/json/branches.json').subscribe(
      (data) => {
        // If data is { bank1: Branch[], bank2: Branch[], ... }
        Object.keys(data).forEach((key) => {
          data[key] = data[key].sort((a, b) => a.name.localeCompare(b.name));
        });
        this.allBranches = data;
      },
      (error) => {
        console.error('Error loading branches:', error);
      }
    );
  }

  triggerFileInput(event: Event): void {
    event.preventDefault();
    const fileInput = document.getElementById('imageUpload');
    fileInput?.click();
    console.log('file input triggered');
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

      // console.log(this.selectedFile);
      // console.log(this.personalData.image);
      // console.log(this.selectedFileName);

      const reader = new FileReader();
      reader.onload = (e: any) => {
        // console.log(e.target.result);
        this.selectedImage = e.target.result;
      };
      reader.readAsDataURL(file);
      console.log(this.selectedImage);
    }
  }

  updateEmployeeType(selectedType: string): void {
    this.empType = selectedType;
    this.personalData.empType = selectedType; // Update personalData.empType dynamically
    console.log('Selected Employee Type:', this.personalData.empType);
  }

  updateProvince(event: Event): void {
    const target = event.target as HTMLSelectElement; // Cast to HTMLSelectElement
    const selectedDistrict = target.value;
    const selected = this.districts.find(
      (district) => district.name === selectedDistrict
    );
    if (this.itemId === null) {
      if (selected) {
        this.personalData.province = selected.province;
      } else {
        this.personalData.province = ''; // Clear if no matching district is found
      }
    }
  }

  EpmloyeIdCreate() {
    // const currentCompanyId = this.personalData.companyId;

    let rolePrefix: string;

    // Map job roles to their respective prefixes
    // const rolePrefixes: { [key: string]: string } = {
    //   'Collection Center Head': 'CCH',

    // };

    // Get the prefix based on the job role
    rolePrefix = 'SA';

    // if (!rolePrefix) {
    //   console.error(`Invalid job role: ${this.personalData.jobRole}`);
    //   return; // Exit if the job role is invalid
    // }

    // Fetch the last ID and assign a new Employee ID
    this.getLastID()
      .then((lastID) => {
        this.personalData.empId = rolePrefix + lastID;
      })
      .catch((error) => {
        console.error('Error fetching last ID:', error);
      });
    // this.personalData.companyId = currentCompanyId;
  }

  getLastID(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.salesAgentService.getForCreateId().subscribe(
        (res) => {
          this.lastID = res.result.empId;
          const lastId = res.result.empId;
          resolve(lastId); // Resolve the Promise with the empId
        },
        (error) => {
          console.error('Error fetching last ID:', error);
          reject(error);
        }
      );
    });
  }

  onBankChange() {
    if (this.selectedBankId) {
      // Update branches based on selected bank
      this.branches = this.allBranches[this.selectedBankId.toString()] || [];

      // Update company data with bank name
      const selectedBank = this.banks.find(
        (bank) => bank.ID === this.selectedBankId
      );
      if (selectedBank) {
        this.personalData.bankName = selectedBank.name;
        this.invalidFields.delete('bankName');
      }

      // Reset branch selection
      this.selectedBranchId = null;
      this.personalData.branchName = '';
    } else {
      this.branches = [];
      this.personalData.bankName = '';
    }
  }

  onBranchChange() {
    if (this.selectedBranchId) {
      // Update company data with branch name
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

  isEmpTypeSelected(): boolean {
    return !!this.touchedFields.empType;
  }

  onBlur(fieldName: keyof Personal): void {
    this.touchedFields[fieldName] = true;

    if (fieldName === 'confirmAccNumber') {
      this.validateConfirmAccNumber();
    }
  }

  validateConfirmAccNumber(): void {
    this.confirmAccountNumberRequired = !this.personalData.confirmAccNumber;

    // Check if account numbers match
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
    const phoneRegex = /^7\d{8}$/; // Allows only 9-digit numbers
    return phoneRegex.test(phone);
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidNIC(nic: string): boolean {
    // 12 digits only (new format)
    const newFormat = /^\d{12}$/;

    // 9 digits + V (old format)
    const oldFormat = /^\d{9}[V]$/;

    return newFormat.test(nic) || oldFormat.test(nic);
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  checkSubmitValidity(): boolean {
    // Regular expressions for validation
    const phonePattern = /^7\d{8}$/; // 9 digits starting with 7
    const accountPattern = /^[a-zA-Z0-9]+$/; // Only alphanumeric characters
    const englishNamePattern = /^[A-Z][a-z]*$/; // First letter capitalized, rest lowercase
    const namePattern = /^[A-Za-z\s'-]+$/; // For names with spaces, hyphens, apostrophes
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email pattern

    // Destructure personalData for easier access
    const {
      firstName,
      lastName,
      phoneNumber1,
      phoneNumber2,
      email,
      empType,
      nic,
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

    // Name validations
    const isFirstNameValid = !!firstName && englishNamePattern.test(firstName);
    const isLastNameValid = !!lastName && englishNamePattern.test(lastName);
    const isAccHolderNameValid =
      !!accHolderName && namePattern.test(accHolderName);

    // Contact validations
    const isPhoneNumber1Valid =
      !!phoneNumber1 && phonePattern.test(phoneNumber1);
    const isEmailValid = !!email && emailPattern.test(email);
    const isEmpTypeSelected = !!empType;
    const isNicValid = !!nic && this.isValidNIC(nic);

    // Phone number 2 validation (optional)
    let isPhoneNumber2Valid = true;
    if (phoneNumber2) {
      isPhoneNumber2Valid =
        phoneNumber2 !== phoneNumber1 && phonePattern.test(phoneNumber2);
    }

    // Address validations
    const isAddressValid =
      !!houseNumber && !!streetName && !!city && !!district;

    // Bank details validations
    const isAccNumberValid = !!accNumber && accountPattern.test(accNumber);

    const isConfirmAccNumberValid =
      !!confirmAccNumber &&
      accountPattern.test(confirmAccNumber) &&
      accNumber === confirmAccNumber;

    const isBankDetailsValid =
      isAccHolderNameValid &&
      isAccNumberValid &&
      !!bankName &&
      !!branchName &&
      isConfirmAccNumberValid;

    // Final validation combining all checks
    return (
      isFirstNameValid &&
      isLastNameValid &&
      isPhoneNumber1Valid &&
      isEmailValid &&
      isEmpTypeSelected &&
      isNicValid &&
      isPhoneNumber2Valid &&
      isAddressValid &&
      isBankDetailsValid
    );
  }

  onSubmit() {
    console.log(this.personalData, this.selectedImage); // Logs the personal data with updated languages
    console.log('hii', this.personalData.empType);

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to create the Sales Agent?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, create it!',
      cancelButtonText: 'No, cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        // Proceed with submission if user clicks 'Yes'
        this.salesAgentService
          .createSalesAgent(this.personalData, this.selectedImage)
          .subscribe(
            (res: any) => {
              this.isLoading = false;
              this.officerId = res.officerId;
              this.errorMessage = '';

              Swal.fire(
                'Success',
                'Sales Agent Profile Created Successfully',
                'success'
              );
              this.navigatePath('/steckholders/action/sales-agents');
            },
            (error: any) => {
              this.isLoading = false;
              this.errorMessage =
                error.error.error || 'An unexpected error occurred'; // Update the error message
              Swal.fire('Error', this.errorMessage, 'error');
            }
          );
      } else {
        // If user clicks 'No', do nothing or show a cancellation message
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
        this.navigatePath('/steckholders/action/sales-agents');
      }
    });
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  validateNameInput(event: KeyboardEvent): void {
    // Allow navigation and control keys
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'Home',
      'End',
      ' ',
      'Spacebar',
    ];

    // Allow these special keys
    if (allowedKeys.includes(event.key)) {
      return;
    }

    // Allow only alphabetic characters (A-Z, a-z), spaces, hyphens, and apostrophes
    const allowedPattern = /^[a-zA-Z\s'-]$/;

    if (!allowedPattern.test(event.key)) {
      event.preventDefault();
    }
  }

  capitalizeFirstLetter(fieldName: 'firstName' | 'lastName') {
    if (this.personalData[fieldName]) {
      // Capitalize first letter and make the rest lowercase
      this.personalData[fieldName] =
        this.personalData[fieldName].charAt(0).toUpperCase() +
        this.personalData[fieldName].slice(1).toLowerCase();
    }
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

  capitalizeName(fieldName: keyof Personal): void {
    if (!this.personalData[fieldName]) return;

    // Convert to lowercase first
    let name = this.personalData[fieldName].toLowerCase();
    let result = '';
    let capitalizeNext = true;

    for (let i = 0; i < name.length; i++) {
      const char = name[i];

      if (capitalizeNext && /[a-z]/.test(char)) {
        result += char.toUpperCase();
        capitalizeNext = false;
      } else {
        result += char;
      }

      // Set flag to capitalize next letter if current character is a separator
      if ([' ', '-', "'"].includes(char)) {
        capitalizeNext = true;
      }
    }

    this.personalData[fieldName] = result;
  }

  isValidName(name: string): boolean {
    // Allows letters, spaces, hyphens, and apostrophes
    const namePattern = /^[A-Za-z\s'-]+$/;
    return namePattern.test(name);
  }

  allowOnlyAlphanumeric(event: KeyboardEvent): void {
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

    // Allow only alphanumeric characters (A-Z, a-z, 0-9)
    const alphanumericPattern = /^[0-9]$/;

    if (!alphanumericPattern.test(event.key)) {
      event.preventDefault();
    }
  }

  isValidAccountNumber(accountNumber: string): boolean {
    const accountPattern = /^[a-zA-Z0-9]+$/;
    return accountPattern.test(accountNumber);
  }
}

class Personal {
  empId!: string;
  empType!: string;
  firstName!: string;
  lastName!: string;
  phoneCode1: string = '+94';
  phoneNumber1!: string;
  phoneCode2: string = '+94';
  phoneNumber2!: string;
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
