import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DestributionService } from '../../../services/destribution-service/destribution-service.service';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-polygon-centers',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    HttpClientModule,
    NgxPaginationModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './view-polygon-centers.component.html',
  styleUrl: './view-polygon-centers.component.css'
})
export class ViewPolygonCentersComponent implements OnInit {
  companyId!: number;
  distributionCentreObj!: DistributionCentre[];
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
  companyOptions: any[] = [];

  selectProvince: string = '';
  selectDistrict: string = '';
  selectCompany: string = '';

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
  ) { }

  ngOnInit(): void {
    this.fetchAllCollectionCenter(this.page, this.itemsPerPage);
    this.fetchCompanies();

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

  fetchCompanies(): void {
    this.isLoading = true;
    this.DestributionSrv.getCompanies().subscribe({
      next: (response) => {
        console.log('Companies fetched:', response);

        if (response.success && response.data) {
          this.companyOptions = response.data
            .map((company) => ({
              label: company.companyNameEnglish, // Use companyNameEnglish directly
              value: company.companyNameEnglish, // Use name as value since ID isn't returned
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching companies:', error);
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load companies',
        });
      },
    });
  }

  applyCompanyFilter(): void {
    this.page = 1;
    this.fetchAllCollectionCenter(
      this.page,
      this.itemsPerPage,
      this.selectDistrict,
      this.selectProvince,
      this.selectCompany,
      this.searchItem
    );
  }

  clearCompanyFilter(): void {
    this.selectCompany = '';
    this.fetchAllCollectionCenter(this.page, this.itemsPerPage);
  }

  fetchAllCollectionCenter(
    page: number = this.page,
    limit: number = this.itemsPerPage,
    district: string = this.selectDistrict,
    province: string = this.selectProvince,
    company: string = this.selectCompany,
    searchItem?: string,
    centerType: string = 'polygon' // Default to 'polygon' type
  ) {
    this.isLoading = true;
    this.DestributionSrv.getAllDistributionCentre(
      page,
      limit,
      district,
      province,
      company,
      searchItem,
      centerType
    ).subscribe(
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
    this.fetchAllCollectionCenter();
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
    this.fetchAllCollectionCenter();
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

    this.fetchAllCollectionCenter();
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
    this.router.navigate(['/distribution-hub/action/add-destribition-center']);
  }

  navigateDashboard(id: number) {
    // this.router.navigate([`/collection-hub/collection-center-dashboard/${id}`]);
  }

  deleteCenter(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this center!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.DestributionSrv.deleteDistributedCenter(id).subscribe(
          (res) => {
            if (res.success) {
              Swal.fire('Deleted!', 'The center has been deleted.', 'success');
              this.fetchAllCollectionCenter();
            } else {
              Swal.fire('Error!', 'Failed to delete the center.', 'error');
            }
          },
          (error) => {
            console.error('Error deleting center:', error);
            Swal.fire('Error!', 'Failed to delete the center.', 'error');
          }
        );
      }
    });
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
