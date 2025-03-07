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

interface CollectionOfficers {
  id: number;
  image: string;
  firstNameEnglish: string;
  lastNameEnglish: string;
  phoneNumber01: string;
  companyNameEnglish: string;
  empId: string;
  nic: string;
  status: string;
  claimStatus: number;
  jobRole: string;
  created_at: string;
  centerName: string;
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
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  searchNIC: string = '';
  isPopupVisible = false;
  status!: Company[];
  statusFilter: any = '';

  companyArr: Company[] = [];
  isLoading = false;

  constructor(
    private router: Router,
    private collectionService: CollectionService,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) {}

  fetchAllCollectionOfficer(
    page: number = 1,
    limit: number = this.itemsPerPage
  ) {
    this.isLoading = true;
    this.collectionService
      .fetchAllCollectionOfficer(
        page,
        limit,
        this.searchNIC,
        this.statusFilter?.id
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

  ngOnInit() {
    this.fetchAllCollectionOfficer(this.page, this.itemsPerPage);
    this.getAllcompany();
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllCollectionOfficer(this.page, this.itemsPerPage);
  }

  applyFilters() {
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
      <div class="container mx-auto">
        <h1 class="text-center text-2xl font-bold mb-4">Officer Name : ${item.firstNameEnglish}</h1>
        <div >
          <p class="text-center">Are you sure you want to approve or reject this collection?</p>
        </div>
        <div class="flex justify-center mt-4">
          <button id="rejectButton" class="bg-red-500 text-white px-6 py-2 rounded-lg mr-2">Reject</button>
          <button id="approveButton" class="bg-green-500 text-white px-4 py-2 rounded-lg">Approve</button>
        </div>
      </div>
    `;

    Swal.fire({
      html: tableHtml,
      showConfirmButton: false, // Hide default confirm button
      width: 'auto',
      didOpen: () => {
        // Handle the "Approve" button click
        document
          .getElementById('approveButton')
          ?.addEventListener('click', () => {
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
}

class Company {
  id!: string;
  companyNameEnglish!: string;
}
