import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FarmerPensionService,
  PensionRequestDetail,
} from '../../../services/finance/farmer-pension.service';
import { TokenService } from '../../../services/token/services/token.service';
import Swal from 'sweetalert2';

import { ViewDocumentImageComponent } from '../../../components/finance-component/view-document-image/view-document-image.component';
import { PermissionService } from '../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-pension-requests-view-documents',
  standalone: true,
  imports: [LoadingSpinnerComponent, CommonModule, ViewDocumentImageComponent],
  templateUrl: './pension-requests-view-documents.component.html',
  styleUrl: './pension-requests-view-documents.component.css',
})
export class PensionRequestsViewDocumentsComponent implements OnInit {
  isLoading = false;
  selectedRequest: PensionRequestDetail | null = null;
  isVisible = false;
  errorMessage: string = '';
  currentRequestId: string = '';

  // For processing actions
  isProcessingAction: boolean = false;
  currentUserId: string | null = null;
  currentUserName: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private farmerPensionService: FarmerPensionService,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) { }

  ngOnInit(): void {
    this.getCurrentUserInfo();

    // Get ID from route params
    this.route.params.subscribe((params) => {
      const requestId = params['id'];

      if (requestId) {
        this.currentRequestId = requestId;
        this.isVisible = true;
        this.viewDetails(requestId);
      } else {
        console.error('No request ID found in route params');
        this.errorMessage = 'No request ID provided';
      }
    });
  }

  // Get current user info from token service
  getCurrentUserInfo(): void {
    const userDetails = this.tokenService.getUserDetails();

    if (userDetails) {
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

  // Getter for safe access to request data
  get hasRequestData(): boolean {
    return this.selectedRequest !== null;
  }

  // Safe getters for farmer info
  get farmerName(): string {
    return this.selectedRequest?.Farmer_Name || '';
  }

  get farmerNIC(): string {
    return this.selectedRequest?.NIC || '';
  }

  // Safe getters for images from request data
  get nicFrontImage(): string {
    return this.selectedRequest?.NIC_Front_Image || '';
  }

  get nicBackImage(): string {
    return this.selectedRequest?.NIC_Back_Image || '';
  }

  get successorNicFrontImage(): string {
    return this.selectedRequest?.Successor_NIC_Front_Image || '';
  }

  get successorNicBackImage(): string {
    return this.selectedRequest?.Successor_NIC_Back_Image || '';
  }

  get successor_birthCrtFront(): string {
    return this.selectedRequest?.Successor_birthCrtFront || '';
  }

  get successor_birthCrtBack(): string {
    return this.selectedRequest?.Successor_birthCrtBack || '';
  }
  

  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  // Method to open the view with request ID
  openViewDocuments(requestId: string): void {
    this.isVisible = true;
    this.viewDetails(requestId);
  }

  viewDetails(requestId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.farmerPensionService.getPensionRequestById(requestId).subscribe({
      next: (response) => {
        if (response && response.status && response.data) {
          this.selectedRequest = response.data;
        } else {
          console.error('Invalid response structure:', response);
          this.errorMessage = 'Invalid data received from server';
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading request details:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error details:', error.error);

        if (error.status === 404) {
          this.errorMessage = `Pension request not found (ID: ${requestId})`;
        } else if (error.status === 401) {
          this.errorMessage = 'Unauthorized. Please login again.';
        } else {
          this.errorMessage = `Error loading data: ${error.message || 'Unknown error'}`;
        }

        this.isLoading = false;
      },
    });
  }

  onApproveClick(): void {
    Swal.fire({
      title: 'Are you sure you want to Approve this request?',
      showCancelButton: true,
      confirmButtonText: 'Yes, Approve',
      cancelButtonText: 'No, Go Back',
      confirmButtonColor: '#3980C0',
      cancelButtonColor: '#6B7280',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white rounded-xl',
        title: 'font-semibold text-lg',
        actions: 'flex-row-reverse justify-start',
        confirmButton: 'rounded-lg', // Add rounded corners to confirm button
        cancelButton: 'rounded-lg',   // Add rounded corners to cancel button
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.approveRequest();
      }
    });
  }

  onRejectClick(): void {
    Swal.fire({
      title: 'Are you sure you want to Reject this request?',
      showCancelButton: true,
      confirmButtonText: 'Yes, Reject',
      cancelButtonText: 'No, Go Back',
      confirmButtonColor: '#C40D0D',
      cancelButtonColor: '#6B7280',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white rounded-xl',
        title: 'font-semibold text-lg',
        actions: 'flex-row-reverse justify-start',
        confirmButton: 'rounded-lg', // Add rounded corners to confirm button
        cancelButton: 'rounded-lg',   // Add rounded corners to cancel button
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.rejectRequest();
      }
    });
  }

  // Approve request
  approveRequest(): void {
    this.processStatusUpdate('Approved');
  }

  // Reject request
  rejectRequest(): void {
    this.processStatusUpdate('Rejected');
  }

  // Process status update
  private processStatusUpdate(status: string): void {
    if (!this.currentRequestId) {
      Swal.fire({
        title: 'Error',
        text: 'Request ID not found',
        icon: 'error',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });
      return;
    }

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

    this.farmerPensionService
      .updatePensionRequestStatus(
        this.currentRequestId,
        status,
        this.currentUserId,
      )
      .subscribe({
        next: (response) => {
          this.isProcessingAction = false;
          if (response.status) {
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
            }).then(() => {
              // Navigate back to pension requests list
              this.router.navigate(['/finance/action/pension-requests']);
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
}
