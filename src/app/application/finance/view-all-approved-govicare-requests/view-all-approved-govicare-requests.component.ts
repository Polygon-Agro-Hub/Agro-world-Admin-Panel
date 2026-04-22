import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import {
  FinanceService,
  GoviCareRequest,
  GoviCareRequestDetail,
} from '../../../services/finance/finance.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-view-all-approved-govicare-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule],
  templateUrl: './view-all-approved-govicare-requests.component.html',
  styleUrl: './view-all-approved-govicare-requests.component.css',
})
export class ViewAllApprovedGovicareRequestsComponent implements OnInit {
  isLoading: boolean = false;

  govicareRequests: GoviCareRequest[] = [];
  totalItems: number = 0;

  // Status Filter
  selectStatus: string = '';
  isStatusDropdownOpen: boolean = false;
  statusDropdownOptions: string[] = ['Draft', 'Published'];

  selectShares: string = '';
  sharesDropdownOptions: string[] = ['Divided', 'Not Divided'];

  // Search
  search: string = '';
  hasSearched: boolean = false;

  // Details Modal
  showDetailsModal: boolean = false;
  selectedRequest: GoviCareRequestDetail | null = null;
  selectedShares!: GoviCareRequest;

  // Publish Confirmation Popup
  isPublishPopup: boolean = false;
  selectedRequestForPublish: GoviCareRequest | null = null;
  isPublishing: boolean = false;
  isSharePopup: boolean = false;

  // Edit Shares Modal
  isEditSharesModal: boolean = false;
  editNumShares: number = 0;
  editShareValue: number = 0;
  editMinShares: number = 0;
  editMaxShares: number = 0;
  isSavingShares: boolean = false;

  constructor(
    private financeService: FinanceService,
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService,
  ) {}

  ngOnInit(): void {
    this.loadGovicareRequests();
  }

  loadGovicareRequests(): void {
    this.isLoading = true;

    const status = this.selectStatus || undefined;
    const shares = this.selectShares || undefined;

    this.financeService
      .getAllApprovedGoviCareRequests(status, shares, this.search)
      .subscribe({
        next: (response) => {
          this.govicareRequests = response.data || [];
          this.totalItems = response.count || 0;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading approved govicare requests:', error);
          this.isLoading = false;
        },
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

  filterShares(): void {
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
      },
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
        confirmButton: 'px-8 py-2 rounded-lg font-medium',
      },
      width: '500px',
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
              text:
                response.message ||
                'Project published successfully to GoViCapital',
              icon: 'success',
              customClass: {
                popup:
                  'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            });
          } else {
            Swal.fire({
              title: 'Error',
              text: response.message || 'Failed to publish project',
              icon: 'error',
              customClass: {
                popup:
                  'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
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
              popup:
                'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
        },
      });
  }

  openImage(imageUrl: string): void {
    if (imageUrl) {
      window.open(
        imageUrl,
        '_blank',
        'width=800,height=600,resizable=yes,scrollbars=yes',
      );
    }
  }

  formatCurrency(amount: number | string): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return (
      'Rs. ' +
      numAmount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  @HostListener('document:click', ['$event'])
  closeDropdowns(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-status-dropdown-container')) {
      this.isStatusDropdownOpen = false;
    }
  }

  // Updated format methods with leading zeros
  formatNumber(num: number): string {
    return num.toString().padStart(3, '0');
  }

  formatTotalItems(count: number): string {
    return count.toString().padStart(2, '0');
  }

  ViewShares(shares: GoviCareRequest) {
    this.selectedShares = shares;
    this.isSharePopup = true;
  }

  divideFunc(num1: number, num2: number): number {
    if (num2 === 0) {
      console.error('Division by zero error');
      return 0; // or throw an error
    }
    const result = num1 / num2;
    return parseFloat(result.toFixed(2));
  }

  auditResults(requestId: number) {
    const tree = this.router.createUrlTree([
      'finance/action/finance-govicapital/view-Govicare-approved-requests/edit-audit-personal-infor',
      String(requestId),
    ]);

    const url = this.router.serializeUrl(tree);
    window.open(window.location.origin + '/admin' + url, '_blank');
  }

  // Calculate total extent in Acres
  calculateExtentInAcres(
    extent: number = 0,
    extentH: number = 0,
    extentP: number = 0,
  ): string {
    const hectaresToAcres = extentH * 2.471;
    const perchesToAcres = extentP * 0.00625;
    const totalAcres = extent + hectaresToAcres + perchesToAcres;

    return totalAcres.toFixed(4) + ' Acres';
  }

  openEditSharesModal() {
    this.editNumShares = this.selectedShares.approvedDetails?.defineShares || 0;
    this.editMinShares = this.selectedShares.approvedDetails?.minShare || 0;
    this.editMaxShares = this.selectedShares.approvedDetails?.maxShare || 0;
    this.onEditSharesChange(); // Calculate share value

    this.isSharePopup = false; // Close view popup
    this.isEditSharesModal = true; // Open edit popup
  }

  closeEditSharesModal() {
    this.isEditSharesModal = false;
  }

  onEditSharesChange() {
    if (
      this.editNumShares > 0 &&
      this.selectedShares.approvedDetails?.totValue
    ) {
      this.editShareValue =
        this.selectedShares.approvedDetails.totValue / this.editNumShares;
    } else {
      this.editShareValue = 0;
    }
  }

  updateShares(form: any) {
    if (
      form.invalid ||
      this.editNumShares <= 0 ||
      this.editMinShares <= 0 ||
      this.editMaxShares <= 0
    ) {
      return;
    }

    if (this.editMaxShares < this.editMinShares) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Maximum shares cannot be less than minimum shares',
        icon: 'error',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });
      return;
    }

    this.isSavingShares = true;

    const updateData = {
      id: this.selectedShares.No,
      jobId: this.selectedShares.Request_ID,
      totalValue: this.selectedShares.approvedDetails?.totValue,
      numShares: this.editNumShares,
      shareValue: this.editShareValue,
      minimumShare: this.editMinShares,
      maximumShare: this.editMaxShares,
      devideType: 'Edit',
    };

    this.financeService.devideSharesRequest(updateData).subscribe({
      next: (response) => {
        this.isSavingShares = false;
        if (response.status) {
          Swal.fire({
            title: 'Success',
            text: 'Shares updated successfully',
            icon: 'success',
            customClass: {
              popup:
                'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
          this.closeEditSharesModal();
          this.loadGovicareRequests();
        } else {
          Swal.fire({
            title: 'Error',
            text: response.message || 'Failed to update shares',
            icon: 'error',
            customClass: {
              popup:
                'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
        }
      },
      error: (error) => {
        this.isSavingShares = false;
        console.error('Error updating shares:', error);
        Swal.fire({
          title: 'Error',
          text: 'An error occurred while updating shares',
          icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
      },
    });
  }

  // Helper methods for input validation
  allowIntegerOnly(event: KeyboardEvent) {
    const allowedKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    if (!allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  allowDecimalOnly(event: KeyboardEvent) {
    const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'];
    if (!allowedKeys.includes(event.key)) {
      event.preventDefault();
      return;
    }
    if (
      event.key === '.' &&
      (event.target as HTMLInputElement).value.includes('.')
    ) {
      event.preventDefault();
    }
  }

  preventNegative(
    field: 'numShares' | 'minimumShare' | 'maximumShare',
    event: Event,
  ) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);

    if (value < 0) {
      input.value = '';
      if (field === 'numShares') this.editNumShares = null!;
      else if (field === 'minimumShare') this.editMinShares = null!;
      else if (field === 'maximumShare') this.editMaxShares = null!;
    }
  }
}
