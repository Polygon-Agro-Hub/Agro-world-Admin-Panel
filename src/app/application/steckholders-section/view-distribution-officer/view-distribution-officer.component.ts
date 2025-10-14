import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { ActivatedRoute, Router } from '@angular/router';
import { DistributionHubService } from '../../../services/distribution-hub/distribution-hub.service';
import Swal from 'sweetalert2';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { CollectionOfficerService } from '../../../services/collection-officer/collection-officer.service';

interface DistributionOfficers {
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
}

interface JobRole {
  id: number;
  jobRole: string;
}

@Component({
  selector: 'app-view-distribution-officer',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    HttpClientModule,
    NgxPaginationModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './view-distribution-officer.component.html',
  styleUrl: './view-distribution-officer.component.css'
})
export class ViewDistributionOfficerComponent {
  distributionOfficers: DistributionOfficers[] = [];
  jobRole: JobRole[] = [
    { id: 1, jobRole: 'Distribution Officer' },
    { id: 2, jobRole: 'Distribution Centre Manager' },
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
  selectedOfficer: DistributionOfficers | null = null;
  selectedCenterId: string | null = null;
  selectedIrmId: string | null = null;
  selectCenterStatus: string = '';
  selectStatus: string = '';
  irmValidationError: boolean = false;


  // Add this line
  centerValidationError: boolean = false;
  hasData: boolean = false;

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

  constructor(
    private router: Router,
    private distributionService: DistributionHubService,
    public tokenService: TokenService,
    public permissionService: PermissionService,
    private collectionOfficerService: CollectionOfficerService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.fetchAllDistributionOfficer(this.page, this.itemsPerPage);
    this.getAllcompany();
    this.fetchDistributionCenterNames();
    // this.route.queryParams.subscribe((params) => {
    //   this.centerId = params['id'] ? +params['id'] : null;
    // });

    // if(this.centerId != null){
    //   console.log(this.centerId);
    // }
  }

  fetchAllDistributionOfficer(
    page: number = 1,
    limit: number = this.itemsPerPage,
    centerStatus: string = this.selectCenterStatus,
    status: string = this.selectStatus
  ) {
    this.isLoading = true;
    this.route.queryParams.subscribe((params) => {
      this.centerId = params['id'] ? +params['id'] : null;
    });


    if (this.centerId === null) {

      this.distributionService
        .fetchAllDistributionOfficers(
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
            this.distributionOfficers = response.items;
            this.totalItems = response.total;
          },
          (error) => {
            this.isLoading = false;
          }
        );

    } else {

      this.distributionService
        .fetchAllDistributionOfficercenter(
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
            this.distributionOfficers = response.items;
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

  fetchDistributionCenterNames() {
    this.distributionService.getDistributionCenterNames().subscribe(
      (response) => {
        this.centerNames = response;
      },
      (error) => { }
    );
  }

  fetchDistributionManagerNames() {
    this.distributionService.getDistributionCenterManagerNames(this.selectedCenterId).subscribe(
      (response) => {
        this.collectionCenterManagerNames = response;
      },
      (error) => { }
    );
  }



  onPageChange(event: number) {
    this.page = event;
    this.fetchAllDistributionOfficer(this.page, this.itemsPerPage);
  }

  applyFilters() {
    this.fetchAllDistributionOfficer(this.page, this.itemsPerPage);
  }

  applyCenterStatusFilters() {
    this.fetchAllDistributionOfficer(this.page, this.itemsPerPage);
  }

  clearCenterStatusFilter() {
    this.selectCenterStatus = '';
    this.fetchAllDistributionOfficer(this.page, this.itemsPerPage);
  }

  deleteDistributionOfficer(id: number) {
    const token = this.tokenService.getToken();
    if (!token) return;

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this Distribution Officer? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
        htmlContainer: 'text-left',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.distributionService.deleteDistributionOfficer(id).subscribe(
          (data) => {
            this.isLoading = false;
            if (data.status) {
              Swal.fire({
                title: 'Deleted!',
                text: 'Successfully deleted Distribution officer',
                icon: 'success',
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold text-lg',
                  htmlContainer: 'text-left',
                },
              });
              this.fetchAllDistributionOfficer(this.page, this.itemsPerPage);
            } else {
              Swal.fire({
                title: 'Error!',
                text: 'There was an error deleting the Distribution Officer.',
                icon: 'error',
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold text-lg',
                  htmlContainer: 'text-left',
                },
              });
            }
          },
          () => {
            this.isLoading = false;
            Swal.fire({
              title: 'Error!',
              text: 'There was an error deleting the Collection Officer.',
              icon: 'error',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
                htmlContainer: 'text-left',
              },
            });
          }
        );
      }
    });
  }

  // editCollectionOfficer(id: number) {
  //   this.navigatePath(
  //     `/steckholders/action/collective-officer/personal-edit/${id}`
  //   );
  // }

  openPopup(item: any) {
    const showApproveButton = item.status === 'Rejected' || item.status === 'Not Approved';
    const showRejectButton = item.status === 'Approved' || item.status === 'Not Approved';

    // Dynamic message based on status
    let message = '';
    if (item.status === 'Approved') {
      message = 'Are you sure you want to reject this distribution officer?';
    } else if (item.status === 'Rejected') {
      message = 'Are you sure you want to approve this distribution officer?';
    } else if (item.status === 'Not Approved') {
      message = 'Are you sure you want to approve or reject this distribution officer?';
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
      didOpen: () => {
        if (showApproveButton) {
          document
            .getElementById('approveButton')
            ?.addEventListener('click', () => {
              Swal.close();
              this.isPopupVisible = false;
              this.isLoading = true;
              this.distributionService.ChangeStatus(item.id, 'Approved').subscribe(
                (res) => {
                  this.isLoading = false;
                  if (res.status) {
                    Swal.fire({
                      icon: 'success',
                      title: 'Success!',
                      text: 'The Distribution Officer was approved successfully.',
                      showConfirmButton: false,
                      timer: 3000,
                      customClass: {
                        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                        title: 'font-semibold text-lg',
                        htmlContainer: 'text-left',
                      },
                    });
                    this.fetchAllDistributionOfficer(this.page, this.itemsPerPage);
                  } else {
                    Swal.fire({
                      icon: 'error',
                      title: 'Error!',
                      text: 'Something went wrong. Please try again.',
                      showConfirmButton: false,
                      timer: 3000,
                      customClass: {
                        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                        title: 'font-semibold text-lg',
                        htmlContainer: 'text-left',
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
                      title: 'font-semibold text-lg',
                      htmlContainer: 'text-left',
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
              this.distributionService.ChangeStatus(item.id, 'Rejected').subscribe(
                (res) => {
                  this.isLoading = false;
                  if (res.status) {
                    Swal.fire({
                      icon: 'success',
                      title: 'Success!',
                      text: 'The Distribution Officer was rejected successfully.',
                      showConfirmButton: false,
                      timer: 3000,
                      customClass: {
                        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                        title: 'font-semibold text-lg',
                        htmlContainer: 'text-left',
                      },
                    });
                    this.fetchAllDistributionOfficer(this.page, this.itemsPerPage);
                  } else {
                    Swal.fire({
                      icon: 'error',
                      title: 'Error!',
                      text: 'Something went wrong. Please try again.',
                      showConfirmButton: false,
                      timer: 3000,
                      customClass: {
                        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                        title: 'font-semibold text-lg',
                        htmlContainer: 'text-left',
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
                      title: 'font-semibold text-lg',
                      htmlContainer: 'text-left',
                    },
                  });
                }
              );
            });
        }
      },
    });
  }

  updateStatus(item: DistributionOfficers, newStatus: string) {
    item.status = newStatus;
    Swal.fire(
      'Updated!',
      `The Distribution Officer status has been updated to ${newStatus}.`,
      'success'
    );
    this.isPopupVisible = false;
  }

  getAllcompany() {
    this.distributionService.getCompanyNames().subscribe((res) => {
      this.companyArr = res;
    });
  }

  onSearch() {
    this.searchNIC = this.searchNIC?.trim() || ''
    console.log('searchNIC', "'", this.searchNIC, "'")
    this.fetchAllDistributionOfficer(this.page, this.itemsPerPage);
  }

  offSearch() {
    this.searchNIC = '';
    this.fetchAllDistributionOfficer(this.page, this.itemsPerPage);
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

  handleClaimButtonClick(item: DistributionOfficers) {
    this.selectedOfficer = item;
    this.selectOfficerId = item.id;

    if (item.claimStatus === 0) {
      this.selectedCenterId = null; // Reset selection
      this.selectedIrmId = null; // Reset selection
      this.iseditModalOpen = true;
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
          });
        }
      );
  }



  claimOfficer() {
    // Reset validation flags
    this.centerValidationError = false;
    this.irmValidationError = false;

    // Validate center
    if (!this.selectedCenterId) {
      this.centerValidationError = true;
    }

    // Validate manager
    if (!this.selectedIrmId && this.selectedOfficer?.jobRole !== 'Distribution Centre Manager') {
      this.irmValidationError = true;
    }

    // Stop if any validation failed
    if (this.centerValidationError || this.irmValidationError) {
      return;
    }

    // Payload
    const data = {
      centerId: this.selectedCenterId,
      irmId: this.selectedOfficer?.jobRole === 'Distribution Centre Manager' ? null : this.selectedIrmId,
      id: this.selectOfficerId
    };

    this.distributionService.claimDistributedOfficer(data).subscribe(
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
            this.fetchAllDistributionOfficer(this.page, this.itemsPerPage);
          }
        });
      },
      () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to claim officer!',
          confirmButtonText: 'Try Again',
        });
      }
    );
  }


  applyStatusFilters() {
    this.fetchAllDistributionOfficer(this.page, this.itemsPerPage);
  }

  clearStatusFilter() {
    this.selectStatus = '';
    this.fetchAllDistributionOfficer(this.page, this.itemsPerPage);
  }

  updateDistributionOfficer(id: number) {
    this.navigatePath(
      `/steckholders/action/view-distribution-officers/update-distribution-officer/${id}`
    );
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
  labelName!:string
}
