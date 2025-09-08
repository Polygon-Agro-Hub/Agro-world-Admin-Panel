
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
interface BranchesData {
  [key: string]: Branch[];
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
isResetPasswordModalOpen: any;
saveNewPassword() {
throw new Error('Method not implemented.');
}
newPassword: any;
confirmPassword: any;
openResetPasswordModal() {
throw new Error('Method not implemented.');
}
resetPassword() {
throw new Error('Method not implemented.');
}

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

  loaded = true;

  banks: Bank[] = [];
  branches: Branch[] = [];
  selectedBankId: number | null = null;
  selectedBranchId: number | null = null;
  allBranches: BranchesData = {};
  errorMessage: string = '';
bankTouched: any;

  constructor(
    private router: Router,
    private http: HttpClient,
    private collectionCenterSrv: CollectionCenterService,
    private distributionHubSrv: DistributionHubService,
    private route: ActivatedRoute,
    private location: Location,
    private cdr: ChangeDetectorRef,
    public emailValidationService: EmailvalidationsService
  ) {}

  ngOnInit(): void {
    this.loadBanks();
    this.loadBranches();
    this.getAllCompanies();
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.itemId = +params['id'];
        this.loadDistributionHeadData(this.itemId);
      }
    });
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
      this.location.back(); // Go to the previous page
    }
  });
}

  


blockLeadingSpace(event: KeyboardEvent, field: string) {
  const value = this.personalData[field] || '';

  if (value.length === 0) {
    // Normal and numpad keys
    const key = event.key;
    const code = event.code;

    if (
      key === ' ' || // Space
      key === '+' || // Plus from main keyboard
      key === '-' || // Minus from main keyboard
      code === 'NumpadAdd' || // Plus from numpad
      code === 'NumpadSubtract' // Minus from numpad
    ) {
      event.preventDefault();
    }
  }
}

blockLeadingChars(event: KeyboardEvent, field: string) {
  const value = this.personalData[field] || '';

  // Block only if at first position
  if (value.length === 0 && [' ', '+', '-'].includes(event.key)) {
    event.preventDefault();
  }
}

fixPastedLeadingChars(event: Event, field: string) {
  let value = (event.target as HTMLInputElement).value;
  // Remove only bad chars at the start
  value = value.replace(/^[\+\-\s]+/, '');
  this.personalData[field] = value;
}



  loadDistributionHeadData(id: number): void {
    this.isLoading = true;
    this.distributionHubSrv.getDistributionHeadDetailsById(id).subscribe(
      (res: any) => {
        this.personalData = res.data;

        // Remove 'DCH' prefix from empId if it exists
        if (
          this.personalData.empId &&
          this.personalData.empId.startsWith('DCH')
        ) {
          this.personalData.empId = this.personalData.empId.substring(3);
        }

        // Set dropdown values
        if (res.data.companyId) {
          this.getAllDistributedCenters(res.data.companyId);
        }

        // Set bank and branch if available
        if (res.data.bankName) {
          const bank = this.banks.find((b) => b.name === res.data.bankName);
          if (bank) {
            this.selectedBankId = bank.ID;
            this.onBankChange();

            if (res.data.branchName) {
              const branch = this.branches.find(
                (b) => b.name === res.data.branchName
              );
              if (branch) {
                this.selectedBranchId = branch.ID;
              }
            }
          }
        }

        // Set image if available
        if (res.data.image) {
          this.selectedImage = res.data.image;
        }

        // Set employee type
        this.empType = res.data.empType;
        // Always set confirmAccNumber to the fetched accNumber
        this.personalData.confirmAccNumber = res.data.accNumber;

        // Check for duplicate numbers on load
        this.checkDuplicatePhoneNumbers();

        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        Swal.fire('Error', 'Failed to load distribution head data', 'error');
      }
    );
  }
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




