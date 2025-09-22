import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { CollectionOfficerService } from '../../../services/collection-officer/collection-officer.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { SalesAgentsService } from '../../../services/dash/sales-agents.service';
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

interface PhoneCode {
  code: string;
  dialCode: string;
  name: string;
}

interface BranchesData {
  [key: string]: Branch[];
}

@Component({
  selector: 'app-edit-sales-agent',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    DropdownModule,
  ],
  templateUrl: './edit-sales-agent.component.html',
  styleUrl: './edit-sales-agent.component.css',
})
export class EditSalesAgentComponent implements OnInit {
onBlur(arg0: string) {
throw new Error('Method not implemented.');
}
  itemId!: number;
  selectedPage: 'pageOne' | 'pageTwo' = 'pageOne';
  selectedFile: File | null = null;
  selectedFileName!: string;
  selectedImage: string | ArrayBuffer | null = null;
  isLoading = true;
  selectedLanguages: string[] = [];
  selectJobRole!: string;
  personalData: Personal = new Personal();
  confirmAccNumber!: any;
  lastID!: string;
  empType!: string;
  comId!: number;
  initiateJobRole!: string;
  initiateId!: string;
  errorMessage: string = '';
  img!: string;
  emailValidationError: string = '';

  banks: Bank[] = [];
  branches: Branch[] = [];
  selectedBankId: number | null = null;
  selectedBranchId: number | null = null;
  allBranches: BranchesData = {};
  touchedFields: { [key in keyof Personal]?: boolean } = {};
  invalidFields: Set<string> = new Set();
  confirmAccountNumberError: boolean = false;
  confirmAccountNumberRequired: boolean = false;
  nicError: boolean = false;

  countries: PhoneCode[] = [
    { code: 'LK', dialCode: '+94', name: 'Sri Lanka' },
    { code: 'VN', dialCode: '+84', name: 'Vietnam' },
    { code: 'KH', dialCode: '+855', name: 'Cambodia' },
    { code: 'BD', dialCode: '+880', name: 'Bangladesh' },
    { code: 'IN', dialCode: '+91', name: 'India' },
    { code: 'NL', dialCode: '+31', name: 'Netherlands' }
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

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private collectionCenterSrv: CollectionCenterService,
    private collectionOfficerService: CollectionOfficerService,
    private salesAgentService: SalesAgentsService
  ) {}

