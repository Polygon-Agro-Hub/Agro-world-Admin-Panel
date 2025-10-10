import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { Country, COUNTRIES } from '../../../../assets/country-data';
import { Location } from '@angular/common';
@Component({
  selector: 'app-edit-collection-center',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LoadingSpinnerComponent,
    DropdownModule, InputTextModule
  ],
  templateUrl: './edit-collection-center.component.html',
  styleUrl: './edit-collection-center.component.css',
})
export class EditCollectionCenterComponent implements OnInit {
  collectionCenterID!: number;
  centerData: CollectionCenter = new CollectionCenter();
  centerFetchData: CollectionCenter = new CollectionCenter();
  selectProvince: string = '';
  selectedDistrict: any = [];
  existRegCode!: string;
  dropdownOpen: boolean = false;
  CompanyData: Company[] = [];
  selectedCompaniesIds: number[] = [];
  selectedCompaniesNames: string[] = [];
  selectDistrict: string = '';
  city: string = '';
  isLoading = false;
  isView: boolean = false;

  leadingSpaceError: boolean = false;
  specialCharOrNumberError: boolean = false;

  allowedPrefixes = ['70', '71', '72', '75', '76', '77', '78'];
  isPhoneInvalidMap: { [key: string]: boolean } = {
    phone01: false,
    phone02: false,
  };

  countries: Country[] = COUNTRIES;
  selectedCountry1: Country | null = null;
  selectedCountry2: Country | null = null;

