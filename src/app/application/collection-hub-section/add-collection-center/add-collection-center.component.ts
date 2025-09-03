import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { Country, COUNTRIES } from '../../../../assets/country-data';
import { MultiSelectModule } from 'primeng/multiselect';
@Component({
  selector: 'app-add-collection-center',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownModule,
    MultiSelectModule,
    InputTextModule,
    FormsModule,
  ],
  templateUrl: './add-collection-center.component.html',
  styleUrls: ['./add-collection-center.component.css'],
})
export class AddCollectionCenterComponent implements OnInit {
  isLoading: boolean = false;
  collectionCenterForm: FormGroup;
  centerData: CollectionCenter = new CollectionCenter();
  selectProvince: string = '';
  selectedDistrict: any = [];
  CompanyData: Company[] = [];
  dropdownOpen: boolean = false;
  selectedCompaniesIds: number[] = [];
  selectedCompaniesNames: string[] = [];
  selectDistrict: string = '';
  city: string = '';
  isLoadingregcode = false;
  companyDisplayText: string = '';
  companyTouched: boolean = false;

  provinceOptions: any[] = [];
  districtOptions: any[] = [];

  searchQuery: string = '';
  filteredCompanies: Company[] = [];

  allowedPrefixes = ['70', '71', '72', '75', '76', '77', '78'];
  isPhoneInvalidMap: { [key: string]: boolean } = {
    phone01: false,
    phone02: false,
  };

  countries: Country[] = COUNTRIES;
  selectedCountry1: Country | null = null;
  selectedCountry2: Country | null = null;

  leadingSpaceError: boolean = false;
  specialCharOrNumberError: boolean = false;

  constructor(
    private fb: FormBuilder,
    private collectionCenterService: CollectionCenterService,
    private router: Router
  ) {
    this.collectionCenterForm = this.fb.group({
      regCode: ['', [Validators.required, Validators.pattern(/^[^\d]*$/)]],
      centerName: ['', [Validators.required, this.noNumbersValidator]],
      contact01: [
        '',
        [Validators.required, Validators.pattern(/^[7][0-9]{8}$/)],
      ],
      contact01Code: ['+94', Validators.required],
      contact02: ['', [Validators.pattern(/^[7][0-9]{8}$/)]],
      contact02Code: ['+94'],
      buildingNumber: ['', Validators.required],
      street: ['', [Validators.required, this.noNumbersValidator]],
      district: ['', Validators.required],
      province: ['', Validators.required],
      country: ['Sri Lanka', Validators.required],
      city: ['', Validators.required],
      searchQuery: [''],
    });
    const defaultCountry = this.countries.find((c) => c.code === 'lk') || null;
    this.selectedCountry1 = defaultCountry;
    this.selectedCountry2 = defaultCountry;
    this.filteredCompanies = [...this.CompanyData];
  }
  //serachable company dropdown
  filterCompanies(event: Event): void {
    const input = (event.target as HTMLInputElement).value.toLowerCase().trim();

    this.filteredCompanies = this.CompanyData.filter((company) =>
      company.companyNameEnglish.toLowerCase().includes(input)
    );
  }