  ngOnInit(): void {
    this.loadBanks();
    this.loadBranches();
    this.itemId = this.route.snapshot.params['id'];

    if (this.itemId) {
      this.isLoading = true;

      this.salesAgentService.getSalesAgentReportById(this.itemId).subscribe({
        next: (response: any) => {
          const officerData = response.officerData[0];

          this.personalData.empId = officerData.empId;
          this.personalData.firstName = officerData.firstName || '';
          this.personalData.lastName = officerData.lastName || '';
          this.personalData.phoneCode1 = officerData.phoneCode1 || '+94';
          this.personalData.phoneNumber1 = officerData.phoneNumber1 || '';
          this.personalData.phoneCode2 = officerData.phoneCode2 || '+94';
          this.personalData.phoneNumber2 = officerData.phoneNumber2 || '';
          this.personalData.nic = officerData.nic || '';
          this.personalData.email = officerData.email || '';
          this.personalData.houseNumber = officerData.houseNumber || '';
          this.personalData.streetName = officerData.streetName || '';
          this.personalData.city = officerData.city || '';
          this.personalData.district = officerData.district || '';
          this.personalData.province = officerData.province || '';
          this.personalData.bankName = officerData.bankName || '';
          this.personalData.branchName = officerData.branchName || '';
          this.personalData.accHolderName = officerData.accHolderName || '';
          this.personalData.accNumber = officerData.accNumber || '';
          this.personalData.empType = officerData.empType || '';
          this.personalData.image = officerData.image || '';

          this.empType = this.personalData.empType;
          this.lastID = this.personalData.empId.slice(-5);
          this.confirmAccNumber = this.personalData.accNumber;

          this.matchExistingBankToDropdown();
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
    }
  }

  getFlagUrl(countryCode: string): string {
    return `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`;
  }

  isValidEmail(email: string): boolean {
  if (!email) return false;
  
  // Basic email pattern
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // Additional checks
  if (email.includes('..')) {
    this.emailValidationError = 'Email cannot contain consecutive dots';
    return false;
  }
  
  if (email.startsWith('.')) {
    this.emailValidationError = 'Email cannot start with a dot';
    return false;
  }
  
  if (email.endsWith('.')) {
    this.emailValidationError = 'Email cannot end with a dot';
    return false;
  }
  
  const atIndex = email.indexOf('@');
  if (atIndex < 0) {
    this.emailValidationError = 'Email must contain an @ symbol';
    return false;
  }
  
  const localPart = email.substring(0, atIndex);
  const domainPart = email.substring(atIndex + 1);
  
  if (localPart.length === 0) {
    this.emailValidationError = 'Email must have characters before @';
    return false;
  }
  
  if (domainPart.length === 0) {
    this.emailValidationError = 'Email must have a domain after @';
    return false;
  }
  
  if (!emailPattern.test(email)) {
    this.emailValidationError = 'Please enter a valid email format (example@domain.com)';
    return false;
  }
  
  // If all checks pass
  this.emailValidationError = '';
  return true;
}


  
// Add these updated methods to your component class

validateEmailInput(event: KeyboardEvent): void {
  // Allow navigation and control keys
  const allowedKeys = [
    'Backspace',
    'Delete',
    'ArrowLeft',
    'ArrowRight',
    'Tab',
    'Home',
    'End',
  ];

  // Allow these special keys
  if (allowedKeys.includes(event.key)) {
    return;
  }

  // Get current value
  const target = event.target as HTMLInputElement;
  const currentValue = target.value || '';

  // Block space completely for email
  if (event.key === ' ') {
    event.preventDefault();
    return;
  }

  // Allow only valid email characters: letters, numbers, dots, hyphens, underscores, and @
  const emailPattern = /^[a-zA-Z0-9._@-]$/;
  if (!emailPattern.test(event.key)) {
    event.preventDefault();
    return;
  }

  // Ensure only one @ symbol
  if (event.key === '@' && currentValue.includes('@')) {
    event.preventDefault();
    return;
  }
}

  validateEmailOnInput(): void {
  if (this.personalData.email) {
    // Remove all spaces and trim
    this.personalData.email = this.personalData.email.replace(/\s/g, '').trim();
    
    // Clear error when user starts correcting
    this.emailValidationError = '';
  }
}

validateAccountHolderNameInput(event: KeyboardEvent): void {
  // Allow navigation and control keys
  const allowedKeys = [
    'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 
    'Tab', 'Home', 'End'
  ];

  if (allowedKeys.includes(event.key)) {
    return;
  }

  // Get current value and cursor position
  const target = event.target as HTMLInputElement;
  const currentValue = target.value || '';
  const cursorPosition = target.selectionStart || 0;

  // Block leading space - if field is empty or cursor is at beginning
  if (event.key === ' ') {
    if (currentValue.length === 0 || cursorPosition === 0) {
      event.preventDefault();
      return;
    }
    
    // Also block if current value only contains spaces
    if (currentValue.trim().length === 0) {
      event.preventDefault();
      return;
    }
  }

  // Block hyphen (-) character
  if (event.key === '-') {
    event.preventDefault();
    return;
  }

  // Allow only English letters, space, apostrophe (no hyphen)
  const englishNamePattern = /^[a-zA-Z\s']$/;
  
  if (!englishNamePattern.test(event.key)) {
    event.preventDefault();
  }
}

formatAccountHolderName(): void {
  if (this.personalData.accHolderName) {
    // Remove leading spaces and any non-English characters and hyphens
    let value = (this.personalData.accHolderName as string)
      .replace(/^\s+/, '') // Remove leading spaces
      .replace(/[^a-zA-Z\s']/g, '') // Remove non-English characters and hyphens
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();

    // Capitalize first letter of each word
    value = value.replace(/(^|\s|')[a-z]/g, (char) => char.toUpperCase());

    this.personalData.accHolderName = value;
  }
}

handleAccountHolderNamePaste(event: ClipboardEvent): void {
  event.preventDefault();
  const clipboardData = event.clipboardData || (window as any).clipboardData;
  const pastedText = clipboardData.getData('text');
  
  // Filter out leading spaces, non-English characters and hyphens
  const cleanText = pastedText
    .replace(/^\s+/, '') // Remove leading spaces
    .replace(/[^a-zA-Z\s']/g, ''); // Remove non-English characters and hyphens
  
  // Insert the cleaned text at cursor position
  const target = event.target as HTMLInputElement;
  const startPos = target.selectionStart || 0;
  const endPos = target.selectionEnd || 0;
  
  const currentValue = target.value;
  const beforeCursor = currentValue.substring(0, startPos);
  const afterCursor = currentValue.substring(endPos);
  
  // If inserting at the beginning, don't add leading spaces
  const newValue = beforeCursor + cleanText + afterCursor;
  target.value = newValue.replace(/^\s+/, ''); // Remove any leading spaces from final result
  
  // Update ngModel
  this.personalData.accHolderName = target.value;
  
  // Move cursor to end of inserted text
  const newCursorPos = startPos + cleanText.length;
  setTimeout(() => {
    target.setSelectionRange(newCursorPos, newCursorPos);
  });
}

validateEmailOnBlur(): void {
  if (this.personalData.email) {
    this.isValidEmail(this.personalData.email);
  }
}

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
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
      this.navigatePath('/steckholders/action/sales-agents');
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
    buttonsStyling: true,
  }).then((result) => {
    if (result.isConfirmed) {
       this.router.navigate(['/steckholders/action/sales-agents']);
    }
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
  validateAccNumber(): void {
  
    if (this.personalData.accNumber && this.confirmAccNumber) {
      this.confirmAccountNumberError =
        this.personalData.accNumber !== this.confirmAccNumber;
    } else {
      this.confirmAccountNumberError = false;
    }
  }
  validateNIC(): boolean {
  const nic = this.personalData.nic;

  if (!nic) {
    this.nicError = true;
    return false;
  }

  // Trim and convert to uppercase
  const cleanNIC = nic.trim().toUpperCase();

  // Check for old format (9 digits + V) or new format (12 digits)
  const isOldFormat = /^[0-9]{9}V$/.test(cleanNIC);
  const isNewFormat = /^[0-9]{12}$/.test(cleanNIC);

  // Set the error flag based on validation
  this.nicError = !(isOldFormat || isNewFormat);
  
  return !this.nicError;
}



onSubmit() {
  const missingFields: string[] = [];

  // Regular expressions
  const phonePattern = /^7\d{8}$/; // 9 digits starting with 7
  const accountPattern = /^[0-9]+$/; // numbers only
  const englishNamePattern = /^[A-Z][a-zA-Z\s]*$/;
  const nicPattern = /(^\d{12}$)|(^\d{9}[Vv]$)/i;
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Employee type
  if (!this.empType) {
    missingFields.push('Staff Employee Type');
  }

  // First Name
  // if (!this.personalData.firstName) {
  //   missingFields.push('First Name');
  // } else if (!englishNamePattern.test(this.personalData.firstName)) {
  //   missingFields.push('First Name - Must start with a capital letter and contain only English letters');
  // }

  // // Last Name
  // if (!this.personalData.lastName) {
  //   missingFields.push('Last Name');
  // } else if (!englishNamePattern.test(this.personalData.lastName)) {
  //   missingFields.push('Last Name - Must start with a capital letter and contain only English letters');
  // }

  // Phone Number 1
  if (!this.personalData.phoneNumber1) {
    missingFields.push('Mobile Number - 1');
  } else if (!phonePattern.test(this.personalData.phoneNumber1)) {
    missingFields.push('Mobile Number - 1 - Must be 9 digits starting with 7 (format: 7XXXXXXXX)');
  }

  // Phone Number 2 (optional)
  if (this.personalData.phoneNumber2 && this.personalData.phoneNumber2.trim() !== '') {
    if (!phonePattern.test(this.personalData.phoneNumber2)) {
      missingFields.push('Mobile Number - 2 - Must be 9 digits starting with 7 (format: 7XXXXXXXX)');
    }
    if (this.personalData.phoneNumber1 === this.personalData.phoneNumber2) {
      missingFields.push('Mobile Number - 2 - Cannot be the same as Mobile Number - 1');
    }
  }

  // Email
  if (!this.personalData.email) {
    missingFields.push('Email');
  } else if (!this.isValidEmail(this.personalData.email)) {
    missingFields.push('Email - Invalid format (e.g., example@domain.com)');
  }

  // NIC
  if (!this.personalData.nic) {
    missingFields.push('NIC Number');
  } else if (!nicPattern.test(this.personalData.nic)) {
    missingFields.push('NIC Number - Must be 12 digits or 9 digits followed by V');
  }

  // Address fields
  if (!this.personalData.houseNumber) {
    missingFields.push('House/Plot Number');
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

  // Account Holder Name
  if (!this.personalData.accHolderName) {
    missingFields.push('Account Holder Name');
  } else if (!this.isValidName(this.personalData.accHolderName)) {
    missingFields.push('Account Holder Name - Only letters, spaces, hyphens, and apostrophes allowed');
  }

  // Account Number
  if (!this.personalData.accNumber) {
    missingFields.push('Account Number');
  } else if (!accountPattern.test(this.personalData.accNumber)) {
    missingFields.push('Account Number - Only numbers allowed');
  }

  // Confirm Account Number
  if (!this.confirmAccNumber) {
    missingFields.push('Confirm Account Number');
  } else if (!accountPattern.test(this.confirmAccNumber)) {
    missingFields.push('Confirm Account Number - Only numbers allowed');
  } else if (this.personalData.accNumber !== this.confirmAccNumber) {
    missingFields.push('Confirm Account Number - Must match Account Number');
  }

  // Bank details
  if (!this.personalData.bankName) {
    missingFields.push('Bank Name');
  }

  if (!this.personalData.branchName) {
    missingFields.push('Branch Name');
  }

  // If any errors, show them in SweetAlert and stop
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
    return; // This stops the form submission
  }

  // If valid, proceed with confirmation
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to edit the Sales Agent?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Save it!',
    cancelButtonText: 'No, cancel',
    customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
        htmlContainer: 'text-left',
      },
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      this.isLoading = true;
      this.salesAgentService
        .editSalesAgent(this.personalData, this.itemId, this.selectedImage)
        .subscribe(
          () => {
            this.isLoading = false;
            Swal.fire('Success', 'Sales Agent Updated Successfully', 'success');
            this.navigatePath('/steckholders/action/sales-agents');
          },
          (error: any) => {
            this.isLoading = false;
            this.errorMessage =
              error.error.error || 'An unexpected error occurred';
            Swal.fire('Error', this.errorMessage, 'error');
          }
        );
    } else {
      Swal.fire('Cancelled', 'Your action has been cancelled', 'info');
    }
  });
}

  navigatePath(path: string) {
    this.router.navigate([path]);
  }
 updateProvince(event: DropdownChangeEvent): void {
  const selectedDistrict = event.value;
  const selected = this.districts.find(
    (district) => district.name === selectedDistrict
  );

  if (this.itemId === null) {
    this.personalData.province = selected ? selected.province : '';
  }
}

validateNameInput(event: KeyboardEvent): void {
  const allowedKeys = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'];
  if (allowedKeys.includes(event.key)) return;

  const target = event.target as HTMLInputElement;
  const fieldName = target.getAttribute('name') as keyof Personal;

  // Block leading spaces
  if (['firstName', 'lastName'].includes(fieldName)) {
    const currentValue = this.personalData[fieldName] as string || '';
    if (event.key === ' ' && (!currentValue || target.selectionStart === 0)) {
      event.preventDefault();
      return;
    }
  }

  // Block ASCII numbers only
  if (/[0-9]/.test(event.key)) {
    event.preventDefault();
    return;
  }

  // Allow letters (English, Sinhala, Tamil), spaces, hyphens, apostrophes
  const allowedPattern = /^[a-zA-Z\u0D80-\u0DFF\u0B80-\u0BFF\s'-]$/;
  if (!allowedPattern.test(event.key)) {
    event.preventDefault();
  }
}

capitalizeFirstLetter(field: 'firstName' | 'lastName' |'houseNumber' | 'streetName' | 'city' | 'accHolderName' | 'bankName' | 'branchName') {
  let value = this.personalData[field];

  if (!value) return;

  // Find index of first non-space character
  const firstNonSpaceIndex = value.search(/\S/);

  if (firstNonSpaceIndex === -1) {
    // Only spaces - do nothing
    return;
  }

  // Extract parts
  const before = value.slice(0, firstNonSpaceIndex);
  const firstChar = value.charAt(firstNonSpaceIndex);
  const after = value.slice(firstNonSpaceIndex + 1);

  // Capitalize the first non-space character and keep the rest as is
  this.personalData[field] = before + firstChar.toUpperCase() + after;
}

  onFieldTouched(field: keyof Personal) {
    this.touchedFields[field] = true;
  }

  onBranchTouched(field: keyof Personal) {
    this.touchedFields[field] = true;
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

  // Block lowercase 'v' explicitly
  if (event.key === 'v') {
    event.preventDefault();
    return;
  }

  // Allow only numbers or uppercase V
  const nicInputPattern = /^[0-9V]$/;
  if (!nicInputPattern.test(event.key)) {
    event.preventDefault();
  }
}

  formatNIC() {
  if (this.personalData.nic) {
    // Remove all spaces and convert to uppercase
    this.personalData.nic = this.personalData.nic.replace(/\s/g, '').toUpperCase();

    // If it ends with 'v' (shouldn't happen due to input validation, but just in case)
    if (this.personalData.nic.endsWith('v')) {
      this.personalData.nic = this.personalData.nic.slice(0, -1) + 'V';
    }
    
    // Validate after formatting
    this.validateNIC();
  } else {
    this.nicError = false;
  }
}

  isFieldInvalid(fieldName: keyof Personal): boolean {
    return !!this.touchedFields[fieldName] && !this.personalData[fieldName];
  }

  capitalizeName(fieldName: keyof Personal): void {
    if (this.personalData[fieldName]) {
      // Convert to lowercase first
      let value = (this.personalData[fieldName] as string).toLowerCase();

      // Capitalize first letter of each word
      value = value.replace(/(^|\s|-|')[a-z]/g, (char) => char.toUpperCase());

      (this.personalData[fieldName] as string) = value;
    }
  }

  isValidName(name: string): boolean {
  // Allows letters, spaces, and apostrophes only (no hyphens)
  const namePattern = /^[A-Za-z\s']+$/;
  return namePattern.test(name);
}

  isFormValid(): boolean {
  // Check all required fields
  if (!this.empType ||
      !this.personalData.firstName ||
      !this.personalData.lastName ||
      !this.personalData.phoneNumber1 ||
      !this.personalData.nic ||
      !this.personalData.email ||
      !this.personalData.houseNumber ||
      !this.personalData.streetName ||
      !this.personalData.city ||
      !this.personalData.district ||
      !this.personalData.accHolderName ||
      !this.personalData.accNumber ||
      !this.personalData.bankName ||
      !this.personalData.branchName ||
      !this.confirmAccNumber) {
    return false;
  }

  // Check field-specific validations
  if (!this.isValidEmail(this.personalData.email) ||
      !this.validateNIC() ||
      this.confirmAccountNumberError ||
      this.confirmAccountNumberRequired ||
      this.nicError) {
    return false;
  }

  // Check phone number patterns
  const phonePattern = /^[0-9]{9}$/;
  if (!phonePattern.test(this.personalData.phoneNumber1) ||
      (this.personalData.phoneNumber2 && !phonePattern.test(this.personalData.phoneNumber2))) {
    return false;
  }

  // Check account number pattern
  const accountPattern = /^[0-9]+$/;
  if (!accountPattern.test(this.personalData.accNumber) ||
      !accountPattern.test(this.confirmAccNumber)) {
    return false;
  }

  // Check if account numbers match
  if (this.personalData.accNumber !== this.confirmAccNumber) {
    return false;
  }

  // Check if phone numbers are different if both provided
  if (this.personalData.phoneNumber2 && 
      this.personalData.phoneNumber2 === this.personalData.phoneNumber1) {
    return false;
  }

  return true;
}

validateEnglishNameInput(event: KeyboardEvent): void {
  // Allow navigation and control keys
  const allowedKeys = [
    'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 
    'Tab', 'Home', 'End', ' ', 'Spacebar'
  ];

  if (allowedKeys.includes(event.key)) {
    return;
  }

  // Block hyphen (-) character
  if (event.key === '-') {
    event.preventDefault();
    return;
  }

  // Allow only English letters, space, apostrophe (no hyphen)
  const englishNamePattern = /^[a-zA-Z\s']$/;
  
  if (!englishNamePattern.test(event.key)) {
    event.preventDefault();
  }
}

formatEnglishName(fieldName: keyof Personal): void {
  if (this.personalData[fieldName]) {
    // Remove any non-English characters and hyphens that might have been pasted
    let value = (this.personalData[fieldName] as string)
      .replace(/[^a-zA-Z\s']/g, '') // Remove non-English characters and hyphens
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();

    // Capitalize first letter of each word
    value = value.replace(/(^|\s|')[a-z]/g, (char) => char.toUpperCase());

    (this.personalData[fieldName] as string) = value;
  }
}

isValidEnglishName(name: string): boolean {
  // Allows only English letters, spaces, and apostrophes (no hyphens)
  const englishNamePattern = /^[a-zA-Z\s']+$/;
  return englishNamePattern.test(name);
}

handleNamePaste(event: ClipboardEvent): void {
  event.preventDefault();
  const clipboardData = event.clipboardData || (window as any).clipboardData;
  const pastedText = clipboardData.getData('text');
  
  // Filter out non-English characters and hyphens
  const cleanText = pastedText.replace(/[^a-zA-Z\s']/g, '');
  
  // Insert the cleaned text at cursor position
  const target = event.target as HTMLInputElement;
  const startPos = target.selectionStart || 0;
  const endPos = target.selectionEnd || 0;
  
  const currentValue = target.value;
  target.value = currentValue.substring(0, startPos) + cleanText + currentValue.substring(endPos);
  
  // Update ngModel
  this.personalData.accHolderName = target.value;
  
  // Move cursor to end of inserted text
  const newCursorPos = startPos + cleanText.length;
  setTimeout(() => {
    target.setSelectionRange(newCursorPos, newCursorPos);
  });
}

preventLeadingSpace(event: KeyboardEvent, fieldName: keyof Personal): void {
  const target = event.target as HTMLInputElement;
  const currentValue = this.personalData[fieldName] as string || '';
  
  // Block space if field is empty or contains only spaces
  if (event.key === ' ' && (!currentValue || currentValue.trim().length === 0)) {
    event.preventDefault();
    return;
  }
  
  // Block space if cursor is at the beginning and current value starts with spaces
  if (event.key === ' ' && target.selectionStart === 0) {
    event.preventDefault();
    return;
  }
}

cleanFieldInput(fieldName: keyof Personal): void {
  if (this.personalData[fieldName]) {
    // Remove leading spaces while preserving the rest of the content
    let value = this.personalData[fieldName] as string;
    value = value.replace(/^\s+/, ''); // Remove only leading spaces
    (this.personalData[fieldName] as string) = value;
  }
}

validateAddressInput(event: KeyboardEvent): void {
  // Allow navigation and control keys
  const allowedKeys = [
    'Backspace',
    'Delete',
    'ArrowLeft',
    'ArrowRight',
    'Tab',
    'Home',
    'End'
  ];

  if (allowedKeys.includes(event.key)) {
    return;
  }

  // Block leading spaces
  const target = event.target as HTMLInputElement;
  const currentValue = target.value || '';
  
  if (event.key === ' ' && (!currentValue || target.selectionStart === 0)) {
    event.preventDefault();
    return;
  }
}

validatePhoneNumber(phoneNumber: string): boolean {
  const phonePattern = /^7\d{8}$/;
  return phonePattern.test(phoneNumber);
}

}

class Personal {
  empId!: any;
  irmId!: number;
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
  image!: string;
  accHolderName!: any;
  accNumber!: any;
  bankName!: string;
  branchName!: string;
}
