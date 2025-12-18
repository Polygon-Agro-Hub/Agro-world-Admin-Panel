import { Component, ViewChild  } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { DropdownModule } from 'primeng/dropdown';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, NgModel  } from '@angular/forms';
import { CollectionService } from '../../../services/collection.service';
import { environment } from '../../../environment/environment';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { CollectionOfficerService } from '../../../services/collection-officer/collection-officer.service';

interface CollectionOfficers {
  id: number;
  image: string;
  firstNameEnglish: string;
  lastNameEnglish: string;
  phoneNumber01: string;
  companyNameEnglish: string;
  empId: any;
  nic: string;
  status: string;
  claimStatus: number;
  jobRole: string;
  created_at: string;
  centerName: string;
  officerModiyBy: string;
  adminModifyBy:string;
  regCode: string;
}

interface JobRole {
  id: number;
  jobRole: string;
}

@Component({
  selector: 'app-view-collective-officer',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    HttpClientModule,
    NgxPaginationModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './view-collective-officer.component.html',
  styleUrls: ['./view-collective-officer.component.css'],
})
export class ViewCollectiveOfficerComponent {
  @ViewChild('selectedCenterIdInput') selectedCenterIdInput!: NgModel;
  @ViewChild('selectedIrmIdInput') selectedIrmIdInput!: NgModel;
  collectionOfficers: CollectionOfficers[] = [];
  jobRole: JobRole[] = [
    { id: 1, jobRole: 'Collection Officer' },
    { id: 2, jobRole: 'Collection Centre Manager' },

  ];
  centerNames: CenterName[] = [];
  collectionCenterManagerNames: ManagerNames[] = [];
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  searchNIC: string = '';
  isPopupVisible = false;
  status!: Company[];
  statusFilter: any = '';
  role: any = '';
  showDisclaimView = false;
  officerId!: number;
  selectOfficerId!: number;
  companyArr: Company[] = [];
  isLoading = false;
  iseditModalOpen: boolean = false;
  selectedOfficer: CollectionOfficers | null = null;
  selectedCenterId: string | null = null;
  selectedIrmId: string | null = null;
  selectCenterStatus: string = '';
  selectStatus: string = '';
  isSteckholdersRoute: boolean = false;

  hasData: boolean = false;

  urlSegment: string = '';

  centerStatusOptions = [
    { label: 'Disclaimed', value: 'Disclaimed' },
    { label: 'Claimed', value: 'Claimed' },
  ];

  statusOptions = [
    { label: 'Approved', value: 'Approved' },
    { label: 'Not Approved', value: 'Not Approved' },
    { label: 'Rejected', value: 'Rejected' },
  ];

  centerId: number | null = null;
  Cname: string = '';

  constructor(
    private router: Router,
    private collectionService: CollectionService,
    public tokenService: TokenService,
    public permissionService: PermissionService,
    private collectionOfficerService: CollectionOfficerService,
    private route: ActivatedRoute,
  ) { }

  fetchAllCollectionOfficer(
    
    page: number = 1,
    limit: number = this.itemsPerPage,
    centerStatus: string = this.selectCenterStatus,
    status: string = this.selectStatus,
    centerId: string | null = this.selectedCenterId
  ) {
    this.isLoading = true;
    console.log('calling 3')
    this.route.queryParams.subscribe((params) => {
      this.centerId = params['id'] ? +params['id'] : null;
      this.Cname = params['Cname'] ? params['Cname'] : null;
    
      console.log('centerId:', this.centerId);
      console.log('Cname:', this.Cname);
    });


    if (this.centerId === null) {
      console.log('calling 1')

      this.collectionService
        .fetchAllCollectionOfficer(
          page,
          limit,
          centerStatus,
          status,
          this.searchNIC,
          this.statusFilter?.id,
          this.role?.jobRole,
        )
        .subscribe(
          (response) => {
            this.isLoading = false;
            if (response.total > 0) {
              this.hasData = true
            } else {
              this.hasData = false
            }
            this.collectionOfficers = response.items;
            this.totalItems = response.total;
          },
          (error) => {
            this.isLoading = false;
          }
        );

    } else {
      console.log('calling 2')

      this.collectionService
        .fetchAllCollectionOfficercenter(
          page,
          limit,
          centerStatus,
          status,
          this.searchNIC,
          this.statusFilter?.id,
          this.role?.jobRole,
          this.centerId ? this.centerId : ''
        )
        .subscribe(
          (response) => {
            this.isLoading = false;
            this.collectionOfficers = response.items;
            this.totalItems = response.total;
            this.hasData = response.total > 0;
          },
          (error) => {
            this.isLoading = false;
          }
        );

    }

  }