  onCompanyInputClick(): void {
    this.dropdownOpen = !this.dropdownOpen;
    this.companyTouched = true;

    // Reset search input and filtered data
    this.filteredCompanies = [...this.CompanyData];

    // Clear the actual input field (optional but recommended)
    const inputElement = document.querySelector(
      '#companySearchInput'
    ) as HTMLInputElement;
    if (inputElement) {
      inputElement.value = '';
    }
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

  ngOnInit() {
    this.initializeDropdownOptions();
    this.getAllCompanies();
    this.collectionCenterForm.get('province')?.valueChanges.subscribe(() => {
      this.onProvinceChange();
    });
    this.collectionCenterForm.get('district')?.valueChanges.subscribe(() => {
      this.onDistrictChange();
    });
    this.collectionCenterForm.get('city')?.valueChanges.subscribe(() => {
      this.onCityChange();
    });
  }

  private initializeDropdownOptions(): void {
  // Convert ProvinceData to dropdown options
  this.provinceOptions = this.ProvinceData.map(province => ({
    label: province.province,
    value: province.province
  }));

  // Initialize district options based on selected province if any
  this.updateDistrictOptions();
}

private updateDistrictOptions(): void {
  const selectedProvince = this.collectionCenterForm.get('province')?.value;
  if (selectedProvince) {
    const province = this.ProvinceData.find(p => p.province === selectedProvince);
    this.districtOptions = province?.district.map(d => ({
      label: d.districtName,
      value: d.districtName
    })) || [];
  } else {
    this.districtOptions = [];
  }
}

isFieldInvalid(field: string): boolean {
  const formControl = this.collectionCenterForm.get(field);
  return formControl ? formControl.invalid && (formControl.dirty || formControl.touched) : false;
}

  getFlagUrl(code: string): string {
    return `https://flagcdn.com/24x18/${code}.png`;
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleSelection(company: any) {
    const index = this.selectedCompaniesIds.indexOf(company.id);

    if (index === -1) {
      this.selectedCompaniesIds.push(company.id);
      this.selectedCompaniesNames.push(company.companyNameEnglish);
    } else {
      this.selectedCompaniesIds.splice(index, 1);
      this.selectedCompaniesNames.splice(index, 1);
    }

    this.companyDisplayText = this.selectedCompaniesNames.join(', ');
    console.log('companyDisplayText', this.companyDisplayText);
  }

  // trimCity(): void {
  //   const control = this.collectionCenterForm.get('buildingNumber');
  //   if (control) {
  //     const value = control.value || '';
  //     control.setValue(value.replace(/^\s+/, ''), { emitEvent: false });
  //   }
  // }

  onProvinceChange() {
  this.updateDistrictOptions();
  
  // Reset district value when province changes
  this.collectionCenterForm.get('district')?.reset();
  
  // Rest of your existing code...
  const control = this.collectionCenterForm.get('city');
  if (control) {
    const value = control.value || '';
    control.setValue(value.replace(/^\s+/, ''), { emitEvent: false });
  }

  const selectedProvince = this.collectionCenterForm.get('province')?.value;
  const selectedDistrict = this.collectionCenterForm.get('district')?.value;
  const selectedCity = this.collectionCenterForm.get('city')?.value;

  this.selectProvince = selectedProvince;
  this.updateRegCode();

  if (selectedProvince && selectedDistrict && selectedCity) {
    this.isLoadingregcode = true;
    this.collectionCenterService
      .generateRegCode(selectedProvince, selectedDistrict, selectedCity)
      .subscribe((response) => {
        this.collectionCenterForm.patchValue({ regCode: response.regCode });
        this.isLoadingregcode = false;
      });
  }
}


  onDistrictChange() {
    const selectedProvince = this.collectionCenterForm.get('province')?.value;
    const selectedDistrict = this.collectionCenterForm.get('district')?.value;
    const selectedCity = this.collectionCenterForm.get('city')?.value;

    if (selectedProvince && selectedDistrict && selectedCity) {
      this.isLoadingregcode = true;
      this.collectionCenterService
        .generateRegCode(selectedProvince, selectedDistrict, selectedCity)
        .subscribe(
          (response) => {
            this.collectionCenterForm.patchValue({ regCode: response.regCode });
            this.isLoadingregcode = false;
          },
          () => {
            this.isLoadingregcode = false;
          }
        );
    }
  }

  onCityChange() {
    this.city = this.collectionCenterForm.get('city')?.value;
    this.updateRegCode();
  }

  updateRegCode() {
    const province = this.collectionCenterForm.get('province')?.value;
    const district = this.collectionCenterForm.get('district')?.value;
    const city = this.collectionCenterForm.get('city')?.value;

    if (province && district && city) {
      const regCode = `${province.slice(0, 2).toUpperCase()}${district
        .slice(0, 1)
        .toUpperCase()}${city.slice(0, 1).toUpperCase()}`;
      this.collectionCenterForm.patchValue({ regCode });
    }
  }

 onSubmit() {
  // Mark all form fields as touched to trigger validation
  this.collectionCenterForm.markAllAsTouched();

  const missingFields: string[] = [];

  // Validation for form fields
  if (!this.collectionCenterForm.get('centerName')?.value || this.collectionCenterForm.get('centerName')?.value.trim() === '') {
    missingFields.push('Collection Centre Name');
  }

  if (!this.selectedCompaniesIds || this.selectedCompaniesIds.length === 0) {
    missingFields.push('Companies - At least one company must be selected');
  }

  if (!this.collectionCenterForm.get('contact01')?.value) {
    missingFields.push('Contact Number - 1');
  } else if (!/^[0-9]{9}$/.test(this.collectionCenterForm.get('contact01')?.value) || this.isPhoneInvalidMap['phone01']) {
    missingFields.push('Contact Number - 1 - Must be a valid 9-digit number (e.g., 77XXXXXXX)');
  }

  if (this.collectionCenterForm.get('contact02')?.value) {
    if (!/^[0-9]{9}$/.test(this.collectionCenterForm.get('contact02')?.value) || this.isPhoneInvalidMap['phone02']) {
      missingFields.push('Contact Number - 2 - Must be a valid 9-digit number (e.g., 77XXXXXXX)');
    }
    if (this.collectionCenterForm.get('contact01')?.value === this.collectionCenterForm.get('contact02')?.value) {
      missingFields.push('Contact Number - 1 and Contact Number - 2 cannot be the same');
    }
  }

  if (!this.collectionCenterForm.get('contact01Code')?.value) {
    missingFields.push('Contact Number - 1 Code');
  }

  if (this.collectionCenterForm.get('contact02')?.value && !this.collectionCenterForm.get('contact02Code')?.value) {
    missingFields.push('Contact Number - 2 Code');
  }

  if (!this.collectionCenterForm.get('buildingNumber')?.value || this.collectionCenterForm.get('buildingNumber')?.value.trim() === '') {
    missingFields.push('Building Number');
  }

  if (!this.collectionCenterForm.get('street')?.value || this.collectionCenterForm.get('street')?.value.trim() === '') {
    missingFields.push('Street Name');
  }

  if (!this.collectionCenterForm.get('city')?.value || this.collectionCenterForm.get('city')?.value.trim() === '') {
    missingFields.push('City');
  }

  if (!this.collectionCenterForm.get('province')?.value) {
    missingFields.push('Province');
  }

  if (!this.collectionCenterForm.get('district')?.value) {
    missingFields.push('District');
  }

  if (!this.collectionCenterForm.get('country')?.value) {
    missingFields.push('Country');
  }

  if (!this.collectionCenterForm.get('regCode')?.value) {
    missingFields.push('Collection Centre Reg Code');
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
    text: 'Do you want to create this Collection Centre?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, create it!',
    cancelButtonText: 'No, cancel',
    reverseButtons: true,
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold text-lg',
    },
  }).then((result) => {
    if (result.isConfirmed) {
      this.isLoading = true;

      // Prepare data for submission
      const formData = {
        centerName: this.collectionCenterForm.get('centerName')?.value.trim(),
        companyIds: this.selectedCompaniesIds,
        contact01Code: this.collectionCenterForm.get('contact01Code')?.value,
        contact01: this.collectionCenterForm.get('contact01')?.value,
        contact02Code: this.collectionCenterForm.get('contact02Code')?.value || null,
        contact02: this.collectionCenterForm.get('contact02')?.value || null,
        buildingNumber: this.collectionCenterForm.get('buildingNumber')?.value.trim(),
        street: this.collectionCenterForm.get('street')?.value.trim(),
        city: this.collectionCenterForm.get('city')?.value.trim(),
        province: this.collectionCenterForm.get('province')?.value,
        district: this.collectionCenterForm.get('district')?.value,
        country: this.collectionCenterForm.get('country')?.value,
        regCode: this.collectionCenterForm.get('regCode')?.value,
      };

      // Call the service to create the Collection Centre
      this.collectionCenterService.createCollectionCenter(formData, this.selectedCompaniesIds).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (res.status) {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Collection Centre created successfully!',
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
                : 'Something went wrong while creating the Collection Centre.',
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
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Cancelled',
        text: 'Collection Centre creation has been cancelled',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });
    }
  });
}

  onCancel() {
  Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: 'All entered data will be lost!',
    showCancelButton: true,
    confirmButtonText: 'Yes, Reset',
    cancelButtonText: 'No, Keep Editing',
        customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
    },
  }).then((result) => {
    if (result.isConfirmed) {
      this.router.navigate(['/collection-hub/view-collection-centers']);
    }
  });
}


