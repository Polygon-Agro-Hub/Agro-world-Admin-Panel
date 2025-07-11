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
  selector: 'app-add-distribution-officer',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './add-distribution-officer.component.html',
  styleUrl: './add-distribution-officer.component.css',
})
export class AddDistributionOfficerComponent implements OnInit {

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

  constructor(
    private router: Router,
    private http: HttpClient,
    private collectionCenterSrv: CollectionCenterService,
    private distributionHubSrv: DistributionHubService,
    private location: Location,
    private route: ActivatedRoute
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

  isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^[0-9]{9}$/;
    return phoneRegex.test(phone);
  }

  isValidNIC(nic: string): boolean {
    const nicRegex = /^(?:\d{12}|\d{9}[a-zA-Z])$/;
    return nicRegex.test(nic);
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

  checkFormValidity(): boolean {
    const namePattern = /^[A-Za-z ]+$/;

    const isFirstNameValid =
      !!this.personalData.firstNameEnglish &&
      namePattern.test(this.personalData.firstNameEnglish);

    const isLastNameValid =
      !!this.personalData.lastNameEnglish &&
      namePattern.test(this.personalData.lastNameEnglish); // Optional: apply pattern here too

    const isPhoneNumberValid = this.isValidPhoneNumber(this.personalData.phoneNumber01);
    const isEmailValid = this.isValidEmail(this.personalData.email);
    const isLanguagesSelected = !!this.personalData.languages;
    const isJobRoleSelected = !!this.personalData.jobRole;
    const isNicSelected = !!this.personalData.nic;

    return (
      isFirstNameValid &&
      isLastNameValid &&
      isPhoneNumberValid &&
      isEmailValid &&
      isLanguagesSelected &&
      isJobRoleSelected &&
      isNicSelected
    );
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

  onBankChange() {
    if (this.selectedBankId) {
      this.branches = this.allBranches[this.selectedBankId.toString()] || [];
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

  onSubmit() {
    console.log('PERSONAL',this.personalData)
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to create the distribution center head?',
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
                'Created Distribution Center Head Successfully',
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
      companyId,
    } = this.personalData;

    const namePattern = /^[A-Za-z ]+$/;


    const isAddressValid =
      !!houseNumber && !!streetName && !!city && !!district;

    if (companyId === '1') {
      const isBankDetailsValid =
        !!accHolderName && namePattern.test(this.personalData.accHolderName) &&
        !!accNumber &&
        !!bankName &&
        !!branchName &&
        !!confirmAccNumber &&
        accNumber === confirmAccNumber;
      return isBankDetailsValid && isAddressValid;
    } else {
      return isAddressValid;
    }
  }

  getAllCompanies() {
    this.distributionHubSrv.getAllCompanyList().subscribe((res) => {
      this.CompanyData = res;
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
        this.banks = data;
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
}

class Personal {
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
