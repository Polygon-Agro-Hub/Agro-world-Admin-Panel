import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { ComplaintsService } from '../../../services/complaints/complaints.service';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';

interface Complaint {
  id: string;
  refNo: string;
  complainCategory: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  createdAt: string;
  status: string;
  reply?: string;
  complain: string;
  replyBy: string | null;
}

interface DropdownOption {
  label: string;
  value: string;
  isExcluded?: boolean;
}

interface ApiResponse {
  status: boolean;
  data: any[];
  total?: number;
}

@Component({
  selector: 'app-retail-complaints',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    InputTextareaModule,
    DropdownModule,
    FormsModule,
    NgxPaginationModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './retail-complaints.component.html',
  styleUrls: ['./retail-complaints.component.css'],
  providers: [DatePipe],
})
export class RetailComplaintsComponent implements OnInit {
  complaints: Complaint[] = [];
  filteredComplaints: Complaint[] = [];

  isLoading = false;
  display = false;
  messageContent = '';
  selectedComplaint = {} as Complaint;

  searchText = '';
  rpst: string | null = null;
  filterComCategory: string | null = null;
  filterStatus: string | null = null;
  totalItems = 0;
  itemsPerPage = 10;
  page = 1;
  roleCategory = this.tokenService.getUserDetails().role;

  hasData: boolean = false;

  replyStatus: DropdownOption[] = [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ];
  comCategories: DropdownOption[] = [];
  status: DropdownOption[] = [];

  constructor(
    private router: Router,
    private datePipe: DatePipe,
    private complaintsService: ComplaintsService,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) { }

  ngOnInit(): void {
    // if (this.tokenService.getUserDetails().role === "2") {
    //   this.roleCategory = "Agriculture";
    // } else if (this.tokenService.getUserDetails().role === "3") {
    //   this.roleCategory = "Finance";
    // }
    // else if (this.tokenService.getUserDetails().role === "4") {
    //   this.roleCategory = "Call Center";
    // }
    // else if (this.tokenService.getUserDetails().role === "5") {
    //   this.roleCategory = "Procurement";
    // }
    // this.tokenService.getUserDetails().role = this.roleCategory;

    this.fetchComplaints();
    this.fetchComplaintCategories();
  }

  private fetchComplaints(): void {
    this.isLoading = true;

    this.complaintsService.fetchComplaints(this.roleCategory).subscribe({
      next: (resp: ApiResponse) => {
        if (resp.data.length === 0) {
          this.hasData = false;
        }
        this.hasData = true;
        this.complaints = resp.data
          .map(item => ({
            id: item.id.toString(),
            refNo: item.refNo,
            complainCategory: item.categoryEnglish,
            firstName: item.firstName,
            lastName: item.lastName,
            contactNumber: item.ContactNumber ? item.ContactNumber.replace(/-/g, '') : '', // Remove hyphens here
            createdAt: this.formatDate(item.createdAt),
            status: this.normalizeStatus(item.status, item.createdAt),
            reply: item.reply || undefined,
            complain: item.complain,
            replyBy: item.replyBy || null,
          }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.filteredComplaints = [...this.complaints];
        this.totalItems = this.filteredComplaints.length;
        this.comCategories = Array.from(
          new Set(this.complaints.map(c => c.complainCategory))
        ).map(cat => ({ label: cat, value: cat }));
        this.status = Array.from(
          new Set(this.complaints.map(c => c.status))
        ).map(st => ({ label: st, value: st }));
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.message.includes('No authentication token found')) {
          alert('No authentication token found. Please log in.');
          this.router.navigate(['login']);
        } else if (err.status === 401) {
          alert('You are not authorized. Please log in.');
          this.router.navigate(['login']);
        } else {
          alert('Failed to load complaints. Please try again later.');
        }
      },
    });
  }

  private fetchComplaintCategories(): void {
    this.complaintsService.fetchComplaintCategories().subscribe({
      next: (resp: { categories: { id: number; categoryEnglish: string }[] }) => {
        this.comCategories = resp.categories.map((c: { id: number; categoryEnglish: string }) => ({
          label: c.categoryEnglish,
          value: c.categoryEnglish,
        }));
      },
      error: (err) => {
        if (err.message.includes('No authentication token found')) {
          alert('No authentication token found. Please log in.');
          this.router.navigate(['login']);
        } else {
          console.error('Category fetch error', err);
        }
      },
    });
  }

  private formatDate(dateString: string): string {
    return this.datePipe.transform(new Date(dateString), 'yyyy-MM-dd hh:mm a') || '';
  }

  private normalizeStatus(status: string | null | undefined, createdAt: string): string {
    if (!status) {
      return 'Unknown';
    }
    if (status.toLowerCase() === 'opened') {
      const diff = (Date.now() - new Date(createdAt).getTime()) / (1000 * 3600 * 24);
      return diff >= 3 ? 'Pending' : 'Assigned';
    }
    return status;
  }

  applyFilters(): void {
    const txt = this.searchText.trim().toLowerCase();

    this.filteredComplaints = this.complaints
      .filter(item => {
        const matchesSearch = !txt || [
          item.refNo,
          item.complainCategory,
          item.firstName,
          item.lastName,
          item.contactNumber,
        ].some(field => field?.toLowerCase().includes(txt));

        const matchesReply =
          this.rpst === 'Yes' ? !!item.reply :
            this.rpst === 'No' ? !item.reply :
              true;

        const matchesCat =
          !this.filterComCategory || item.complainCategory === this.filterComCategory;

        const matchesStat =
          !this.filterStatus || item.status === this.filterStatus;

        return matchesSearch && matchesReply && matchesCat && matchesStat;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    this.totalItems = this.filteredComplaints.length;
    this.page = 1;
    this.hasData = this.filteredComplaints.length > 0;
  }

  searchComplain(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchText = '';
    this.applyFilters();
  }

  regStatusFil(): void {
    this.applyFilters();
  }

  onPageChange(p: number): void {
    this.page = p;
  }

  goBack(): void {
    this.router.navigate(['/complaints']);
  }

  navigateSelectComplain(id: string): void {
    this.router.navigate([`/complaints/selected-retail-complaints/${id}`]);
  }

  onSearchTextChange(event: string): void {
    this.searchText = event;
    this.applyFilters();
  }

  showReplyDialog(c: Complaint): void {
    this.selectedComplaint = { ...c };
    this.messageContent = c.reply || '';
    this.display = true;
  }

  hideDialog(): void {
    this.display = false;
    this.messageContent = '';
  }

  submitReply(): void {
    // Implementation for submitting reply if needed
  }
}