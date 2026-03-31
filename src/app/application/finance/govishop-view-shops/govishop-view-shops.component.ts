import { CommonModule, Location } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { StakeholderService } from '../../../services/stakeholder/stakeholder.service';

interface Shop {
  id: number;
  logo: string;
  shopName: string;
  phone: string;
  email: string;
  shopType: string;
  approvedStatus: string;
  isActive: number;
  updatedAt: Date;
  ownerName: string;
  ownerPhone: string;
}

interface Company {
  id: number;
  companyNameEnglish: string;
}


@Component({
  selector: 'app-govishop-view-shops',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    HttpClientModule,
    NgxPaginationModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './govishop-view-shops.component.html',
  styleUrl: './govishop-view-shops.component.css'
})
export class GovishopViewShopsComponent implements OnInit {
  shops: Shop[] = [];
  selectedDistrict: string | null = null;
  searchItem: string = '';
  page: number = 1;
  itemsPerPage: number = 10;
  isLoading = false;
  totalItems: number = 0;
  hasData: boolean = true;
  centerId!: number;

  selectedActiveStatus: string = ''
  selectedApprvalStatus: string = ''
  selectedBussinessType: string = ''

  urlSegment: string = '';

  id!: number;
  name!: string;

  selectAccessStatus: string = ''
  selectApproval: string = ''
  selectBussinessType: string = ''

  activeStatusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ]

  approvalStatusOptions = [
    { label: 'Approved', value: 'Approved' },
    { label: 'Not Approved', value: 'Not Approved' },
    { label: 'Rejected', value: 'Rejected' }
  ]

  bussinessTypeOptions = [
    { label: 'Limited Liability Company', value: 'Limited Liability Company' },
    { label: 'Partnership Business', value: 'Partnership Business' },
    { label: 'Sole propprietorship', value: 'Sole propprietorship' },
    { label: 'Cooperative Society', value: 'Cooperative Society' }
  ]


  constructor(
    private router: Router,
    private collectionService: CollectionCenterService,
    public tokenService: TokenService,
    public permissionService: PermissionService,
    private location: Location,
    private route: ActivatedRoute,
    private goviShopService: StakeholderService
  ) {}

  ngOnInit(): void {
    const segments = this.router.url
    .split('/')
    .filter(segment => segment.length > 0);

    this.urlSegment = segments[segments.length - 1];
    console.log('First segment:', this.urlSegment);

    if (this.urlSegment === 'all-govi-shops') {
      this.fetchAllGoViShopRequests();
    } else {
      this.route.queryParamMap.subscribe((params) => {
        const id = params.get('id');
        const name = params.get('name');
        console.log('Query parameter ID:', id);
        
        this.id = Number(id);
        this.name = String(name);
  
        this.fetchGoviShopsForSeletectedUser();
        });
    }

  }

  fetchGoviShopsForSeletectedUser(
    id: number = this.id,
    page: number = this.page,
    limit: number = this.itemsPerPage,
    accessStatus: string = this.selectedActiveStatus,
    approval: string = this.selectedApprvalStatus,
    bussinessType: string = this.selectedBussinessType,
    searchItem: string = this.searchItem
  ) {
    this.isLoading = true;
    this.goviShopService.getAllShopsbyOwnerId(id, page, limit, accessStatus, approval, bussinessType, searchItem)
      .subscribe(
        (response) => {

          this.isLoading = false;
          this.shops = response.results;
          this.hasData = this.shops.length > 0;
          this.totalItems = response.total;
        },
        (error) => {
          if (error.status === 401) {
          }
        }
      );
  }

  fetchAllGoViShopRequests(
    page: number = this.page,
    limit: number = this.itemsPerPage,
    approval: string = this.selectedActiveStatus,
    bussinessType: string = this.selectedBussinessType,
    searchItem: string = this.searchItem
  ) {
    this.isLoading = true;
    this.goviShopService.getAllShopsRequests(page, limit, approval, bussinessType, searchItem)
      .subscribe(
        (response) => {

          this.isLoading = false;
          this.shops = response.results;
          this.hasData = this.shops.length > 0;
          this.totalItems = response.total;
        },
        (error) => {
          if (error.status === 401) {
          }
        }
      );
  }

  selectMethodToFilter() {
    if (this.urlSegment === 'all-govi-shops') {
      this.fetchAllGoViShopRequests()
    } else {
      this.fetchGoviShopsForSeletectedUser();
    }
  }

deleteCollectionCenter(id: number) {
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you really want to delete this Collection Centre? This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
    },
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#dc2626',
  }).then((result) => {
    if (result.isConfirmed) {
      this.collectionService.deleteCollectionCenter(id).subscribe(
        (res) => {
          if (res) {
            Swal.fire({
              title: 'Deleted!',
              text: 'The Collection Centre has been deleted.',
              icon: 'success',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold',
              },
              confirmButtonColor: '#2563eb',
            });
            this.fetchGoviShopsForSeletectedUser();
          }
        },
        (error) => {
          Swal.fire({
            title: 'Error!',
            text: 'There was an error deleting the Collection Centre',
            icon: 'error',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
            },
            confirmButtonColor: '#2563eb',
          });
        }
      );
    }
  });
}



  onPageChange(event: number) {
    this.page = event;
    this.selectMethodToFilter();
  }

  searchPlantCareUsers() {
    this.searchItem = this.searchItem?.trim() || ''
    this.page = 1;
    this.selectMethodToFilter();
  }

  clearSearch(): void {
    this.searchItem = '';
    this.selectMethodToFilter();
  }

  navigateEdit(id: number) {
    this.router.navigate([`/govi-shop/action/update-govi-shop/${id}`]);
  }

  add(): void {
    this.router.navigate(['/collection-hub/add-collection-center']);
  }

  navigateDashboard(id: number) {
    this.router.navigate([`/collection-hub/collection-center-dashboard/${id}`]);
  }

  assignTarget(items: any, centerId: number) {

    let comId;
    items?.some((company: Company) =>
      company.companyNameEnglish === 'agroworld (Pvt) Ltd'
        ? (comId = company.id)
        : 0
    );
    this.router.navigate([
      `/collection-hub/collection-center-dashboard/${centerId}/${comId}`,
    ]);
  }

  isAgroworldPresent(item: any): boolean {
    return (
      item.companies?.some(
        (company: any) => company.companyNameEnglish === 'agroworld (Pvt) Ltd'
      ) ?? false
    );
  }

  viewCollectionCenter(id: number) {
    this.router.navigate([`/collection-hub/preview-collection-center/${id}`]);
  }

  back(): void {
    this.location.back();
  }

  toggleStatus(item: any) {
    item.isActive = !item.isActive;
  
  }

  activeStatusFilter() {
    this.selectMethodToFilter();
  }

  approvalStatusFilter() {
    this.selectMethodToFilter();
  }

  bussinessTypeFilter() {
    this.selectMethodToFilter();
  }
}

class CenterName {
  id!: number;
  centerName!: string;
  officerCount!: number;
}
