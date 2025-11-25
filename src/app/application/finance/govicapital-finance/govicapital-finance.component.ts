import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../../../services/finance/finance.service';

interface RejectedInvestmentRequest {
  id: string;
  varietyId: string;
  certificateId: string;
  farmerId: string;
  officerId: string;
  jobId: string;
  extentha: number;
  extentac: number;
  extentp: number;
  investment: number;
  expectedYield: number;
  startDate: string;
  nicFront: string;
  nicBack: string;
  assignDate: string;
  publishDate: string;
  assignedBy: string;
  reqStatus: string;
  reqCahangeTime: string;
  publishStatus: string;
  createdAt: string;
  rejectionReason: string;
  rejectedAt: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  cropNameEnglish: string;
  varietyNameEnglish: string;
  certificateName: string;
  expectedInvestment?: number;
  expectedStartDate?: string;
  requestDateTime?: string;
  NICnumber: string;
}

@Component({
  selector: 'app-govicapital-finance',
  standalone: true,
  imports: [LoadingSpinnerComponent, CommonModule, FormsModule],
  templateUrl: './govicapital-finance.component.html',
  styleUrl: './govicapital-finance.component.css',
})
export class GovicapitalFinanceComponent implements OnInit {
  isLoading = false;
  total: number | null = null;
  searchTerm: string = '';
  rejectedRequests: RejectedInvestmentRequest[] = [];

  // Modal properties
  showModal = false;
  selectedRequest: RejectedInvestmentRequest | null = null;

  constructor(
    private location: Location,
    private financeService: FinanceService
  ) {}

  ngOnInit(): void {
    this.loadRejectedRequests();
  }

  back(): void {
    this.location.back();
  }

  loadRejectedRequests(): void {
    this.isLoading = true;
    this.financeService
      .getAllRejectedInvestmentRequests(this.searchTerm)
      .subscribe({
        next: (response) => {
          this.rejectedRequests = response.data;
          this.total = response.count;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading rejected requests:', error);
          this.isLoading = false;
          // You can add a toast notification here
        },
      });
  }

  onSearch(): void {
    this.loadRejectedRequests();
  }

  onClearSearch(): void {
    this.searchTerm = '';
    this.loadRejectedRequests();
  }

  viewDetails(request: RejectedInvestmentRequest): void {
    this.selectedRequest = request;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedRequest = null;
  }

  getFullName(firstName: string, lastName: string): string {
    return `${firstName} ${lastName}`.trim();
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  viewNicImage(imageUrl: string, imageType: string): void {
    // Implement image viewing logic
    // You can open a modal or navigate to a new page
    console.log(`View ${imageType} image:`, imageUrl);

    // Example: Open image in new tab
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    }
  }
}
