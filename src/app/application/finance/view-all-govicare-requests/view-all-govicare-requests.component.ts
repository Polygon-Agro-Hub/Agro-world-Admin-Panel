import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import Swal from 'sweetalert2';
import { FinanceService, GoviCareRequest, GoviCareRequestDetail, InvestmentOfficer } from '../../../services/finance/finance.service';

@Component({
  selector: 'app-view-all-govicare-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule],
  templateUrl: './view-all-govicare-requests.component.html',
  styleUrl: './view-all-govicare-requests.component.css'
})
export class ViewAllGovicareRequestsComponent implements OnInit {
  isLoading: boolean = false;

  govicareRequests: GoviCareRequest[] = [];
  totalItems: number = 0;

  // Status Filter
  selectStatus: string = '';
  isStatusDropdownOpen: boolean = false;
  statusDropdownOptions: string[] = ['Assigned', 'Not Assigned'];

  // Search
  search: string = '';

  // Details Modal
  showDetailsModal: boolean = false;
  selectedRequest: GoviCareRequestDetail | null = null;

  // Assign Officer Popup
  isAssignPopup: boolean = false;
  isOfficerPopUp: boolean = false;
  isCompletedJobPopup: boolean = false;
  selectedGovicareRequest: GoviCareRequest | null = null;
  assignedOfficerArray: string[] = [];

  // Assign popup state
  selectedOfficerRole: string = '';
  selectedOfficerId: string = '';
  availableOfficers: InvestmentOfficer[] = [];
  selectedOfficerInfo: InvestmentOfficer | null = null;
  isLoadingOfficers: boolean = false;
  isAssigning: boolean = false;
  assignError: string = '';
  currentAssignedOfficer: any = null;

  // Officer Role Options
  officerRoleOptions = [
    { label: 'Field Officer', value: 'Field Officer' },
    { label: 'Chief Field Officer', value: 'Chief Field Officer' },
  ];

  constructor(
    private FinanceService: FinanceService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadGovicareRequests();
  }

