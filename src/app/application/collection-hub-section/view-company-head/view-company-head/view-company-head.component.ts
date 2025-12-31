import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';
import { CollectionCenterService } from '../../../../services/collection-center/collection-center.service';
import { CollectionService } from '../../../../services/collection.service';
import { PermissionService } from '../../../../services/roles-permission/permission.service';
import { TokenService } from '../../../../services/token/services/token.service';

@Component({
  selector: 'app-view-company-head',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
    FormsModule,
  ],
  templateUrl: './view-company-head.component.html',
  styleUrl: './view-company-head.component.css',
  providers: [DatePipe],
})
export class ViewCompanyHeadComponent implements OnInit {
  companyId: number | null = null;
  companyName: string | null = null;
  companyHead: CompanyHead[] = [];

  isLoading = false;

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  hasData: boolean = true;
  searchText: string = '';
  isPopupVisible = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private companyService: CollectionCenterService,
    private datePipe: DatePipe,
    private collectionService: CollectionService,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.companyId = params['id'] ? +params['id'] : null;
      this.companyName = params['companyName'] ? params['companyName'] : null;
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
    this.companyService
      .getAllCompanyHeads(companyId, page, limit, search)
      .subscribe(
        (data) => {
          this.isLoading = false;
          this.companyHead = data.items;
          this.companyHead.forEach((head) => {
            head.createdAtFormatted = this.datePipe.transform(
              head.createdAt,
              "yyyy/MM/dd 'at' hh.mm a"
            );
          });
          this.hasData = this.companyHead.length > 0;
          this.totalItems = data.total;
        },
        (error) => {
          if (error.status === 401) {
            this.isLoading = false;
          }
        }
      );
  }

  editCompanyHead(id: number) {
    this.navigatePath(`/collection-hub/edit-center-head/${id}`);
  }

  viewCompanyHead(id: number) {
    this.router.navigate(
      [`/collection-hub/view-center-head/${id}`]
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

  Back(): void {
    this.router.navigate(['/collection-hub/manage-company']);
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  onSearch() {
    if (this.searchText) {
      this.searchText = this.searchText.replace(/^\s+/, '');
    }

    this.page = 1; 
    this.fetchAllCompanyHeads(
      this.companyId!,
      this.page,
      this.itemsPerPage,
      this.searchText
    );
  }


  offSearch() {
    this.searchText = '';
    this.page = 1; 
    this.fetchAllCompanyHeads(
      this.companyId!,
      this.page,
      this.itemsPerPage,
      this.searchText
    );
  }

  handleSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  deleteCompanyHead(id: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this centre head? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-white dark:bg-[#363636] text-[#534E4E] dark:text-textDark',
        title: 'font-semibold text-lg',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.companyService.deleteCompanyHead(id).subscribe(
          (data: any) => {
            if (data) {
              Swal.fire({
                title: 'Deleted!',
                text: 'The Centre Head has been deleted.',
                icon: 'success',
                customClass: {
                  popup: 'bg-white dark:bg-[#363636] text-[#534E4E] dark:text-textDark',
                  title: 'font-semibold text-lg',
                },
              });
              this.fetchAllCompanyHeads();
            }
          },
          (error) => {
            Swal.fire({
              title: 'Error!',
              text: 'There was an error deleting the Centre Head.',
              icon: 'error',
              customClass: {
                popup: 'bg-white dark:bg-[#363636] text-[#534E4E] dark:text-textDark',
                title: 'font-semibold text-lg',
              },
            });
          }
        );
      }
    });
  }

  openPopup(item: any) {
  const showApproveButton = item.status === 'Rejected' || item.status === 'Not Approved';
  const showRejectButton = item.status === 'Approved' || item.status === 'Not Approved';

  const tableHtml = `
    <div class="px-10 py-8 rounded-md bg-white dark:bg-gray-800">
      <h1 class="text-center text-2xl font-bold mb-4 dark:text-white">Officer Name : ${item.firstNameEnglish}</h1>
      <div>
        ${item.status === 'Not Approved' 
          ? '<p class="text-center dark:text-white">Are you sure you want to approve or reject this collection Centre Head ?</p>'
          : showRejectButton 
            ? '<p class="text-center dark:text-white">Are you sure you want to reject this collection Centre Head ?</p>'
            : showApproveButton 
              ? '<p class="text-center dark:text-white">Are you sure you want to approve this collection Centre Head ?</p>'
              : ''
        }
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
      popup: 'bg-white dark:bg-[#363636] text-[#534E4E] dark:text-textDark',
      title: 'font-semibold text-lg',
    },
    didOpen: () => {
      if (showApproveButton) {
        document
          .getElementById('approveButton')
          ?.addEventListener('click', () => {
            // Close the original popup and directly approve
            Swal.close();
            this.isPopupVisible = false;
            this.isLoading = true;
            
            // Directly proceed with approval without confirmation
            this.collectionService.ChangeStatus(item.id, 'Approved').subscribe(
              (res) => {
                this.isLoading = false;
                if (res.status) {
                  Swal.fire({
                    icon: 'success',
                    title: 'Approved!',
                    text: 'The Collection Centre Head was approved successfully.',
                    showConfirmButton: false,
                    timer: 3000,
                    customClass: {
                      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                      title: 'font-semibold text-lg',
                      htmlContainer: 'text-left',
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
                      popup: 'bg-white dark:bg-[#363636] text-[#534E4E] dark:text-textDark',
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
                    popup: 'bg-white dark:bg-[#363636] text-[#534E4E] dark:text-textDark',
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
            // Close the original popup and directly reject
            Swal.close();
            this.isPopupVisible = false;
            this.isLoading = true;
            
            // Directly proceed with rejection without confirmation
            this.collectionService.ChangeStatus(item.id, 'Rejected').subscribe(
              (res) => {
                this.isLoading = false;
                if (res.status) {
                  Swal.fire({
                    icon: 'success',
                    title: 'Rejected!',
                    text: 'The Collection Centre Head was rejected successfully.',
                    showConfirmButton: false,
                    timer: 3000,
                    customClass: {
                      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                      title: 'font-semibold text-lg',
                      htmlContainer: 'text-left',
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
                      popup: 'bg-white dark:bg-[#363636] text-[#534E4E] dark:text-textDark',
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
                    popup: 'bg-white dark:bg-[#363636] text-[#534E4E] dark:text-textDark',
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

}

class CompanyHead {
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