import { Component, OnInit } from '@angular/core';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { CollectionOfficerService } from '../../../services/collection-officer/collection-officer.service';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { ActivatedRoute, Router } from '@angular/router';
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
  selector: 'app-collectiveofficers-personal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
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



  banks: Bank[] = [];
  branches: Branch[] = [];
  selectedBankId: number | null = null;
  selectedBranchId: number | null = null;
  allBranches: BranchesData = {};

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
    // If the checkbox is checked, add the language to the string; if unchecked, remove it
    if (event.target.checked) {
      if (this.personalData.languages) {
        // Add the language if it's not already in the string
        if (!this.personalData.languages.includes(lang)) {
          this.personalData.languages += this.personalData.languages
            ? `,${lang}`
            : lang;
        }
      } else {
        this.personalData.languages = lang;
      }
    } else {
      // Remove the language from the string if the checkbox is unchecked
      const languagesArray = this.personalData.languages.split(',');
      const index = languagesArray.indexOf(lang);
      if (index !== -1) {
        languagesArray.splice(index, 1);
      }
      this.personalData.languages = languagesArray.join(',');
    }
  }

  onSubmit() {
    console.log(this.personalData); // Logs the personal data with updated languages
    console.log('hii', this.personalData.empType);

    // Show a confirmation dialog before proceeding
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
        // Proceed with submission if user clicks 'Yes'
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
        this.navigatePath('/steckholders/action/collective-officer');
      }
    });
  }

  nextFormCreate(page: 'pageOne' | 'pageTwo') {
    this.selectedPage = page;
    // if (!this.selectedImage) {
    //   Swal.fire({
    //     title: 'Image Required',
    //     text: 'Please upload a profile picture',
    //     icon: 'warning',
    //     confirmButtonText: 'OK',
    //   });
    //   return; // This will terminate the function if no image is selected
    // }
  }

  ngOnInit(): void {
    this.loadBanks();
    this.loadBranches();
    this.getAllCollectionCetnter();
    this.getAllCompanies();
    this.EpmloyeIdCreate();
  }

  loadBanks() {
    this.http.get<Bank[]>('assets/json/banks.json').subscribe(
      data => {
        this.banks = data;
       
      },
      error => {
        console.error('Error loading banks:', error);
      }
    );
  }

  loadBranches() {
    this.http.get<BranchesData>('assets/json/branches.json').subscribe(
      data => {
        this.allBranches = data;
        
      },
      error => {
        console.error('Error loading branches:', error);
      }
    );
  }



  
  
  onBankChange() {
    if (this.selectedBankId) {
      // Update branches based on selected bank
      this.branches = this.allBranches[this.selectedBankId.toString()] || [];
      
      // Update company data with bank name
      const selectedBank = this.banks.find(bank => bank.ID === this.selectedBankId);
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
      const selectedBranch = this.branches.find(branch => branch.ID === this.selectedBranchId);
      if (selectedBranch) {
        this.personalData.branchName = selectedBranch.name;
        this.invalidFields.delete('branchName');
      }
    } else {
      this.personalData.branchName = '';
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

    // Map job roles to their respective prefixes
    const rolePrefixes: { [key: string]: string } = {
      'Collection Center Head': 'CCH',
      'Collection Center Manager': 'CCM',
      'Customer Officer': 'CUO',
      'Collection Officer': 'COO',
    };

    // Get the prefix based on the job role
    rolePrefix = rolePrefixes[this.personalData.jobRole];

    if (!rolePrefix) {
      console.error(`Invalid job role: ${this.personalData.jobRole}`);
      return; // Exit if the job role is invalid
    }

    // Fetch the last ID and assign a new Employee ID
    this.getLastID(rolePrefix)
      .then((lastID) => {
        this.personalData.empId = rolePrefix + lastID;
      })
      .catch((error) => {
        console.error('Error fetching last ID:', error);
      });
    this.personalData.companyId = currentCompanyId;
    this.personalData.centerId = currentCenterId;
  }

  getLastID(role: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.collectionCenterSrv.getForCreateId(role).subscribe(
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

  updateEmployeeType(selectedType: string): void {
    this.empType = selectedType;
    this.personalData.empType = selectedType; // Update personalData.empType dynamically
    console.log('Selected Employee Type:', this.personalData.empType);
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidNIC(nic: string): boolean {
    const nicRegex = /^(?:\d{12}|\d{9}[a-zA-Z])$/;
    return nicRegex.test(nic);
  }

  isAtLeastOneLanguageSelected(): boolean {
    return (
      !!this.personalData.languages && this.personalData.languages.length > 0
    );
  }

  isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^[0-9]{9,10}$/; // Adjust based on phone number format
    return phoneRegex.test(phone);
  }

  onBlur(fieldName: keyof Personal): void {
    this.touchedFields[fieldName] = true;
  
    
    if (fieldName === 'confirmAccNumber') {
      this.validateConfirmAccNumber();
    }
  }
  
  // isFieldInvalid(fieldName: keyof Company): boolean {
  //   return !!this.touchedFields[fieldName] && !this.companyData[fieldName];
  // }
  
  
  validateConfirmAccNumber(): void {
   
    this.confirmAccountNumberRequired = !this.personalData.confirmAccNumber;
  
    // Check if account numbers match
    if (this.personalData.accNumber && this.personalData.confirmAccNumber) {
      this.confirmAccountNumberError = this.personalData.accNumber !== this.personalData.confirmAccNumber;
    } else {
      this.confirmAccountNumberError = false;
    }
  }



  // onBlur(fieldName: keyof Personal): void {
  //   this.touchedFields[fieldName] = true;
  // }

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
    return !!this.empType; // Returns true if empType is not null or undefined
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
      !!this.personalData.firstNameTamil;
    const isLastNameValid =
      !!this.personalData.lastNameEnglish &&
      !!this.personalData.lastNameSinhala &&
      !!this.personalData.lastNameTamil;
    const isPhoneNumberValid =
      this.isValidPhoneNumber(this.personalData.phoneNumber01) &&
      this.isValidPhoneNumber(this.personalData.phoneNumber02);
    const isEmailValid = this.isValidEmail(this.personalData.email);
    const isEmpTypeSelected = !!this.empType;
    const isLanguagesSelected = !!this.personalData.languages;
    const isCompanySelected = !!this.personalData.companyId;
    const isCenterSelected = !!this.personalData.centerId;
    const isJobRoleSelected = !!this.personalData.jobRole;
    const isNicSelected = !!this.personalData.nic;

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
      isNicSelected
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

    const isAddressValid =
      !!houseNumber && !!streetName && !!city && !!district;

    if (companyId === '1') {
      const isBankDetailsValid =
        !!accHolderName && !!accNumber && !!bankName && !!branchName && !! confirmAccNumber && accNumber === confirmAccNumber;
      return isBankDetailsValid && isAddressValid;
    } else {
      return isAddressValid;
    }
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
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
