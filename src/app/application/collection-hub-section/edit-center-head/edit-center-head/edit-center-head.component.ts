import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { CollectionCenterService } from '../../../../services/collection-center/collection-center.service';
import { CollectionOfficerService } from '../../../../services/collection-officer/collection-officer.service';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';

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
  selector: 'app-edit-center-head',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './edit-center-head.component.html',
  styleUrl: './edit-center-head.component.css',
})
export class EditCenterHeadComponent {
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
  confirmAccNumber!: any;
  lastID!: string;
  empType!: string;
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
  invalidFields: Set<string> = new Set();
  confirmAccountNumberError: boolean = false;
  confirmAccountNumberRequired: boolean = false;

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
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private collectionCenterSrv: CollectionCenterService,
    private collectionOfficerService: CollectionOfficerService
  ) {}

  ngOnInit(): void {
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
          this.personalData.bankName = officerData.bankName || '';
          this.personalData.branchName = officerData.branchName || '';
          this.personalData.accHolderName = officerData.accHolderName || '';
          this.personalData.accNumber = officerData.accNumber || '';
          this.personalData.empType = officerData.empType || '';
          this.personalData.irmId = officerData.irmId || '';
          this.personalData.image = officerData.image || '';
          this.selectedLanguages = this.personalData.languages.split(',');
          this.empType = this.personalData.empType;
          this.lastID = this.personalData.empId.slice(-5);
          this.comId = this.personalData.companyId;
          this.confirmAccNumber = this.personalData.accNumber;
          this.initiateJobRole = officerData.jobRole || '';
          this.initiateId = officerData.empId.slice(-5);
          this.matchExistingBankToDropdown();
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
        },
      });
    }

    this.getAllCompanies();
  }

  loadBanks() {
    this.http.get<Bank[]>('assets/json/banks.json').subscribe(
      (data) => {
        this.banks = data.sort((a, b) => a.name.localeCompare(b.name));
      },
      (error) => {}
    );
  }

  loadBranches() {
    this.http.get<BranchesData>('assets/json/branches.json').subscribe(
      (data) => {
        Object.keys(data).forEach((bankID) => {
          data[bankID].sort((a, b) => a.name.localeCompare(b.name));
        });
        this.allBranches = data;
      },
      (error) => {}
    );
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

  getAllCompanies() {
    this.collectionCenterSrv.getAllCompanyList().subscribe((res) => {
      this.CompanyData = res;
    });
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

  isLanguageRequired = false;

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
    this.isLanguageRequired = this.selectedLanguages.length === 0;
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
        this.navigatePath('/collection-hub/edit-center-head');
      }
    });
  }

  nextFormCreate(page: 'pageOne' | 'pageTwo') {
    const nicPattern = /^(\d{9}V|\d{12})$/;
  
    if (
      !this.personalData.firstNameEnglish ||
      !this.personalData.firstNameSinhala ||
      !this.personalData.firstNameTamil ||
      !this.personalData.lastNameEnglish ||
      !this.personalData.lastNameSinhala ||
      !this.personalData.lastNameTamil ||
      !this.personalData.phoneNumber01 ||
      !this.personalData.nic ||
      !nicPattern.test(this.personalData.nic) || // ✅ Add pattern check here
      !this.personalData.email ||
      !this.personalData.empType
    ) {
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

  validateConfirmAccNumber(): void {
    this.confirmAccountNumberRequired = !this.confirmAccNumber;
    if (this.personalData.accNumber && this.confirmAccNumber) {
      this.confirmAccountNumberError =
        this.personalData.accNumber !== this.confirmAccNumber;
    } else {
      this.confirmAccountNumberError = false;
    }
  }

  onSubmit() {
    if (
      !this.personalData.houseNumber ||
      !this.personalData.streetName ||
      !this.personalData.city ||
      !this.personalData.province ||
      !this.personalData.district ||
      !this.personalData.accHolderName ||
      !this.personalData.accNumber ||
      !this.personalData.bankName ||
      !this.personalData.branchName ||
      this.personalData.accNumber !== this.confirmAccNumber
    ) {
      return;
    }

    this.isLoading = true;
    this.isLoading = false;
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to edit the Centre Head?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Save it!',
      cancelButtonText: 'No, cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
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
                'Centre Head updated Successfully',
                'success'
              );
              window.history.back();
            },
            (error: any) => {
              this.isLoading = false;
              this.errorMessage =
                error.error.error || 'An unexpected error occurred'; // Update the error message
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
  bankName!: string;
  branchName!: string;
}

class Company {
  id!: number;
  companyNameEnglish!: string;
}
