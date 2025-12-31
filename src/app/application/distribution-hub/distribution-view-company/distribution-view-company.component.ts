import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DistributionHubService } from '../../../services/distribution-hub/distribution-hub.service';
import Swal from 'sweetalert2';
import { CollectionService } from '../../../services/collection.service';
import { title } from 'process';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-distribution-view-company',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
    FormsModule,
  ],
  templateUrl: './distribution-view-company.component.html',
  styleUrl: './distribution-view-company.component.css',
  providers: [DatePipe],
})
export class DistributionViewCompanyComponent implements OnInit {
  companyId: number | null = null;
  companyName: string | null = null;
  distributionCompanyHeads: DistributionCompanyHead[] = [];

  isLoading = false;

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  hasData: boolean = true;
  searchText: string = '';
  isPopupVisible = false;

  // Add permission flag
  canApproveReject: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    private distributionHubService: DistributionHubService,
    public tokenService: TokenService,
    public permissionService: PermissionService,
    private collectionService: CollectionService
  ) { }

  add(id: number, companyName: string): void {
    this.router.navigate(['/distribution-hub/action/add-distribution-officer', id, companyName]);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.companyId = params['id'] ? +params['id'] : null;
      this.companyName = params['companyName'] ? params['companyName'] : null;
    });
    
    // Check permission
    this.checkPermission();
    
    this.fetchAllCompanyHeads();
  }

  // Method to check permission
  checkPermission(): void {
    this.canApproveReject = 
      this.permissionService.hasPermission('Distribution Hub approved/not approved cch') ||
      this.tokenService.getUserDetails().role === '1';
  }

  // Alternative method approach (if you prefer using a method instead of property)
  hasPermission(): boolean {
    return this.permissionService.hasPermission('Distribution Hub approved/not approved cch') ||
           this.tokenService.getUserDetails().role === '1';
  }

  fetchAllCompanyHeads(
    companyId: number = this.companyId!,
    page: number = 1,
    limit: number = this.itemsPerPage,
    search: string = this.searchText
  ) {
    this.isLoading = true;
    this.distributionHubService
      .getAllDistributionCompanyHeads(companyId, page, limit, search)
      .subscribe(
        (data) => {
          this.isLoading = false;
          this.distributionCompanyHeads = data.items;
          this.distributionCompanyHeads.forEach((head) => {
            head.createdAtFormatted = this.datePipe.transform(
              head.createdAt,
              "yyyy/MM/dd 'at' hh.mm a"
            );
          });
          this.hasData = this.distributionCompanyHeads.length > 0;
          this.totalItems = data.total;
        },
        (error) => {
          console.error('Error:', error); // Add error logging
          if (error.status === 401) {
            this.isLoading = false;
          }
        }
      );
  }

  onSearch() {
    this.fetchAllCompanyHeads(
      this.companyId!,
      this.page,
      this.itemsPerPage,
      this.searchText
    );
  }

  offSearch() {
    this.searchText = '';
    this.fetchAllCompanyHeads(
      this.companyId!,
      this.page,
      this.itemsPerPage,
      this.searchText
    );
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllCompanyHeads(
      this.companyId!,
      this.page,
      this.itemsPerPage,
      this.searchText
    );
  }

  deleteDistributionHead(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you really want to delete this centre head?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.distributionHubService.deleteDistributionHead(id).subscribe({
          next: (response) => {
            this.isLoading = false;
            Swal.fire({
              title: 'Deleted!',
              text: 'Distribution head has been deleted.',
              icon: 'success',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            });
            this.fetchAllCompanyHeads();
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error deleting distribution head:', error);
            Swal.fire({
              title: 'Error!',
              text: 'Failed to delete distribution head.',
              icon: 'error',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            });
          },
        });
      }
    });
  }

  view(id: number, isView: boolean): void {
    if (!id) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Officer ID is missing.',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });
      return;
    }
    this.router.navigate([`/distribution-hub/action/view-head-portal/${id}`], {
      queryParams: { isView }
    });
  }

  edit(id: number): void {
    this.router.navigate([
      '/distribution-hub/action/edit-distribution-officer/',
      id,
    ]);
  }

  openPopup(item: any) {
    // Check permission first
    if (!this.canApproveReject) {
      Swal.fire({
        icon: 'info',
        title: 'Permission Denied',
        text: 'You do not have permission to change approval status.',
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });
      return;
    }

    const showApproveButton = item.status === 'Rejected' || item.status === 'Not Approved';
    const showRejectButton = item.status === 'Approved' || item.status === 'Not Approved';

    const tableHtml = `
        <div class=" px-10 py-8 rounded-md bg-white dark:bg-gray-800">
          <h1 class="text-center text-2xl font-bold mb-4 dark:text-white">Officer Name : ${item.firstNameEnglish}</h1>
          <div>
            <p class="text-center dark:text-white">Are you sure you want to approve or reject this collection officer?</p>
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
        title: 'font-semibold text-lg',
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
                      text: 'The Distributed Center Head was approved successfully.',
                      showConfirmButton: false,
                      timer: 3000,
                      customClass: {
                        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                        title: 'font-semibold text-lg',
                      },
                    });
                    this.fetchAllCompanyHeads();
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
                      text: 'The Distributed Center Head was rejected successfully.',
                      showConfirmButton: false,
                      timer: 3000,
                      customClass: {
                        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                        title: 'font-semibold text-lg',
                      },
                    });
                    this.fetchAllCompanyHeads();
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
                    },
                  });
                }
              );
            });
        }
      },
    });
  }

  trimLeadingSpaces() {
    if (this.searchText && this.searchText.startsWith(' ')) {
      this.searchText = this.searchText.trimStart();
    }
  }
}

class DistributionCompanyHead {
  id!: number;
  empId!: string;
  firstNameEnglish!: string;
  lastNameEnglish!: string;
  email!: string;
  phoneCode01!: string;
  phoneNumber01!: string;
  phoneCode02!: string;
  phoneNumber02!: string;
  createdAt!: Date;
  status!: string;
  createdAtFormatted!: string | null;
  officeModify: string | null = null;
  adminModify: string | null = null;
}