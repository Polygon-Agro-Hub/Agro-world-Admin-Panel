import { Component, ViewChild, OnInit } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { DropdownModule } from 'primeng/dropdown';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, NgModel } from '@angular/forms';
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
  adminModifyBy: string;
  regCode: string;
}

interface JobRole {
  id: number;
  jobRole: string;
}

@Component({
  selector: 'app-view-driver',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    HttpClientModule,
    NgxPaginationModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './view-driver.component.html',
  styleUrl: './view-driver.component.css'
})
export class ViewDriverComponent implements OnInit {
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
  cId: number | null = null;

  centerStatusOptions = [
    { label: 'Disclaimed', value: 'Disclaimed' },
    { label: 'Claimed', value: 'Claimed' },
  ];

  statusOptions = [
    { label: 'Approved', value: 'Approved' },
    { label: 'Not Approved', value: 'Not Approved' },
    { label: 'Rejected', value: 'Rejected' },
  ];

  centerOptions: CenterOptions[] = [];

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

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['Cname']) {
        this.Cname = params['Cname'];
      }
    });

    this.fetchAllDrivers();
    this.getAllcompany();
    this.fetchCenterNames();
    console.log('role', this.tokenService.getUserDetails().role);
  }

  fetchAllDrivers(
    page: number = 1,
    limit: number = this.itemsPerPage,
    centerStatus: string = this.selectCenterStatus,
    status: string = this.selectStatus,
    searchNIC: string = this.searchNIC,
    centerId: number | null = this.cId
  ) {
    this.isLoading = true;
    this.collectionService
      .getAllDrivers(
        page,
        limit,
        centerStatus,
        status,
        searchNIC,
        centerId
      )
      .subscribe(
        (response) => {
          this.isLoading = false;
          this.hasData = response.total > 0;
          this.collectionOfficers = response.items;
          this.totalItems = response.total;
        },
        (error) => {
          this.isLoading = false;
          this.hasData = false;
        }
      );
  }

  back(): void {
    if (this.centerId != null) {
      history.back()
    } else {
      this.router.navigate(['steckholders/action']);
    }
  }

  fetchCenterNames() {
    this.isLoading = true;
    this.collectionService.getDistributionCenterNames().subscribe(
      (response: CenterName[]) => {
        this.isLoading = false;
        this.centerNames = response;

        this.centerOptions = response.map(item => ({
          label: `${item.regCode} - ${item.centerName}`,
          value: item.id
        }));
      },
      (error) => { }
    );
  }

  onCenterChange() {
    if (this.selectedCenterId) {
      const numericCenterId = parseInt(this.selectedCenterId);
      this.fetchManagerNames(numericCenterId);
    } else {
      this.collectionCenterManagerNames = [];
    }
  }

  fetchManagerNames(centerId: number) {
    this.isLoading = true;
    this.collectionService.getDistributionCenterManagerNames(centerId).subscribe(
      (response) => {
        this.isLoading = false;
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

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllDrivers(
      this.page,
      this.itemsPerPage,
      this.selectCenterStatus,
      this.selectStatus,
      this.searchNIC,
      this.cId
    );
  }

  applyCenterFilters() {
    this.page = 1;
    this.fetchAllDrivers(
      this.page,
      this.itemsPerPage,
      this.selectCenterStatus,
      this.selectStatus,
      this.searchNIC,
      this.cId
    );
  }

  applyCenterStatusFilters() {
    this.page = 1;
    this.fetchAllDrivers(
      this.page,
      this.itemsPerPage,
      this.selectCenterStatus,
      this.selectStatus,
      this.searchNIC,
      this.cId
    );
  }

  clearCenterStatusFilter() {
    this.selectCenterStatus = '';
    this.page = 1;
    this.fetchAllDrivers(
      this.page,
      this.itemsPerPage,
      this.selectCenterStatus,
      this.selectStatus,
      this.searchNIC,
      this.cId
    );
  }

  deleteCollectionOfficer(id: number) {
    const token = this.tokenService.getToken();
    if (!token) return;

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this Driver? This action cannot be undone.',
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
      buttonsStyling: false,
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
                text: 'The Driver has been deleted.',
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold',
                  confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
                },
                buttonsStyling: false
              });
              this.fetchAllDrivers(
                this.page,
                this.itemsPerPage,
                this.selectCenterStatus,
                this.selectStatus,
                this.searchNIC,
                this.cId
              );
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'There was an error deleting the Driver.',
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
              text: 'There was an error deleting the Driver.',
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

  openPopup(item: any) {
    const showApproveButton = item.status === 'Rejected' || item.status === 'Not Approved';
    const showRejectButton = item.status === 'Approved' || item.status === 'Not Approved';

    let message = '';
    if (item.status === 'Approved') {
      message = 'Are you sure you want to reject this driver?';
    } else if (item.status === 'Rejected') {
      message = 'Are you sure you want to approve this driver?';
    } else if (item.status === 'Not Approved') {
      message = 'Are you sure you want to approve or reject this driver?';
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
                      text: 'The Driver was approved successfully.',
                      showConfirmButton: false,
                      timer: 3000,
                      customClass: {
                        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                        title: 'font-semibold',
                      },
                    });
                    this.fetchAllDrivers(
                      this.page,
                      this.itemsPerPage,
                      this.selectCenterStatus,
                      this.selectStatus,
                      this.searchNIC,
                      this.cId
                    );
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
                      text: 'The Driver was rejected successfully.',
                      showConfirmButton: false,
                      timer: 3000,
                      customClass: {
                        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                        title: 'font-semibold',
                      },
                    });
                    this.fetchAllDrivers(
                      this.page,
                      this.itemsPerPage,
                      this.selectCenterStatus,
                      this.selectStatus,
                      this.searchNIC,
                      this.cId
                    );
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
    Swal.fire({
      title: 'Updated!',
      text: `The Collection Officer status has been updated to ${newStatus}.`,
      icon: 'success',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      }
    });
    this.isPopupVisible = false;
  }

  getAllcompany() {
    this.collectionService.getCompanyNames().subscribe((res) => {
      this.companyArr = res;
    });
  }

  onSearch() {
    this.searchNIC = this.searchNIC?.trim() || '';
    this.page = 1;
    this.fetchAllDrivers(
      this.page,
      this.itemsPerPage,
      this.selectCenterStatus,
      this.selectStatus,
      this.searchNIC,
      this.cId
    );
  }

  offSearch() {
    this.searchNIC = '';
    this.page = 1;
    this.fetchAllDrivers(
      this.page,
      this.itemsPerPage,
      this.selectCenterStatus,
      this.selectStatus,
      this.searchNIC,
      this.cId
    );
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  viewDriverProfile(id: number) {
    this.router.navigate([
      '/steckholders/action/drivers/preview-driver',
      id,
    ]);
  }

  editDriver(id: number) {
    this.router.navigate([
      '/steckholders/action/view-distribution-officers/update-distribution-officer',
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
    this.selectOfficerId = item.id;

    if (item.claimStatus === 0) {
      this.selectedCenterId = null;
      this.selectedIrmId = null;
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
            text: 'Driver disclaimed successfully!',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
              confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
            },

          }).then((result) => {
            if (result.isConfirmed) {
              this.fetchAllDrivers(
                this.page,
                this.itemsPerPage,
                this.selectCenterStatus,
                this.selectStatus,
                this.searchNIC,
                this.cId
              );
            }
          });
          this.showDisclaimView = false;
        },
        () => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to disclaim driver successfully!',
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

    if (this.selectedOfficer?.jobRole === 'Driver') {
      if (!this.selectedCenterId || !this.selectedIrmId) {
        return;
      }
    } else {
      if (!this.selectedCenterId) {
        return;
      }
    }

    const payload: any = { centerId: this.selectedCenterId };
    if (this.selectedIrmId) {
      payload.managerId = this.selectedIrmId;
    }

    this.collectionService
      .claimDriver(this.selectOfficerId, payload)
      .subscribe(
        () => {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Driver claimed successfully!',
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
              this.fetchAllDrivers(
                this.page,
                this.itemsPerPage,
                this.selectCenterStatus,
                this.selectStatus,
                this.searchNIC,
                this.cId
              );
            }
          });
        },
        () => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to claim driver!',
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
    this.page = 1;
    this.fetchAllDrivers(
      this.page,
      this.itemsPerPage,
      this.selectCenterStatus,
      this.selectStatus,
      this.searchNIC,
      this.cId
    );
  }

  clearStatusFilter() {
    this.selectStatus = '';
    this.page = 1;
    this.fetchAllDrivers(
      this.page,
      this.itemsPerPage,
      this.selectCenterStatus,
      this.selectStatus,
      this.searchNIC,
      this.cId
    );
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
  displayLabel?: string;
}

class CenterOptions {
  label!: string;
  value!: string;
}