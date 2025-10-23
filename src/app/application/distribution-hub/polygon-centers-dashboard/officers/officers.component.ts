import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router } from '@angular/router';
import { DestributionService } from '../../../../services/destribution-service/destribution-service.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { DistributionHubService } from '../../../../services/distribution-hub/distribution-hub.service';

@Component({
  selector: 'app-officers',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    CalendarModule,
    DropdownModule,
    NgxPaginationModule,
    FormsModule,
  ],
  templateUrl: './officers.component.html',
  styleUrl: './officers.component.css',
})
export class OfficersComponent implements OnChanges {
  @Input() centerObj!: CenterDetails;
  isLoading = false;
  hasData: boolean = false;
  officersArr!: Officeres[];
  officerCount: number = 0;
  selectRole: string = '';
  selectStatus: string = '';
  searchText: string = '';
  isPopupVisible: boolean = false;

  statusOptions = [
    { label: 'Approved', value: 'Approved' },
    { label: 'Not Approved', value: 'Not Approved' },
    { label: 'Rejected', value: 'Rejected' },
  ];

  roleOptions = [
    { label: 'Distribution Officer', value: 'Distribution Officer' },
    {
      label: 'Distribution Centre Manager',
      value: 'Distribution Centre Manager',
    },
  ];

  constructor(
    private router: Router,
    private DestributionSrv: DestributionService,
    private distributionService: DistributionHubService,

  ) { }

  ngOnChanges(): void {
    this.fetchData();
  }

  fetchData() {
    this.DestributionSrv.getDistributedCenterOfficers(
      this.centerObj.centerId,
      this.selectRole,
      this.selectStatus,
      this.searchText
    ).subscribe((res) => {
      // this.targetArr = res.data;
      // this.targetCount = res.data.length || 0;
      console.log('Distributed Center Officers', res);
      this.officersArr = res.data;
      this.officerCount = res.data?.length || 0;
      this.hasData = this.officerCount > 0;
    });
  }

  changeStatus() {
    this.fetchData();
  }

  changeRole() {
    this.fetchData();
  }

  onSearch() {
    this.fetchData();
  }

  offSearch() {
    this.searchText = '';
    this.fetchData();
  }

  editDistributionOfficer(id: number) {
    this.router.navigate([
      `/distribution-hub/action/view-polygon-centers/edit-distribution-officer/${id}`,
    ]);
  }

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
                    this.fetchData();
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
                    this.fetchData();
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
}

interface CenterDetails {
  centerId: number;
  centerName: string;
  centerRegCode: string;
}

class Officeres {
  id!: number;
  firstNameEnglish!: string;
  lastNameEnglish!: string;
  jobRole!: string;
  empId!: string;
  status!: string;
  phoneCode01!: string;
  phoneNumber01!: string;
  nic!: string;
}