  back(): void {
    if (this.centerId != null) {
      history.back()
    } else {
      this.router.navigate(['steckholders/action']);
    }

  }

  fetchCenterNames() {
    this.collectionService.getCenterNames().subscribe(
      (response) => {
        this.centerNames = response;
      },
      (error) => { }
    );
  }

  onCenterChange() {
    if (this.selectedCenterId) {
      const numericCenterId = parseInt(this.selectedCenterId);
      console.log(this.selectedCenterId);


      this.fetchManagerNames(numericCenterId);

    } else {
      this.collectionCenterManagerNames = [];
    }
  }

  fetchManagerNames(centerId: number) {
    this.collectionService.getCollectionCenterManagerNames(centerId).subscribe(
      (response) => {
        console.log('Manager names response:', response);

        this.collectionCenterManagerNames = response.data || response;
        this.collectionCenterManagerNames = this.collectionCenterManagerNames.map(manager => ({
          ...manager,
          displayLabel: `${manager.empId} - ${manager.firstNameEnglish} ${manager.lastNameEnglish}`
        }));
      },
      (error) => {
        console.error('Error fetching managers:', error);
        this.collectionCenterManagerNames = [];
      }
    );
  }

  ngOnInit() {
    this.isSteckholdersRoute = this.router.url.includes('/steckholders/action/collective-officer');
    this.fetchAllCollectionOfficer(this.page, this.itemsPerPage);
    this.getAllcompany();
    this.fetchCenterNames();
    if (this.centerId !== null) {
      this.fetchManagerNames(this.centerId);
    }
    console.log('role', this.tokenService.getUserDetails().role);

    this.urlSegment = this.router.url.split('/').filter(segment => segment.length > 0)[0];
    console.log('First segment:', this.urlSegment);

    // this.route.queryParams.subscribe((params) => {
    //   this.centerId = params['id'] ? +params['id'] : null;
    // });

    // if(this.centerId != null){
    //   console.log(this.centerId);
    // }
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllCollectionOfficer(this.page, this.itemsPerPage);
  }

  applyFilters() {
    this.fetchAllCollectionOfficer(this.page, this.itemsPerPage);
  }

  applyCenterStatusFilters() {
    this.fetchAllCollectionOfficer(this.page, this.itemsPerPage);
  }

  clearCenterStatusFilter() {
    this.selectCenterStatus = '';
    this.fetchAllCollectionOfficer(this.page, this.itemsPerPage);
  }

