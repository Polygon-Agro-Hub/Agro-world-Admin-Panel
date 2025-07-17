import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { DestributionService } from '../../../services/destribution-service/destribution-service.service';
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
  styleUrl: './view-distribution-center.component.css',
})
export class ViewDistributionCenterComponent implements OnInit {
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
  ) {}

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

  viewDistributionCenter(id: number): void {
    this.router.navigate([
      `/distribution-hub/action/view-distribution-centre/${id}`,
    ]);
  }

  fetchCompanies(): void {
    this.isLoading = true;
    this.DestributionSrv.getCompanies().subscribe({
      next: (response) => {
        console.log('Raw API response:', response); // Add this line
        console.log('Companies fetched:', response.data); // Check the data structure

        if (response.success && response.data) {
          this.companyOptions = response.data
            .map((company) => ({
              label: company.companyNameEnglish,
              value: company.companyNameEnglish,
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
    searchItem?: string
  ) {
    this.isLoading = true;
    this.DestributionSrv.getAllDistributionCentre(
      page,
      limit,
      district,
      province,
      company,
      searchItem
    ).subscribe(
      (response) => {
        this.isLoading = false;
        this.distributionCentreObj = response.items;
        this.hasData = this.distributionCentreObj.length > 0;
        this.totalItems = response.total; // This updates the count
      },
      (error) => {
        console.error('API Error:', error);
        this.isLoading = false;
        if (error.status === 401) {
          // Unauthorized access handling
        }
      }
    );
  }

  formatCount(count: number): string {
    return count < 10 ? `0${count}` : `${count}`;
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
      this.selectDistrict,
      this.selectProvince,
      this.selectCompany,
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

      this.districtOptions =
        selected?.district
          .map((d) => ({
            label: d.districtName,
            value: d.districtName,
          }))
          .sort((a, b) => a.label.localeCompare(b.label)) || [];

      this.selectDistrict = '';
    } else {
      this.districtOptions = this.ProvinceData.flatMap((p) => p.district)
        .map((d) => ({
          label: d.districtName,
          value: d.districtName,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }

    // Call fetch with updated filters
    this.fetchAllCollectionCenter(
      this.page,
      this.itemsPerPage,
      this.selectDistrict,
      this.selectProvince, // Make sure this is the correct format
      this.selectCompany,
      this.searchItem
    );
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
    this.router.navigate([
      `/distribution-hub/action/edit-distribution-centre/${id}`,
    ]);
  }

  add(): void {
    this.router.navigate(['/distribution-hub/action/add-destribition-center']);
  }

  navigateDashboard(id: number) {
    // this.router.navigate([`/collection-hub/collection-center-dashboard/${id}`]);
  }

  deleteDistributionCenter(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.DestributionSrv.deleteDistributionCenter(id).subscribe({
          next: () => {
            Swal.fire(
              'Deleted!',
              'Distribution center has been deleted.',
              'success'
            );
            // Refresh the list after deletion
            this.fetchAllCollectionCenter(this.page, this.itemsPerPage);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error deleting distribution center:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete distribution center',
            });
          },
        });
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
