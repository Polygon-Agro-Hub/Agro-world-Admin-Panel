import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { DestributionService } from '../../../services/destribution-service/destribution-service.service'
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-view-distribution-center',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    HttpClientModule,
    NgxPaginationModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './view-distribution-center.component.html',
  styleUrl: './view-distribution-center.component.css'
})
export class ViewDistributionCenterComponent implements OnInit {

  // centerNameObj: CenterName = new CenterName();
  companyId!: number;
  distributionCentreObj!: DistributionCentre[];
  // filteredCollection!: CollectionCenter[];
  districts: string[] = [];
  selectedDistrict: string | null = null;
  searchItem: string = '';
  page: number = 1;
  itemsPerPage: number = 10;
  isLoading = false;
  totalItems: number = 0;
  hasData: boolean = true;
  centerId!: number;

  provinceOptions: any[] = [];
  districtOptions: any[] = [];

  selectProvince: string = '';
  selectDistrict: string = '';

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
      district: [{ districtName: 'Rathnapura' }, { districtName: 'Kegalle' }],
    },
  ];

  constructor(
    private router: Router,
    private DestributionSrv: DestributionService,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.fetchAllCollectionCenter(this.page, this.itemsPerPage);

    this.provinceOptions = this.ProvinceData.map((p) => ({
      label: p.province,
      value: p.province,
    })).sort((a, b) => a.label.localeCompare(b.label));

    // District dropdown (all districts initially, sorted alphabetically)
    this.districtOptions = this.ProvinceData.flatMap((p) => p.district)
      .map((d) => ({
        label: d.districtName,
        value: d.districtName,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  fetchAllCollectionCenter(
    page: number = this.page,
    limit: number = this.itemsPerPage,
    district: string = this.selectDistrict,
    province: string = this.selectProvince,
    searchItem?: string
  ) {
    this.isLoading = true;
    this.DestributionSrv
      .getAllDistributionCentre(page, limit, district, province, searchItem)
      .subscribe(
        (response) => {
          this.isLoading = false;
          this.distributionCentreObj = response.items;
          this.hasData = this.distributionCentreObj.length > 0;
          this.totalItems = response.total;
        },
        (error) => {
          if (error.status === 401) {
            // Unauthorized access handling (left empty intentionally)
          }
        }
      );
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllCollectionCenter(this.page, this.itemsPerPage);
  }

  searchPlantCareUsers() {
    this.page = 1;
    this.fetchAllCollectionCenter(
      this.page,
      this.itemsPerPage,
      this.searchItem
    );
  }

  clearSearch(): void {
    this.searchItem = '';
    this.fetchAllCollectionCenter(this.page, this.itemsPerPage);
  }

  applyProvinceFilters() {
    if (this.selectProvince) {
      const selected = this.ProvinceData.find(
        (p) => p.province === this.selectProvince
      );

      // Filter and sort districts for selected province
      this.districtOptions =
        selected?.district
          .map((d) => ({
            label: d.districtName,
            value: d.districtName,
          }))
          .sort((a, b) => a.label.localeCompare(b.label)) || [];

      // Reset district selection
      this.selectDistrict = '';
    } else {
      // Province cleared → show all districts, sorted
      this.districtOptions = this.ProvinceData.flatMap((p) => p.district)
        .map((d) => ({
          label: d.districtName,
          value: d.districtName,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }

    console.log(this.selectProvince);

    this.fetchAllCollectionCenter(this.page, this.itemsPerPage);
  }

  applyDistrictFilters() {
    if (this.selectDistrict) {
      const matchingProvince = this.ProvinceData.find((p) =>
        p.district.some((d) => d.districtName === this.selectDistrict)
      );

      if (matchingProvince) {
        this.selectProvince = matchingProvince.province;

        // Filter district list for this province
        this.districtOptions = matchingProvince.district.map((d) => ({
          label: d.districtName,
          value: d.districtName,
        }));
      }
    }
    console.log(this.selectDistrict);

    this.fetchAllCollectionCenter(this.page, this.itemsPerPage);
  }

  clearDistrictFilter() {
    this.selectDistrict = '';
    this.fetchAllCollectionCenter(this.page, this.itemsPerPage);
  }

  clearProvinceFilter() {
    this.selectProvince = '';
    this.selectDistrict = '';
    this.districtOptions = this.ProvinceData.flatMap((p) => p.district).map(
      (d) => ({
        label: d.districtName,
        value: d.districtName,
      })
    );
    this.fetchAllCollectionCenter(this.page, this.itemsPerPage);
  }

  navigateEdit(id: number) {
    // this.router.navigate([`/collection-hub/update-collection-center/${id}`]);
  }

  add(): void {
    // this.router.navigate(['/collection-hub/add-collection-center']);
  }

  navigateDashboard(id: number) {
    // this.router.navigate([`/collection-hub/collection-center-dashboard/${id}`]);
  }

}

class DistributionCentre {
  id!: number;
  officerName!: string;
  regCode!: string;
  centerName!: string;
  code1!: string;
  contact01!: string;
  code2!: string;
  contact02!: string;
  city!: string;
  district!: string;
  province!: string;
  latitude!: string;
  longitude!: string;
  companyName!: string;
}
