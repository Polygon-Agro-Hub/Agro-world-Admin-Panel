import { CommonModule  } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, NgModel } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import Swal from 'sweetalert2';
import { DistributionHubService } from '../../../services/distribution-hub/distribution-hub.service';
import { Router } from '@angular/router';
import { CalendarModule } from 'primeng/calendar';

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

interface PhoneCode {
  code: string;
  dialCode: string;
  name: string;
}

@Component({
  selector: 'app-create-distribution-officer',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    DropdownModule,
    CalendarModule
  ],
  templateUrl: './create-distribution-officer.component.html',
  styleUrl: './create-distribution-officer.component.css'
})
export class CreateDistributionOfficerComponent implements OnInit {
  @ViewChild('pageContainer') pageContainer!: ElementRef;
  @ViewChild('licNoInput') licNoModel!: NgModel;
  @ViewChild('confirmLicNoInput') confirmLicNoModel!: NgModel;
  @ViewChild('insurenceNoInput') insurenceNoModel!: NgModel;
  @ViewChild('confirmInsurenceNoInput') confirmInsurenceNoModel!: NgModel;
  @ViewChild('vRegNoInput') vRegNoModel!: NgModel;
  @ViewChild('confirmVRegNoInput') confirmVRegNoModel!: NgModel;

  officerId: number | null = null;
  selectedFile: File | null = null;
  languages: string[] = ['Sinhala', 'English', 'Tamil'];
  selectedPage: 'pageOne' | 'pageTwo' | 'pageThree' = 'pageOne';
  driverObj: Drivers = new Drivers();
  personalData: Personal = new Personal();

  distributionCenterData: DistributionCenter[] = [];
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

  loaded = true;

  banks: Bank[] = [];
  branches: Branch[] = [];
  selectedBankId: number | null = null;
  selectedBranchId: number | null = null;
  allBranches: BranchesData = {};

  confirmAccountNumberError: boolean = false;
  confirmAccountNumberRequired: boolean = false;
  companyOptions: any[] = [];
  centerOptions: any[] = [];
  managerOptions: any[] = [];
  bankOptions: any[] = [];
  branchOptions: any[] = [];

  showFirstDigitError: boolean = false;
firstDigitErrorField: 'phoneNumber01' | 'phoneNumber02' | null = null;

  invalidFields: Set<string> = new Set();

  languagesRequired: boolean = false;
  isDriverRoute: boolean = false;

  // Driver Images
  licenseFrontImageFileName!: string;
  licenseFrontImagePreview: string | ArrayBuffer | null = null;
  licenseFrontImageFile: File | null = null;

  licenseBackImageFileName!: string;
  licenseBackImagePreview: string | ArrayBuffer | null = null;
  licenseBackImageFile: File | null = null;

  insurenceFrontImageFileName!: string;
  insurenceFrontImagePreview: string | ArrayBuffer | null = null;
  insurenceFrontImageFile: File | null = null;

  insurenceBackImageFileName!: string;
  insurenceBackImagePreview: string | ArrayBuffer | null = null;
  insurenceBackImageFile: File | null = null;

  vehicleFrontImageFileName!: string;
  vehicleFrontImagePreview: string | ArrayBuffer | null = null;
  vehicleFrontImageFile: File | null = null;

  vehicleBackImageFileName!: string;
  vehicleBackImagePreview: string | ArrayBuffer | null = null;
  vehicleBackImageFile: File | null = null;

  vehicleSideAImageFileName!: string;
  vehicleSideAImagePreview: string | ArrayBuffer | null = null;
  vehicleSideAImageFile: File | null = null;

  vehicleSideBImageFileName!: string;
  vehicleSideBImagePreview: string | ArrayBuffer | null = null;
  vehicleSideBImageFile: File | null = null;

  isAppireImgValidation: boolean = false;
  selectVehicletype: any = { name: '', capacity: '' };

  curDate:Date = new Date();
  tomorrowDate: Date = new Date();   // tomorrow's date

  VehicleTypes = [
    { name: 'Mahindra Bollero', capacity: 272 },
    { name: 'Dimo Batta', capacity: 750 },
    { name: 'Three Wheeler', capacity: 100 },
  ];


  jobRoleOptions: any[] = [
    { label: 'Distribution Centre Manager', value: 'Distribution Centre Manager' },
    { label: 'Distribution Officer', value: 'Distribution Officer' },
  ];

  countries: PhoneCode[] = [
    { code: 'LK', dialCode: '+94', name: 'Sri Lanka' },
    { code: 'VN', dialCode: '+84', name: 'Vietnam' },
    { code: 'KH', dialCode: '+855', name: 'Cambodia' },
    { code: 'BD', dialCode: '+880', name: 'Bangladesh' },
    { code: 'IN', dialCode: '+91', name: 'India' },
    { code: 'NL', dialCode: '+31', name: 'Netherlands' },
    // { code: 'UK', dialCode: '+44', name: 'United Kingdom' },
    // { code: 'US', dialCode: '+1', name: 'United States' }
  ];

