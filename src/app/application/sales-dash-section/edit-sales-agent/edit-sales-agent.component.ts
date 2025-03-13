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
  imports: [ReactiveFormsModule, HttpClientModule, CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './edit-sales-agent.component.html',
  styleUrl: './edit-sales-agent.component.css'
})
export class EditSalesAgentComponent implements OnInit{

  itemId!: number;
  selectedPage: 'pageOne' | 'pageTwo' = 'pageOne';
  selectedFile: File | null = null;
  selectedFileName!: string
  selectedImage: string | ArrayBuffer | null = null;
  isLoading = true;
  selectedLanguages: string[] = [];
  selectJobRole!: string
  personalData: Personal = new Personal();
  
  confirmAccNumber!: any;
  
  lastID!: string
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
    private collectionOfficerService: CollectionOfficerService,
    private salesAgentService: SalesAgentsService,
  ) { }

  ngOnInit(): void {
    this.loadBanks();
    this.loadBranches();
    this.itemId = this.route.snapshot.params['id'];

    if (this.itemId) {
      this.isLoading = true;
      console.log('isLoading became true');

      this.salesAgentService.getSalesAgentReportById(this.itemId).subscribe({
        next: (response: any) => {
          console.log('Response: ', response);

          // Map the response data to the Personal class
          const officerData = response.officerData[0];
          console.log('hi hi: ', response.officerData[0].empId);

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

          // Additional fields
          
          this.empType = this.personalData.empType;
          this.lastID = this.personalData.empId.slice(-4);
          console.log('cutted empId', this.lastID);
          // this.lastID = this.personalData.empId;
          
          this.confirmAccNumber = this.personalData.accNumber;
          // this.initiateJobRole = officerData.jobRole || '';
          // this.initiateId = officerData.empId.slice(-4);

          // console.log('This is the initiate Id', this.initiateJobRole)
          // console.log('This is the initiate JobRole', this.initiateId)

          // console.log('Mapped Personal Data: ', this.personalData);
          // console.log('laguages', this.selectedLanguages);

          this.matchExistingBankToDropdown();
          


          this.isLoading = false;
          console.log('isloading became false');
          

        },
        error: (error) => {
          console.error('Error fetching officer details:', error);
          this.isLoading = false;
        },
      });
    }
    
  }

  loadBanks() {
    this.http.get<Bank[]>('assets/json/banks.json').subscribe(
      data => {
        this.banks = data.sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
      },
      error => {
        console.error('Error loading banks:', error);
      }
    );
  }


  loadBranches() {
    this.http.get<BranchesData>('assets/json/branches.json').subscribe(
      data => {
        Object.keys(data).forEach(bankID => {
          data[bankID].sort((a, b) => a.name.localeCompare(b.name));
        });
        this.allBranches = data;
      },
      error => {
        console.error('Error loading branches:', error);
      }
    );
  }

  matchExistingBankToDropdown() {
    // Only proceed if both banks and branches are loaded and we have existing data
    if (this.banks.length > 0 && Object.keys(this.allBranches).length > 0 &&
      this.personalData && this.personalData.bankName) {
      console.log('hit 01', this.personalData.bankName);

      // Find the bank ID that matches the existing bank name
      const matchedBank = this.banks.find(bank => bank.name === this.personalData.bankName);

      if (matchedBank) {
        this.selectedBankId = matchedBank.ID;
        // Load branches for this bank
        this.branches = this.allBranches[this.selectedBankId.toString()] || [];

        // If we also have a branch name, try to match it
        if (this.personalData.branchName) {
          const matchedBranch = this.branches.find(branch => branch.name === this.personalData.branchName);
          if (matchedBranch) {
            this.selectedBranchId = matchedBranch.ID;
          }
        }
      }
    }
    console.log('hit 02');
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
      // this.officerForm.patchValue({ image: file });

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage = e.target.result; // Set selectedImage to the base64 string or URL
        console.log(this.selectedImage);
      };
      reader.readAsDataURL(file); // Read the file as a data URL
    }
  }



  triggerFileInput(event: Event): void {
    event.preventDefault();
    const fileInput = document.getElementById('imageUpload');
    fileInput?.click();
  }

  updateEmployeeType(selectedType: string): void {
    this.empType = selectedType;
    this.personalData.empType = selectedType; // Update personalData.empType dynamically
    console.log('Selected Employee Type:', this.empType);
  }

  updateProvince(event: Event): void {
    const target = event.target as HTMLSelectElement; // Cast to HTMLSelectElement
    const selectedDistrict = target.value;

    const selected = this.districts.find(district => district.name === selectedDistrict);

    if (this.itemId === null) {

      if (selected) {
        this.personalData.province = selected.province;
      } else {
        this.personalData.province = ''; // Clear if no matching district is found
      }

    } else {


      if (selected) {
        this.personalData.province = selected.province;
      }
    }
  }

  onBankChange() {
    if (this.selectedBankId) {
      // Update branches based on selected bank
      this.branches = this.allBranches[this.selectedBankId.toString()] || [];

      // Update company data with bank name
      const selectedBank = this.banks.find(bank => bank.ID === this.selectedBankId);
      if (selectedBank) {
        this.personalData.bankName = selectedBank.name;
      }

      // Reset branch selection if the current selection doesn't belong to this bank
      const currentBranch = this.branches.find(branch => branch.ID === this.selectedBranchId);
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
      // Update company data with branch name
      const selectedBranch = this.branches.find(branch => branch.ID === this.selectedBranchId);
      if (selectedBranch) {
        this.personalData.branchName = selectedBranch.name;
      }
    } else {
      this.personalData.branchName = '';
    }
  }
  
  validateConfirmAccNumber(): void {
   
    this.confirmAccountNumberRequired = !this.confirmAccNumber;
  
    // Check if account numbers match
    if (this.personalData.accNumber && this.confirmAccNumber) {
      this.confirmAccountNumberError = this.personalData.accNumber !== this.confirmAccNumber;
    } else {
      this.confirmAccountNumberError = false;
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
    }).then((result) => {
      if (result.isConfirmed) {
        this.navigatePath('/steckholders/action/sales-agents')
      }
    });
  }

  onSubmit() {
    console.log('start submitting')
    if (
      !this.personalData.firstName ||
      !this.personalData.lastName ||
      !this.personalData.phoneNumber1 ||
      !this.personalData.nic ||
      !this.personalData.email ||
      !this.personalData.empType ||
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

    ) { return; }


    this.isLoading = true;
    console.log(this.personalData); // Logs the personal data with updated languages
    console.log('hii', this.personalData.empType);
    console.log(this.selectedImage);

    
    this.isLoading = false;
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to edit the Sales Agent?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Save it!',
      cancelButtonText: 'No, cancel',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.salesAgentService.editSalesAgent(this.personalData, this.itemId, this.selectedImage).subscribe(
          (res: any) => {

            this.isLoading = false;
            Swal.fire('Success', 'Sales Agent Created Successfully', 'success');
            this.navigatePath('/steckholders/action/sales-agents');
          },
          (error: any) => {
            this.isLoading = false;
            this.errorMessage = error.error.error || 'An unexpected error occurred'; // Update the error message
            Swal.fire('Error', this.errorMessage, 'error');
          }
        );
      } else {
        this.isLoading = false;
        // If user clicks 'No', do nothing or show a cancellation message
        Swal.fire('Cancelled', 'Your action has been cancelled', 'info');
      }
    });
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
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