  constructor(
    private collectionCenterService: CollectionCenterService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.collectionCenterID = this.route.snapshot.params['id'];
    const defaultCountry = this.countries.find(c => c.code === 'lk') || null;
  this.selectedCountry1 = defaultCountry;
  this.selectedCountry2 = defaultCountry;
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
  }).then((result) => {
    if (result.isConfirmed) {
    this.router.navigate(['collection-hub/view-collection-centers']);
    }
  });
}


  ngOnInit(): void {
    this.fetchCollectionCenter();
    this.getAllCompanies();
  }

  getFlagUrl(code: string): string {
    return `https://flagcdn.com/24x18/${code}.png`;
  }

  allowOnlyNumbers(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    // Only allow 0-9
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  ProvinceData = [
    {
      province: 'Central',
      district: [
        { districtName: 'Kandy' },
        { districtName: 'Matale' },
        { districtName: 'Nuwara Eliya' },
      ],
    },
    {
      province: 'Eastern',
      district: [
        { districtName: 'Ampara' },
        { districtName: 'Batticaloa' },
        { districtName: 'Trincomalee' },
      ],
    },
    {
      province: 'North Central',
      district: [
        { districtName: 'Anuradhapura' },
        { districtName: 'Polonnaruwa' },
      ],
    },
    {
      province: 'North Western',
      district: [{ districtName: 'Kurunegala' }, { districtName: 'Puttalam' }],
    },
    {
      province: 'Northern',
      district: [
        { districtName: 'Jaffna' },
        { districtName: 'Kilinochchi' },
        { districtName: 'Mannar' },
        { districtName: 'Mulaitivu' },
        { districtName: 'Vavuniya' },
      ],
    },
    {
      province: 'Sabaragamuwa',
      district: [{ districtName: 'Kegalle' }, { districtName: 'Rathnapura' }],
    },
    {
      province: 'Southern',
      district: [
        { districtName: 'Galle' },
        { districtName: 'Hambantota' },
        { districtName: 'Matara' },
      ],
    },
    {
      province: 'Uva',
      district: [{ districtName: 'Badulla' }, { districtName: 'Moneragala' }],
    },
    {
      province: 'Western',
      district: [
        { districtName: 'Colombo' },
        { districtName: 'Gampaha' },
        { districtName: 'Kalutara' },
      ],
    },
  ];

  validateSriLankanPhone(input: string, key: string): void {
    if (!input) {
      this.isPhoneInvalidMap[key] = false;
      return;
    }

    const firstDigit = input.charAt(0);
    const prefix = input.substring(0, 2);
    const isValidPrefix = this.allowedPrefixes.includes(prefix);
    const isValidLength = input.length === 9;

    if (firstDigit !== '7') {
      this.isPhoneInvalidMap[key] = true;
      return;
    }

    if (!isValidPrefix && input.length >= 2) {
      this.isPhoneInvalidMap[key] = true;
      return;
    }

    if (input.length === 9 && isValidPrefix) {
      this.isPhoneInvalidMap[key] = false;
      return;
    }

    this.isPhoneInvalidMap[key] = false;
  }

  onCenterNameInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let input = inputElement.value;

    // Reset errors
    this.leadingSpaceError = false;
    this.specialCharOrNumberError = false;

    // Check for leading space
    if (input.startsWith(' ')) {
      this.leadingSpaceError = true;
      input = input.trimStart(); // remove leading space
    }

   // Allow English letters, Sinhala (\u0D80-\u0DFF), Tamil (\u0B80-\u0BFF), and spaces
  const validInput = input.replace(/[^A-Za-z\u0D80-\u0DFF\u0B80-\u0BFF ]/g, '');
  if (validInput !== input) {
    this.specialCharOrNumberError = true;
  }
    // Capitalize the first letter
    if (validInput.length > 0) {
      validInput.trimStart(); // ensure no leading space
      this.centerFetchData.centerName =
        validInput.charAt(0).toUpperCase() + validInput.slice(1);
    } else {
      this.centerFetchData.centerName = '';
    }

    // Update input element value to reflect filtered result
    inputElement.value = this.centerFetchData.centerName;
  }

  onBuildingNumberInput(event: Event): void {
  const inputElement = event.target as HTMLInputElement;
  let rawValue = inputElement.value;
  const trimmedValue = rawValue.replace(/^\s+/, '');
  
  if (rawValue !== trimmedValue) {
    rawValue = trimmedValue; // Remove leading spaces
  }
  
  // Capitalize first letter
  if (rawValue.length > 0) {
    this.centerFetchData.buildingNumber = 
      rawValue.charAt(0).toUpperCase() + rawValue.slice(1);
  } else {
    this.centerFetchData.buildingNumber = '';
  }
  
  // Update input field value
  inputElement.value = this.centerFetchData.buildingNumber;
}

  onStreetNameInput(event: Event): void {
  const inputElement = event.target as HTMLInputElement;
  let rawValue = inputElement.value;
  const trimmedValue = rawValue.replace(/^\s+/, '');
  
  if (rawValue !== trimmedValue) {
    rawValue = trimmedValue; // Remove leading spaces
  }
  
  // Capitalize first letter
  if (rawValue.length > 0) {
    this.centerFetchData.street = 
      rawValue.charAt(0).toUpperCase() + rawValue.slice(1);
  } else {
    this.centerFetchData.street = '';
  }
  
  // Update input field value
  inputElement.value = this.centerFetchData.street;
}

  // onStreetNameChange(value: string): void {
  //   this.centerFetchData.street = value.replace(/^\s+/, '');
  // }
  // onCityNameChange(value: string): void {
  //   this.centerFetchData.city = value.replace(/^\s+/, '');
  // }

