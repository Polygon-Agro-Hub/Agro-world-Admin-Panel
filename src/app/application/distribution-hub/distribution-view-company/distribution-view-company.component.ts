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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    private distributionHubService: DistributionHubService,
    private collectionService: CollectionService
  ) {}

  add(id: number, companyName: string): void {
    this.router.navigate(['/distribution-hub/action/add-distribution-officer', id, companyName]);
  }

  ngOnInit(): void {
    console.log('ngonitni')
    this.route.queryParams.subscribe((params) => {
      this.companyId = params['id'] ? +params['id'] : null;
      this.companyName = params['companyName'] ? params['companyName'] : null;
      console.log('companyId', this.companyId);
    });
    this.fetchAllCompanyHeads();
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
          console.log('API Response:', data);
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
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.distributionHubService.deleteDistributionHead(id).subscribe({
          next: (response) => {
            this.isLoading = false;
            Swal.fire(
              'Deleted!',
              'Distribution head has been deleted.',
              'success'
            );
            this.fetchAllCompanyHeads();
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error deleting distribution head:', error);
            Swal.fire('Error!', 'Failed to delete distribution head.', 'error');
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
                        text: 'The Collection officer was approved successfully.',
                        showConfirmButton: false,
                        timer: 3000,
                      });
                      this.fetchAllCompanyHeads();
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
                  () => {
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
                        text: 'The Collection officer was rejected successfully.',
                        showConfirmButton: false,
                        timer: 3000,
                      });
                      this.fetchAllCompanyHeads();
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
                  () => {
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
          }
        },
      });
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
}
