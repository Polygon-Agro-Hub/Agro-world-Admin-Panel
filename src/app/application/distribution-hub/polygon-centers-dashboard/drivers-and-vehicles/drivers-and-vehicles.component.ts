import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { DistributionHubService } from '../../../../services/distribution-hub/distribution-hub.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

interface DriverVehicle {
  officerId: number;
  empId: string;
  firstName: string;
  lastName: string;
  vehicleType: string;
  capacity: number;
  phone: string;
  phoneNumber02: string;
  nic: string;
  status: string;
  distributedCenterId: number;
  centerName: string;
  regCode: string;
}

@Component({
  selector: 'app-drivers-and-vehicles',
  standalone: true,
  imports: [
    DropdownModule,
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './drivers-and-vehicles.component.html',
  styleUrl: './drivers-and-vehicles.component.css',
})
export class DriversAndVehiclesComponent implements OnInit {
  isLoading = false;
  hasData = true;

  page = 1;
  limit = 10;
  totalItems = 0;

  // Center ID - from route params
  distributedCompanyCenterId: number = 0;

  selectStatus: string | null = null;
  selectVehicleType: string | null = null;
  searchText: string = '';

  regCode: string = '';
  centerName: string = '';

  fetchDriversAndVehicles() {
    this.isLoading = true;

    const cleanSearchText = this.searchText?.trim() || '';

    this.distributionHubService
      .getDistributedDriversAndVehicles(
        this.distributedCompanyCenterId,
        this.page,
        this.limit,
        this.selectStatus || undefined,
        this.selectVehicleType || undefined,
        cleanSearchText || undefined
      )
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.officersArr = res.data || [];
            this.totalItems = res.total || 0;
            this.hasData = this.officersArr.length > 0;

            if (this.officersArr.length > 0) {
              this.regCode = this.officersArr[0].regCode || '';
              this.centerName = this.officersArr[0].centerName || '';
            }
          } else {
            this.officersArr = [];
            this.totalItems = 0;
            this.hasData = false;
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching drivers and vehicles:', err);
          this.officersArr = [];
          this.totalItems = 0;
          this.hasData = false;
          this.isLoading = false;
        },
      });
  }

  officersArr: DriverVehicle[] = [];
  officerCount = 0;

  constructor(
    private distributionHubService: DistributionHubService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  statusOptions = [
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Not Approved', value: 'Not Approved' },
  ];

  vehicleTypeOptions = [
    { label: 'Dimo Batta', value: 'Dimo Batta' },
    { label: 'Mahindra Bolero', value: 'Mahindra Bollero' },
    { label: 'Three Wheeler', value: 'Three Wheeler' },
  ];

  ngOnInit(): void {
    // Get center ID from route params
    this.route.params.subscribe(params => {
      this.distributedCompanyCenterId = +params['id']; // Convert to number
      this.fetchDriversAndVehicles();
    });
  }

  // Pagination handler
  onPageChange(pageNumber: number): void {
    this.page = pageNumber;
    this.fetchDriversAndVehicles();
  }

  changeStatus(): void {
    console.log('Status changed to:', this.selectStatus);
    this.page = 1;
    this.fetchDriversAndVehicles();
  }

  changeVehicleType(): void {
    console.log('Vehicle type changed to:', this.selectVehicleType);
    this.page = 1;
    this.fetchDriversAndVehicles();
  }

  // Search handler
  onSearch(): void {
    console.log('Search text:', this.searchText);
    this.page = 1;
    this.fetchDriversAndVehicles();
  }

  // Clear search
  offSearch(): void {
    this.searchText = '';
    this.page = 1;
    this.fetchDriversAndVehicles();
  }

  getRowNumber(index: number): number {
    return (this.page - 1) * this.limit + index + 1;
  }

  openPopup(item: DriverVehicle): void {
    const showApproveButton =
      item.status === 'Rejected' || item.status === 'Not Approved';
    const showRejectButton =
      item.status === 'Approved' || item.status === 'Not Approved';

    let message = '';
    if (item.status === 'Approved') {
      message = 'Are you sure you want to reject this driver?';
    } else if (item.status === 'Rejected') {
      message = 'Are you sure you want to approve this driver?';
    } else if (item.status === 'Not Approved') {
      message = 'Are you sure you want to approve or reject this driver?';
    }

    const tableHtml = `
      <div class="px-10 py-8 rounded-md bg-white dark:bg-gray-800">
        <h1 class="text-center text-2xl font-bold mb-4 dark:text-white">Driver Name: ${
          item.firstName
        } ${item.lastName}</h1>
        <div>
          <p class="text-center dark:text-white">${message}</p>
        </div>
        <div class="flex justify-center mt-4">
          ${
            showRejectButton
              ? '<button id="rejectButton" class="bg-red-500 text-white px-6 py-2 rounded-lg mr-2">Reject</button>'
              : ''
          }
          ${
            showApproveButton
              ? '<button id="approveButton" class="bg-green-500 text-white px-4 py-2 rounded-lg">Approve</button>'
              : ''
          }
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
              this.isLoading = true;
              this.distributionHubService
                .ChangeStatus(item.officerId, 'Approved')
                .subscribe(
                  (res) => {
                    this.isLoading = false;
                    if (res.status) {
                      Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: 'The driver was approved successfully.',
                        showConfirmButton: false,
                        timer: 3000,
                        customClass: {
                          popup:
                            'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                          title: 'font-semibold text-lg',
                          htmlContainer: 'text-left',
                        },
                      });
                      this.fetchDriversAndVehicles();
                    } else {
                      Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: 'Something went wrong. Please try again.',
                        showConfirmButton: false,
                        timer: 3000,
                        customClass: {
                          popup:
                            'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
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
                        popup:
                          'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
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
              this.isLoading = true;
              this.distributionHubService
                .ChangeStatus(item.officerId, 'Rejected')
                .subscribe(
                  (res) => {
                    this.isLoading = false;
                    if (res.status) {
                      Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: 'The driver was rejected successfully.',
                        showConfirmButton: false,
                        timer: 3000,
                        customClass: {
                          popup:
                            'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                          title: 'font-semibold text-lg',
                          htmlContainer: 'text-left',
                        },
                      });
                      this.fetchDriversAndVehicles();
                    } else {
                      Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: 'Something went wrong. Please try again.',
                        showConfirmButton: false,
                        timer: 3000,
                        customClass: {
                          popup:
                            'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
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
                        popup:
                          'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
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

  navigateProfile(id: number): void {
    this.router.navigate([
      `/distribution-hub/action/view-polygon-centers/distributed-officer-profile/${id}`,
    ]);
  }

  editDistributionOfficer(id: number): void {
    this.router.navigate([
      `/distribution-hub/action/view-polygon-centers/edit-distribution-officer/${id}`,
    ]);
  }

  deleteDistributionOfficer(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this driver? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'No, Cancel',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
        htmlContainer: 'text-left',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.distributionHubService.deleteDistributionOfficer(id).subscribe(
          (data) => {
            this.isLoading = false;
            if (data.status) {
              Swal.fire({
                title: 'Deleted!',
                text: 'Successfully deleted driver',
                icon: 'success',
                customClass: {
                  popup:
                    'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold text-lg',
                  htmlContainer: 'text-left',
                },
              });
              this.fetchDriversAndVehicles();
            } else {
              Swal.fire({
                title: 'Error!',
                text: 'There was an error deleting the driver.',
                icon: 'error',
                customClass: {
                  popup:
                    'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
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
              text: 'There was an error deleting the driver.',
              icon: 'error',
              customClass: {
                popup:
                  'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
                htmlContainer: 'text-left',
              },
            });
          }
        );
      }
    });
  }
}