onSubmit() {
  const missingFields: string[] = [];

  // Validation for required fields
  if (!this.centerFetchData.centerName || this.centerFetchData.centerName.trim() === '') {
    missingFields.push('Collection Centre Name is Required');
  } else if (/[^A-Za-z ]/.test(this.centerFetchData.centerName)) {
    missingFields.push('Collection Centre Name - Must contain only English letters and spaces');
  }

  if (!this.selectedCompaniesIds || this.selectedCompaniesIds.length === 0) {
    missingFields.push('Companies - At least one company must be selected');
  }

  if (!this.centerFetchData.contact01) {
    missingFields.push('Contact Number - 1 is Required');
  } else if (!/^[0-9]{9}$/.test(this.centerFetchData.contact01.toString()) || this.isPhoneInvalidMap['phone01']) {
    missingFields.push('Contact Number - 1 - Must be a valid 9-digit number (e.g., 77XXXXXXX)');
  }

  if (this.centerFetchData.contact02) {
    if (!/^[0-9]{9}$/.test(this.centerFetchData.contact02.toString()) || this.isPhoneInvalidMap['phone02']) {
      missingFields.push('Contact Number - 2 - Must be a valid 9-digit number (e.g., 77XXXXXXX)');
    }
    if (this.centerFetchData.contact01 === this.centerFetchData.contact02) {
      missingFields.push('Contact Number - 1 and Contact Number - 2 cannot be the same');
    }
  }

  // if (!this.centerFetchData.code1) {
  //   missingFields.push('Contact Number - 1 Code');
  // }

  // if (this.centerFetchData.contact02 && !this.centerFetchData.code2) {
  //   missingFields.push('Contact Number - 2 Code');
  // }

  if (!this.centerFetchData.buildingNumber || this.centerFetchData.buildingNumber.trim() === '') {
    missingFields.push('Building Number is Required');
  }

  if (!this.centerFetchData.street || this.centerFetchData.street.trim() === '') {
    missingFields.push('Street Name is Required');
  }

  if (!this.centerFetchData.city || this.centerFetchData.city.trim() === '') {
    missingFields.push('City is Required');
  }

  if (!this.centerFetchData.province) {
    missingFields.push('Province is Required');
  }

  if (!this.centerFetchData.district) {
    missingFields.push('District is Required');
  }

  if (!this.centerFetchData.country) {
    missingFields.push('Country is Required');
  }

  if (!this.centerFetchData.regCode) {
    missingFields.push('Collection Centre Reg Code is Required');
  }

  // Display validation errors if any
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
    text: 'Do you want to update this Collection Centre?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, update it!',
    cancelButtonText: 'No, cancel',
    reverseButtons: true,
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold text-lg',
    },
  }).then((result) => {
    if (result.isConfirmed) {
      this.isLoading = true;

      // Call the service to update the Collection Centre
      this.collectionCenterService.updateColectionCenter(this.centerFetchData, this.selectedCompaniesIds, this.collectionCenterID).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (res.status) {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Collection Centre updated successfully!',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            }).then(() => {
              this.router.navigate(['/collection-hub/view-collection-centers']);
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: res.message === 'This RegCode already exists!' 
                ? 'The registration code is already in use.' 
                : res.message || 'Something went wrong while updating the Collection Centre.',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            });
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          let errorMessage = 'An unexpected error occurred';
          if (error.error && error.error.error) {
            switch (error.error.error) {
              case 'Duplicate reg code':
                errorMessage = 'The registration code is already in use.';
                break;
              case 'Duplicate contact number':
                errorMessage = 'The contact number is already registered.';
                break;
              case 'Invalid company selection':
                errorMessage = 'One or more selected companies are invalid.';
                break;
              case 'Collection center not found':
                errorMessage = 'The Collection Centre does not exist.';
                break;
              default:
                errorMessage = error.error.error || 'An unexpected error occurred';
            }
          }
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage,
            confirmButtonText: 'OK',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
        },
      });
    }
  });
}
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  getAllCompanies() {
    this.collectionCenterService.getAllCompanyList().subscribe(
      (res) => {
        this.CompanyData = res;
        this.updateSelectedCompanies();
      },
      () => {}
    );
  }

  fetchCollectionCenter() {
  this.isLoading = true;
  this.collectionCenterService
    .getCenterById(this.collectionCenterID)
    .subscribe(
      (res) => {
        if (res?.status) {
          this.centerFetchData = res.results;
          
          // Load districts for the selected province (if province exists)
          if (this.centerFetchData.province) {
            const filteredProvince = this.ProvinceData.find(
              (item) => item.province === this.centerFetchData.province
            );
            
            if (filteredProvince) {
              this.selectedDistrict = filteredProvince.district;
            }
          }
          
          this.existRegCode = this.centerFetchData.regCode;
          this.updateSelectedCompanies();
          this.isLoading = false;
        } else {
          this.isLoading = false;
          Swal.fire('Sorry', 'Centre Data not available', 'warning');
          this.router.navigate(['/collection-hub/view-collection-centers']);
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching collection center:', error);
      }
    );
}

  updateSelectedCompanies() {
    if (this.centerFetchData.companies) {
      const companyNames = this.centerFetchData.companies
        .split(',')
        .map((name) => name.trim());

      this.selectedCompaniesIds = this.CompanyData.filter((company) =>
        companyNames.includes(company.companyNameEnglish)
      ).map((company) => company.id);
    }
  }

  toggleSelection(company: any) {
    const index = this.selectedCompaniesIds.indexOf(company.id);
    if (index === -1) {
      this.selectedCompaniesIds.push(company.id);
    } else {
      this.selectedCompaniesIds.splice(index, 1);
    }

    this.centerFetchData.companies = this.CompanyData.filter((c) =>
      this.selectedCompaniesIds.includes(c.id)
    )
      .map((c) => c.companyNameEnglish)
      .join(',');
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
  }).then((result) => {
    if (result.isConfirmed) {
      this.location.back(); // 👈 this takes the user back to the previous page
    }
  });
}


  updateRegCode() {
    const provinceCode = this.selectProvince.slice(0, 3).toUpperCase();
    const districtCode = this.selectDistrict.slice(0, 3).toUpperCase();
    const cityCode = this.city.slice(0, 3).toUpperCase();

    if (provinceCode && districtCode && cityCode) {
      this.centerFetchData.regCode = `${provinceCode}-${districtCode}-${cityCode}`;
    }
  }

  onProvinceChange() {
  console.log('Province changed to:', this.centerFetchData.province);
  
  // Clear district selection when province changes
  this.centerFetchData.district = '';
  this.selectedDistrict = [];
  
  // Find districts for the selected province
  const filteredProvince = this.ProvinceData.find(
    (item) => item.province === this.centerFetchData.province
  );
  
  if (filteredProvince) {
    this.selectedDistrict = filteredProvince.district;
  }
  
  // Generate reg code if all required fields are present
  this.generateRegCodeIfReady();
}

  onDistrictChange() {
  console.log('District changed to:', this.centerFetchData.district);
  
  // Generate reg code if all required fields are present
  this.generateRegCodeIfReady();
}

  onCityInput(event: Event): void {
  const inputElement = event.target as HTMLInputElement;
  let rawValue = inputElement.value;
  const trimmedValue = rawValue.replace(/^\s+/, '');
  
  if (rawValue !== trimmedValue) {
    rawValue = trimmedValue; // Remove leading spaces
  }
  
  // Capitalize first letter
  if (rawValue.length > 0) {
    this.centerFetchData.city = 
      rawValue.charAt(0).toUpperCase() + rawValue.slice(1);
  } else {
    this.centerFetchData.city = '';
  }
  
  // Update input field value
  inputElement.value = this.centerFetchData.city;
  
  // Call the original logic for reg code generation
  this.onCityChange();
}

  onCityChange() {
  console.log('City changed to:', this.centerFetchData.city);
  
  // Generate reg code if all required fields are present
  this.generateRegCodeIfReady();
}

// Helper method to generate reg code only when all required fields are present
private generateRegCodeIfReady() {
  const selectedProvince = this.centerFetchData.province;
  const selectedDistrict = this.centerFetchData.district;
  const selectedCity = this.centerFetchData.city;

  if (selectedProvince && selectedDistrict && selectedCity) {
    this.collectionCenterService
      .generateRegCode(selectedProvince, selectedDistrict, selectedCity)
      .subscribe(
        (response) => {
          this.centerFetchData.regCode = response.regCode;
        },
        (error) => {
          console.error('Error generating reg code:', error);
        }
      );
  }
}
}

class CollectionCenter {
  regCode!: string;
  centerName!: string;
  contact01!: number;
  code1: string = '+94';
  contact02!: number;
  code2: string = '+94';
  buildingNumber!: string;
  street!: string;
  city!: string;
  district!: string;
  province!: string;
  country: string = 'Sri Lanka';
  companies!: string;
}

class Company {
  id!: number;
  companyNameEnglish!: string;
}
