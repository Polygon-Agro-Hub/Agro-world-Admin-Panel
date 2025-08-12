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

  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]@[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    
    // Additional checks for invalid patterns
    if (!email || email.length === 0) return false;
    
    // Check for consecutive dots
    if (email.includes('..')) return false;
    
    // Check for leading dot in local part
    if (email.startsWith('.')) return false;
    
    // Check for trailing dot before @
    const atIndex = email.indexOf('@');
    if (atIndex > 0 && email.charAt(atIndex - 1) === '.') return false;
    
    // Check for dot immediately after @
    if (atIndex < email.length - 1 && email.charAt(atIndex + 1) === '.') return false;
    
    // Check for invalid special characters (only allow letters, numbers, dots, hyphens, underscores)
    const localPart = email.substring(0, atIndex);
    const domainPart = email.substring(atIndex + 1);
    
    // Local part validation - only allow alphanumeric, dots, hyphens, underscores
    const localPartRegex = /^[a-zA-Z0-9._-]+$/;
    if (!localPartRegex.test(localPart)) return false;
    
    // Domain part validation
    const domainPartRegex = /^[a-zA-Z0-9.-]+$/;
    if (!domainPartRegex.test(domainPart)) return false;
    
    // Use the main regex for final validation
    return emailRegex.test(email);
  }

  validateEmailInput(event: KeyboardEvent, fieldName: string): void {
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
    const currentValue =
      (this.personalData[fieldName as keyof Personal] as string) || '';

    // Block space completely for email
    if (event.key === ' ') {
      event.preventDefault();
      return;
    }

    // Block leading dot
    if (event.key === '.' && currentValue.length === 0) {
      event.preventDefault();
      return;
    }

    // Block consecutive dots
    if (event.key === '.' && currentValue.endsWith('.')) {
      event.preventDefault();
      return;
    }

    // Block dot immediately before @ or after @
    const atIndex = currentValue.indexOf('@');
    if (event.key === '.' && atIndex !== -1) {
      // Get cursor position (approximation - in real implementation you'd need to track cursor position)
      const cursorPosition = currentValue.length;
      if (cursorPosition === atIndex + 1) { // Trying to add dot right after @
        event.preventDefault();
        return;
      }
    }

    // Block dot at the end if @ exists (to prevent trailing dot before @)
    if (event.key === '@' && currentValue.endsWith('.')) {
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
      // Remove any invalid characters that might have been pasted
      this.personalData.email = this.personalData.email
        .replace(/\s/g, '') // Remove all spaces
        .replace(/\.{2,}/g, '.') // Replace multiple consecutive dots with single dot
        .replace(/^\./, '') // Remove leading dot
        .replace(/\.@/, '@'); // Remove dot immediately before @
      
      // Remove invalid special characters (keep only alphanumeric, dots, hyphens, underscores, @)
      this.personalData.email = this.personalData.email.replace(/[^a-zA-Z0-9._@-]/g, '');
      
      // Ensure only one @ symbol
      const atCount = (this.personalData.email.match(/@/g) || []).length;
      if (atCount > 1) {
        const firstAtIndex = this.personalData.email.indexOf('@');
        this.personalData.email = 
          this.personalData.email.substring(0, firstAtIndex + 1) + 
          this.personalData.email.substring(firstAtIndex + 1).replace(/@/g, '');
      }
    }
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
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
  }).then((result) => {
    if (result.isConfirmed) {
      this.router.navigate(['/steckholders/action/sales-agents']);
    }
  });
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

  if (!isOldFormat && !isNewFormat) {
    this.nicError = true;
    return false;
  }

  this.nicError = false;
  return true;
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

  onSubmit() {
    const phonePattern = /^[0-9]{9}$/;
    const accountPattern = /^[a-zA-Z0-9]+$/;

    // Check if employee type is selected
if (!this.isFormValid()) {
    Swal.fire('Error', 'Please fill all required fields correctly', 'error');
    return;
  }

    if (!this.empType) {
      Swal.fire('Error', 'Staff Employee Type is a required field', 'error');
      return;
    }

    // Enhanced email validation
    if (!this.personalData.email || !this.isValidEmail(this.personalData.email)) {
      Swal.fire('Error', 'Please enter a valid email address', 'error');
      return;
    }

    if (
      !this.personalData.firstName ||
      !this.personalData.lastName ||
      !this.personalData.phoneNumber1 ||
      !phonePattern.test(this.personalData.phoneNumber1) ||
      !this.personalData.nic ||
      !this.validateNIC() ||
      !this.personalData.houseNumber ||
      !this.personalData.streetName ||
      !this.personalData.city ||
      !this.personalData.province ||
      !this.personalData.district ||
      !this.personalData.accHolderName ||
      !this.personalData.accNumber ||
      !accountPattern.test(this.personalData.accNumber) ||
      !this.personalData.bankName ||
      !this.personalData.branchName ||
      this.personalData.accNumber !== this.confirmAccNumber ||
      !accountPattern.test(this.confirmAccNumber) ||
      (this.personalData.phoneNumber2 &&
        (!phonePattern.test(this.personalData.phoneNumber2) ||
          this.personalData.phoneNumber2 === this.personalData.phoneNumber1))
    ) {
      if (this.nicError) {
        Swal.fire(
          'Error',
          'Invalid NIC format (e.g., 123456789V or 200012345678)',
          'error'
        );
      } else {
        Swal.fire('Error', 'Please fill all required fields correctly', 'error');
      }
      return;
    }

    this.isLoading = true;

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to edit the Sales Agent?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Save it!',
      cancelButtonText: 'No, cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.salesAgentService
          .editSalesAgent(this.personalData, this.itemId, this.selectedImage)
          .subscribe(
            () => {
              this.isLoading = false;
              Swal.fire(
                'Success',
                'Sales Agent Updated Successfully',
                'success'
              );
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
        this.isLoading = false;
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
    // Allow navigation and control keys
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'Home',
      'End',
      ' ',
      'Spacebar',
    ];

    // Allow these special keys
    if (allowedKeys.includes(event.key)) {
      return;
    }

    // Allow only alphabetic characters (A-Z, a-z), spaces, hyphens, and apostrophes
    const allowedPattern = /^[a-zA-Z\s'-]$/;

    if (!allowedPattern.test(event.key)) {
      event.preventDefault();
    }
  }
capitalizeFirstLetter(field: 'firstName' | 'lastName') {
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
    // Allows letters, spaces, hyphens, and apostrophes
    const namePattern = /^[A-Za-z\s'-]+$/;
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
