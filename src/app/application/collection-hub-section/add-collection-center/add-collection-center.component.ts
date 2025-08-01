import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { Country, COUNTRIES } from '../../../../assets/country-data';

@Component({
  selector: 'app-add-collection-center',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DropdownModule, InputTextModule, FormsModule],
  templateUrl: './add-collection-center.component.html',
  styleUrls: ['./add-collection-center.component.css'],
})
export class AddCollectionCenterComponent implements OnInit {
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
      contact02: [
        '',
        [Validators.pattern(/^[7][0-9]{8}$/)],
      ],
      contact02Code: ['+94'],
      buildingNumber: ['', Validators.required],
      street: ['', [Validators.required, this.noNumbersValidator]],
      district: ['', Validators.required],
      province: ['', Validators.required],
      country: ['Sri Lanka', Validators.required],
      city: ['', Validators.required],
      searchQuery: ['']
    });
    const defaultCountry = this.countries.find(c => c.code === 'lk') || null;
  this.selectedCountry1 = defaultCountry;
  this.selectedCountry2 = defaultCountry;
  this.filteredCompanies = [...this.CompanyData];
  }
  //serachable company dropdown
  filterCompanies(event: Event): void {
    const input = (event.target as HTMLInputElement).value.toLowerCase().trim();
  
    this.filteredCompanies = this.CompanyData.filter(company =>
      company.companyNameEnglish.toLowerCase().includes(input)
    );
  }

  onCompanyInputClick(): void {
    this.dropdownOpen = !this.dropdownOpen;
    this.companyTouched = true;
  
    // Reset search input and filtered data
    this.filteredCompanies = [...this.CompanyData];
  
    // Clear the actual input field (optional but recommended)
    const inputElement = document.querySelector('#companySearchInput') as HTMLInputElement;
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

    const selectedProvinceData = this.ProvinceData.find(
      (province) => province.province === selectedProvince
    );
    if (selectedProvinceData) {
      this.selectedDistrict = selectedProvinceData.district;
    }

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

  // const contact01 = this.collectionCenterForm.get('contact01')?.value;
  // const contact02 = this.collectionCenterForm.get('contact02')?.value;

  // const isSameNumber = contact01 === contact02;
  // const isInvalidPhone = this.isPhoneInvalidMap['phone02'];
  // const isContact02Invalid = this.collectionCenterForm.get('contact02')?.invalid;

  // if (contact02 && (isSameNumber || isInvalidPhone || isContact02Invalid)) {
  //   if (isSameNumber) {
  //     Swal.fire({
  //       icon: 'error',
  //       title: 'Duplicate Phone Number',
  //       text: 'Phone Number - 2 should be different from Phone Number - 1.'
  //     });
  //   } else if (isInvalidPhone) {
  //     Swal.fire({
  //       icon: 'error',
  //       title: 'Invalid Phone Format',
  //       text: 'Please enter a valid phone number (e.g., 77XXXXXXX, 72XXXXXXX, etc).'
  //     });
  //   } else if (isContact02Invalid) {
  //     Swal.fire({
  //       icon: 'error',
  //       title: 'Invalid Phone Number',
  //       text: 'Phone Number must be exactly 9 digits.'
  //     });
  //   }
  //   return; // prevent form submission
  // }

  // Proceed if no errors
  if (this.collectionCenterForm.valid) {
    // your form submit logic here
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: 'Form submitted successfully!'
    });
  }

    const requiredFields = [
      { key: 'buildingNumber', label: 'Building Number' },
      { key: 'street', label: 'Street' },
      { key: 'city', label: 'City' },
      { key: 'centerName', label: 'Center Name' },
      { key: 'contact01', label: 'Contact Number' },
      { key: 'district', label: 'District' },
      { key: 'province', label: 'Province' },
      { key: 'regCode', label: 'Registration Code' },
      { key: 'contact01Code', label: 'Contact Code' },
    ];

    const missingFields = requiredFields
      .filter((field) => !this.collectionCenterForm.value[field.key])
      .map((field) => `- ${field.label}`);

    if (this.selectedCompaniesIds.length === 0) {
      missingFields.push(`- Company Name`);
    }

    if (missingFields.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Form Validation Error',
        html: `<p>Please fill in the following required fields:</p><ul>${missingFields
          .map((f) => `<li>${f}</li>`)
          .join('')}</ul>`,
      });
      return;
    }

    this.centerData = {
      ...this.centerData,
      ...this.collectionCenterForm.value,
    };

    this.collectionCenterService
      .createCollectionCenter(this.centerData, this.selectedCompaniesIds)
      .subscribe(
        (res) => {
          console.log(res);
          if (res.status) {
            Swal.fire(
              'Success',
              'Collection centre Created Successfully',
              'success'
            );
            this.router.navigate(['/collection-hub/view-collection-centers']);
          } else {
            if (res.message === 'This RegCode already exists!') {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Something went wrong while creating the Collection centre.',
              });
            }
          }
        },
        (error) => {
          console.log('Error:', error);
        }
      );
  }

  onCancel() {
    Swal.fire({
      icon: 'info',
      title: 'Cancelled',
      text: 'Form has been cleared!',
      timer: 2000,
      showConfirmButton: false,
    }).then(() => {
      this.collectionCenterForm.reset();
      this.selectedDistrict = [];
      this.selectProvince = '';
      this.router.navigate(['/collection-hub/view-collection-centers']);
    });
  }

  getAllCompanies() {
    this.collectionCenterService.getAllCompanyList().subscribe((res) => {
      this.CompanyData = res;
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
    this.router.navigate(['/collection-hub']);
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
      district: [
        { districtName: 'Kurunegala' },
        { districtName: 'Puttalam' },
      ],
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
      district: [
        { districtName: 'Kegalle' },
        { districtName: 'Rathnapura' },
      ],
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
      district: [
        { districtName: 'Badulla' },
        { districtName: 'Moneragala' },
      ],
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
      const value = control.value || '';
      control.setValue(value.replace(/^\s+/, ''), { emitEvent: false });
    }
  }

  trimCity(): void {
    const control = this.collectionCenterForm.get('buildingNumber');
    if (control) {
      const value = control.value || '';
      control.setValue(value.replace(/^\s+/, ''), { emitEvent: false });
    }
  }

  trimStreetName(): void {
    const control = this.collectionCenterForm.get('street');
    if (control) {
      const value = control.value || '';
      control.setValue(value.replace(/^\s+/, ''), { emitEvent: false });
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
  
    // Remove invalid characters (only allow A-Z, a-z, and space)
    const filteredInput = input.replace(/[^A-Za-z ]/g, '');
    if (filteredInput !== input) {
      this.specialCharOrNumberError = true;
    }
  
    // Capitalize the first letter (if input is not empty)
    const capitalizedInput =
      filteredInput.length > 0
        ? filteredInput.charAt(0).toUpperCase() + filteredInput.slice(1)
        : '';
  
    // Update form control value without emitting a new event to avoid infinite loop
    this.collectionCenterForm.get('centerName')?.setValue(capitalizedInput, { emitEvent: false });
  
    // If you're storing it separately too
    this.centerData.centerName = capitalizedInput;
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