getAllCompanies() {
  this.collectionCenterService.getAllCompanyList().subscribe((res) => {
    console.log('Raw response from service:', res);
    this.CompanyData = res;

 

    this.filteredCompanies = this.CompanyData.filter(
      (item) => item.id != null && item.companyNameEnglish
    );
    this.filteredCompanies = this.filteredCompanies.filter(
      (item, index, self) => index === self.findIndex(i => i.id === item.id)
    );
    console.log('Companies for dropdown:', this.filteredCompanies);
  });
}


  noNumbersValidator(control: any) {
    const regex = /^[A-Za-z\s]*$/;
    if (control.value && !regex.test(control.value)) {
      return { containsNumbers: true };
    }
    return null;
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
    this.router.navigate(['/collection-hub']);
    }
  });
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

  trimBuildingNumber(): void {
  const control = this.collectionCenterForm.get('buildingNumber');
  if (control) {
    let value = control.value || '';
    value = value.replace(/^\s+/, '');
    // Capitalize first letter
    value = this.capitalizeFirstLetter(value);
    control.setValue(value, { emitEvent: false });
  }
}

  trimCity(): void {
  const control = this.collectionCenterForm.get('city');
  if (control) {
    let value = control.value || '';
    value = value.replace(/^\s+/, '');
    // Capitalize first letter
    value = this.capitalizeFirstLetter(value);
    control.setValue(value, { emitEvent: false });
  }
}

  trimStreetName(): void {
  const control = this.collectionCenterForm.get('street');
  if (control) {
    let value = control.value || '';
    value = value.replace(/^\s+/, '');
    // Capitalize first letter
    value = this.capitalizeFirstLetter(value);
    control.setValue(value, { emitEvent: false });
  }
}

  onCenterNameInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let input = inputElement.value;

    // Reset errors
    this.leadingSpaceError = false;
    this.specialCharOrNumberError = false;

    // Remove leading spaces and flag if they existed
    if (input.startsWith(' ')) {
      this.leadingSpaceError = true;
      input = input.trimStart();
    }

   
  const filteredInput = input.replace(/[^A-Za-z\u0D80-\u0DFF\u0B80-\u0BFF ]/g, '');
  if (filteredInput !== input) {
    this.specialCharOrNumberError = true;
  }

    // Capitalize the first letter (if input is not empty)
    const capitalizedInput =
      filteredInput.length > 0
        ? filteredInput.charAt(0).toUpperCase() + filteredInput.slice(1)
        : '';

    // Update form control value without emitting a new event to avoid infinite loop
    this.collectionCenterForm
      .get('centerName')
      ?.setValue(capitalizedInput, { emitEvent: false });

    // If you're storing it separately too
    this.centerData.centerName = capitalizedInput;
  }

  capitalizeFirstLetter(input: string): string {
  if (!input) return '';
  return input.charAt(0).toUpperCase() + input.slice(1);
}
}

class CollectionCenter {
  regCode!: string;
  centerName!: string;
  contact01!: string;
  contact01Code!: string;
  contact02!: string;
  contact02Code!: string;
  buildingNumber!: string;
  street!: string;
  district!: string;
  province!: string;
  country!: string;
  city!: string;
}

class Company {
  id!: number;
  companyNameEnglish!: string;
}
