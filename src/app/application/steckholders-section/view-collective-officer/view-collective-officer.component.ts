import { Component } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { DropdownModule } from 'primeng/dropdown';
import {
  HttpClientModule,
  HttpClient,
  HttpHeaders,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CollectionService } from '../../../services/collection.service';
import { environment } from '../../../environment/environment';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { response } from 'express';
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
  collectionOfficers: CollectionOfficers[] = [];
  jobRole: JobRole[] = [
    { id: 1, jobRole: 'Collection Officer' },
    { id: 2, jobRole: 'Collection Center Manager' },
    { id: 3, jobRole: 'Customer Officer' },
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

  selectedCenterId: string | null = null; // Store selected center ID
  selectedIrmId: string | null = null;

  selectCenterStatus: string = '';
  selectStatus: string = '';

  centerStatusOptions = [
    { label: 'Disclaimed', value: 'Disclaimed' },
    { label: 'Claimed', value: 'Claimed' }
  ];

  statusOptions = [
    { label: 'Approved', value: 'Approved' },
    { label: 'Not Approved', value: 'Not Approved' },
    { label: 'Rejected', value: 'Rejected' }
    
  ];

  constructor(
    private router: Router,
    private collectionService: CollectionService,
    public tokenService: TokenService,
    public permissionService: PermissionService,
    private collectionOfficerService: CollectionOfficerService
  ) {}

  fetchAllCollectionOfficer(
    page: number = 1,
    limit: number = this.itemsPerPage,
    centerStatus: string = this.selectCenterStatus,
    status: string = this.selectStatus,
  ) {
    this.isLoading = true;
    this.collectionService
    
      .fetchAllCollectionOfficer(
        page,
        limit,
        centerStatus,
        status,
        this.searchNIC,
        this.statusFilter?.id,
        this.role?.jobRole
      )
      .subscribe(
        (response) => {
          this.isLoading = false;
          console.log(response);

          this.collectionOfficers = response.items;
          this.totalItems = response.total;
          console.log(this.collectionOfficers);
        },
        (error) => {
          console.error('Error fetching ongoing cultivations:', error);
          if (error.status === 401) {
            // Handle unauthorized access (e.g., redirect to login)
          }
        }
      );
  }

  fetchCenterNames() {
    this.collectionService.getCenterNames().subscribe(
      (response) => {
        console.log('this is centers', response);
        this.centerNames = response;
      },
      (error) => {
        console.error('Error fetching center names:', error);
      }
    );
  }

  fetchManagerNames() {
    this.collectionService.getCollectionCenterManagerNames().subscribe(
      (response) => {
        console.log('Hello Manager', response);

        this.collectionCenterManagerNames = response;
      },
      (error) => {
        console.error('Error fetching manager names:', error);
      }
    );
  }

  ngOnInit() {
    this.fetchAllCollectionOfficer(this.page, this.itemsPerPage);
    this.getAllcompany();
    this.fetchCenterNames();
    this.fetchManagerNames();
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllCollectionOfficer(this.page, this.itemsPerPage);
  }

  applyFilters() {
    this.fetchAllCollectionOfficer(this.page, this.itemsPerPage);
  }

  applyCenterStatusFilters() {
    console.log('center', this.selectCenterStatus)
    this.fetchAllCollectionOfficer(this.page, this.itemsPerPage);
  }

  clearCenterStatusFilter() {
    this.selectCenterStatus = '';
    this.fetchAllCollectionOfficer(this.page, this.itemsPerPage);
  }

  deleteCollectionOfficer(id: number) {
    const token = this.tokenService.getToken();
    if (!token) {
      console.error('No token found');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this Collection Officer? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true; // Start loading before making the request

        this.collectionService.deleteOfficer(id).subscribe(
          (data) => {
            this.isLoading = false; // Stop loading after the response

            if (data.status) {
              console.log('Collection Officer deleted successfully');
              Swal.fire(
                'Deleted!',
                'The Collection Officer has been deleted.',
                'success'
              );
              this.fetchAllCollectionOfficer(this.page, this.itemsPerPage);
            } else {
              Swal.fire(
                'Error!',
                'There was an error deleting the Collection Officer.',
                'error'
              );
            }
          },
          (error) => {
            this.isLoading = false; // Stop loading if an error occurs
            console.error('Error deleting officer:', error);
            Swal.fire(
              'Error!',
              'There was an error deleting the Collection Officer.',
              'error'
            );
          }
        );
      }
    });
  }

  editCollectionOfficer(id: number) {
    this.navigatePath(
      `/steckholders/action/collective-officer/personal-edit/${id}`
    );
  }

  openPopup(item: any) {
    this.isPopupVisible = true;

    // HTML structure for the popup
    const tableHtml = `
      <div class=" px-10 py-8 rounded-md bg-white dark:bg-gray-800">
        <h1 class="text-center text-2xl font-bold mb-4 dark:text-white">Officer Name : ${item.firstNameEnglish}</h1>
        <div >
          <p class="text-center dark:text-white">Are you sure you want to approve or reject this collection?</p>
        </div>
        <div class="flex justify-center mt-4">
          <button id="rejectButton" class="bg-red-500 text-white px-6 py-2 rounded-lg mr-2">Reject</button>
          <button id="approveButton" class="bg-green-500 text-white px-4 py-2 rounded-lg">Approve</button>
        </div>
      </div>
    `;

    Swal.fire({
      html: tableHtml,
      showConfirmButton: false,
      width: 'auto',
      background: 'transparent', // Makes the popup background transparent
      backdrop: 'rgba(0, 0, 0, 0.5)', // Optional: Dark semi-transparent backdrop
      grow: 'row', // Optional: Controls popup animation
      showClass: {
        popup: 'animate__animated animate__fadeIn', // Optional: Adds fade-in animation
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOut', // Optional: Adds fade-out animation
      },
      didOpen: () => {
        // Handle the "Approve" button click
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
                    text: 'The collection was approved successfully.',
                    showConfirmButton: false,
                    timer: 3000,
                  });
                  this.fetchAllCollectionOfficer(this.page, this.itemsPerPage);
                } else {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Something went wrong. Please try again.',
                    showConfirmButton: false,
                    timer: 3000,
                  });
                }
              },
              (err) => {
                this.isLoading = false;
                Swal.fire({
                  icon: 'error',
                  title: 'Error!',
                  text: 'An error occurred while approving. Please try again.',
                  showConfirmButton: false,
                  timer: 3000,
                });
              }
            );
          });

        // Handle the "Reject" button click
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
                    text: 'The collection was rejected successfully.',
                    showConfirmButton: false,
                    timer: 3000,
                  });
                  this.fetchAllCollectionOfficer(this.page, this.itemsPerPage);
                } else {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Something went wrong. Please try again.',
                    showConfirmButton: false,
                    timer: 3000,
                  });
                }
              },
              (err) => {
                this.isLoading = false;
                Swal.fire({
                  icon: 'error',
                  title: 'Error!',
                  text: 'An error occurred while rejecting. Please try again.',
                  showConfirmButton: false,
                  timer: 3000,
                });
              }
            );
          });
      },
    });
  }

  updateStatus(item: CollectionOfficers, newStatus: string) {
    item.status = newStatus;
    Swal.fire(
      'Updated!',
      `The Collection Officer status has been updated to ${newStatus}.`,
      'success'
    );
    this.isPopupVisible = false;
  }

  getAllcompany() {
    this.collectionService.getCompanyNames().subscribe((res) => {
      console.log('company:', res);
      this.companyArr = res;
    });
  }

  onSearch() {
    console.log();

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
    this.iseditModalOpen = false;
  }

  editModalOpen(role: any) {
    this.selectedOfficer = role;
    this.iseditModalOpen = true;
  }

  closeDisclaimView() {
    this.showDisclaimView = false;
  }

  handleClaimButtonClick(item: CollectionOfficers) {
    console.log('Hello World', item);

    this.selectedOfficer = item;
    this.selectOfficerId = item.id;
    console.log('select officer', this.selectedOfficer);

    if (item.claimStatus === 0) {
      this.iseditModalOpen = true;
    } else if (item.claimStatus === 1) {
      this.showDisclaimView = true;
    }
  }

  confirmDisclaim() {
    this.collectionOfficerService
      .disclaimOfficer(this.selectOfficerId)
      .subscribe(
        (response) => {
          console.log('Officer ID sent successfully:', response);

          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Officer ID sent successfully!',
            confirmButtonText: 'OK',
          }).then((result) => {
            if (result.isConfirmed) {
              // Refresh the page after the user clicks "OK"
              window.location.reload();
            }
          });

          this.showDisclaimView = false;
        },
        (error) => {
          console.error('Error sending Officer ID:', error);

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to send Officer ID!',
            confirmButtonText: 'Try Again',
          });
        }
      );
  }

  claimOfficer() {
    if (!this.selectedCenterId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please select a center.',
        confirmButtonText: 'OK',
      });
      return;
    }

    const payload = {
      centerId: this.selectedCenterId,
    };

    this.collectionOfficerService
      .claimOfficer(this.selectOfficerId, payload)
      .subscribe(
        (response) => {
          console.log('Officer claimed successfully:', response);

          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Officer claimed successfully!',
            confirmButtonText: 'OK',
          }).then((result) => {
            if (result.isConfirmed) {
              this.iseditModalOpen = false; // Close the modal
              this.fetchAllCollectionOfficer(this.page, this.itemsPerPage); // Refresh the list
            }
          });
        },
        (error) => {
          console.error('Error claiming officer:', error);

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
    this.fetchAllCollectionOfficer(this.page, this.itemsPerPage);
  }

  clearStatusFilter() {
    this.selectStatus = ''
    this.fetchAllCollectionOfficer(this.page, this.itemsPerPage);
  }
}

class Company {
  id!: string;
  companyNameEnglish!: string;
}

class CenterName {
  id!: string;
  regCode!:string;
  centerName!: string;
}

class ManagerNames {
  id!: string;
  firstNameEnglish!: string;
  lastNameEnglish!: string;
}
