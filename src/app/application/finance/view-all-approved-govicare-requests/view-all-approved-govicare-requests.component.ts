import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FinanceService, GoviCareRequest, GoviCareRequestDetail } from '../../../services/finance/finance.service';

@Component({
  selector: 'app-view-all-approved-govicare-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './view-all-approved-govicare-requests.component.html',
  styleUrl: './view-all-approved-govicare-requests.component.css'
})
export class ViewAllApprovedGovicareRequestsComponent implements OnInit {
  isLoading: boolean = false;

  govicareRequests: GoviCareRequest[] = [];
  totalItems: number = 0;

  // Status Filter
  selectStatus: string = '';
  isStatusDropdownOpen: boolean = false;
  statusDropdownOptions: string[] = ['Draft', 'Published'];

  // Search
  search: string = '';
  hasSearched: boolean = false;

  // Details Modal
  showDetailsModal: boolean = false;
  selectedRequest: GoviCareRequestDetail | null = null;

  // Publish Confirmation Popup
  isPublishPopup: boolean = false;
  selectedRequestForPublish: GoviCareRequest | null = null;
  isPublishing: boolean = false;

  constructor(
    private financeService: FinanceService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadGovicareRequests();
  }

  loadGovicareRequests(): void {
    this.isLoading = true;

    const status = this.selectStatus || undefined;

    this.financeService
      .getAllApprovedGoviCareRequests(status, this.search)
      .subscribe({
        next: (response) => {
          this.govicareRequests = response.data || [];
          this.totalItems = response.count || 0;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading approved govicare requests:', error);
          this.isLoading = false;
        }
      });
  }

  // Status Filter Methods
  toggleStatusDropdown(): void {
    this.isStatusDropdownOpen = !this.isStatusDropdownOpen;
  }

  selectStatusOption(option: string): void {
    this.selectStatus = option;
    this.isStatusDropdownOpen = false;
    this.filterStatus();
  }

  filterStatus(): void {
    this.loadGovicareRequests();
  }

  cancelStatus(event: Event): void {
    event.stopPropagation();
    this.selectStatus = '';
    this.isStatusDropdownOpen = false;
    this.hasSearched = false;
    this.loadGovicareRequests();
  }

  // Search functionality
  applySearch(): void {
    if (this.search.trim()) {
      this.hasSearched = true;
    }
    this.loadGovicareRequests();
  }

  clearSearch(): void {
    this.search = '';
    this.hasSearched = false;
    this.loadGovicareRequests();
  }

  // Details Modal Methods
  viewDetails(requestId: string): void {
    this.isLoading = true;
    this.financeService.getGoviCareRequestById(requestId).subscribe({
      next: (response) => {
        this.selectedRequest = response.data;
        this.showDetailsModal = true;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading request details:', error);
        this.isLoading = false;
      }
    });
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedRequest = null;
  }

  // Status Click Handler
  onStatusClick(request: GoviCareRequest): void {
    if (request.publishStatus === 'Published') {
      this.showCannotChangePopup(request);
    } else if (request.publishStatus === 'Draft') {
      this.openPublishPopup(request);
    }
  }

  showCannotChangePopup(request: GoviCareRequest): void {
    Swal.fire({
      html: `
      <div style="text-align: center; padding: 20px;">
        <h2 class="request-id-text" style="font-size: 1.5rem; font-weight: 600; margin-bottom: 20px; color: #1f2937;">
          Request ID : ${request.Request_ID}
        </h2>
        <p style="color: #ef4444; font-size: 1.125rem; font-weight: 600; margin-bottom: 15px;">
          Please Note :
        </p>
        <p class="description-text" style="color: #374151; font-size: 1rem; line-height: 1.6;">
          Since, this project already has been published to the GoViCapital, you are not able change the status.
        </p>
      </div>
    `,
      showCancelButton: false,
      confirmButtonText: 'Close',
      confirmButtonColor: '#6B7280',
      customClass: {
        popup: 'bg-white dark:bg-tileBlack rounded-lg shadow-2xl',
        confirmButton: 'px-8 py-2 rounded-lg font-medium'
      },
      width: '500px'
    });
  }

  openPublishPopup(request: GoviCareRequest): void {
    this.selectedRequestForPublish = request;
    this.isPublishPopup = true;
  }

  closePublishPopup(): void {
    this.isPublishPopup = false;
    this.selectedRequestForPublish = null;
  }

  confirmPublish(): void {
    if (!this.selectedRequestForPublish) return;

    this.isPublishing = true;

    this.financeService
      .updateGoviCareRequestPublishStatus(this.selectedRequestForPublish.No)
      .subscribe({
        next: (response) => {
          this.isPublishing = false;
          if (response.status) {
            this.closePublishPopup();
            this.loadGovicareRequests();

            Swal.fire({
              title: 'Success',
              text: response.message || 'Project published successfully to GoViCapital',
              icon: 'success',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            });
          } else {
            Swal.fire({
              title: 'Error',
              text: response.message || 'Failed to publish project',
              icon: 'error',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            });
          }
        },
        error: (error) => {
          this.isPublishing = false;
          console.error('Error publishing request:', error);
          Swal.fire({
            title: 'Error',
            text: 'An error occurred while publishing the project',
            icon: 'error',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
        }
      });
  }

  openImage(imageUrl: string): void {
    if (imageUrl) {
      window.open(imageUrl, '_blank', 'width=800,height=600,resizable=yes,scrollbars=yes');
    }
  }

  formatCurrency(amount: number): string {
    return 'Rs. ' + amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  @HostListener('document:click', ['$event'])
  closeDropdowns(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-status-dropdown-container')) {
      this.isStatusDropdownOpen = false;
    }
  }

  getStatusClass(status: string): string {
    return status === 'Published'
      ? 'bg-[#BBFFC6] text-[#308233]'
      : 'bg-[#D1D5DB] text-[#4B5563]';
  }

  // Updated format methods with leading zeros
  formatNumber(num: number): string {
    return num.toString().padStart(3, '0');
  }

  formatTotalItems(count: number): string {
    return count.toString().padStart(2, '0');
  }
}