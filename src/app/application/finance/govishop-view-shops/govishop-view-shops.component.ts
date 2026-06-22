import { CommonModule, Location } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
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
  styleUrl: './govishop-view-shops.component.css',
})
export class GovishopViewShopsComponent implements OnInit {
  shops: Shop[] = [];
  searchItem: string = '';
  page: number = 1;
  itemsPerPage: number = 10;
  isLoading = false;
  totalItems: number = 0;
  hasData: boolean = true;
  centerId!: number;

  selectedActiveStatus: string = '';
  selectedApprvalStatus: string = '';
  selectedBussinessType: string = '';

  urlSegment: string = '';

  id!: number;
  name!: string;

  selectAccessStatus: string = '';
  selectApproval: string = '';
  selectBussinessType: string = '';
  pendingToggleShop: Shop | null = null;
  pendingToggleStatus: number = 0;
  showToggleModal = false;

  text: string = '';
  mobileNumber: string = '';

  showDeleteModal = false;
  shopToDelete: Shop | null = null;
  textAreaTouched: boolean = false;

  activeStatusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ];

  approvalStatusOptions = [
    { label: 'Approved', value: 'Approved' },
    { label: 'Not Approved', value: 'Pending' },
    { label: 'Rejected', value: 'Rejected' },
  ];

  bussinessTypeOptions = [
    { label: 'Limited Liability Company', value: 'Limited Liability Company' },
    { label: 'Partnership Business', value: 'Partnership Business' },
    { label: 'Sole propprietorship', value: 'Sole propprietorship' },
    { label: 'Cooperative Society', value: 'Cooperative Society' },
    {
      label: 'No Formal Registration (Request NIC)',
      value: 'No Formal Registration (Request NIC)',
    },
  ];

  constructor(
    private router: Router,
    private collectionService: CollectionCenterService,
    public tokenService: TokenService,
    public permissionService: PermissionService,
    private location: Location,
    private route: ActivatedRoute,
    private goviShopService: StakeholderService,
  ) {}

  ngOnInit(): void {
    const segments = this.router.url
      .split('/')
      .filter((segment) => segment.length > 0);

    this.urlSegment = segments[segments.length - 1];

    if (this.urlSegment === 'all-shop-requests') {
      this.fetchAllGoViShopRequests();
    } else {
      this.route.queryParamMap.subscribe((params) => {
        const id = params.get('id');
        const name = params.get('name');

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
    searchItem: string = this.searchItem,
  ) {
    this.isLoading = true;
    this.goviShopService
      .getAllShopsbyOwnerId(
        id,
        page,
        limit,
        accessStatus,
        approval,
        bussinessType,
        searchItem,
      )
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
        },
      );
  }

  fetchAllGoViShopRequests(
    page: number = this.page,
    limit: number = this.itemsPerPage,
    approval: string = this.selectedApprvalStatus,
    bussinessType: string = this.selectedBussinessType,
    searchItem: string = this.searchItem,
  ) {
    this.isLoading = true;
    this.goviShopService
      .getAllShopsRequests(page, limit, approval, bussinessType, searchItem)
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
        },
      );
  }

  selectMethodToFilter() {
    if (this.urlSegment === 'all-shop-requests') {
      this.fetchAllGoViShopRequests();
    } else {
      this.fetchGoviShopsForSeletectedUser();
    }
  }

  openDeleteModal(shop: Shop): void {
    this.shopToDelete = shop;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.shopToDelete = null;
    this.text = '';
    this.mobileNumber = '';
  }

  onTextareaClick() {
    this.textAreaTouched = true;
  }

  confirmDelete(form: NgForm): void {
    form.form.markAllAsTouched();
    this.textAreaTouched = true;
    if (
      this.shopToDelete &&
      this.text !== '' &&
      this.mobileNumber &&
      this.mobileNumber === this.shopToDelete.phone
    ) {
      Swal.fire({
        icon: 'info',
        title: 'Are you sure?',
        text: 'Do you really want to Delete this GoViShop?',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete',
        cancelButtonText: 'No, Cancel',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
        buttonsStyling: true,
      }).then((result) => {
        if (result.isConfirmed) {
          this.confirmDeleteShop();
        } else {
          // User cancelled
          this.isLoading = false;
        }
      });
    }
  }

  confirmDeleteShop() {
    this.isLoading = true;
    this.goviShopService
      .deleteGoviShop(this.shopToDelete!.id, this.text)
      .subscribe({
        next: (response) => {
          if (response.status) {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              html: 'GoViShop deleted Successfully',
              confirmButtonText: 'OK',
              customClass: {
                popup:
                  'bg-white dark:bg-[#363636] text-[#534E4E] dark:text-textDark',
                title: 'font-semibold text-lg',
                htmlContainer: 'text-left',
              },
            });
          }
          this.showDeleteModal = false;
          this.isLoading = false;
          this.shopToDelete = null;
          this.text = '';
          this.mobileNumber = '';

          this.fetchGoviShopsForSeletectedUser();
        },
        error: (error) => {
          console.error('Error deleting GoViShop:', error);
          this.isLoading = false;
          this.showDeleteModal = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            html: 'Error deleting GoViShop',
            confirmButtonText: 'OK',
            customClass: {
              popup:
                'bg-white dark:bg-[#363636] text-[#534E4E] dark:text-textDark',
              title: 'font-semibold text-lg',
              htmlContainer: 'text-left',
            },
          });
          this.text = '';
          this.mobileNumber = '';
        },
      });
  }

  openImageInNewTab(imageUrl: string): void {
    if (imageUrl.startsWith('data:')) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
              <html>
                <head><title>Image Preview</title></head>
                <body style="margin:0">
                  <img src="${imageUrl}" style="width:100%; height:100%" />
                </body>
              </html>
            `);
        newWindow.document.close();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Popup Blocked',
          text: 'Please allow popups for this site to view the image.',
        });
      }
    } else if (imageUrl.startsWith('http')) {
      window.open(imageUrl, '_blank');
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Image URL',
        text: 'Image URL is not valid. Cannot open in new tab.',
      });
    }
  }

  // deleteGoViShop(id: number) {
  //   Swal.fire({
  //     title: 'Are you sure?',
  //     text: 'Do you really want to delete this GoViShop? This action cannot be undone.',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'Yes, delete it!',
  //     cancelButtonText: 'Cancel',
  //     customClass: {
  //       popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
  //       title: 'font-semibold',
  //     },
  //     confirmButtonColor: '#2563eb',
  //     cancelButtonColor: '#dc2626',
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       this.goviShopService.deleteGoviShop(id).subscribe(
  //         (res) => {
  //           if (res) {
  //             Swal.fire({
  //               title: 'Deleted!',
  //               text: 'The GoViShop has been deleted.',
  //               icon: 'success',
  //               customClass: {
  //                 popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
  //                 title: 'font-semibold',
  //               },
  //               confirmButtonColor: '#2563eb',
  //             });
  //             this.selectMethodToFilter();
  //           }
  //         },
  //         (error) => {
  //           Swal.fire({
  //             title: 'Error!',
  //             text: 'Error occured while deleting the GoViShop.',
  //             icon: 'error',
  //             customClass: {
  //               popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
  //               title: 'font-semibold',
  //             },
  //             confirmButtonColor: '#2563eb',
  //           });
  //         }
  //       );
  //     }
  //   });
  // }

  onPageChange(event: number) {
    this.page = event;
    this.selectMethodToFilter();
  }

  searchPlantCareUsers() {
    this.searchItem = this.searchItem?.trim() || '';
    this.page = 1;
    this.selectMethodToFilter();
  }

  clearSearch(): void {
    this.searchItem = '';
    this.selectMethodToFilter();
  }

  navigateEdit(id: number) {
    this.router.navigate([`/govi-shop/action/update-govi-shop/${id}`]);

    if (this.urlSegment === 'all-shop-requests') {
      this.router.navigate([`/govi-shop/action/update-govi-shop/${id}`]);
    } else {
      this.router.navigate([
        `/steckholders/action/govi-shop-suppliers/update-govi-shop/${id}`,
      ]);
    }
  }

  previewGoViShop(id: number) {
    if (this.urlSegment === 'all-shop-requests') {
      this.router.navigate([`/govi-shop/action/preview-govi-shop/${id}`]);
    } else {
      this.router.navigate([
        `/steckholders/action/govi-shop-suppliers/preview-govi-shop/${id}`,
      ]);
    }
  }

  back(): void {
    this.location.back();
  }

  toggleStatus(shop: Shop): void {
    this.pendingToggleShop = shop;
    this.pendingToggleStatus = shop.isActive === 1 ? 0 : 1;
    this.showToggleModal = true;
  }

  confirmToggle(): void {
    if (!this.pendingToggleShop) return;
    const shop = this.pendingToggleShop;
    const newStatus = this.pendingToggleStatus;

    this.goviShopService.toggleShopActiveStatus(shop.id, newStatus).subscribe({
      next: () => {
        shop.isActive = newStatus;
        this.closeToggleModal();
      },
      error: (err) => {
        console.error('Toggle error:', err);
        this.closeToggleModal();
      },
    });
  }

  closeToggleModal(): void {
    this.showToggleModal = false;
    this.pendingToggleShop = null;
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
