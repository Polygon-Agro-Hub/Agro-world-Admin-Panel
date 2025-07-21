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
        this.banks = data;
      },
      (error) => {
        console.error('Error loading banks:', error);
      }
    );
  }

  loadBranches() {
    this.http.get<BranchesData>('assets/json/branches.json').subscribe(
      (data) => {
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
    const phoneRegex = /^[0-9]{9,}$/; // Allows only 9-digit numbers
    return phoneRegex.test(phone);
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidNIC(nic: string): boolean {
    const nicRegex = /^(?:\d{12}|\d{9}[a-zA-Z])$/;
    return nicRegex.test(nic);
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  checkSubmitValidity(): boolean {
    console.log('cehcking submit')
    const phonePattern = /^[0-9]{9}$/;
    const accountPattern = /^[a-zA-Z0-9]+$/

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

    const isFirstNameValid = !!firstName;

    const isPhoneNumber1Valid = !!phoneNumber1 && phonePattern.test(phoneNumber1);
    const isEmailValid = this.isValidEmail(email);
    const isEmpTypeSelected = !!empType;
    const isNicSelected = !!nic;

    const isAccNumberPatternValid = accountPattern.test(accNumber);
    const isConfirmAccNumberPatternValid = accountPattern.test(confirmAccNumber);

    let isPhoneValid = true;

    if (phoneNumber2) {
      isPhoneValid = (phoneNumber2 !== phoneNumber1) && phonePattern.test(phoneNumber2);
    }

    const isAddressValid =
      !!houseNumber && !!streetName && !!city && !!district;

    const isBankDetailsValid =
      !!accHolderName &&
      !!accNumber &&
      !!bankName &&
      !!branchName &&
      !!confirmAccNumber &&
      accNumber === confirmAccNumber &&
      isAccNumberPatternValid &&
      isConfirmAccNumberPatternValid;
    console.log('isBankDetailsValid', isBankDetailsValid, 'isAddressValid', isAddressValid, 'isFirstNameValid', isFirstNameValid, 'isPhoneNumber1Valid', isPhoneNumber1Valid, 'isEmailValid', isEmailValid,
      'isEmpTypeSelected', isEmpTypeSelected, 'isNicSelected', isNicSelected, 'isPhoneValid', isPhoneValid
     )
    return (
      isBankDetailsValid &&
      isAddressValid &&
      isFirstNameValid &&
      isPhoneNumber1Valid &&
      isEmailValid &&
      isEmpTypeSelected &&
      isNicSelected &&
      isPhoneValid
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