 deleteCollectionOfficer(id: number) {
  const token = this.tokenService.getToken();
  if (!token) return;

  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you really want to delete this Collection Officer? This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
      confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700',
      cancelButton: 'bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 ml-2'
    },
    buttonsStyling: false, // let Tailwind handle button styling
  }).then((result) => {
    if (result.isConfirmed) {
      this.isLoading = true;
      this.collectionService.deleteOfficer(id).subscribe(
        (data) => {
          this.isLoading = false;
          if (data.status) {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'The Collection Officer has been deleted.',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold',
                confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
              },
              buttonsStyling: false
            });
            this.fetchAllCollectionOfficer(this.page, this.itemsPerPage);
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'There was an error deleting the Collection Officer.',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold',
                confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
              },
              buttonsStyling: false
            });
          }
        },
        () => {
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'There was an error deleting the Collection Officer.',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
              confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
            },
            buttonsStyling: false
          });
        }
      );
    }
  });
}

  editCollectionOfficer(id: number) {
    this.navigatePath(
      `/collection-hub/edit-collection-officers/${id}`
    );
  }

  openPopup(item: any) {
    const showApproveButton = item.status === 'Rejected' || item.status === 'Not Approved';
    const showRejectButton = item.status === 'Approved' || item.status === 'Not Approved';

    // Dynamic message based on status
    let message = '';
    if (item.status === 'Approved') {
      message = 'Are you sure you want to reject this collection officer?';
    } else if (item.status === 'Rejected') {
      message = 'Are you sure you want to approve this collection officer?';
    } else if (item.status === 'Not Approved') {
      message = 'Are you sure you want to approve or reject this collection officer?';
    }

    const tableHtml = `
    <div class=" px-10 py-8 rounded-md bg-white dark:bg-gray-800">
      <h1 class="text-center text-2xl font-bold mb-4 dark:text-white">Officer Name : ${item.firstNameEnglish}</h1>
      <div>
        <p class="text-center dark:text-white">${message}</p>
      </div>
      <div class="flex justify-center mt-4">
        ${showRejectButton ? '<button id="rejectButton" class="bg-red-500 text-white px-6 py-2 rounded-lg mr-2">Reject</button>' : ''}
        ${showApproveButton ? '<button id="approveButton" class="bg-green-500 text-white px-4 py-2 rounded-lg">Approve</button>' : ''}
      </div>
    </div>
  `;

    Swal.fire({
      html: tableHtml,
      showConfirmButton: false,
      width: 'auto',
      background: 'transparent',
      backdrop: 'rgba(0, 0, 0, 0.5)',
      grow: 'row',
      showClass: { popup: 'animate__animated animate__fadeIn' },
      hideClass: { popup: 'animate__animated animate__fadeOut' },
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
      didOpen: () => {
        if (showApproveButton) {
          document
            .getElementById('approveButton')
            ?.addEventListener('click', () => {
              Swal.close();
              this.isPopupVisible = false;
              this.isLoading = true;
              this.collectionService.ChangeStatus(item.id, 'Approved').subscribe(
                (res) => {
                  this.isLoading = false;
                  if (res.status) {
                    Swal.fire({
                      icon: 'success',
                      title: 'Success!',
                      text: 'The Collection Officer was approved successfully.',
                      showConfirmButton: false,
                      timer: 3000,
                      customClass: {
                        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                        title: 'font-semibold',
                      },
                    });
                    this.fetchAllCollectionOfficer(this.page, this.itemsPerPage);
                  } else {
                    Swal.fire({
                      icon: 'error',
                      title: 'Error!',
                      text: 'Something went wrong. Please try again.',
                      showConfirmButton: false,
                      timer: 3000,
                      customClass: {
                        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                        title: 'font-semibold',
                      },
                    });
                  }
                },
                () => {
                  this.isLoading = false;
                  Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'An error occurred while approving. Please try again.',
                    showConfirmButton: false,
                    timer: 3000,
                    customClass: {
                      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                      title: 'font-semibold',
                    },
                  });
                }
              );
            });
        }

        if (showRejectButton) {
          document
            .getElementById('rejectButton')
            ?.addEventListener('click', () => {
              Swal.close();
              this.isPopupVisible = false;
              this.isLoading = true;
              this.collectionService.ChangeStatus(item.id, 'Rejected').subscribe(
                (res) => {
                  this.isLoading = false;
                  if (res.status) {
                    Swal.fire({
                      icon: 'success',
                      title: 'Success!',
                      text: 'The Collection Officer was rejected successfully.',
                      showConfirmButton: false,
                      timer: 3000,
                      customClass: {
                        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                        title: 'font-semibold',
                      },
                    });
                    this.fetchAllCollectionOfficer(this.page, this.itemsPerPage);
                  } else {
                    Swal.fire({
                      icon: 'error',
                      title: 'Error!',
                      text: 'Something went wrong. Please try again.',
                      showConfirmButton: false,
                      timer: 3000,
                      customClass: {
                        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                        title: 'font-semibold',
                      },
                    });
                  }
                },
                () => {
                  this.isLoading = false;
                  Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'An error occurred while rejecting. Please try again.',
                    showConfirmButton: false,
                    timer: 3000,
                    customClass: {
                      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                      title: 'font-semibold',
                    },
                  });
                }
              );
            });
        }
      },
    });
  }

  updateStatus(item: CollectionOfficers, newStatus: string) {
    item.status = newStatus;
    Swal.fire(
     { title: 'Updated!',
     text: `The Collection Officer status has been updated to ${newStatus}.`,
     icon: 'success',
     customClass: {
       popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
       title: 'font-semibold',
     }}
    );
    this.isPopupVisible = false;
  }

  getAllcompany() {
    this.collectionService.getCompanyNames().subscribe((res) => {
      this.companyArr = res;
    });
  }

  onSearch() {
    this.searchNIC = this.searchNIC?.trim() || ''
    console.log('searchNIC', "'", this.searchNIC, "'")
    this.fetchAllCollectionOfficer(this.page, this.itemsPerPage);
  }

  offSearch() {
    this.searchNIC = '';
    this.fetchAllCollectionOfficer(this.page, this.itemsPerPage);
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  viewCollectiveOfficerProfile(id: number) {
    this.router.navigate([
      '/steckholders/action/collective-officer/collective-officer-profile',
      id,
    ]);
  }

  editCloseModel() {
    this.selectedOfficer = null;
    this.selectedCenterId = null;
    this.selectedIrmId = null;
    this.iseditModalOpen = false;
  }

  editModalOpen(role: any) {
    this.selectedOfficer = role;
    this.selectedCenterId = null;
    this.selectedIrmId = null;
    this.iseditModalOpen = true;
  }

  closeDisclaimView() {
    this.showDisclaimView = false;
  }

  handleClaimButtonClick(item: CollectionOfficers) {
    this.selectedOfficer = item;
    console.log('this.selectedOfficer', this.selectedOfficer)
    this.selectOfficerId = item.id;

    if (item.claimStatus === 0) {
      this.selectedCenterId = null; // Reset selection
      this.selectedIrmId = null; // Reset selection
      this.iseditModalOpen = true;
      this.collectionCenterManagerNames = [];
    } else if (item.claimStatus === 1) {
      this.showDisclaimView = true;
      
    }
  }

  confirmDisclaim() {
    this.collectionOfficerService
      .disclaimOfficer(this.selectOfficerId)
      .subscribe(
        () => {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Officer disclaimed successfully!',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
              confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
            },
            
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.reload();
            }
          });
          this.showDisclaimView = false;
        },
        () => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to disclaim User successfully!',
            confirmButtonText: 'Try Again',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
              confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
            },
          });
        }
      );
  }

  claimOfficer() {
    const centerControl = (this as any).selectedCenterIdInput;
    const managerControl = (this as any).selectedIrmIdInput;
  
    if (centerControl) {
      centerControl.control.markAsTouched();
    }
    if (managerControl) {
      managerControl.control.markAsTouched();
    }
  
    if (this.selectedOfficer?.jobRole === 'Collection Officer') {
      // Require both center and manager
      if (!this.selectedCenterId || !this.selectedIrmId) {
        return;
      }
    } else {
      // For other roles, require only center
      if (!this.selectedCenterId) {
        return;
      }
    }

    // Prepare payload - include manager ID if selected
    const payload: any = { centerId: this.selectedCenterId };
    if (this.selectedIrmId) {
      payload.managerId = this.selectedIrmId;
    }

    this.collectionOfficerService
      .claimOfficer(this.selectOfficerId, payload)
      .subscribe(
        () => {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Officer claimed successfully!',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
              confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
            },
          }).then((result) => {
            if (result.isConfirmed) {
              this.iseditModalOpen = false;
              this.selectedCenterId = null;
              this.selectedIrmId = null;
              this.fetchAllCollectionOfficer(this.page, this.itemsPerPage);
            }
          });
        },
        () => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to claim officer!',
            confirmButtonText: 'Try Again',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
              confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
            },
          });
        }
      );
  }

  applyStatusFilters() {
    this.fetchAllCollectionOfficer(this.page, this.itemsPerPage);
  }

  clearStatusFilter() {
    this.selectStatus = '';
    this.fetchAllCollectionOfficer(this.page, this.itemsPerPage);
  }

  getModifiedBy(item: CollectionOfficers): string {
  return item.officerModiyBy || item.adminModifyBy || '--';
}
}

class Company {
  id!: string;
  companyNameEnglish!: string;
}

class CenterName {
  id!: string;
  regCode!: string;
  centerName!: string;
}

class ManagerNames {
  id!: string;
  firstNameEnglish!: string;
  lastNameEnglish!: string;
  empId!: string;
}