  getFlagUrl(countryCode: string): string {
    return `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`;
  }

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
    private distributionOfficerServ: DistributionHubService,
    private http: HttpClient,
    private router: Router
  ) { 
     this.tomorrowDate.setDate(this.tomorrowDate.getDate() + 1);
  }

  selectedLanguages: string[] = [];

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

  private formatDateForDatabase(date: Date | string | null): string | null {
    if (!date) return null;

    const dateObj = date instanceof Date ? date : new Date(date);

    // Format as YYYY-MM-DD
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  back(): void {
    let confirmMessage = 'You may lose the added data after going back!';
    let confirmButtonText = 'Yes, Go Back';
    let cancelButtonText = 'No, Stay Here';

    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: confirmMessage,
      showCancelButton: true,
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText,
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
      buttonsStyling: true,
    }).then((result) => {
      if (result.isConfirmed) {
        // Use history back instead of specific route
        window.history.back();
        // Or: this.location.back();
      }
    });
  }


  onSubmit() {
    const missingFields: string[] = [];

    // Only mark driver fields as touched if they exist (driver role)
    if (this.personalData.jobRole === 'Driver') {
      this.licNoModel?.control.markAsTouched();
      this.confirmLicNoModel?.control.markAsTouched();
      this.insurenceNoModel?.control.markAsTouched();
      this.confirmInsurenceNoModel?.control.markAsTouched();
      this.vRegNoModel?.control.markAsTouched();
      this.confirmVRegNoModel?.control.markAsTouched();
    }

    // Check required fields for pageOne
    if (!this.personalData.empType) {
      missingFields.push('Staff Employee Type is Required');
    }

    if (!this.isAtLeastOneLanguageSelected()) {
      missingFields.push('Preferred Languages is Required');
    }

    if (!this.personalData.companyId) {
      missingFields.push('Company Name is Required');
    }

    if (!this.personalData.centerId) {
      missingFields.push('Collection Centre Name is Required');
    }

    if (!this.personalData.jobRole) {
      missingFields.push('Job Role is Required');
    }

    if (this.personalData.jobRole === 'Distribution Officer' && !this.personalData.irmId) {
      missingFields.push('Manager Name is Required');
    }

    if (!this.personalData.firstNameEnglish) {
      missingFields.push('First Name (in English) is Required');
    }

    if (!this.personalData.lastNameEnglish) {
      missingFields.push('Last Name (in English) is Required');
    }

    if (!this.personalData.firstNameSinhala && !this.isDriverRoute) {
      missingFields.push('First Name (in Sinhala) is Required');
    }

    if (!this.personalData.lastNameSinhala && !this.isDriverRoute) {
      missingFields.push('Last Name (in Sinhala) is Required');
    }

    if (!this.personalData.firstNameTamil && !this.isDriverRoute) {
      missingFields.push('First Name (in Tamil) is Required');
    }

    if (!this.personalData.lastNameTamil && !this.isDriverRoute) {
      missingFields.push('Last Name (in Tamil) is Required');
    }

    if (!this.personalData.phoneNumber01) {
  missingFields.push('Mobile Number - 01 is Required');
} else if (!this.isValidPhoneNumber(this.personalData.phoneNumber01)) {
  missingFields.push('Mobile Number - 01 - Please enter a valid mobile number (format: 7XXXXXXXX)');
}

if (this.personalData.phoneNumber02 && !this.isValidPhoneNumber(this.personalData.phoneNumber02)) {
  missingFields.push('Mobile Number - 02 - Please enter a valid mobile number (format: 7XXXXXXXX)');
}

if (this.shouldShowDuplicateError()) {
  missingFields.push('Mobile Number - 02 - Cannot be the same as Mobile Number - 01');
}

    if (!this.personalData.nic) {
      missingFields.push('NIC Number is Required');
    } else if (!this.isValidNIC(this.personalData.nic)) {
      missingFields.push('NIC Number - Must be 12 digits or 9 digits followed by V');
    }

    if (!this.personalData.email) {
      missingFields.push('Email is Required');
    } else if (!this.isValidEmail(this.personalData.email)) {
      missingFields.push(`Email - ${this.getEmailErrorMessage(this.personalData.email)}`);
    }

    // Check required fields for pageTwo
    if (!this.personalData.houseNumber) {
      missingFields.push('House Number is Required');
    }

    if (!this.personalData.streetName) {
      missingFields.push('Street Name is Required');
    }

    if (!this.personalData.city) {
      missingFields.push('City is Required');
    }

    if (!this.personalData.district) {
      missingFields.push('District is Required');
    }

    if (!this.personalData.province) {
      missingFields.push('Province is Required');
    }

    if (!this.personalData.accHolderName) {
      missingFields.push(`Account Holder's Name is Required`);
    }

    if (!this.personalData.accNumber) {
      missingFields.push('Account Number');
    }

    if (!this.personalData.confirmAccNumber) {
      missingFields.push('Confirm Account Number is Required');
    } else if (this.personalData.accNumber !== this.personalData.confirmAccNumber) {
      missingFields.push('Confirm Account Number - Must match Account Number');
    }

    if (!this.selectedBankId) {
      missingFields.push('Bank Name is Required');
    }

    if (!this.selectedBranchId) {
      missingFields.push('Branch Name is Required');
    }

    if (this.personalData.jobRole === 'Driver') {
      
      if (!this.driverObj.licNo) {
        missingFields.push('Driving License ID number is Required');
      } else if (!/^([A-Z]\d{7}|\d{10,12})$/.test(this.driverObj.licNo)) {
        missingFields.push('Please enter a valid License ID number (1 capital letter + 7 digits or 10–12 digits).');
      }
  
      if (!this.driverObj.confirmLicNo) {
        missingFields.push('Confirm Driving License ID number is Required');
      } else if (this.driverObj.licNo !== this.driverObj.confirmLicNo) {
        missingFields.push('Confirm Driving License ID number should match the Driving License ID number.');
      }
  
      if (!this.driverObj.insNo) {
        missingFields.push('Insurance Number is Required');
      }
      if (!this.driverObj.confirmInsNo) {
        missingFields.push('Confirm Insurance Number is Required');
      } else if (this.driverObj.insNo !== this.driverObj.confirmInsNo) {
        missingFields.push('Confirm Insurance Number should match the Insurance Number.');
      }
  
      if (!this.driverObj.vRegNo) {
        missingFields.push('Vehicle Registration Number is Required');
      }
  
      if (!this.driverObj.confirmVRegNo) {
        missingFields.push(' Confirm Vehicle Registration Number is Required');
      } else if (this.driverObj.vRegNo !== this.driverObj.confirmVRegNo) {
        missingFields.push('Confirm Vehicle Registration Number should match the Vehicle Registration Number.');
      }

      if (!this.licenseFrontImageFileName) {
        missingFields.push("License's Front Image is Required");
      }
      if (!this.licenseBackImageFileName) {
        missingFields.push("License's Back Image is Required");
      }
      if (!this.driverObj.insExpDate) {
        missingFields.push('Insurance Expire Date is Required');
      }
      if (!this.insurenceFrontImageFileName) {
        missingFields.push("Insurance's Front Image is Required");
      }
      if (!this.insurenceBackImageFileName) {
        missingFields.push("Insurance's Back Image is Required");
      }

      if (!this.driverObj.vType) {
        missingFields.push('Vehicle Type is Required');
      }
      if (!this.vehicleFrontImageFileName) {
        missingFields.push("Vehicle's Front Image is Required");
      }
      if (!this.vehicleBackImageFileName) {
        missingFields.push("Vehicle's Back Image is Required");
      }
      if (!this.vehicleSideAImageFileName) {
        missingFields.push("Vehicle's Side Image - 1 is Required");
      }
      if (!this.vehicleSideBImageFileName) {
        missingFields.push("Vehicle's Side Image - 2 is Required");
      }
    }

    if (missingFields.length > 0) {
      // Mark all fields as touched to show validation errors
      this.touchedFields.empType = true;
      this.touchedFields.companyId = true;
      this.touchedFields.centerId = true;
      this.touchedFields.jobRole = true;
      this.touchedFields.irmId = true;
      this.touchedFields.firstNameEnglish = true;
      this.touchedFields.lastNameEnglish = true;
      this.touchedFields.firstNameSinhala = true;
      this.touchedFields.lastNameSinhala = true;
      this.touchedFields.firstNameTamil = true;
      this.touchedFields.lastNameTamil = true;
      this.touchedFields.phoneNumber01 = true;
      this.touchedFields.phoneNumber02 = true;
      this.touchedFields.nic = true;
      this.touchedFields.email = true;
      this.touchedFields.houseNumber = true;
      this.touchedFields.streetName = true;
      this.touchedFields.city = true;
      this.touchedFields.district = true;
      this.touchedFields.province = true;
      this.touchedFields.accHolderName = true;
      this.touchedFields.accNumber = true;
      this.touchedFields.confirmAccNumber = true;
      this.invalidFields.add('bankName');
      this.invalidFields.add('branchName');
      
      // Mark driver-specific fields as touched if driver role
      if (this.personalData.jobRole === 'Driver') {
        this.licNoModel?.control.markAsTouched();
        this.confirmLicNoModel?.control.markAsTouched();
        this.insurenceNoModel?.control.markAsTouched();
        this.confirmInsurenceNoModel?.control.markAsTouched();
        this.vRegNoModel?.control.markAsTouched();
        this.confirmVRegNoModel?.control.markAsTouched();
      }
      
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

    const roleTitle = this.getRoleDisplayName(this.personalData.jobRole);

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to create the ${roleTitle}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, create it!',
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

        // Prepare driver data if job role is Driver
        if (this.personalData.jobRole === 'Driver') {
          this.driverObj.licFrontName = this.licenseFrontImageFileName;
          this.driverObj.licBackName = this.licenseBackImageFileName;
          this.driverObj.insFrontName = this.insurenceFrontImageFileName;
          this.driverObj.insBackName = this.insurenceBackImageFileName;
          this.driverObj.vFrontName = this.vehicleFrontImageFileName;
          this.driverObj.vBackName = this.vehicleBackImageFileName;
          this.driverObj.vSideAName = this.vehicleSideAImageFileName;
          this.driverObj.vSideBName = this.vehicleSideBImageFileName;

          // Format the insurance expiry date before sending
          const formattedDriverObj = {
            ...this.driverObj,
            insExpDate: this.formatDateForDatabase(this.driverObj.insExpDate)
          };

          this.distributionOfficerServ
            .createDistributionOfficer(
              this.personalData,
              this.selectedImage,
              formattedDriverObj,  // Use formatted driver object
              this.licenseFrontImagePreview,
              this.licenseBackImagePreview,
              this.insurenceFrontImagePreview,
              this.insurenceBackImagePreview,
              this.vehicleFrontImagePreview,
              this.vehicleBackImagePreview,
              this.vehicleSideAImagePreview,
              this.vehicleSideBImagePreview
            )
            .subscribe(
              (res: any) => {
                this.isLoading = false;
                this.officerId = res.officerId;
                this.errorMessage = '';

                const roleTitle = this.getRoleDisplayName(this.personalData.jobRole);

                Swal.fire({
                  title: 'Success',
                  text: `${roleTitle} Created Successfully`,
                  icon: 'success',
                  customClass: {
                    popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                    title: 'font-semibold text-lg',
                  },
                });
                this.navigatePath('/steckholders/action/drivers');
              },
              (error: any) => {
                this.isLoading = false;
                this.handleCreateError(error);
              }
            );
        } else {
          this.distributionOfficerServ
            .createDistributionOfficer(this.personalData, this.selectedImage)
            .subscribe(
              (res: any) => {
                this.isLoading = false;
                this.officerId = res.officerId;
                this.errorMessage = '';

                // Dynamic success message based on job role
                const roleTitle = this.getRoleDisplayName(this.personalData.jobRole);

                Swal.fire({
                  title: 'Success',
                  text: `${roleTitle} Created Successfully`,
                  icon: 'success',
                  customClass: {
                    popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                    title: 'font-semibold text-lg',
                  },
                });
                this.navigatePath('/steckholders/action/view-distribution-officers');
              },
              (error: any) => {
                this.isLoading = false;
                this.handleCreateError(error);
              }
            );
        }
      }
    }
    );
  }

  private getRoleDisplayName(jobRole: string): string {
    const roleMapping: { [key: string]: string } = {
      'Driver': 'Driver',
      'Distribution Officer': 'Distribution Officer',
      'Distribution Centre Manager': 'Distribution Centre Manager'
    };

    return roleMapping[jobRole] || 'Distribution Officer';
  }

  //   private handleCreateError(error: any) {
  //     let errorMessage = 'An unexpected error occurred';

  //     if (error.error && error.error.errors) {
  //         // Handle array of errors
  //         const errors = error.error.errors;
  //         const errorMessages = [];

  //         // Map each error code to a user-friendly message
  //         errors.forEach((errorCode: string) => {
  //             switch (errorCode) {
  //                 case 'NIC':
  //                     errorMessages.push('The NIC number is already registered.');
  //                     break;
  //                 case 'email':
  //                     errorMessages.push('The email address is already in use.');
  //                     break;
  //                 case 'phoneNumber01':
  //                     errorMessages.push('The primary phone number is already registered.');
  //                     break;
  //                 case 'phoneNumber02':
  //                     errorMessages.push('The secondary phone number is already registered.');
  //                     break;
  //                 default:
  //                     errorMessages.push(`Error: ${errorCode}`);
  //             }
  //         });

  //         // Join multiple errors with line breaks
  //         errorMessage = errorMessages.join('<br>');
  //     } else if (error.error && error.error.error) {
  //         // Handle single string error (for backward compatibility)
  //         switch (error.error.error) {
  //             case 'Invalid file format or file upload error':
  //                 errorMessage = 'Invalid file format or error uploading the file.';
  //                 break;
  //             default:
  //                 errorMessage = error.error.error || 'An unexpected error occurred';
  //         }
  //     }

  //     this.errorMessage = errorMessage;
  //     Swal.fire({
  //         title: 'Error',
  //         html: this.errorMessage, // Use 'html' instead of 'text' for line breaks
  //         icon: 'error',
  //         customClass: {
  //             popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
  //             title: 'font-semibold',
  //         },
  //     });
  // }

  private handleCreateError(error: any) {
    this.isLoading = false;
    let errorMessage = 'An unexpected error occurred';
    let messages: string[] = [];
    if (error.error && Array.isArray(error.error.errors)) {
      messages = error.error.errors.map((err: string) => {
        switch (err) {
          case 'NIC':
            return 'The NIC number is already registered.';
          case 'email':
            return 'Email already exists.';
          case 'phoneNumber01':
            return 'Mobile Number 1 already exists.';
          case 'phoneNumber02':
            return 'Mobile Number 2 already exists.';
          default:
            return 'Validation error: ' + err;
        }
      });
    }

    if (messages.length > 0) {
      errorMessage = '<div class="text-left"><p class="mb-2">Please fix the following Duplicate field issues:</p><ul class="list-disc pl-5">';
      messages.forEach(m => {
        errorMessage += `<li>${m}</li>`;
      });
      errorMessage += '</ul></div>';
      Swal.fire({
        icon: 'error',
        title: 'Duplicate Information',
        html: errorMessage,
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
          htmlContainer: 'text-left',
          confirmButton: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700',
        },
      });
      return;
    }
  }
  onCancel() {
    let confirmMessage = 'You may lose the added data after canceling!';
    let confirmButtonText = 'Yes, Cancel';
    let cancelButtonText = 'No, Keep Editing';

    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: confirmMessage,
      showCancelButton: true,
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText,
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
      buttonsStyling: true,
    }).then((result) => {
      if (result.isConfirmed) {
        // Use browser history back instead of specific route navigation
        window.history.back();
      }
    });
  }

  nextFormCreate(page: 'pageOne' | 'pageTwo' | 'pageThree') {
    // this.selectedPage = page;
    // Scroll to top after page change
    setTimeout(() => {
      this.scrollToTop();
    }, 100);
    console.log('pdatra', this.personalData)
    if (page === 'pageTwo') {

      this.validateLanguages();
      const missingFields: string[] = [];

      this.touchedFields.empType = true;
      this.touchedFields.companyId = true;
      this.touchedFields.centerId = true;
      this.touchedFields.jobRole = true;
      this.touchedFields.firstNameEnglish = true;
      this.touchedFields.lastNameEnglish = true;
      this.touchedFields.firstNameSinhala = true;
      this.touchedFields.lastNameSinhala = true;
      this.touchedFields.firstNameTamil = true;
      this.touchedFields.lastNameTamil = true;
      this.touchedFields.phoneNumber01 = true;
      this.touchedFields.nic = true;
      this.touchedFields.email = true;
      this.languagesTouched = true;
      this.empTypeTouched = true;

      // Validate pageOne fields
      if (!this.personalData.empType) {
        missingFields.push('Staff Employee Type is Required');
      }

      if (!this.isAtLeastOneLanguageSelected()) {
        missingFields.push('Preferred Language is Required');
      }

      if (!this.personalData.companyId) {
        missingFields.push('Company Name is Required');
      }

      if (!this.personalData.centerId) {
        missingFields.push('Collection Centre Name is Required');
      }

      if (!this.personalData.jobRole) {
        missingFields.push('Job Role is Required');
      }

      if ((this.personalData.jobRole === 'Distribution Officer' || this.personalData.jobRole === 'Driver') && !this.personalData.irmId) {
        missingFields.push('Manager Name is Required');
      }

      if (!this.personalData.firstNameEnglish) {
        missingFields.push('First Name (in English) is Required');
      }

      if (!this.personalData.lastNameEnglish) {
        missingFields.push('Last Name (in English) is Required');
      }

      if (!this.personalData.firstNameSinhala && !this.isDriverRoute) {
        missingFields.push('First Name (in Sinhala) is Required');
      }

      if (!this.personalData.lastNameSinhala && !this.isDriverRoute) {
        missingFields.push('Last Name (in Sinhala) is Required');
      }

      if (!this.personalData.firstNameTamil && !this.isDriverRoute) {
        missingFields.push('First Name (in Tamil) is Required');
      }

      if (!this.personalData.lastNameTamil && !this.isDriverRoute) {
        missingFields.push('Last Name (in Tamil) is Required');
      }

      if (!this.personalData.phoneNumber01) {
  missingFields.push('Mobile Number - 01 is Required');
} else if (!this.isValidPhoneNumber(this.personalData.phoneNumber01)) {
  missingFields.push('Mobile Number - 01 - Please enter a valid mobile number (format: 7XXXXXXXX)');
}

if (this.personalData.phoneNumber02 && !this.isValidPhoneNumber(this.personalData.phoneNumber02)) {
  missingFields.push('Mobile Number - 02 - Please enter a valid mobile number (format: 7XXXXXXXX)');
}

if (this.shouldShowDuplicateError()) {
  missingFields.push('Mobile Number - 02 - Cannot be the same as Mobile Number - 01');
}

      if (!this.personalData.nic) {
        missingFields.push('NIC Number is Required');
      } else if (!this.isValidNIC(this.personalData.nic)) {
        missingFields.push('NIC Number - Must be 12 digits or 9 digits followed by V');
      }

      if (!this.personalData.email) {
        missingFields.push('Email is Required');
      } else if (!this.isValidEmail(this.personalData.email)) {
        missingFields.push(`Email - ${this.getEmailErrorMessage(this.personalData.email)}`);
      }

      // Show error popup if there are missing fields
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

      // Navigate to the selected page only if validation passes
      this.selectedPage = page;
    } else if (page === 'pageThree') {
      // Validate pageTwo fields before moving to pageThree
      const missingFields: string[] = [];

      this.touchedFields.houseNumber = true;
      this.touchedFields.streetName = true;
      this.touchedFields.city = true;
      this.touchedFields.district = true;
      this.touchedFields.accHolderName = true;
      this.touchedFields.accNumber = true;
      this.touchedFields.confirmAccNumber = true;

      if (!this.personalData.houseNumber) {
        missingFields.push('House Number is Required');
      }
      if (!this.personalData.streetName) {
        missingFields.push('Street Name is Required');
      }
      if (!this.personalData.city) {
        missingFields.push('City is Required');
      }
      if (!this.personalData.district) {
        missingFields.push('District is Required');
      }
      if (!this.personalData.accHolderName) {
        missingFields.push(`Account Holder's Name is Required`);
      }
      if (!this.personalData.accNumber) {
        missingFields.push('Account Number is Required');
      }
      if (!this.personalData.confirmAccNumber) {
        missingFields.push('Confirm Account Number is Required');
      } else if (this.personalData.accNumber !== this.personalData.confirmAccNumber) {
        missingFields.push('Confirm Account Number - Must match Account Number');
      }
      if (!this.selectedBankId) {
        missingFields.push('Bank Name is Required');
      }
      if (!this.selectedBranchId) {
        missingFields.push('Branch Name is Required');
      }

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

      this.selectedPage = page;
    } else {
      this.selectedPage = page;
    }
  }

  ngOnInit(): void {
    const currentRoute = this.router.url;

    if (currentRoute.includes('drivers/add-driver')) {

      this.isDriverRoute = true;

      this.jobRoleOptions = [
        { label: 'Driver', value: 'Driver' }
      ];

    }
    this.loadBanks();
    this.loadBranches();
    this.getAllCompanies();
    this.EpmloyeIdCreate();
    // Pre-fill country with Sri Lanka
    this.personalData.country = 'Sri Lanka';
  }

  loadBranches() {
    this.http.get<BranchesData>('assets/json/branches.json').subscribe(
      (data) => {
        this.allBranches = data;
      },
      (error) => { }
    );
  }

  loadBanks() {
    this.http.get<Bank[]>('assets/json/banks.json').subscribe(
      (data) => {
        // Sort banks alphabetically by name
        this.banks = data.sort((a, b) => a.name.localeCompare(b.name));

        // Convert to dropdown options format
        this.bankOptions = this.banks.map(bank => ({
          label: bank.name,
          value: bank.ID
        }));
      },
      (error) => { }
    );
  }

  onBankChange() {
    if (this.selectedBankId) {
      const branchesForBank = this.allBranches[this.selectedBankId.toString()] || [];
      // Sort branches alphabetically
      this.branches = branchesForBank.sort((a, b) => a.name.localeCompare(b.name));

      // Convert to dropdown options format
      this.branchOptions = this.branches.map(branch => ({
        label: branch.name,
        value: branch.ID
      }));

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
      this.branchOptions = [];
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

  getAllCollectionCetnter(id: number) {
    this.loaded = false;
    this.personalData.centerId = '';
    this.personalData.irmId = '';
    this.distributionOfficerServ.getAllDistributionCenterByCompany(id).subscribe(
      (res) => {
        this.distributionCenterData = res;
        // Convert to dropdown options format with regCode in front
        this.centerOptions = this.distributionCenterData.map(center => ({
          label: `${center.regCode ? center.regCode + ' - ' : ''}${center.centerName}`,
          value: center.id
        }));
        this.loaded = true;
      },
      (error) => {
        this.distributionCenterData = [];
        this.centerOptions = [];
        this.loaded = true;
      }
    );
  }

  getAllCompanies() {
    this.distributionOfficerServ.getAllCompanyList().subscribe((res) => {
      this.CompanyData = res;
      // Convert to dropdown options format
      this.companyOptions = this.CompanyData.map(company => ({
        label: company.companyNameEnglish,
        value: company.id
      }));
    });
  }

  getAllCollectionManagers() {
    this.distributionOfficerServ
      .getAllManagerList(
        this.personalData.companyId,
        this.personalData.centerId
      )
      .subscribe((res) => {
        this.collectionManagerData = res;
        // Convert to dropdown options format
        this.managerOptions = this.collectionManagerData.map(manager => ({
          label: manager.empId + " - " + manager.firstNameEnglish + " " + manager.lastNameEnglish,
          value: manager.id
        }));
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
        Swal.fire({
          title: 'Error', text: 'File size should not exceed 5MB', icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',

          },
        }

        );
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          title: 'Error', text: 'Only JPEG, JPG and PNG files are allowed', icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',

          },
        }
        );
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

    const rolePrefixes: { [key: string]: string } = {
      'Distribution Centre Manager': 'DCM',
      'Distribution Officer': 'DIO',
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
      this.distributionOfficerServ.getForCreateId(role).subscribe(
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

  updateProvince(event: DropdownChangeEvent): void {
    const selectedDistrict = event.value;

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
  updateEmployeeType(selectedType: string): void {
    this.empType = selectedType;
    this.personalData.empType = selectedType;
  }

  formatName(fieldName: 'firstNameEnglish' | 'lastNameEnglish'): void {
  let value = this.personalData[fieldName];
  if (value) {
    // Remove leading/trailing spaces and replace multiple spaces with single space
    value = value.trim().replace(/\s{2,}/g, ' ');

    // Capitalize first letter and make rest lowercase
    if (value.length > 0) {
      value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }

    this.personalData[fieldName] = value;
  }
}

  // Updated formatSinhalaName function
  formatSinhalaName(fieldName: 'firstNameSinhala' | 'lastNameSinhala'): void {
    let value = this.personalData[fieldName];
    if (value) {
      // Allow only Sinhala unicode characters and spaces
      value = value.replace(/[^\u0D80-\u0DFF\s]/g, '');

      // Remove leading spaces
      value = value.replace(/^\s+/, '');

      // Replace multiple consecutive spaces with single space
      value = value.replace(/\s{2,}/g, ' ');

      this.personalData[fieldName] = value;
    }
  }

  // Updated formatTamilName function
  formatTamilName(fieldName: 'firstNameTamil' | 'lastNameTamil'): void {
    let value = this.personalData[fieldName];
    if (value) {
      // Allow only Tamil unicode characters and spaces
      value = value.replace(/[^\u0B80-\u0BFF\s]/g, '');

      // Remove leading spaces
      value = value.replace(/^\s+/, '');

      // Replace multiple consecutive spaces with single space
      value = value.replace(/\s{2,}/g, ' ');

      this.personalData[fieldName] = value;
    }
  }

  // Updated formatAccountHolderName function
  formatAccountHolderName(): void {
  let value = this.personalData.accHolderName;
  if (value) {
    // Remove leading/trailing spaces and replace multiple spaces with single space
    value = value.trim().replace(/\s{2,}/g, ' ');

    // Capitalize first letter of each word
    value = value.replace(/\b\w/g, (char: string) => char.toUpperCase());

    this.personalData.accHolderName = value;
  }
}


  // Add new keypress handler for account holder name input
  preventAccountHolderSpecialCharacters(event: KeyboardEvent): void {
  // Handle space restrictions first
  if (!this.handleSpaceRestrictions(event)) {
    return;
  }

  const char = String.fromCharCode(event.which);
  // Allow only letters (a-z, A-Z) and space
  if (!/[a-zA-Z\s]/.test(char)) {
    event.preventDefault();
  }
}

  // Add new keypress handlers for address fields
  preventAddressSpecialCharacters(event: KeyboardEvent): void {
  // Handle space restrictions first
  if (!this.handleSpaceRestrictions(event)) {
    return;
  }

  const char = String.fromCharCode(event.which);
  // Allow letters, numbers, and space for address fields
  if (!/[a-zA-Z0-9\s\-\/\\#]/.test(char)) {
    event.preventDefault();
  }
}

  // Format address fields to handle spaces
  formatAddressField(fieldName: 'houseNumber' | 'streetName' | 'city'): void {
  let value = this.personalData[fieldName];
  if (value) {
    // Remove leading/trailing spaces and replace multiple spaces with single space
    value = value.trim().replace(/\s{2,}/g, ' ');

    // Capitalize first letter of each word for streetName and city
    if (fieldName === 'streetName' || fieldName === 'city') {
      value = value.replace(/\b\w/g, (char: string) => char.toUpperCase());
    }

    // For houseNumber, capitalize the first letter only if it's alphabetic
    if (fieldName === 'houseNumber' && value.length > 0) {
      const firstChar = value.charAt(0);
      if (/[a-zA-Z]/.test(firstChar)) {
        value = firstChar.toUpperCase() + value.slice(1);
      }
    }

    this.personalData[fieldName] = value;
  }
}
  // Check if name has invalid characters (numbers or special characters)
  hasInvalidNameCharacters(fieldName: 'firstNameEnglish' | 'lastNameEnglish'): boolean {
    const value = this.personalData[fieldName];
    if (!value) return false;
    // Check if contains numbers or special characters
    return /[^a-zA-Z\s]/.test(value);
  }

  // Check if Sinhala name has invalid characters
  hasInvalidSinhalaCharacters(fieldName: 'firstNameSinhala' | 'lastNameSinhala'): boolean {
    const value = this.personalData[fieldName];
    if (!value) return false;
    // Check if contains non-Sinhala characters
    return /[^\u0D80-\u0DFF\s]/.test(value);
  }

  // Check if Tamil name has invalid characters
  hasInvalidTamilCharacters(fieldName: 'firstNameTamil' | 'lastNameTamil'): boolean {
    const value = this.personalData[fieldName];
    if (!value) return false;
    // Check if contains non-Tamil characters
    return /[^\u0B80-\u0BFF\s]/.test(value);
  }

  // Check if account holder name has invalid characters
  hasInvalidAccountHolderCharacters(): boolean {
    const value = this.personalData.accHolderName;
    if (!value) return false;
    // Check if contains numbers or special characters
    return /[^a-zA-Z\s]/.test(value);
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
    if (!email) return false;

    // Updated email regex to allow + character
    const emailRegex = /^[a-zA-Z0-9]+([._%+-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-]?[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;

    // Check for invalid patterns
    if (email.includes('..')) {
      return false; // Consecutive dots
    }
    if (email.startsWith('.') || email.endsWith('.')) {
      return false; // Leading or trailing dot
    }
    // Updated special characters check to exclude + from invalid characters
    if (/[!#$%^&*()=<>?\/\\]/.test(email.replace(/\+/g, ''))) {
      return false; // Invalid special characters (excluding +)
    }

    return emailRegex.test(email);
  }

  // Updated NIC validation
  isValidNIC(nic: string): boolean {
    if (!nic) return false;
    // Allow 12 digits or 9 digits followed by 'V' (case insensitive)
    const nicRegex = /^(?:\d{12}|\d{9}[vV])$/;
    return nicRegex.test(nic);
  }

  isAtLeastOneLanguageSelected(): boolean {
    return (
      !!this.personalData.languages && this.personalData.languages.length > 0
    );
  }

  isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  
  // Must start with 7 and be exactly 9 digits total
  const phoneRegex = /^7[0-9]{8}$/;
  return phoneRegex.test(phone);
}

  // Check if phone numbers are duplicate
  areDuplicatePhoneNumbers(): boolean {
    const phone1 = this.personalData.phoneNumber01;
    const phone2 = this.personalData.phoneNumber02;

    if (!phone1 || !phone2) return false;

    return phone1 === phone2;
  }

  onBlur(fieldName: keyof Personal): void {
  this.touchedFields[fieldName] = true;
  
  // Check for first digit error on blur
  if (fieldName === 'phoneNumber01' || fieldName === 'phoneNumber02') {
    const value = this.personalData[fieldName];
    if (value && value.length > 0 && value.charAt(0) !== '7') {
      this.showFirstDigitError = true;
      this.firstDigitErrorField = fieldName;
    } else {
      this.showFirstDigitError = false;
      this.firstDigitErrorField = null;
    }
  }
  
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
  // isFieldInvalid(fieldName: keyof Personal): boolean {
  //   const value = this.personalData[fieldName];
  //   // Show error only if touched AND completely blank
  //   return !!this.touchedFields[fieldName] && (value === null || value === undefined || value.trim() === '');
  // }

  isFieldInvalid(fieldName: keyof Personal): boolean {

    const value = this.personalData[fieldName];

    // Check if field is touched
    if (!this.touchedFields[fieldName]) {
      return false;
    }

    // Handle different data types
    if (value === null || value === undefined) {
      return true;
    }

    // For strings, check if empty after trim
    if (typeof value === 'string') {
      return value.trim() === '';
    }

    // For numbers, check if it's 0 or negative (if 0 is invalid) or just null/undefined
    if (typeof value === 'number') {
      return false; // or return value === 0 if 0 is not allowed
    }

    // For other types, you might want different logic
    return false;
  }


  onLanguagesBlur(): void {
    this.languagesTouched = true;
  }

  onEmpTypeBlur(): void {
    this.empTypeTouched = true;
  }

  isEmpTypeSelected(): boolean {
    return !!this.empType;
  }

  validateFile(file: File): boolean {
    if (file.size > 5000000) {
      Swal.fire({
        title: 'Error', text: 'File size should not exceed 5MB', icon: 'error',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',

        },
      }
      );
      return false;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        title: 'Error', text: 'Only JPEG, JPG and PNG files are allowed', icon: 'error',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',

        },
      });
      return false;
    }

    return true;
  }


  checkFormValidity(): boolean {
    const isFirstNameValid =
      !!this.personalData.firstNameEnglish &&
      !!this.personalData.firstNameSinhala &&
      !!this.personalData.firstNameTamil &&
      !this.hasInvalidNameCharacters('firstNameEnglish') &&
      !this.hasInvalidSinhalaCharacters('firstNameSinhala') &&
      !this.hasInvalidTamilCharacters('firstNameTamil');

    const isLastNameValid =
      !!this.personalData.lastNameEnglish &&
      !!this.personalData.lastNameSinhala &&
      !!this.personalData.lastNameTamil &&
      !this.hasInvalidNameCharacters('lastNameEnglish') &&
      !this.hasInvalidSinhalaCharacters('lastNameSinhala') &&
      !this.hasInvalidTamilCharacters('lastNameTamil');

    const isPhoneNumberValid = this.isValidPhoneNumber(
      this.personalData.phoneNumber01
    );
    const isEmailValid = this.isValidEmail(this.personalData.email);
    const isEmpTypeSelected = !!this.empType;
    const isLanguagesSelected = !!this.personalData.languages;
    const isCompanySelected = !!this.personalData.companyId;
    const isCenterSelected = !!this.personalData.centerId;
    const isJobRoleSelected = !!this.personalData.jobRole;
    const isNicValid = this.isValidNIC(this.personalData.nic);
    const arePhoneNumbersNotDuplicate = !this.areDuplicatePhoneNumbers();

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
      isNicValid &&
      arePhoneNumbersNotDuplicate
    );
  }

  // Updated submit validity check
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
        !!accHolderName &&
        !!accNumber &&
        !!bankName &&
        !!branchName &&
        !!confirmAccNumber &&
        accNumber === confirmAccNumber &&
        !this.hasInvalidAccountHolderCharacters();
      return isBankDetailsValid && isAddressValid && !this.areDuplicatePhoneNumbers();
    } else {
      return isAddressValid && !this.areDuplicatePhoneNumbers();
    }
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
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

  // Updated handleSpaceRestrictions function to prevent leading and consecutive spaces
handleSpaceRestrictions(event: KeyboardEvent): boolean {
  const charCode = event.which ? event.which : event.keyCode;
  const currentValue = (event.target as HTMLInputElement).value;
  const selectionStart = (event.target as HTMLInputElement).selectionStart;

  if (charCode === 32) { // Space key
    // Block space if input is empty
    if (currentValue.length === 0) {
      event.preventDefault();
      return false;
    }

    // Block space if cursor is at the start
    if (selectionStart === 0) {
      event.preventDefault();
      return false;
    }

    // Block space if the character before cursor is already a space
    if (selectionStart !== null && currentValue.charAt(selectionStart - 1) === ' ') {
      event.preventDefault();
      return false;
    }

    // Block space if the character at cursor is a space
    if (selectionStart !== null && currentValue.charAt(selectionStart) === ' ') {
      event.preventDefault();
      return false;
    }
  }

  return true;
}


  // Handle NIC input restrictions
  preventNICInvalidCharacters(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    const char = String.fromCharCode(charCode);
    const currentValue = (event.target as HTMLInputElement).value;

    // Block spaces entirely for NIC
    if (charCode === 32) {
      event.preventDefault();
      return;
    }

    // Allow only numbers and 'V' or 'v'
    if (!/[0-9Vv]/.test(char)) {
      event.preventDefault();
    }
  }

  // Format NIC input
  formatNIC(): void {
    let value = this.personalData.nic;
    if (value) {
      // Remove all spaces and invalid characters
      value = value.replace(/[^0-9Vv]/g, '');

      // Convert 'v' to 'V' and ensure only one V at the end
      if (value.includes('v') || value.includes('V')) {
        // Remove all V's first
        value = value.replace(/[Vv]/g, '');
        // Add single V at the end if original had V/v
        value = value + 'V';
      }

      // Limit length based on format
      if (value.includes('V')) {
        // 9 digits + V format
        if (value.length > 10) {
          value = value.substring(0, 9) + 'V';
        }
      } else {
        // 12 digits format
        if (value.length > 12) {
          value = value.substring(0, 12);
        }
      }

      this.personalData.nic = value;
    }
  }

  // Add these new functions for account number handling
  preventAccountNumberInvalidCharacters(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;

    // Block spaces entirely for account numbers
    if (charCode === 32) {
      event.preventDefault();
      return;
    }

    // Allow only numbers
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  // Format account number input
  formatAccountNumber(fieldName: 'accNumber' | 'confirmAccNumber'): void {
    let value = this.personalData[fieldName];
    if (value) {
      // Remove all spaces and non-numeric characters
      value = value.replace(/[^0-9]/g, '');
      this.personalData[fieldName] = value;
    }
  }

  // Handle Email input restrictions
  preventEmailInvalidCharacters(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    const char = String.fromCharCode(charCode);

    // Block spaces entirely for email
    if (charCode === 32) {
      event.preventDefault();
      return;
    }

    // Updated to allow alphanumeric, @, ., -, _, and +
    if (!/[a-zA-Z0-9@.\-_+]/.test(char)) {
      event.preventDefault();
    }
  }

  // Format Email input
  formatEmail(): void {
    let value = this.personalData.email;
    if (value) {
      // Remove all spaces and invalid characters
      value = value.replace(/[^a-zA-Z0-9@.\-_]/g, '');

      // Convert to lowercase for consistency
      value = value.toLowerCase();

      this.personalData.email = value;
    }
  }

  preventSpecialCharacters(event: KeyboardEvent): void {
  // Handle space restrictions first
  if (!this.handleSpaceRestrictions(event)) {
    return;
  }

  const char = String.fromCharCode(event.which);
  // Allow only letters (a-z, A-Z) and space
  if (!/[a-zA-Z\s]/.test(char)) {
    event.preventDefault();
  }
}

  preventNonSinhalaCharacters(event: KeyboardEvent): void {
    // Handle space restrictions first
    if (!this.handleSpaceRestrictions(event)) {
      return;
    }

    const char = String.fromCharCode(event.which);
    // Allow Sinhala unicode characters and space
    if (!/[\u0D80-\u0DFF\s]/.test(char)) {
      event.preventDefault();
    }
  }

  preventNonTamilCharacters(event: KeyboardEvent): void {
    if (!this.handleSpaceRestrictions(event)) {
      return;
    }
    const char = String.fromCharCode(event.which);
    if (!/[\u0B80-\u0BFF\s]/.test(char)) {
      event.preventDefault();
    }
  }
  // Prevent non-numeric characters for phone numbers
  preventNonNumeric(event: KeyboardEvent): void {
    const char = String.fromCharCode(event.which);
    // Allow only numbers (0-9)
    if (!/[0-9]/.test(char)) {
      event.preventDefault();
    }
  }

  formatPhoneNumber(fieldName: 'phoneNumber01' | 'phoneNumber02'): void {
  let value = this.personalData[fieldName];
  if (value) {
    // Remove non-numeric characters
    value = value.replace(/[^0-9]/g, '');
    
    // Track if we need to show error for empty or invalid first digit
    if (value.length > 0 && value.charAt(0) !== '7') {
      this.showFirstDigitError = true;
      this.firstDigitErrorField = fieldName;
      // Replace first digit with 7 if it's not already
      value = '7' + value.substring(1);
    } else if (value.length > 0 && value.charAt(0) === '7') {
      this.showFirstDigitError = false;
      this.firstDigitErrorField = null;
    }
    
    // Limit to 9 digits
    if (value.length > 9) {
      value = value.substring(0, 9);
    }
    
    this.personalData[fieldName] = value;
  }
}


  changeCenter(event: any) {
    console.log('Center changed:', this.personalData.centerId);
    console.log('Center MAnager:', this.personalData.irmId);
    this.personalData.irmId = '';
    // this.centerOptions = [];
    this.getAllCollectionManagers();
  }

  getEmailErrorMessage(email: string): string {
    if (!email) {
      return 'Email is required';
    }

    if (email.includes('..')) {
      return 'Email cannot contain consecutive dots';
    }
    if (email.startsWith('.')) {
      return 'Email cannot start with a dot';
    }
    if (email.endsWith('.')) {
      return 'Email cannot end with a dot';
    }
    if (/[!#$%^&*()=<>?\/\\]/.test(email)) {
      return 'Email contains invalid special characters';
    }
    if (!/@/.test(email)) {
      return 'Email must contain an @ symbol';
    }
    if (!/\./.test(email.split('@')[1])) {
      return 'Email domain must contain a dot (.)';
    }

    return 'Please enter a valid email in the format: example@domain.com';
  }

  triggerFileInputForDriver(event: Event, inputId: string): void {
    event.preventDefault();
    const fileInput = document.getElementById(inputId);
    fileInput?.click();
  }

  onLicenseFrontImageSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        Swal.fire({
          title: 'Error',
          text: 'License image size should not exceed 5MB',
          icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          title: 'Error',
          text: 'License image must be JPEG, JPG or PNG format',
          icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
        return;
      }

      this.licenseFrontImageFile = file;
      this.licenseFrontImageFileName = file.name;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.licenseFrontImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  clearLicenseFrontImage(): void {
    this.licenseFrontImageFile = null;
    this.licenseFrontImageFileName = '';
    this.licenseFrontImagePreview = null;
    const fileInput = document.getElementById('licenseFrontImageUpload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  onLicenseBackImageSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        Swal.fire({
          title: 'Error',
          text: 'License image size should not exceed 5MB',
          icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          title: 'Error',
          text: 'License image must be JPEG, JPG or PNG format',
          icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
        return;
      }

      this.licenseBackImageFile = file;
      this.licenseBackImageFileName = file.name;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.licenseBackImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  clearLicenseBackImage(): void {
    this.licenseBackImageFile = null;
    this.licenseBackImageFileName = '';
    this.licenseBackImagePreview = null;
    const fileInput = document.getElementById('licenseBackImageUpload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  // Insurance images
  onInsurenceFrontImageSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        Swal.fire({
          title: 'Error',
          text: 'Insurance image size should not exceed 5MB',
          icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          title: 'Error',
          text: 'Insurance image must be JPEG, JPG or PNG format',
          icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
        return;
      }

      this.insurenceFrontImageFile = file;
      this.insurenceFrontImageFileName = file.name;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.insurenceFrontImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  clearInsurenceFrontImage(): void {
    this.insurenceFrontImageFile = null;
    this.insurenceFrontImageFileName = '';
    this.insurenceFrontImagePreview = null;
    const fileInput = document.getElementById('insurenceFrontImageUpload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  onInsurenceBackImageSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        Swal.fire({
          title: 'Error',
          text: 'Insurance image size should not exceed 5MB',
          icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          title: 'Error',
          text: 'Insurance image must be JPEG, JPG or PNG format',
          icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
        return;
      }

      this.insurenceBackImageFile = file;
      this.insurenceBackImageFileName = file.name;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.insurenceBackImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  clearInsurenceBackImage(): void {
    this.insurenceBackImageFile = null;
    this.insurenceBackImageFileName = '';
    this.insurenceBackImagePreview = null;
    const fileInput = document.getElementById('insuranceBackImageUpload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  // Vehicle images
  onVehicleFrontImageSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        Swal.fire({
          title: 'Error',
          text: 'Vehicle image size should not exceed 5MB',
          icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          title: 'Error',
          text: 'Vehicle image must be JPEG, JPG or PNG format',
          icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
        return;
      }

      this.vehicleFrontImageFile = file;
      this.vehicleFrontImageFileName = file.name;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.vehicleFrontImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  clearVehicleFrontImage(): void {
    this.vehicleFrontImageFile = null;
    this.vehicleFrontImageFileName = '';
    this.vehicleFrontImagePreview = null;
    const fileInput = document.getElementById('vehicleFrontImageUpload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  onVehicleBackImageSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        Swal.fire({
          title: 'Error',
          text: 'Vehicle image size should not exceed 5MB',
          icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          title: 'Error',
          text: 'Vehicle image must be JPEG, JPG or PNG format',
          icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
        return;
      }

      this.vehicleBackImageFile = file;
      this.vehicleBackImageFileName = file.name;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.vehicleBackImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  clearVehicleBackImage(): void {
    this.vehicleBackImageFile = null;
    this.vehicleBackImageFileName = '';
    this.vehicleBackImagePreview = null;
    const fileInput = document.getElementById('vehicleBackImageUpload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  onVehicleSideAImageSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        Swal.fire({
          title: 'Error',
          text: 'Vehicle image size should not exceed 5MB',
          icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          title: 'Error',
          text: 'Vehicle image must be JPEG, JPG or PNG format',
          icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
        return;
      }

      this.vehicleSideAImageFile = file;
      this.vehicleSideAImageFileName = file.name;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.vehicleSideAImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  clearVehicleSideAImage(): void {
    this.vehicleSideAImageFile = null;
    this.vehicleSideAImageFileName = '';
    this.vehicleSideAImagePreview = null;
    const fileInput = document.getElementById('vehicleSideAImageUpload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  onVehicleSideBImageSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        Swal.fire({
          title: 'Error',
          text: 'Vehicle image size should not exceed 5MB',
          icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          title: 'Error',
          text: 'Vehicle image must be JPEG, JPG or PNG format',
          icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
        return;
      }

      this.vehicleSideBImageFile = file;
      this.vehicleSideBImageFileName = file.name;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.vehicleSideBImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  clearVehicleSideBImage(): void {
    this.vehicleSideBImageFile = null;
    this.vehicleSideBImageFileName = '';
    this.vehicleSideBImagePreview = null;
    const fileInput = document.getElementById('vehicleSideBImageUpload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  vehicleChange() {
    this.driverObj.vType = this.selectVehicletype.name;
    this.driverObj.vCapacity = this.selectVehicletype.capacity;
  }

  preventNonNumbers(event: KeyboardEvent) {
    const allowedKeys = [
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'
    ];

    if (!allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }


  preventSpecialcharacters(event: KeyboardEvent) {
    const allowedPattern = /^[a-zA-Z0-9]$/;
    const inputChar = event.key;

    if (!allowedPattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  preventSpecialCharactersPaste(event: ClipboardEvent) {
    const pastedText = event.clipboardData?.getData('text') || '';
    const allowedPattern = /^[a-zA-Z0-9]+$/;

    if (!allowedPattern.test(pastedText)) {
      event.preventDefault();
    }
  }

  scrollToTop(): void {
    if (this.pageContainer && this.pageContainer.nativeElement) {
      this.pageContainer.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  getNICMaxLength(): number {
    if (!this.personalData.nic) return 12;

    const nic = this.personalData.nic.toUpperCase();

    // If it already contains 'V', limit to 11 (10 digits + 'V')
    if (nic.includes('V')) {
      return 10;
    }

    // Check if last character could be 'V' (if we have 9 digits and typing the 10th)
    if (nic.length === 9 && /^\d+$/.test(nic)) {
      return 10; // Allow space for 'V'
    }

    return 12; // Default for new NIC
  }

  preventNonNumericWith7First(event: KeyboardEvent, fieldName: 'phoneNumber01' | 'phoneNumber02'): void {
  const char = String.fromCharCode(event.which);
  const currentValue = this.personalData[fieldName] || '';
  const cursorPosition = (event.target as HTMLInputElement).selectionStart || 0;
  
  // Allow control keys (backspace, delete, arrows, tab)
  if ([8, 9, 13, 37, 38, 39, 40, 46].includes(event.keyCode)) {
    this.showFirstDigitError = false;
    this.firstDigitErrorField = null;
    return;
  }
  
  // Allow only numbers
  if (!/[0-9]/.test(char)) {
    event.preventDefault();
    // Don't show error message when blocking non-numeric input
    return;
  }
  
  // If field is empty and trying to input first character
  if (currentValue.length === 0 && cursorPosition === 0) {
    // First character must be '7'
    if (char !== '7') {
      event.preventDefault();
      // Don't show error message, just silently block the input
    } else {
      this.showFirstDigitError = false;
      this.firstDigitErrorField = null;
    }
  }
  
  // If trying to insert at the beginning of existing number
  if (cursorPosition === 0 && currentValue.length > 0) {
    // If inserting at position 0, the new first character must be '7'
    if (char !== '7') {
      event.preventDefault();
      // Don't show error message, just silently block the input
    } else {
      this.showFirstDigitError = false;
      this.firstDigitErrorField = null;
    }
  }
  
  // If inserting elsewhere, clear the error
  if (cursorPosition > 0) {
    this.showFirstDigitError = false;
    this.firstDigitErrorField = null;
  }
}

preventInvalidPhonePaste(event: ClipboardEvent, fieldName: 'phoneNumber01' | 'phoneNumber02'): void {
  event.preventDefault();
  const clipboardData = event.clipboardData || (window as any).clipboardData;
  const pastedText = clipboardData.getData('text');
  
  // Remove non-numeric characters
  let cleanedText = pastedText.replace(/[^0-9]/g, '');
  
  // Ensure first digit is 7
  if (cleanedText.length > 0 && cleanedText.charAt(0) !== '7') {
    // Try to find a 7 in the pasted text
    const indexOf7 = cleanedText.indexOf('7');
    if (indexOf7 > -1) {
      // Use from the first 7 found
      cleanedText = cleanedText.substring(indexOf7);
    } else {
      // Prepend 7 if no 7 found
      cleanedText = '7' + cleanedText;
    }
  }
  
  // Limit to 9 digits
  if (cleanedText.length > 9) {
    cleanedText = cleanedText.substring(0, 9);
  }
  
  // Get current value and cursor position
  const inputElement = event.target as HTMLInputElement;
  const currentValue = this.personalData[fieldName] || '';
  const cursorPosition = inputElement.selectionStart || 0;
  
  // Insert the cleaned text at cursor position
  const newValue = currentValue.substring(0, cursorPosition) + 
                   cleanedText + 
                   currentValue.substring(inputElement.selectionEnd || 0);
  
  // Ensure the resulting value starts with 7
  let finalValue = newValue.replace(/[^0-9]/g, '');
  if (finalValue.length > 0 && finalValue.charAt(0) !== '7') {
    finalValue = '7' + finalValue.substring(1);
    this.showFirstDigitError = true;
    this.firstDigitErrorField = fieldName;
  } else {
    this.showFirstDigitError = false;
    this.firstDigitErrorField = null;
  }
  
  if (finalValue.length > 9) {
    finalValue = finalValue.substring(0, 9);
  }
  
  this.personalData[fieldName] = finalValue;
}

shouldShowDuplicateError(): boolean {
  const phone1 = this.personalData.phoneNumber01;
  const phone2 = this.personalData.phoneNumber02;
  
  if (!phone1 || !phone2) return false;
  
  if (!this.isValidPhoneNumber(phone1) || !this.isValidPhoneNumber(phone2)) return false;
  
  return phone1 === phone2;
}


}

class Personal {
  jobRole: string = '';
  empId!: string;
  centerId!: number | string;
  irmId!: number | string;
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

class DistributionCenter {
  id!: number;
  centerName!: string;
  regCode!: string;
}

class CollectionManager {
  id!: number;
  empId!: string;
  firstNameEnglish!: string;
  lastNameEnglish!: string;
}

class Company {
  id!: number;
  companyNameEnglish!: string;
}

class Drivers {
  licNo!: string;
  insNo!: string;
  insExpDate!: string;
  vType!: string;
  vCapacity!: string;
  vRegNo!: string;
  confirmLicNo!: string;
  confirmInsNo!: string;
  confirmVRegNo!: string;

  licFrontName!: string;
  licBackName!: string;
  insFrontName!: string;
  insBackName!: string;
  vFrontName!: string;
  vBackName!: string;
  vSideAName!: string;
  vSideBName!: string;
}