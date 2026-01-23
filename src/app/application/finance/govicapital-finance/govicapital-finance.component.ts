import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../../../services/finance/finance.service';
import { Router } from '@angular/router';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';

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
  officerEmpId: string;
  rejectedBy: string;
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
    private financeService: FinanceService,
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) { }

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

  const date = new Date(dateString);

  // Format time part (12-hour format with AM/PM)
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  // Format date part
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit'
  });

  // Combine as "11:00PM on June 01, 2026"
  return `${time} on ${formattedDate}`;
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

  formatNumber(index: number): string {
    // Format as 3-digit number with leading zeros (001, 002, etc.)
    return (index + 1).toString().padStart(3, '0');
  }

  auditResults(requestId: string) {
    this.router.navigate(['finance/action/finance-govicapital/reject-requests/audit-personal-infor', requestId]);
  }
}
