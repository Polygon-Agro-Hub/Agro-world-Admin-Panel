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
];

getFlagUrl(countryCode: string): string {
  return `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`;
}

dropdownOpen = false;

  jobRoles = [
    'Collection Centre Manager',
    'Collection Officer',
    'Customer Officer'
  ];

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
  jobRoleTouched: boolean = false;

  constructor(
    private collectionOfficerService: CollectionOfficerService,
    private fb: FormBuilder,
    private collectionCenterSrv: CollectionCenterService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) { }

  selectedLanguages: string[] = [];

markAllFieldsAsTouched(): void {
  // Mark all form fields as touched
  const requiredFields: (keyof Personal)[] = [
    'firstNameEnglish', 'lastNameEnglish', 'firstNameSinhala', 'lastNameSinhala',
    'firstNameTamil', 'lastNameTamil', 'phoneNumber01', 'phoneNumber02',
    'nic', 'email', 'companyId', 'centerId', 'jobRole', 'houseNumber',
    'streetName', 'city', 'district', 'province', 'accHolderName',
    'accNumber', 'confirmAccNumber'
  ];

  requiredFields.forEach(field => {
    this.touchedFields[field] = true;
  });

  // Mark language and employee type as touched
  this.languagesTouched = true;
  this.empTypeTouched = true;
}

markPageOneFieldsAsTouched(): void {
  const pageOneFields: (keyof Personal)[] = [
    'firstNameEnglish', 'lastNameEnglish', 'firstNameSinhala', 'lastNameSinhala',
    'firstNameTamil', 'lastNameTamil', 'phoneNumber01', 'phoneNumber02',
    'nic', 'email', 'companyId', 'centerId', 'jobRole', 'irmId'
  ];

  pageOneFields.forEach(field => {
    this.touchedFields[field] = true;
  });

  this.languagesTouched = true;
  this.empTypeTouched = true;
  this.jobRoleTouched = true;
}

toggleDropdown() {
  this.dropdownOpen = !this.dropdownOpen;
}

closeDropdown() {
  this.dropdownOpen = false;
}

