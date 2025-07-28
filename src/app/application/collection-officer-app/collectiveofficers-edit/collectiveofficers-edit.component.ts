import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { CollectionOfficerService } from '../../../services/collection-officer/collection-officer.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

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
  selector: 'app-collectiveofficers-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './collectiveofficers-edit.component.html',
  styleUrl: './collectiveofficers-edit.component.css',
})
export class CollectiveofficersEditComponent {
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

  banks: Bank[] = [];
  branches: Branch[] = [];
  selectedBankId: number | null = null;
  selectedBranchId: number | null = null;
  allBranches: BranchesData = {};
  touchedFields: { [key in keyof Personal]?: boolean } = {};
  confirmAccountNumberError: boolean = false;
  confirmAccountNumberRequired: boolean = false;

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

  isLanguageRequired = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private collectionCenterSrv: CollectionCenterService,
    private collectionOfficerService: CollectionOfficerService
  ) { }

  ngOnInit() {
    this.loadBanks();
    this.loadBranches();
    this.itemId = this.route.snapshot.params['id'];

    if (this.itemId) {
      this.isLoading = true;
      this.collectionCenterSrv.getOfficerReportById(this.itemId).subscribe({
        next: (response: any) => {
          const officerData = response.officerData[0];

          this.personalData.empId = officerData.empId;
          this.personalData.jobRole = officerData.jobRole || '';
          this.personalData.firstNameEnglish =
            officerData.firstNameEnglish || '';
          this.personalData.firstNameSinhala =
            officerData.firstNameSinhala || '';
          this.personalData.firstNameTamil = officerData.firstNameTamil || '';
          this.personalData.lastNameEnglish = officerData.lastNameEnglish || '';
          this.personalData.lastNameSinhala = officerData.lastNameSinhala || '';
          this.personalData.lastNameTamil = officerData.lastNameTamil || '';
          this.personalData.phoneCode01 = officerData.phoneCode01 || '+94';
          this.personalData.phoneNumber01 = officerData.phoneNumber01 || '';
          this.personalData.phoneCode02 = officerData.phoneCode02 || '+94';
          this.personalData.phoneNumber02 = officerData.phoneNumber02 || '';
          this.personalData.nic = officerData.nic || '';
          this.personalData.email = officerData.email || '';
          this.personalData.houseNumber = officerData.houseNumber || '';
          this.personalData.streetName = officerData.streetName || '';
          this.personalData.city = officerData.city || '';
          this.personalData.district = officerData.district || '';
          this.personalData.province = officerData.province || '';
          this.personalData.languages = officerData.languages || '';
          this.personalData.companyId = officerData.companyId || '';
          this.personalData.centerId = officerData.centerId || '';
          this.personalData.bankName = officerData.bankName || '';
          this.personalData.branchName = officerData.branchName || '';
          this.personalData.accHolderName = officerData.accHolderName || '';
          this.personalData.accNumber = officerData.accNumber || '';
          this.personalData.confirmAccNumber = officerData.accNumber || '';
          this.personalData.empType = officerData.empType || '';
          this.personalData.irmId = officerData.irmId || '';
          this.personalData.image = officerData.image || '';

          this.selectedLanguages = this.personalData.languages.split(',');
          this.empType = this.personalData.empType;
          this.lastID = this.personalData.empId.slice(-5);
          this.cenId = this.personalData.centerId;
          this.comId = this.personalData.companyId;
          this.initiateJobRole = officerData.jobRole || '';
          this.initiateId = officerData.empId.slice(-5);

          this.matchExistingBankToDropdown();
          this.getAllCollectionManagers();
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
        },
      });
    }

    this.getAllCollectionCetnter();
    this.getAllCompanies();
    this.EpmloyeIdCreate();
  }

  loadBanks() {
    this.http.get<Bank[]>('assets/json/banks.json').subscribe((data) => {
      this.banks = data.sort((a, b) => a.name.localeCompare(b.name));
    });
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

        if (this.personalData.branchName) {
          const matchedBranch = this.branches.find(
            (branch) => branch.name === this.personalData.branchName
          );
          if (matchedBranch) {
            this.selectedBranchId = matchedBranch.ID;
          }
        }
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
      }

      const currentBranch = this.branches.find(
        (branch) => branch.ID === this.selectedBranchId
      );
      if (!currentBranch) {
        this.selectedBranchId = null;
        this.personalData.branchName = '';
      }
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
      }
    } else {
      this.personalData.branchName = '';
    }
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

  isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidNIC(nic: string): boolean {
    if (!nic) return false;
    // Updated regex to exclude simple 'v' and only allow 'V' at the end
    const nicRegex = /^(?:\d{12}|\d{9}[V])$/;
    return nicRegex.test(nic);
  }

  isValidPhoneNumber(phone: string): boolean {
    if (!phone) return false;
    const phoneRegex = /^[0-9]{9}$/;
    return phoneRegex.test(phone);
  }

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

  formatSinhalaName(fieldName: 'firstNameSinhala' | 'lastNameSinhala'): void {
    let value = this.personalData[fieldName];
    if (value) {
      // Allow only Sinhala unicode characters and spaces
      value = value.replace(/[^\u0D80-\u0DFF\s]/g, '');
      this.personalData[fieldName] = value;
    }
  }

  formatTamilName(fieldName: 'firstNameTamil' | 'lastNameTamil'): void {
    let value = this.personalData[fieldName];
    if (value) {
      // Allow only Tamil unicode characters and spaces
      value = value.replace(/[^\u0B80-\u0BFF\s]/g, '');
      this.personalData[fieldName] = value;
    }
  }

  hasInvalidNameCharacters(fieldName: 'firstNameEnglish' | 'lastNameEnglish'): boolean {
    const value = this.personalData[fieldName];
    if (!value) return false;
    // Check if contains numbers or special characters
    return /[^a-zA-Z\s]/.test(value);
  }

  hasInvalidSinhalaCharacters(fieldName: 'firstNameSinhala' | 'lastNameSinhala'): boolean {
    const value = this.personalData[fieldName];
    if (!value) return false;
    // Check if contains non-Sinhala characters
    return /[^\u0D80-\u0DFF\s]/.test(value);
  }

  hasInvalidTamilCharacters(fieldName: 'firstNameTamil' | 'lastNameTamil'): boolean {
    const value = this.personalData[fieldName];
    if (!value) return false;
    // Check if contains non-Tamil characters
    return /[^\u0B80-\u0BFF\s]/.test(value);
  }

  hasInvalidAccountHolderName(): boolean {
    const value = this.personalData.accHolderName;
    if (!value) return false;
    // Check if contains numbers or special characters
    return /[^a-zA-Z\s]/.test(value);
  }

  arePhoneNumbersSame(): boolean {
    if (!this.personalData.phoneNumber01 || !this.personalData.phoneNumber02) {
      return false;
    }
    return this.personalData.phoneNumber01 === this.personalData.phoneNumber02;
  }

  isAtLeastOneLanguageSelected(): boolean {
    return this.selectedLanguages && this.selectedLanguages.length > 0;
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

    const isPhoneNumberValid = this.isValidPhoneNumber(this.personalData.phoneNumber01);
    const isEmailValid = this.isValidEmail(this.personalData.email);
    const isEmpTypeSelected = !!this.empType;
    const isLanguagesSelected = this.isAtLeastOneLanguageSelected();
    const isCompanySelected = !!this.personalData.companyId;
    const isCenterSelected = !!this.personalData.centerId;
    const isJobRoleSelected = !!this.personalData.jobRole;
    const isNicValid = this.isValidNIC(this.personalData.nic);

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
      !this.arePhoneNumbersSame()
    );
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
      'Collection Center Head': 'CCH',
      'Collection Center Manager': 'CCM',
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
    }).then((result) => {
      if (result.isConfirmed) {
        this.navigatePath('/steckholders/action/collective-officer');
      }
    });
  }

  nextFormCreate(page: 'pageOne' | 'pageTwo') {
    if (page === 'pageTwo' && !this.checkFormValidity()) {
      return;
    }
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
    } else {
      if (selected) {
        this.personalData.province = selected.province;
      }
    }
  }

  getAllCollectionCetnter() {
    this.collectionCenterSrv.getAllCollectionCenter().subscribe((res) => {
      this.collectionCenterData = res;
    });
  }

  getAllCompanies() {
    this.collectionCenterSrv.getAllCompanyList().subscribe((res) => {
      this.CompanyData = res;
    });
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

    // Update personalData.languages string
    this.personalData.languages = this.selectedLanguages.join(',');
    this.isLanguageRequired = this.selectedLanguages.length === 0;
  }

  onSubmit() {
  if (!this.checkSubmitValidity()) {
    this.isLoading = false;
    return;
  }

  this.isLoading = true;
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to update the collection officer?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Save it!',
    cancelButtonText: 'No, cancel',
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      this.collectionOfficerService
        .editCollectiveOfficer(
          this.personalData,
          this.itemId,
          this.selectedImage
        )
        .subscribe(
          (res: any) => {
            this.isLoading = false;
            Swal.fire(
              'Success',
              'Collection Officer Updated Successfully',
              'success'
            );
            this.navigatePath('/steckholders/action/collective-officer');
          },
          (error: any) => {
            this.isLoading = false;
            let errorMessage = 'An unexpected error occurred';

            // Handle specific error messages from the backend
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
      this.isLoading = false;
      Swal.fire('Cancelled', 'Your action has been cancelled', 'info');
    }
  });
}

  navigatePath(path: string) {
    this.router.navigate([path]);
  }
}

class Personal {
  jobRole!: string;
  empId!: any;
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
  companyId!: number;
  image!: string;
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
}

class Company {
  id!: number;
  companyNameEnglish!: string;
}