  loadGovicareRequests(): void {
    this.isLoading = true;

    const status = this.selectStatus || undefined;

    this.FinanceService
      .getAllGoviCareRequests(status, this.search)
      .subscribe({
        next: (response) => {
          this.govicareRequests = response.data || [];
          this.totalItems = response.count || 0;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading govicare requests:', error);
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
    this.loadGovicareRequests();
  }

  // Search functionality
  applySearch(): void {
    this.loadGovicareRequests();
  }

  clearSearch(): void {
    this.search = '';
    this.loadGovicareRequests();
  }

  // Details Modal Methods
  viewDetails(requestId: string): void {
    this.isLoading = true;
    this.FinanceService.getGoviCareRequestById(requestId).subscribe({
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

  // Officer Assignment Methods
  onAssignStatusClick(request: GoviCareRequest): void {
    // Open assign popup for both Assigned and Not Assigned status
    this.openAssignPopup(request);
  }

  // Open assign popup
  openAssignPopup(request: GoviCareRequest): void {
    this.selectedGovicareRequest = request;
    this.selectedOfficerRole = '';
    this.selectedOfficerId = '';
    this.availableOfficers = [];
    this.selectedOfficerInfo = null;
    this.currentAssignedOfficer = null;
    this.assignError = '';

    // If already assigned, pre-populate the officer role and load officers
    if (request.Status === 'Assigned' && request.empId && request.empId !== '--') {
      // Determine officer role from empId prefix
      if (request.empId.startsWith('FIO')) {
        this.selectedOfficerRole = 'Field Officer';
      } else if (request.empId.startsWith('CFO')) {
        this.selectedOfficerRole = 'Chief Field Officer';
      }

      // Load officers for the district and role
      if (this.selectedOfficerRole) {
        const district = request.district;
        this.loadOfficersByDistrictAndRole(district, this.selectedOfficerRole, request.empId);
      }
    }

    this.isAssignPopup = true;
  }

  // Close assign popup
  assignPopupClose(): void {
    this.isAssignPopup = false;
    this.selectedGovicareRequest = null;
    this.selectedOfficerRole = '';
    this.selectedOfficerId = '';
    this.availableOfficers = [];
    this.selectedOfficerInfo = null;
    this.currentAssignedOfficer = null;
    this.assignError = '';
  }

  // When officer role changes
  onOfficerRoleChange(): void {
    this.selectedOfficerId = '';
    this.selectedOfficerInfo = null;
    this.availableOfficers = [];

    if (this.selectedOfficerRole && this.selectedGovicareRequest) {
      // Get district from the selected request
      const district = this.selectedGovicareRequest.district;
      // Get currently assigned empId if exists
      const currentEmpId = this.selectedGovicareRequest.Status === 'Assigned'
        ? this.selectedGovicareRequest.empId
        : undefined;
      this.loadOfficersByDistrictAndRole(district, this.selectedOfficerRole, currentEmpId);
    }
  }

  // Load officers by district and role
  loadOfficersByDistrictAndRole(district: string, role: string, currentEmpId?: string): void {
    this.isLoadingOfficers = true;
    this.assignError = '';

    this.FinanceService
      .getOfficersByDistrictAndRoleForInvestment(district, role)
      .subscribe({
        next: (response) => {
          this.isLoadingOfficers = false;
          if (response.status && response.data) {
            this.availableOfficers = response.data.map(
              (officer: InvestmentOfficer) => ({
                ...officer,
                displayName: `${officer.empId
                  } - ${officer.firstName} ${officer.lastName}`,
              })
            );

            // If there's a currently assigned officer, select them
            if (currentEmpId) {
              const currentOfficer = this.availableOfficers.find(
                (officer) => officer.empId === currentEmpId
              );
              if (currentOfficer) {
                this.selectedOfficerId = currentOfficer.empId;
                this.selectedOfficerInfo = currentOfficer;
                this.currentAssignedOfficer = currentOfficer;
              }
            }

            if (this.availableOfficers.length === 0) {
              this.assignError = `No ${role}s available in ${district} district`;
            }
          } else {
            this.availableOfficers = [];
            this.assignError = response.message || 'No officers found';
          }
        },
        error: (error) => {
          this.isLoadingOfficers = false;
          console.error('Error loading officers:', error);
          this.availableOfficers = [];
          this.assignError = 'Failed to load officers. Please try again.';
        },
      });
  }

  // When officer is selected
  onOfficerSelected(): void {
    if (this.selectedOfficerId) {
      const officer = this.availableOfficers.find(
        (officer) => officer.empId === this.selectedOfficerId
      );
      this.selectedOfficerInfo = officer || null;
      this.currentAssignedOfficer = officer;
    } else {
      this.selectedOfficerInfo = null;
    }
  }

  // Assign officer to request
  assignOfficer(): void {
    if (
      !this.selectedGovicareRequest ||
      !this.selectedOfficerId ||
      !this.selectedOfficerInfo
    ) {
      this.assignError = 'Please select an officer';
      return;
    }

    // Check if trying to assign the same officer
    if (this.selectedGovicareRequest.Status === 'Assigned' &&
      this.selectedGovicareRequest.empId === this.selectedOfficerId) {
      this.assignError = 'This officer is already assigned to this request';
      return;
    }

    this.isAssigning = true;
    this.assignError = '';

    const officerId = this.selectedOfficerInfo.id;
    const requestId = this.selectedGovicareRequest.No;

    this.FinanceService
      .assignOfficerToInvestmentRequest(requestId, officerId)
      .subscribe({
        next: (response) => {
          this.isAssigning = false;
          if (response.status) {
            this.assignPopupClose();
            this.loadGovicareRequests(); // Refresh the list

            const actionText = this.selectedGovicareRequest?.Status === 'Assigned'
              ? 'updated'
              : 'assigned';

            Swal.fire({
              title: 'Success',
              text: response.message || `Officer ${actionText} successfully`,
              icon: 'success',
              customClass: {
                popup:
                  'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            });
          } else {
            this.assignError = response.message || 'Failed to assign officer';
          }
        },
        error: (error) => {
          this.isAssigning = false;
          console.error('Error assigning officer:', error);
          this.assignError = 'An error occurred while assigning officer';
        },
      });
  }

  // Officer popup methods
  officerPopUpOpen(request: GoviCareRequest): void {
    if (request.Officer_ID && request.Officer_ID !== '--') {
      const officerInfo = [
        `Officer ID: ${request.Officer_ID}`,
        `Status: ${request.Status}`,
        `Request ID: ${request.Request_ID}`,
      ];

      this.assignedOfficerArray = officerInfo;
    } else {
      this.assignedOfficerArray = ['No officer assigned'];
    }
    this.isOfficerPopUp = true;
  }

  officerPopUpClose(): void {
    this.isOfficerPopUp = false;
    this.assignedOfficerArray = [];
  }

  // Open image in new window
  openImage(imageUrl: string): void {
    if (imageUrl) {
      window.open(imageUrl, '_blank', 'width=800,height=600,resizable=yes,scrollbars=yes');
    }
  }

  // Format currency
  formatCurrency(amount: number): string {
    return 'Rs. ' + amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  closeDropdowns(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-status-dropdown-container')) {
      this.isStatusDropdownOpen = false;
    }
  }

  // Get status class for styling
  getStatusClass(status: string): string {
    return status === 'Assigned'
      ? 'bg-[#BBFFC6] text-green-800 dark:bg-bg-[#BBFFC6] dark:text-green-800'
      : 'bg-[#F8FFA6] text-yellow-800 dark:bg-bg-[#F8FFA6] dark:text-yellow-800';
  }

  // Format number
  formatNumber(num: number): string {
    return num.toString();
  }

  // Get assign class
  getAssignClass(status: string): string {
    return status === 'Assigned'
      ? 'bg-[#BBFFC6] text-[#308233]'
      : 'bg-[#F8FFA6] text-[#A8A100]';
  }

  // Get assign text
  getAssignText(status: string): string {
    return status;
  }
}