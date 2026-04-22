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
  farmerId: number;
  officerId: number;
  jobId: string;
  extentha: number;
  extentac: string;
  extentp: number;
  investment: string;
  expectedYield: string;
  startDate: string;
  nicFront: string;
  nicBack: string;
  assignDate: string;
  publishDate: string | null;
  assignedBy: number;
  reqStatus: string;
  reqCahangeTime: string | null;
  publishStatus: string;
  createdAt: string;
  rejectionReason: string;
  rejectedAt: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  NICnumber: string;
  cropNameEnglish: string;
  varietyNameEnglish?: string;
  certificateName?: string;
  varietyId?: string;
  certificateId?: string;
  officerEmpId?: string;
  rejectedBy: string | null;
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
    public permissionService: PermissionService,
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

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }

      // Format time part (12-hour format with AM/PM)
      const time = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      // Format date part
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
      });

      return `${time} on ${formattedDate}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  }

  formatCurrency(amount: string | number): string {
    try {
      // Convert string to number if needed
      const amountNum =
        typeof amount === 'string' ? parseFloat(amount) : amount;

      // Check if conversion was successful
      if (isNaN(amountNum)) {
        return 'LKR 0.00';
      }

      return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2,
      }).format(amountNum);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return 'LKR 0.00';
    }
  }

  formatExtent(extent: string | number): string {
    try {
      if (typeof extent === 'string') {
        // Parse the string to a number and format with 4 decimal places
        const extentNum = parseFloat(extent);
        return isNaN(extentNum) ? '0.0000' : extentNum.toFixed(4);
      }
      // If it's already a number
      return extent.toFixed(4);
    } catch (error) {
      console.error('Error formatting extent:', error);
      return '0.0000';
    }
  }

  viewNicImage(imageUrl: string, imageType: string): void {
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    }
  }

  formatNumber(index: number): string {
    return (index + 1).toString().padStart(3, '0');
  }

  auditResults(requestId: string) {
    const tree = this.router.createUrlTree([
      'finance/action/finance-govicapital/reject-requests/audit-personal-infor',
      requestId,
    ]);

    const url = this.router.serializeUrl(tree);
    window.open(window.location.origin + '/admin' + url, '_blank');
  }
}
