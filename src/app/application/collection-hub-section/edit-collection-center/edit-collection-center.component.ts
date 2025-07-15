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

@Component({
  selector: 'app-edit-collection-center',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LoadingSpinnerComponent,
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
              'Collection Center updated Successfully',
              'success'
            );
            this.router.navigate(['/collection-hub/view-collection-centers']);
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Failed',
              text: res?.message || 'This RegCode already exists!',
            });
          }
        },
        () => {
          Swal.fire({
            icon: 'error',
            title: 'Server Error',
            text: 'Failed to update the collection center. Please try again later.',
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
        () => {}
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
          () => {}
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
          () => {}
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
          () => {}
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
  country!: string;
  companies!: string;
}

class Company {
  id!: number;
  companyNameEnglish!: string;
}
