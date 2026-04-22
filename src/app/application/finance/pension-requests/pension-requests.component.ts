import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TokenService } from '../../../services/token/services/token.service';
import Swal from 'sweetalert2';
import {
  FarmerPensionService,
  PensionRequest,
  PensionRequestDetail,
} from '../../../services/finance/farmer-pension.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pension-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './pension-requests.component.html',
  styleUrl: './pension-requests.component.css',
})
export class PensionRequestsComponent implements OnInit {
  isLoading = false;
  search: string = '';

  pensionRequests: PensionRequest[] = [];
  totalItems: number = 0;

  // Details Modal
  showDetailsModal: boolean = false;
  selectedRequest: PensionRequestDetail | null = null;

  // Approve/Reject Popup
  showApproveRejectModal: boolean = false;
  selectedRequestForAction: PensionRequest | null = null;
  actionNotes: string = '';
  isProcessingAction: boolean = false;

  // Logged in user info
  currentUserId: string | null = null;
  currentUserName: string | null = null;

  constructor(
    private farmerPensionService: FarmerPensionService,
    public tokenService: TokenService,
    public permissionService: PermissionService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getCurrentUserInfo();
    this.loadPensionRequests();
  }

  // Get current user info from token service
  getCurrentUserInfo(): void {
    // Try different methods to get user info based on your token service implementation
    const userDetails = this.tokenService.getUserDetails();

    if (userDetails) {
      // Check for different possible property names
      this.currentUserId =
        userDetails.id || userDetails.userId || userDetails.sub || null;
      this.currentUserName =
        userDetails.username ||
        userDetails.name ||
        userDetails.userName ||
        null;
    }

    // If still not found, try decoding the token directly
    if (!this.currentUserId) {
      const token = this.tokenService.getToken();
      if (token) {
        // Try to decode JWT token (if it's a JWT)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          this.currentUserId =
            payload.id || payload.userId || payload.sub || null;
          this.currentUserName =
            payload.username || payload.name || payload.userName || null;
        } catch (error) {
          console.warn('Could not decode JWT token:', error);
        }
      }
    }
  }

  loadPensionRequests(): void {
    this.isLoading = true;

    this.farmerPensionService
      .getAllPensionRequests(undefined, this.search)
      .subscribe({
        next: (response) => {
          this.pensionRequests = this.sortByStatus(response.data || []);
          this.totalItems = response.count || 0;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading pension requests:', error);
          this.isLoading = false;
        },
      });
  }

  applySearch(): void {
    this.loadPensionRequests();
  }

  clearSearch(): void {
    this.search = '';
    this.loadPensionRequests();
  }

  // Image opening method
  openImage(imageUrl: string): void {
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    }
  }

  // Details Modal Methods
  viewDetails(requestId: number): void {
    this.isLoading = true;
    this.farmerPensionService
      .getPensionRequestById(requestId.toString())
      .subscribe({
        next: (response) => {
          if (response.status && response.data) {
            this.selectedRequest = response.data;
            this.showDetailsModal = true;
          } else {
            Swal.fire({
              title: 'Error',
              text: response.message || 'Failed to load request details',
              icon: 'error',
              customClass: {
                popup:
                  'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            });
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading request details:', error);
          this.isLoading = false;
          Swal.fire({
            title: 'Error',
            text: 'An error occurred while loading request details',
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

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedRequest = null;
  }

  // Approve/Reject Methods
  openApproveRejectModal(request: PensionRequest): void {
    this.selectedRequestForAction = request;
    this.actionNotes = '';
    this.isProcessingAction = false;
    this.showApproveRejectModal = true;

    // Log which user is trying to approve/reject
  }

  closeApproveRejectModal(): void {
    this.showApproveRejectModal = false;
    this.selectedRequestForAction = null;
    this.actionNotes = '';
    this.isProcessingAction = false;
  }

  approveRequest(): void {
    this.processStatusUpdate('Approved');
  }

  rejectRequest(): void {
    this.processStatusUpdate('Rejected');
  }

  private processStatusUpdate(status: string): void {
    if (!this.selectedRequestForAction) return;

    // Check if user is logged in
    if (!this.currentUserId) {
      Swal.fire({
        title: 'Authentication Error',
        text: 'You must be logged in to perform this action',
        icon: 'error',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });
      return;
    }

    this.isProcessingAction = true;

    // Pass userId as parameter
    this.farmerPensionService
      .updatePensionRequestStatus(
        this.selectedRequestForAction.Request_ID.toString(),
        status,
        this.currentUserId, // Pass userId here
      )
      .subscribe({
        next: (response) => {
          this.isProcessingAction = false;
          if (response.status) {
            this.closeApproveRejectModal();
            this.loadPensionRequests(); // Refresh the list

            Swal.fire({
              title: 'Success',
              text:
                response.message ||
                `Request ${status.toLowerCase()} successfully`,
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
              text:
                response.message || `Failed to ${status.toLowerCase()} request`,
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
          this.isProcessingAction = false;
          console.error('Error updating request status:', error);
          Swal.fire({
            title: 'Error',
            text: 'An error occurred while processing the request',
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

  // Get status class for styling
  getStatusClass(status: string): string {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'To Review':
      default:
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    }
  }

  // Sort pension requests by status: To Review first, then Rejected
  sortByStatus(requests: PensionRequest[]): PensionRequest[] {
    const statusOrder: { [key: string]: number } = {
      'To Review': 1,
      'Rejected': 2,
    };

    return requests.sort((a, b) => {
      const orderA = statusOrder[a.reqStatus] || 999;
      const orderB = statusOrder[b.reqStatus] || 999;
      return orderA - orderB;
    });
  }

  // Format NIC for display (add spaces for readability)
  formatNIC(nic: string): string {
  if (!nic) return '';
  return nic; // Return the NIC as-is without any formatting
}

  // Format date for display with full month name
formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',  // Changed from 'short' to 'long' for full month name
    day: 'numeric',
  });
}

  // Add this function to your component class (you can place it near formatNIC and formatDate methods)
  calculateAge(dob: string | null | undefined): string {
    if (!dob) return '--';

    const birthDate = new Date(dob);
    const today = new Date();

    // Check if date is valid
    if (isNaN(birthDate.getTime())) return '--';

    // Use UTC dates to avoid timezone issues
    const dobYear = birthDate.getUTCFullYear();
    const dobMonth = birthDate.getUTCMonth();
    const dobDay = birthDate.getUTCDate();

    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();

    let years = todayYear - dobYear;
    let months = todayMonth - dobMonth;

    // Adjust if birthday hasn't occurred yet this year
    if (months < 0 || (months === 0 && todayDay < dobDay)) {
      years--;
      months = months < 0 ? months + 12 : 11;
    }

    // Adjust if day hasn't occurred yet this month
    if (todayDay < dobDay && months > 0) {
      months--;
    }

    // Ensure non-negative values
    years = Math.max(years, 0);
    months = Math.max(months, 0);

    // Build age string
    let ageString = '';

    if (years > 0) {
      ageString += `${years} ${years === 1 ? 'Year' : 'Years'}`;
    }

    // Only show months if months > 0
    if (months > 0) {
      ageString += `${ageString ? ', ' : ''}${months} ${months === 1 ? 'Month' : 'Months'}`;
    }

    // If both are 0, show 0 Year
    if (!ageString) {
      ageString = '0 Year';
    }

    return ageString;
  }

  openReviewRequest(request: PensionRequest): void {
    // Get the NIC from the current request
    const id = request.User_ID;

    if (!id) {
      console.error('ID not found in request');
      return;
    }
    this.router.navigate([`/finance/action/cultivation-history/${id}`], {
      queryParams: { nic: request.NIC },
    });
  }

  formatTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  formatDateLikeImage(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    });
  }

  openViewDocuments(request: PensionRequest): void {
    // Use Request_ID instead of User_ID
    const id = request.Request_ID;

    if (!id) {
      console.error('Request_ID not found in request');
      return;
    }

    this.router.navigate(
      [`/finance/action/pension-requests-view-documents/${id}`],
      {
        queryParams: { nic: request.NIC },
      },
    );
  }
}
