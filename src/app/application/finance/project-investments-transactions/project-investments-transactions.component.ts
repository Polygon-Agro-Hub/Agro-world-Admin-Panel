import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { DropdownModule } from 'primeng/dropdown';
import { ActivatedRoute, Router } from '@angular/router';
import { FinanceService } from '../../../services/finance/finance.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';

@Component({
  selector: 'app-project-investments-transactions',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, DropdownModule, FormsModule],
  templateUrl: './project-investments-transactions.component.html',
  styleUrl: './project-investments-transactions.component.css',
})
export class ProjectInvestmentsTransactionsComponent {
  isLoading = false;
  hasData: boolean = true;
  investmentsArr: Investments[] = [];
  statusFilter: string = ''
  id!: number;
  isPopUpOpen: boolean = false;
  itemId!: number;
  searchText: string = ''

  // Project details
  projectId: string = '';
  sharePrice: number = 0;
  cropName: string = '';

  statusArr = [
    { status: 'To Review', value: 'To Review' },
    { status: 'Approved', value: 'Approved' },
    { status: 'Rejected', value: 'Rejected' },
  ];

  constructor(
    private router: Router,
    private financeService: FinanceService,
    private route: ActivatedRoute,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) { }

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchProjectDetails(this.id);
    this.fetchAllInvestments(this.id);
  }

  fetchProjectDetails(id: number): void {
    this.isLoading = true;
    this.financeService.getProjectInvestments().subscribe({
      next: (response) => {
        if (response && response.data) {
          const project = response.data.find((p: any) => p.id === id);
          if (project) {
            this.projectId = project.jobId || '';
            this.cropName = project.cropNameEnglish || '';
            if (project.investment && project.defineShares) {
              this.sharePrice = project.investment / project.defineShares;
            }
          }
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading project details:', error);
        this.isLoading = false;
      }
    });
  }

  fetchAllInvestments(id: number, status: string = this.statusFilter, search: string = this.searchText): void {
    this.isLoading = true;

    this.financeService.getAllInvestments(
      id, status, search
    )
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response) {
            this.investmentsArr = response.items;
            this.investmentsArr.sort((a, b) => {
              return a.id - b.id;
            });
            
            this.hasData = this.investmentsArr.length > 0;
            if (this.investmentsArr.length > 0 && this.sharePrice === 0) {
              const firstInvestment = this.investmentsArr[0];
              if (firstInvestment.totInvt && firstInvestment.shares && firstInvestment.shares > 0) {
                this.sharePrice = firstInvestment.totInvt / firstInvestment.shares;
              }
            }

          } else {
            this.hasData = false;
            this.investmentsArr = [];
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error loading farmer payments:', error);
          this.hasData = false;
          this.investmentsArr = [];
        }
      });
  }

  applystatusFilters() {
    console.log(this.statusFilter);
    this.fetchAllInvestments(
      this.id,
      this.statusFilter,
    );
  }


  // Method to format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  // Method to get status class for styling
  getStatusClass(status: string): string {
    switch (status) {
      case 'To Review':
        return 'bg-[#F8FFA6] text-[#A8A100] dark:bg-[#F8FFA6] dark:text-[#A8A100]';
      case 'Approved':
        return 'bg-[#BBFFC6] text-[#308233] dark:bg-[#BBFFC6] dark:text-[#308233]';
      case 'Rejected':
        return 'bg-[#FFB9B7] text-[#D16D6A] dark:bg-[#FFB9B7] dark:text-[#D16D6A]';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  openPopUp(id: number) {
    this.itemId = id
    this.isPopUpOpen = true;
  }

  closePopUp() {
    this.isPopUpOpen = false;
  }

  onReject() {
    this.rejectInvestmentStatus(this.itemId)
    this.isPopUpOpen = false;
  }

  rejectInvestmentStatus(id: number): void {
    this.isLoading = true;

    this.financeService.rejectInvestmentStatus(id)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Transaction record Rejected successfully',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold',
                confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
              },

            })

          } else {
            Swal.fire({
              icon: 'error',
              title: 'error',
              text: 'Error Rejecting transaction record',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold',
                confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
              },

            })
          }
          this.fetchAllInvestments(this.id)
        },
        error: (error) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'error',
            text: 'Error Rejecting transaction record',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
              confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
            },

          })
          this.fetchAllInvestments(this.id)
        }
      });
  }

  onApprove() {
    this.approveInvestmentStatus(this.itemId)
    this.isPopUpOpen = false;
  }

  approveInvestmentStatus(id: number): void {
    this.isLoading = true;

    this.financeService.approveInvestmentStatus(id)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('response', response)

          if (response.success) {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Transaction record approved successfully',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold',
                confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
              },

            })

          } else {
            Swal.fire({
              icon: 'error',
              title: 'error',
              text: 'Error approving transaction record',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold',
                confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
              },

            })
          }
          this.fetchAllInvestments(this.id)
        },
        error: (error) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'error',
            text: 'Error approving transaction record',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
              confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
            },

          })
          this.fetchAllInvestments(this.id)
        }
      });
  }

  onSearch() {
    this.searchText = this.searchText?.trim() || ''
    console.log('searchText', "'", this.searchText, "'")
    this.fetchAllInvestments(this.id);
  }

  offSearch() {
    this.searchText = '';
    this.fetchAllInvestments(this.id);
  }

  viewNicFront(url: string) {
    // Open the image in a new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  viewNicBack(url: string) {
    // Open the image in a new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  viewBankSlip(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

}
class Investments {
  id!: number;
  regCode!: string;
  refCode!: string;
  phoneCode!: string;
  phoneNumber!: string;
  shares!: number
  totInvt!: number
  createdAt!: Date
  nicFront!: string
  nicBack!: string
  bankSlip!: string
  invtStatus!: string
}