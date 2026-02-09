import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FarmerPensionService,
  PensionRequestDetail,
} from '../../../services/finance/farmer-pension.service';

import { ViewDocumentImageComponent } from "../../../components/finance-component/view-document-image/view-document-image.component";

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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private farmerPensionService: FarmerPensionService,
  ) {}

  ngOnInit(): void {
    // Get ID from route params
    this.route.params.subscribe(params => {
      const requestId = params['id'];
      console.log('Route params:', params);
      console.log('Request ID from params:', requestId);
      
      if (requestId) {
        this.isVisible = true;
        this.viewDetails(requestId);
      } else {
        console.error('No request ID found in route params');
        this.errorMessage = 'No request ID provided';
      }
    });
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
    
    console.log('Calling viewDetails with ID:', requestId);
    
    this.farmerPensionService.getPensionRequestById(requestId).subscribe({
      next: (response) => {
        console.log('Full API Response:', response);
        
        if (response && response.status && response.data) {
          this.selectedRequest = response.data;
          console.log('Selected Request Data:', this.selectedRequest);
          console.log('Image URLs:', {
            NIC_Front_Image: this.selectedRequest?.NIC_Front_Image,
            NIC_Back_Image: this.selectedRequest?.NIC_Back_Image,
            Successor_NIC_Front_Image: this.selectedRequest?.Successor_NIC_Front_Image,
            Successor_NIC_Back_Image: this.selectedRequest?.Successor_NIC_Back_Image
          });
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
}