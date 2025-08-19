import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule,Location } from '@angular/common';
import Swal from 'sweetalert2';
import { CollectionCenterService } from '../../../../services/collection-center/collection-center.service';
import { CollectionOfficerService } from '../../../../services/collection-officer/collection-officer.service';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { EmailvalidationsService } from '../../../../services/email-validation/emailvalidations.service';

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
  emailErrorMessage: string | null = null;

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
    private collectionOfficerService: CollectionOfficerService,
   private location: Location,
   public emailValidationService: EmailvalidationsService
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


nextFormCreate(page: 'pageOne' | 'pageTwo') {
  // Only validate when navigating to pageTwo
  if (page === 'pageTwo') {
    const missingFields: string[] = [];
    const nicPattern = /^(\d{9}V|\d{12})$/;
    const phonePattern = /^[0-9]{9}$/;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!this.empType) {
      missingFields.push('Staff Employee Type');
    }

    if (this.isLanguageRequired && this.selectedLanguages.length === 0) {
      missingFields.push('Preferred Languages - At least one language must be selected');
    }

    if (!this.personalData.companyId) {
      missingFields.push('Company Name');
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
      missingFields.push('Phone Number - 1');
    } else if (!phonePattern.test(this.personalData.phoneNumber01)) {
      missingFields.push('Phone Number - 1 - Must be a valid 9-digit number (e.g., 77XXXXXXX)');
    }

    if (this.personalData.phoneNumber02) {
      if (!phonePattern.test(this.personalData.phoneNumber02)) {
        missingFields.push('Phone Number - 2 - Must be a valid 9-digit number (e.g., 77XXXXXXX)');
      }
      if (this.personalData.phoneNumber01 === this.personalData.phoneNumber02) {
        missingFields.push('Phone Number - 2 - Must be different from Phone Number - 1');
      }
    }

    if (!this.personalData.nic) {
      missingFields.push('NIC Number');
    } else if (!nicPattern.test(this.personalData.nic)) {
      missingFields.push('NIC Number - Must be 9 digits followed by V or 12 digits');
    }

    if (!this.personalData.email) {
  missingFields.push('Email');
} else {
  const emailValidation = this.emailValidationService.validateEmail(this.personalData.email);
  if (!emailValidation.isValid) {
    missingFields.push(`Email - ${emailValidation.errorMessage}`);
  }
}

    // Display errors if any
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

  // Navigate to the requested page
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
  const missingFields: string[] = [];

  // Validation for pageOne fields
  if (!this.empType) {
    missingFields.push('Staff Employee Type');
  }

  if (this.isLanguageRequired && this.selectedLanguages.length === 0) {
    missingFields.push('Preferred Languages - At least one language must be selected');
  }

  if (!this.personalData.companyId) {
    missingFields.push('Company Name');
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
    missingFields.push('Phone Number - 1');
  } else if (!/^[0-9]{9}$/.test(this.personalData.phoneNumber01)) {
    missingFields.push('Phone Number - 1 - Must be a valid 9-digit number (e.g., 77XXXXXXX)');
  }

  if (this.personalData.phoneNumber02) {
    if (!/^[0-9]{9}$/.test(this.personalData.phoneNumber02)) {
      missingFields.push('Phone Number - 2 - Must be a valid 9-digit number (e.g., 77XXXXXXX)');
    }
    if (this.personalData.phoneNumber01 === this.personalData.phoneNumber02) {
      missingFields.push('Phone Number - 2 - Must be different from Phone Number - 1');
    }
  }

  if (!this.personalData.nic) {
    missingFields.push('NIC Number');
  } else if (!/^(\d{9}V|\d{12})$/.test(this.personalData.nic)) {
    missingFields.push('NIC Number - Must be 9 digits followed by V or 12 digits');
  }

  if (!this.personalData.email) {
  missingFields.push('Email');
} else {
  const emailValidation = this.emailValidationService.validateEmail(this.personalData.email);
  if (!emailValidation.isValid) {
    missingFields.push(`Email - ${emailValidation.errorMessage}`);
  }
}

  // Validation for pageTwo fields
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

  // Bank details validation (only required if companyId is 1)
  if (this.personalData.companyId == 1) {
    if (!this.personalData.accHolderName) {
      missingFields.push('Account Holder’s Name');
    }

    if (!this.personalData.accNumber) {
      missingFields.push('Account Number');
    }

    if (!this.confirmAccNumber) {
      missingFields.push('Confirm Account Number');
    } else if (this.personalData.accNumber !== this.confirmAccNumber) {
      missingFields.push('Confirm Account Number - Must match Account Number');
    }

    if (!this.selectedBankId) {
      missingFields.push('Bank Name');
    }

    if (!this.selectedBranchId) {
      missingFields.push('Branch Name');
    }
  }

  // Display errors if any
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

  // Confirmation dialog
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
        .editCollectiveOfficer(this.personalData, this.itemId, this.selectedImage)
        .subscribe({
          next: (res: any) => {
            this.isLoading = false;
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Centre Head updated successfully',
              confirmButtonText: 'OK',
            }).then(() => {
              window.history.back();
            });
          },
          error: (error: any) => {
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
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: this.errorMessage,
              confirmButtonText: 'OK',
            });
          },
        });
    } else {
      this.isLoading = false;
      Swal.fire({
        icon: 'info',
        title: 'Cancelled',
        text: 'Your action has been cancelled',
        confirmButtonText: 'OK',
      });
    }
  });
}
  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  validateEmail(): void {
  this.emailErrorMessage = this.emailValidationService.getErrorMessage(this.personalData.email);
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