selectjobRole(role: string) {

  if (role === "Collection Centre Manager") {
    this.personalData.jobRole = "Collection Centre Manager";
    this.toggleDropdown()
    console.log('dropdownOpen', this.dropdownOpen)
  } else {
    this.personalData.jobRole = role;
    this.toggleDropdown()
    console.log('dropdownOpen', this.dropdownOpen)
  }
  console.log('personalData', this.personalData)

  this.EpmloyeIdCreate(); // call your method
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

onJobRoleBlur(): void {
  this.jobRoleTouched = true;
}

isJobRoleSelected(): boolean {
  return !!this.personalData.jobRole && this.personalData.jobRole !== '';
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

  if (!this.personalData.irmId && this.personalData.jobRole === 'Collection Officer') {
    missingFields.push('Collection Centre Manager is Required');
  }

  if (!this.personalData.phoneNumber01) {
    missingFields.push('Mobile Number - 01 is Required');
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

  if (!this.personalData.accHolderName) {
    missingFields.push("Account Holder's Name is required.");
  }

  if (!this.personalData.accNumber) {
    missingFields.push('Account Number is Required');
  }

  if (!this.personalData.confirmAccNumber) {
    missingFields.push('Confirm Account Number is Required');
  } else if (this.personalData.accNumber !== this.personalData.confirmAccNumber) {
    missingFields.push('Confirm Account Number - Must match Account Number');
  }

  if (!this.selectedBankId) {
    missingFields.push('Bank Name is Required');
  }

  if (!this.selectedBranchId) {
    missingFields.push('Branch Name is Required');
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
        confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
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
        .createCollectiveOfficer(this.personalData, this.selectedImage)
        .subscribe(
          (res: any) => {
            this.isLoading = false;
            this.officerId = res.officerId;
            this.errorMessage = '';

            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Collection Officer Created Successfully',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
                htmlContainer: 'text-left',
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

// Or combine both into a single function
capitalizeNames() {
  if (this.personalData.firstNameEnglish) {
    this.personalData.firstNameEnglish = 
      this.personalData.firstNameEnglish.charAt(0).toUpperCase() + 
      this.personalData.firstNameEnglish.slice(1);
  }
  if (this.personalData.lastNameEnglish) {
    this.personalData.lastNameEnglish = 
      this.personalData.lastNameEnglish.charAt(0).toUpperCase() + 
      this.personalData.lastNameEnglish.slice(1);
  }
}
// Prevent spaces anywhere in the input after typing starts
blockSpaces(event: KeyboardEvent) {
  if (event.key === ' ') {
    event.preventDefault(); // stop space character
  }
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
  console.log('personalData', this.personalData)
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

    if (!this.personalData.irmId && this.personalData.jobRole === 'Collection Officer') {
      missingFields.push('Collection Centre Manager is Required');
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

    if (!this.personalData.phoneNumber01) {
      missingFields.push('Mobile Number - 01 is Required');
    } else if (!this.isValidPhoneNumber(this.personalData.phoneNumber01)) {
      missingFields.push('Mobile Number - 01 - Must be 9 digits ');
    }

    if (this.personalData.phoneNumber02 && !this.isValidPhoneNumber(this.personalData.phoneNumber02)) {
      missingFields.push('Mobile Number - 02 - Must be 9 digits');
    }

    if (this.personalData.phoneNumber01 && this.personalData.phoneNumber02 && this.personalData.phoneNumber01 === this.personalData.phoneNumber02) {
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

    // If errors exist, the validation messages will now be visible due to touched fields
    // Show popup and stop navigation
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
  this.personalData.irmId = ''; // Clear manager selection
  this.managerOptions = []; // Clear manager options
  
  this.collectionCenterSrv.getAllCollectionCenterByCompany(id).subscribe(
    (res) => {
      this.collectionCenterData = res;
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
      'Collection Centre Head': 'CCH',
      'Collection Centre Manager': 'CCM',
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
onLetterKeyPress(event: KeyboardEvent) {
  const input = event.target as HTMLInputElement;
  const char = event.key;
  
  // Block space if it's at the start (cursor at position 0)
  if (char === ' ' && input.selectionStart === 0) {
    event.preventDefault();
    return;
  }
  
  // Allow all letters (\p{L}) and space (but not at the beginning), block numbers and special characters
  // const regex = /^[\p{L} ]$/u;
  // if (!regex.test(char)) {
  //   event.preventDefault(); // block the key
  // }
}

// Add this method to handle input events and remove leading spaces
onSinhalaTamilInput(event: Event, fieldName: 'firstNameSinhala' | 'lastNameSinhala' | 'firstNameTamil' | 'lastNameTamil'): void {
  const input = event.target as HTMLInputElement;
  let value = input.value;
  
  // Remove leading spaces
  if (value.startsWith(' ')) {
    value = value.trimStart();
    this.personalData[fieldName] = value;
    
    // Force update the model to reflect the change
    setTimeout(() => {
      input.value = value;
    }, 0);
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
    // Allow only Tamil letters (\u0B80-\u0BFF) and spaces
    value = value.replace(/[^\u0B80-\u0BFF ]/g, '');
    // Trim spaces and remove multiple consecutive spaces
    value = value.trim().replace(/\s{2,}/g, ' ');
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

onTrimInput(event: Event, modelRef: any, fieldName: string): void {
  const inputElement = event.target as HTMLInputElement;
  let trimmedValue = inputElement.value.trimStart();

  // ✅ Capitalize the first letter (if not empty)
  if (trimmedValue.length > 0) {
    trimmedValue = trimmedValue.charAt(0).toUpperCase() + trimmedValue.slice(1);
  }

  modelRef[fieldName] = trimmedValue;
  inputElement.value = trimmedValue;
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
  
  // Updated email regex to allow + character
  const emailRegex = /^[a-zA-Z0-9]+([._%+-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-]?[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;
  
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
  
  // Must start with 7 and have exactly 9 digits total
  const phoneRegex = /^7\d{8}$/;
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
  
  // Updated to allow alphanumeric, @, ., -, _, and +
  if (!/[a-zA-Z0-9@.\-_+]/.test(char)) {
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
  preventNonNumeric(event: KeyboardEvent, fieldName: 'phoneNumber01' | 'phoneNumber02'): void {
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

  formatPhoneNumber(fieldName: 'phoneNumber01' | 'phoneNumber02'): void {
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

  changeCenter(event: any){
    console.log('Center changed:', this.personalData.centerId);
    console.log('Center MAnager:', this.personalData.irmId);
    this.personalData.irmId = '';
    // this.centerOptions = [];
    this.getAllCollectionManagers();
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
  
}

class Personal {
  jobRole: string = '';
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