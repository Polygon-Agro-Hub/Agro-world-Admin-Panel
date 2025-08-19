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
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';

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
  ) { }

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


onSubmit() {
  const missingFields: string[] = [];

  // Check required fields for pageOne
  if (!this.personalData.empType) {
    missingFields.push('Staff Employee Type');
  }

  if (!this.isAtLeastOneLanguageSelected()) {
    missingFields.push('Preferred Languages');
  }

  if (!this.personalData.companyId) {
    missingFields.push('Company Name');
  }

  if (!this.personalData.centerId) {
    missingFields.push('Collection Centre Name');
  }

  if (!this.personalData.jobRole) {
    missingFields.push('Job Role');
  }

  if (this.personalData.jobRole === 'Collection Officer' && !this.personalData.irmId) {
    missingFields.push('Manager Name');
  }

  if (!this.personalData.firstNameEnglish) {
    missingFields.push('First Name (in English)');
  }

  if (!this.personalData.lastNameEnglish) {
    missingFields.push('Last Name (in English)');
  }

  if (!this.personalData.firstNameSinhala) {
    missingFields.push('First Name (in Sinhala)');
  }

  if (!this.personalData.lastNameSinhala) {
    missingFields.push('Last Name (in Sinhala)');
  }

  if (!this.personalData.firstNameTamil) {
    missingFields.push('First Name (in Tamil)');
  }

  if (!this.personalData.lastNameTamil) {
    missingFields.push('Last Name (in Tamil)');
  }

  if (!this.personalData.phoneNumber01) {
    missingFields.push('Mobile Number - 01');
  } else if (!this.isValidPhoneNumber(this.personalData.phoneNumber01)) {
    missingFields.push('Mobile Number - 01 - Must be 9 digits');
  }

  if (this.personalData.phoneNumber02 && !this.isValidPhoneNumber(this.personalData.phoneNumber02)) {
    missingFields.push('Mobile Number - 02 - Must be 9 digits');
  }

  if (this.areDuplicatePhoneNumbers()) {
    missingFields.push('Mobile Number - 02 - Cannot be the same as Mobile Number - 01');
  }

  if (!this.personalData.nic) {
    missingFields.push('NIC Number');
  } else if (!this.isValidNIC(this.personalData.nic)) {
    missingFields.push('NIC Number - Must be 12 digits or 9 digits followed by V');
  }

  if (!this.personalData.email) {
    missingFields.push('Email');
  } else if (!this.isValidEmail(this.personalData.email)) {
    missingFields.push('Email - Invalid format (e.g., example@domain.com)');
  }

  // Check required fields for pageTwo
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
    missingFields.push('Account Holder Name');
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

  // If errors, show list and stop
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

            Swal.fire('Success', 'Collection Officer Created Successfully', 'success');
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

nextFormCreate(page: 'pageOne' | 'pageTwo') {
  if (page === 'pageTwo') {
    const missingFields: string[] = [];

    // Validate pageOne fields
    if (!this.personalData.empType) {
      missingFields.push('Staff Employee Type');
    }

    if (!this.isAtLeastOneLanguageSelected()) {
      missingFields.push('Preferred Languages');
    }

    if (!this.personalData.companyId) {
      missingFields.push('Company Name');
    }

    if (!this.personalData.centerId) {
      missingFields.push('Collection Centre Name');
    }

    if (!this.personalData.jobRole) {
      missingFields.push('Job Role');
    }

    if (this.personalData.jobRole === 'Collection Officer' && !this.personalData.irmId) {
      missingFields.push('Manager Name');
    }

    if (!this.personalData.firstNameEnglish) {
      missingFields.push('First Name (in English)');
    }

    if (!this.personalData.lastNameEnglish) {
      missingFields.push('Last Name (in English)');
    }

    if (!this.personalData.firstNameSinhala) {
      missingFields.push('First Name (in Sinhala)');
    }

    if (!this.personalData.lastNameSinhala) {
      missingFields.push('Last Name (in Sinhala)');
    }

    if (!this.personalData.firstNameTamil) {
      missingFields.push('First Name (in Tamil)');
    }

    if (!this.personalData.lastNameTamil) {
      missingFields.push('Last Name (in Tamil)');
    }

    if (!this.personalData.phoneNumber01) {
      missingFields.push('Mobile Number - 01');
    } else if (!this.isValidPhoneNumber(this.personalData.phoneNumber01)) {
      missingFields.push('Mobile Number - 01 - Must be 9 digits');
    }

    if (this.personalData.phoneNumber02 && !this.isValidPhoneNumber(this.personalData.phoneNumber02)) {
      missingFields.push('Mobile Number - 02 - Must be 9 digits');
    }

    if (this.personalData.phoneNumber01 && this.personalData.phoneNumber02 && this.personalData.phoneNumber01 === this.personalData.phoneNumber02) {
      missingFields.push('Mobile Number - 02 - Cannot be the same as Mobile Number - 01');
    }

    if (!this.personalData.nic) {
      missingFields.push('NIC Number');
    } else if (!this.isValidNIC(this.personalData.nic)) {
      missingFields.push('NIC Number - Must be 12 digits or 9 digits followed by V');
    }

    if (!this.personalData.email) {
      missingFields.push('Email');
    } else if (!this.isValidEmail(this.personalData.email)) {
      missingFields.push('Email - Invalid format (e.g., example@domain.com)');
    }

    // If errors, show popup and stop navigation
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

  // Navigate to the selected page
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
  loadBranches() {
    this.http.get<BranchesData>('assets/json/branches.json').subscribe(
      (data) => {
        this.allBranches = data;
      },
      (error) => { }
    );
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
        this.personalData.bankName = selectedBank.name;
        this.invalidFields.delete('bankName');
      }
      this.selectedBranchId = null;
      this.personalData.branchName = '';
    } else {
      this.branches = [];
      this.branchOptions = [];
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
    this.personalData.centerId = '';
    this.collectionCenterSrv.getAllCollectionCenterByCompany(id).subscribe(
      (res) => {
        this.collectionCenterData = res;
        // Convert to dropdown options format
        this.centerOptions = this.collectionCenterData.map(center => ({
          label: center.centerName,
          value: center.id
        }));
        this.loaded = true;
      },
      (error) => {
        this.collectionCenterData = [];
        this.centerOptions = [];
        this.loaded = true;
      }
    );
  }

  getAllCompanies() {
    this.collectionCenterSrv.getAllCompanyList().subscribe((res) => {
      this.CompanyData = res;
      // Convert to dropdown options format
      this.companyOptions = this.CompanyData.map(company => ({
        label: company.companyNameEnglish,
        value: company.id
      }));
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
        // Convert to dropdown options format
        this.managerOptions = this.collectionManagerData.map(manager => ({
          label: manager.firstNameEnglish + " " + manager.lastNameEnglish,
          value: manager.id
        }));
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
  updateEmployeeType(selectedType: string): void {
    this.empType = selectedType;
    this.personalData.empType = selectedType;
  }

  formatName(fieldName: 'firstNameEnglish' | 'lastNameEnglish'): void {
    let value = this.personalData[fieldName];
    if (value) {
      // Remove special characters and numbers, keep only letters and spaces
      value = value.replace(/[^a-zA-Z\s]/g, '');

      // Remove leading spaces
      value = value.replace(/^\s+/, '');

      // Replace multiple consecutive spaces with single space
      value = value.replace(/\s{2,}/g, ' ');

      // Capitalize first letter and make rest lowercase
      if (value.length > 0) {
        value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      }

      this.personalData[fieldName] = value;
    }
  }

  // Updated formatSinhalaName function
  formatSinhalaName(fieldName: 'firstNameSinhala' | 'lastNameSinhala'): void {
    let value = this.personalData[fieldName];
    if (value) {
      // Allow only Sinhala unicode characters and spaces
      value = value.replace(/[^\u0D80-\u0DFF\s]/g, '');

      // Remove leading spaces
      value = value.replace(/^\s+/, '');

      // Replace multiple consecutive spaces with single space
      value = value.replace(/\s{2,}/g, ' ');

      this.personalData[fieldName] = value;
    }
  }

  // Updated formatTamilName function
  formatTamilName(fieldName: 'firstNameTamil' | 'lastNameTamil'): void {
    let value = this.personalData[fieldName];
    if (value) {
      // Allow only Tamil unicode characters and spaces
      value = value.replace(/[^\u0B80-\u0BFF\s]/g, '');

      // Remove leading spaces
      value = value.replace(/^\s+/, '');

      // Replace multiple consecutive spaces with single space
      value = value.replace(/\s{2,}/g, ' ');

      this.personalData[fieldName] = value;
    }
  }

  // Updated formatAccountHolderName function
  formatAccountHolderName(): void {
    let value = this.personalData.accHolderName;
    if (value) {
      // Remove special characters and numbers, keep only letters and spaces
      value = value.replace(/[^a-zA-Z\s]/g, '');

      // Remove leading spaces
      value = value.replace(/^\s+/, '');

      // Replace multiple consecutive spaces with single space
      value = value.replace(/\s{2,}/g, ' ');

      // Capitalize first letter of each word
      value = value.replace(/\b\w/g, (char: string) => char.toUpperCase());

      this.personalData.accHolderName = value;
    }
  }

  // Add new keypress handler for account holder name input
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

  // Add new keypress handlers for address fields
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

  // Format address fields to handle spaces
  formatAddressField(fieldName: 'houseNumber' | 'streetName' | 'city'): void {
  let value = this.personalData[fieldName];
  if (value) {
    // Remove leading/trailing spaces and replace multiple spaces with single space
    value = value.trim().replace(/\s{2,}/g, ' ');

    // Capitalize first letter of each word for streetName and city
    if (fieldName === 'streetName' || fieldName === 'city') {
      value = value.replace(/\b\w/g, (char: string) => char.toUpperCase());
    }
    
    // For houseNumber, capitalize the first letter only if it's alphabetic
    if (fieldName === 'houseNumber' && value.length > 0) {
      const firstChar = value.charAt(0);
      if (/[a-zA-Z]/.test(firstChar)) {
        value = firstChar.toUpperCase() + value.slice(1);
      }
    }

    this.personalData[fieldName] = value;
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


// Handle NIC input restrictions
preventNICInvalidCharacters(event: KeyboardEvent): void {
  const charCode = event.which ? event.which : event.keyCode;
  const char = String.fromCharCode(charCode);
  const currentValue = (event.target as HTMLInputElement).value;
  
  // Block spaces entirely for NIC
  if (charCode === 32) {
    event.preventDefault();
    return;
  }
  
  // Allow only numbers and 'V' or 'v'
  if (!/[0-9Vv]/.test(char)) {
    event.preventDefault();
  }
}

// Format NIC input
formatNIC(): void {
  let value = this.personalData.nic;
  if (value) {
    // Remove all spaces and invalid characters
    value = value.replace(/[^0-9Vv]/g, '');
    
    // Convert 'v' to 'V' and ensure only one V at the end
    if (value.includes('v') || value.includes('V')) {
      // Remove all V's first
      value = value.replace(/[Vv]/g, '');
      // Add single V at the end if original had V/v
      value = value + 'V';
    }
    
    // Limit length based on format
    if (value.includes('V')) {
      // 9 digits + V format
      if (value.length > 10) {
        value = value.substring(0, 9) + 'V';
      }
    } else {
      // 12 digits format
      if (value.length > 12) {
        value = value.substring(0, 12);
      }
    }
    
    this.personalData.nic = value;
  }
}

// Add these new functions for account number handling
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

// Format account number input
formatAccountNumber(fieldName: 'accNumber' | 'confirmAccNumber'): void {
  let value = this.personalData[fieldName];
  if (value) {
    // Remove all spaces and non-numeric characters
    value = value.replace(/[^0-9]/g, '');
    this.personalData[fieldName] = value;
  }
}

// Handle Email input restrictions
preventEmailInvalidCharacters(event: KeyboardEvent): void {
  const charCode = event.which ? event.which : event.keyCode;
  const char = String.fromCharCode(charCode);
  
  // Block spaces entirely for email
  if (charCode === 32) {
    event.preventDefault();
    return;
  }
  
  // Allow alphanumeric, @, ., -, _
  if (!/[a-zA-Z0-9@.\-_]/.test(char)) {
    event.preventDefault();
  }
}

// Format Email input
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

  preventSpecialCharacters(event: KeyboardEvent): void {
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

  preventNonSinhalaCharacters(event: KeyboardEvent): void {
    // Handle space restrictions first
    if (!this.handleSpaceRestrictions(event)) {
      return;
    }

    const char = String.fromCharCode(event.which);
    // Allow Sinhala unicode characters and space
    if (!/[\u0D80-\u0DFF\s]/.test(char)) {
      event.preventDefault();
    }
  }

  preventNonTamilCharacters(event: KeyboardEvent): void {
    if (!this.handleSpaceRestrictions(event)) {
      return;
    }
    const char = String.fromCharCode(event.which);
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

  changeCenter(event: any){
    console.log('Center changed:', this.personalData.centerId);
    console.log('Center MAnager:', this.personalData.irmId);
    this.personalData.irmId = '';
    // this.centerOptions = [];
    this.getAllCollectionManagers();
  }
  
}

class Personal {
  jobRole: string = 'Collection Center Manager';
  empId!: string;
  centerId!: number | string;
  irmId!: number | string;
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