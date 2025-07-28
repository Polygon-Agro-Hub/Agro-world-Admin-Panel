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
import { DropdownModule } from 'primeng/dropdown';

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

  updateProvince(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedDistrict = target.value;
    const selected = this.districts.find(
      (district) => district.name === selectedDistrict
    );

    if (this.itemId === null) {
      this.personalData.province = selected ? selected.province : '';
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

  validateNIC(): boolean {
    const nic = this.personalData.nic;

    if (!nic) {
      this.nicError = true;
      return false;
    }

    // Single pattern: matches either 9 digits + V/v OR 12 digits
    const pattern = /^(\d{9}[Vv]|\d{12})$/;

    if (!pattern.test(nic)) {
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
    if (!this.empType) {
      Swal.fire('Error', 'Staff Employee Type is a required field', 'error');
      return;
    }

    if (
      !this.personalData.firstName ||
      !this.personalData.lastName ||
      !this.personalData.phoneNumber1 ||
      !phonePattern.test(this.personalData.phoneNumber1) ||
      !this.personalData.nic ||
      !this.validateNIC() ||
      !this.personalData.email ||
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

  capitalizeFirstLetter(fieldName: 'firstName' | 'lastName') {
    if (this.personalData[fieldName]) {
      // Capitalize first letter and make the rest lowercase
      this.personalData[fieldName] =
        this.personalData[fieldName].charAt(0).toUpperCase() +
        this.personalData[fieldName].slice(1).toLowerCase();
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
