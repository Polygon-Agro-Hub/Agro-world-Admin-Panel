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
interface PhoneCode {
  code: string;
  dialCode: string;
  name: string;
}
@Component({
  selector: 'app-preview-collection-center',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DropdownModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './preview-collection-center.component.html',
  styleUrl: './preview-collection-center.component.css',
})
export class PreviewCollectionCenterComponent implements OnInit {
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
    countries: PhoneCode[] = [
  { code: 'LK', dialCode: '+94', name: 'Sri Lanka' },
  { code: 'VN', dialCode: '+84', name: 'Vietnam' },
  { code: 'KH', dialCode: '+855', name: 'Cambodia' },
  { code: 'BD', dialCode: '+880', name: 'Bangladesh' },
  { code: 'IN', dialCode: '+91', name: 'India' },
  { code: 'NL', dialCode: '+31', name: 'Netherlands' },
  { code: 'UK', dialCode: '+44', name: 'United Kingdom' },
  { code: 'US', dialCode: '+1', name: 'United States' }
];

getFlagUrl(countryCode: string): string {
  return `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`;
}
  constructor(
    private collectionCenterService: CollectionCenterService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.collectionCenterID = this.route.snapshot.params['id'];
  }

  back(): void {
    this.router.navigate(['collection-hub/view-collection-centers']);
  }

  ngOnInit(): void {
    this.fetchCollectionCenter();
    this.getAllCompanies();
  }

  ProvinceData = [
    {
      province: 'Western',
      district: [
        { districtName: 'Colombo' },
        { districtName: 'Kalutara' },
        { districtName: 'Gampaha' },
      ],
    },
    {
      province: 'Central',
      district: [
        { districtName: 'Kandy' },
        { districtName: 'Matale' },
        { districtName: 'Nuwara Eliya' },
      ],
    },
    {
      province: 'Southern',
      district: [
        { districtName: 'Galle' },
        { districtName: 'Matara' },
        { districtName: 'Hambantota' },
      ],
    },
    {
      province: 'Northern',
      district: [
        { districtName: 'Jaffna' },
        { districtName: 'Mannar' },
        { districtName: 'Vavuniya' },
        { districtName: 'Kilinochchi' },
        { districtName: 'Mulaitivu' },
      ],
    },
    {
      province: 'Eastern',
      district: [
        { districtName: 'Batticaloa' },
        { districtName: 'Ampara' },
        { districtName: 'Trincomalee' },
      ],
    },
    {
      province: 'Uva',
      district: [{ districtName: 'Badulla' }, { districtName: 'Moneragala' }],
    },
    {
      province: 'North Western',
      district: [{ districtName: 'Kurunegala' }, { districtName: 'Puttalam' }],
    },
    {
      province: 'North Central',
      district: [
        { districtName: 'Anuradhapura' },
        { districtName: 'Polonnaruwa' },
      ],
    },
    {
      province: 'Sabaragamuwa',
      district: [{ districtName: 'Ratnapura' }, { districtName: 'Kegalle' }],
    },
  ];

  onSubmit() {
    this.collectionCenterService
      .updateColectionCenter(
        this.centerFetchData,
        this.selectedCompaniesIds,
        this.collectionCenterID
      )
      .subscribe(
        (res) => {
          if (res?.status) {
            Swal.fire(
              'Success',
              'Collection Centre updated Successfully',
              'success'
            );
            this.router.navigate(['/collection-hub/view-collection-centers']);
          } else {
            if (res?.message === 'This RegCode already exists!') {
              Swal.fire({
                icon: 'error',
                title: 'Failed',
                text: 'This RegCode already exists!',
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'This RegCode already exists!',
              });
            }
          }
        },
        (error) => {
          console.error('Error:', error);
          Swal.fire({
            icon: 'error',
            title: 'Server Error',
            text: 'Failed to update the collection centre. Please try again later.',
          });
        }
      );
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
      (error) => console.error('Error fetching companies:', error)
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
            this.selectProvince = this.centerFetchData.province;
            this.existRegCode = this.centerFetchData.regCode; 

            this.updateSelectedCompanies();
            this.onProvinceChange();
            this.isLoading = false;
          } else {
            this.isLoading = false;
            Swal.fire('Sorry', 'Center Data not available', 'warning');
            this.router.navigate(['/collection-hub/view-collection-centers']);
          }
        },

        (error) => console.error('Error fetching collection centre:', error)
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
      icon: 'info',
      title: 'Cancelled',
      text: 'Changes have been discarded!',
      timer: 2000,
      showConfirmButton: false,
    });
    this.fetchCollectionCenter();
    this.router.navigate(['/collection-hub/view-collection-centers']);
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
    const selectedProvince = this.centerFetchData.province;
    const selectedDistrict = this.centerFetchData.district;
    const selectedCity = this.centerFetchData.city;

    const filteredProvince = this.ProvinceData.filter(
      (item) => item.province === this.selectProvince
    );
    this.centerFetchData.province = this.selectProvince;

    if (filteredProvince.length > 0) {
      this.selectedDistrict = filteredProvince[0].district;
    } else {
      this.selectedDistrict = [];
    }

    if (selectedProvince && selectedDistrict && selectedCity) {
      this.collectionCenterService
        .generateRegCode(selectedProvince, selectedDistrict, selectedCity)
        .subscribe(
          (response) => {
            this.centerFetchData.regCode = response.regCode;
          },
          (error) => {
            console.error('Error fetching regCode:', error);
          }
        );
    }
  }

  onDistrictChange() {
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
            console.error('Error fetching regCode:', error);
          }
        );
    }
  }

  onCityChange() {
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
            console.error('Error fetching regCode:', error);
          }
        );
    }
  }

  formatContactNumber(value: number | null): string {
  if (value === null || value === undefined || value === 0 || isNaN(value)) {
    return '-';
  }
  return value.toString();
}

onContact02Change(value: string) {
  if (value === '-' || value === '') {
    this.centerFetchData.contact02 = null;
  } else {
    const parsedValue = parseInt(value, 10);
    this.centerFetchData.contact02 = isNaN(parsedValue) ? null : parsedValue;
  }
}

}

class CollectionCenter {
  regCode!: string;
  centerName!: string;
  contact01!: number;
  code1!: string;
  contact02!: number | null;
  code2!: string;
  buildingNumber!: string;
  street!: string;
  city!: string;
  district!: string;
  province!: string;
  country!: string;
  companies!: string;
}

class Company {
  id!: number;
  companyNameEnglish!: string;
}