blockInvalidNameInput(event: KeyboardEvent, currentValue: string): void {
  const key = event.key;

  // Allow only letters and space
  const allowed = /^[a-zA-Z ]$/;

  // Block if not allowed
  if (!allowed.test(key)) {
    event.preventDefault();
  }

  // Block space if first character
  if (key === ' ' && currentValue.length === 0) {
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

isValidPhoneNumber(phone: string, code: string): boolean {
  if (!phone || !code) return false;
  const fullNumber = `${code}${phone}`;
  const mobilePattern = /^\+947\d{8}$/; // Sri Lankan numbers
  return mobilePattern.test(fullNumber);
}


checkDuplicatePhoneNumbers(): void {
  const phone1 = `${this.personalData.phoneCode01 || ''}${this.personalData.phoneNumber01 || ''}`.trim();
  const phone2 = `${this.personalData.phoneCode02 || ''}${this.personalData.phoneNumber02 || ''}`.trim();

  // Only check for duplicates if both numbers exist and are valid format
  if (phone1 && phone2 && phone1 === phone2) {
    // Additional check: only show duplicate error if both numbers are in valid format
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
        this.location.back(); // This will navigate back to the previous page
      }
    });
  }

  nextFormCreate(page: 'pageOne' | 'pageTwo') {
  // Block navigation if duplicate phone numbers
  this.checkDuplicatePhoneNumbers();
  if (this.duplicatePhoneError) {
    Swal.fire('Error', "Company Mobile Number - 1 and Mobile Number - 2 can't be the same", 'error');
    return;
  }
  
  // Check if form is valid and show errors if not
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

  // First Name validation
  if (!this.personalData.firstNameEnglish || !namePattern.test(this.personalData.firstNameEnglish)) {
    errors.push('First Name is required and should contain only letters');
  }

  // Last Name validation
  if (!this.personalData.lastNameEnglish || !namePattern.test(this.personalData.lastNameEnglish)) {
    errors.push('Last Name is required and should contain only letters');
  }

  // Phone Number validation
  if (!this.isValidPhoneNumber(this.personalData.phoneNumber01, this.personalData.phoneCode01)) {
    errors.push('Mobile Number - 1 is required and should be valid');
  }

  // Email validation
  if (!this.personalData.email || !this.isValidEmail(this.personalData.email)) {
    errors.push('Email is required and should be valid');
  }

  // Languages validation
  if (!this.personalData.languages) {
    errors.push('At least one language must be selected');
  }

  // Company validation
  if (!this.personalData.companyId) {
    errors.push('Company Name is required');
  }

  // Job Role validation
  if (!this.personalData.jobRole) {
    errors.push('Job Role is required');
  }

  // NIC validation
  if (!this.personalData.nic || !this.isValidNIC(this.personalData.nic)) {
    errors.push('NIC is required and should be valid');
  }

  return errors;
}

  checkFormValidity(): boolean {
  const namePattern = /^[A-Za-z ]+$/;

  const isFirstNameValid =
    !!this.personalData.firstNameEnglish &&
    namePattern.test(this.personalData.firstNameEnglish);

  const isLastNameValid =
    !!this.personalData.lastNameEnglish &&
    namePattern.test(this.personalData.lastNameEnglish);

  const isPhoneNumberValid = this.isValidPhoneNumber(
    this.personalData.phoneNumber01,
    this.personalData.phoneCode01
  );

  const isEmailValid = this.personalData.email 
    ? this.emailValidationService.isEmailValid(this.personalData.email)
    : false;

  const isLanguagesSelected = !!this.personalData.languages;
  const isCompanySelected = !!this.personalData.companyId;
  const isJobRoleSelected = !!this.personalData.jobRole;
  const isNicSelected =
    !!this.personalData.nic && this.isValidNIC(this.personalData.nic);

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
    const selected = this.districts.find(
      (district) => district.name === selectedDistrict
    );
    if (selected) {
      this.personalData.province = selected.province;
    } else {
      this.personalData.province = '';
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

onBankChange() {
  if (this.selectedBankId) {
    console.log('Selected Bank ID:', this.selectedBankId);
    console.log('Available branches:', this.allBranches);
    const branches = this.allBranches[this.selectedBankId.toString()] || [];
    this.branches = branches.slice().sort((a, b) => a.name.localeCompare(b.name));
    console.log('Filtered branches:', this.branches);
    const selectedBank = this.banks.find((bank) => bank.ID === this.selectedBankId);
    if (selectedBank) {
      this.personalData.bankName = selectedBank.name;
      this.invalidFields.delete('bankName');
    }
    this.selectedBranchId = null;
    this.personalData.branchName = '';
    this.cdr.detectChanges(); // Force change detection
  } else {
    this.branches = [];
    this.personalData.bankName = '';
    this.cdr.detectChanges();
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
  this.checkDuplicatePhoneNumbers();
  if (this.duplicatePhoneError) {
    Swal.fire('Error', "Company Phone Number - 1 and 2 can't be the same", 'error');
    return;
  }
  
  // Check if form is valid and show errors if not
  if (!this.checkSubmitValidity()) {
    const errors = this.getSubmitValidationErrors();
    this.showValidationErrors(errors);
    return;
  }
  
  if (
    !this.personalData.confirmAccNumber ||
    this.personalData.confirmAccNumber.toString().trim() === '' ||
    !this.checkSubmitValidity()
  ) {
    Swal.fire('Error', 'Please fill the confirm account number', 'error');
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
  }).then((result) => {
    if (result.isConfirmed) {
      this.isLoading = true;
      const updateData = {
        ...this.personalData,
        empId: 'DCH' + this.personalData.empId,
        image: this.selectedImage,
      };

      this.distributionHubSrv
        .updateDistributionHeadDetails(this.itemId!, updateData)
        .subscribe(
          (res: any) => {
            this.isLoading = false;
            this.errorMessage = '';

            Swal.fire(
              'Success',
              'Updated Distribution Centre Head Successfully',
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
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire('Cancelled', 'Your action has been cancelled', 'info').then(
        () => {
          this.location.back();
        }
      );
    }
  });
}

getSubmitValidationErrors(): string[] {
  const errors: string[] = [];
  
  // Basic address validation
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

  // For companyId === 1, validate bank details
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
    // Basic address validation
    const isAddressValid =
      !!this.personalData.houseNumber &&
      !!this.personalData.streetName &&
      !!this.personalData.city &&
      !!this.personalData.district;

    // For companyId === 1, validate bank details
    if (this.personalData.companyId === '1') {
      // First validate that confirmAccNumber is not empty
      if (
        !this.personalData.confirmAccNumber ||
        this.personalData.confirmAccNumber.toString().trim() === ''
      ) {
        return false;
      }

      // Then check if numbers match (convert both to string for comparison)
      const accNumbersMatch =
        this.personalData.accNumber.toString() ===
        this.personalData.confirmAccNumber.toString();

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

  loadBanks() {
    this.http.get<Bank[]>('assets/json/banks.json').subscribe(
      (data) => {
        // Sort banks alphabetically by name
        this.banks = data.slice().sort((a, b) => a.name.localeCompare(b.name));
      },
      (error) => {}
    );
  }

  capitalizeV(): void {
  if (this.personalData.nic) {
    this.personalData.nic = this.personalData.nic.replace(/v/g, 'V');
  }
}

  loadBranches() {
    this.http.get<BranchesData>('assets/json/branches.json').subscribe(
      (data) => {
        this.allBranches = data;
      },
      (error) => {}
    );
  }

  showValidationErrors(errors: string[]): void {
  let errorMessage = '<ul style="text-align: left; margin-left: 20px;">';
  errors.forEach(error => {
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
  // Return null if no error
  if (!this.personalData.phoneNumber02) {
    return null;
  }
  
  // Check for duplicate error first (highest priority for styling)
  if (this.duplicatePhoneError && this.personalData.phoneNumber01 && this.personalData.phoneNumber02) {
    return 'duplicate';
  }
  
  // Check for invalid format
  if (!this.isValidPhoneNumber(this.personalData.phoneNumber02, this.personalData.phoneCode02)) {
    return 'invalid';
  }
  
  return null;
}


  
}

class Personal {
  [key: string]: any;
  jobRole: string = 'Distribution Center Head';
  empId!: string;
  centerId!: number;
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

