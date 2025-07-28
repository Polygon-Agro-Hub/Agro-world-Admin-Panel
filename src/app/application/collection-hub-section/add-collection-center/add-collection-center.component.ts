import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-collection-center',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
    });
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
  }

  onProvinceChange() {
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
