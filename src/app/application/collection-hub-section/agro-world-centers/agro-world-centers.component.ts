import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import Swal from 'sweetalert2';

interface CollectionCenter {
  id: number;
  regCode: string;
  centerName: string;
  code1: string;
  contact01: string;
  code2: string;
  contact02: string;
  buildingNumber: string;
  street: string;
  district: string;
  province: string;
  companies: Company[];
}

interface Company {
  id: number;
  companyNameEnglish: string;
}

@Component({
  selector: 'app-agro-world-centers',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    HttpClientModule,
    NgxPaginationModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './agro-world-centers.component.html',
  styleUrl: './agro-world-centers.component.css',
})
export class AgroWorldCentersComponent {
  centerNameObj: CenterName = new CenterName();
  companyId!: number;
  collectionObj!: CollectionCenter[];
  filteredCollection!: CollectionCenter[];
  districts: string[] = [];
  selectedDistrict: string | null = null;
  searchItem: string = '';
  page: number = 1;
  itemsPerPage: number = 10;
  isLoading = false;
  totalItems: number = 0;
  hasData: boolean = true;
  centerId!: number;

  constructor(
    private router: Router,
    private collectionService: CollectionCenterService,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.fetchAllCollectionCenter(this.page, this.itemsPerPage);
  }

  fetchAllCollectionCenter(
    page: number = this.page,
    limit: number = this.itemsPerPage,
    searchItem?: string
  ) {
    this.isLoading = true;
    this.collectionService
      .getAllCollectionCenterPageAW(page, limit, searchItem)
      .subscribe(
        (response) => {
          this.isLoading = false;
          this.collectionObj = response.items;
          this.hasData = this.collectionObj.length > 0;
          this.totalItems = response.total;
        },
        (error) => {
          if (error.status === 401) {
          }
        }
      );
  }

  deleteCollectionCenter(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this Collection Center? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.collectionService.deleteCollectionCenter(id).subscribe(
          (res) => {
            if (res) {
              Swal.fire(
                'Deleted!',
                'The Collection Center has been deleted.',
                'success'
              );
              this.fetchAllCollectionCenter();
            }
          },
          (error) => {
            Swal.fire(
              'Error!',
              'There was an error deleting the Collection Centers',
              'error'
            );
          }
        );
      }
    });
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

  navigateEdit(id: number) {
    this.router.navigate([`/collection-hub/update-collection-center/${id}`]);
  }

  add(): void {
    this.router.navigate(['/collection-hub/add-collection-center']);
  }

  navigateDashboard(id: number) {
    this.router.navigate([`/collection-hub/collection-center-dashboard/${id}`]);
  }

  assignTarget(items: any, centerId: number, centerName: string) {
    let comId;
    items?.some((company: Company) =>
      company.companyNameEnglish === 'agroworld (Pvt) Ltd'
        ? (comId = company.id)
        : 0
    );
    this.router.navigate([
      `/collection-hub/collection-center-dashboard/${centerId}/${comId}/${centerName}`,
    ]);
  }

  isAgroworldPresent(item: any): boolean {
    return (
      item.companies?.some(
        (company: any) => company.companyNameEnglish === 'agroworld (Pvt) Ltd'
      ) ?? false
    );
  }

  navigateAddTarget(item: CollectionCenter) {
    const agroworldCompany = item.companies.find(
      (company: Company) => company.companyNameEnglish === 'agroworld (Pvt) Ltd'
    );

    if (!agroworldCompany) {
      return;
    }
    const companyId = agroworldCompany.id;

    this.router.navigate([
      `/collection-hub/add-daily-target/${item.id}/${item.centerName}/${item.regCode}`,
    ]);
  }
}

class CenterName {
  id!: number;
  centerName!: string;
  regCode!: string;
  officerCount!: number;
}
