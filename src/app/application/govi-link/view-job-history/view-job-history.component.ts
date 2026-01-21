import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { GoviLinkService } from '../../../services/govi-link/govi-link.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';

interface FieldAuditHistory {
  jobId: string;
  empId: string;
  farmId: string;
  farmCode: string;
  regCode: string;
  visitPurpose: string;
  farmerNIC: string;
  district: string;
  scheduledDate: string;
  completedDate: string;
  onScreenTime: string;
  status: string;
  assignedOn: string;
  assignedByName: string;
  assignedOfficer: string;
}

interface DropdownOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-view-job-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    LoadingSpinnerComponent,
    CalendarModule,
    DropdownModule
  ],
  templateUrl: './view-job-history.component.html',
  styleUrl: './view-job-history.component.css'
})
export class ViewJobHistoryComponent implements OnInit {
  jobHistory: FieldAuditHistory[] = [];
  filteredHistory: FieldAuditHistory[] = [];
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  searchTerm: string = '';
  isLoading: boolean = false;
  hasData: boolean = false;

  // Filter values
  selectedStatus: string | null = null;
  selectedDistrict: string | null = null;
  completedDateFrom: Date | null = null;
  maxDate: Date = new Date();

  // Dropdown options
  statusOptions: DropdownOption[] = [
    { label: 'All Status', value: '' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Completed', value: 'Completed' }
  ];

  districtOptions: DropdownOption[] = [
    { label: 'All Districts', value: '' },
    { label: 'Colombo', value: 'Colombo' },
    { label: 'Galle', value: 'Galle' },
    { label: 'Kandy', value: 'Kandy' },
    { label: 'Matara', value: 'Matara' },
    { label: 'Jaffna', value: 'Jaffna' },
    { label: 'Gampaha', value: 'Gampaha' },
    { label: 'Kalutara', value: 'Kalutara' },
    { label: 'Anuradhapura', value: 'Anuradhapura' },
    { label: 'Polonnaruwa', value: 'Polonnaruwa' },
    { label: 'Kurunegala', value: 'Kurunegala' },
    { label: 'Puttalam', value: 'Puttalam' },
    { label: 'Ratnapura', value: 'Ratnapura' },
    { label: 'Kegalle', value: 'Kegalle' },
    { label: 'Badulla', value: 'Badulla' },
    { label: 'Monaragala', value: 'Monaragala' },
    { label: 'Hambantota', value: 'Hambantota' },
    { label: 'Ampara', value: 'Ampara' },
    { label: 'Batticaloa', value: 'Batticaloa' },
    { label: 'Trincomalee', value: 'Trincomalee' },
    { label: 'Vavuniya', value: 'Vavuniya' },
    { label: 'Mannar', value: 'Mannar' },
    { label: 'Mullaitivu', value: 'Mullaitivu' },
    { label: 'Kilinochchi', value: 'Kilinochchi' },
    { label: 'Matale', value: 'Matale' },
    { label: 'Nuwara Eliya', value: 'Nuwara Eliya' }
  ];

  constructor(
    private router: Router,
    private goviLinkService: GoviLinkService,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) {}

  ngOnInit() {
    this.fetchJobHistory();
  }

  fetchJobHistory() {
    this.isLoading = true;

    const filters = {
      status: this.selectedStatus || undefined,
      district: this.selectedDistrict || undefined,
      completedDateFrom: this.completedDateFrom ? this.formatDate(this.completedDateFrom) : undefined,
      searchJobId: this.getSearchParam('jobId'),
      searchFarmId: this.getSearchParam('farmId'),
      searchNic: this.getSearchParam('nic')
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof typeof filters] === undefined) {
        delete filters[key as keyof typeof filters];
      }
    });


    this.goviLinkService.getFieldAuditHistory(filters).subscribe(
      (response) => {
        this.isLoading = false;
        if (response.success) {
          this.jobHistory = response.data.map((item: any) => ({
            jobId: item.jobId,
            empId: item.empId,
            farmId: item.farmId,
            farmCode: item.farmCode,
            regCode: item.regCode,
            visitPurpose: this.formatVisitPurpose(item.visitPurpose),
            farmerNIC: item.farmerNIC,
            district: item.district,
            scheduledDate: this.formatDateTime(item.scheduledDate),
            completedDate: this.formatDateTime(item.completedDate),
            onScreenTime: item.onScreenTime || '-',
            status: item.status,
            assignedOn: this.formatDateTime(item.assignedOn),
            assignedByName: item.assignedByName || '-',
            assignedOfficer: item.assignedOfficer || '-'
          }));
          this.totalItems = this.jobHistory.length;
          this.hasData = this.totalItems > 0;
        } else {
          this.hasData = false;
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching job history:', error);
        this.hasData = false;
      }
    );
  }

  getSearchParam(type: 'jobId' | 'farmId' | 'nic'): string | undefined {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      return undefined;
    }

    const trimmed = this.searchTerm.trim();
    
    // Determine search type based on input pattern
    if (type === 'jobId' && /^\d{11}$/.test(trimmed)) {
      return trimmed;
    }
    if (type === 'farmId' && /^\d+$/.test(trimmed)) {
      return trimmed;
    }
    if (type === 'nic' && /^\d{9}[vVxX]|\d{12}$/.test(trimmed)) {
      return trimmed;
    }
    
    // If unsure, return for all types
    return trimmed;
  }

  formatVisitPurpose(purpose: string): string {
    const mapping: { [key: string]: string } = {
      'Request': 'Requested Service',
      'Individual': 'Individual Farmer Audit',
      'Cluster': 'Farmer Cluster Audit'
    };
    return mapping[purpose] || purpose;
  }

  formatDateTime(dateTime: string): string {
    if (!dateTime) return '-';
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Date filter handlers
  onCompletedDateChange() {
    this.page = 1;
    this.applyFilters();
  }

  onCompletedDateClear() {
    this.completedDateFrom = null;
    this.page = 1;
    this.applyFilters();
  }

  applyFilters() {
    this.page = 1;
    this.fetchJobHistory();
  }

  onSearch() {
    this.searchTerm = this.searchTerm?.trim() || '';
    this.page = 1;
    this.fetchJobHistory();
  }

  clearSearch() {
    this.searchTerm = '';
    this.page = 1;
    this.fetchJobHistory();
  }

  onPageChange(event: number) {
    this.page = event;
  }

  getStatusClass(status: string): string {
    return status === 'Completed' ? 'text-green-600' : 'text-red-600';
  }

  back(): void {
    this.router.navigate(['/govi-link']);
  }

  
viewResponse(jobId: string, purpose: string) {

  if (jobId && jobId.startsWith("FA")) {
    this.router.navigate(['/govi-link/action/view-govi-link-jobs-farmer-audit-response'], {
      queryParams: { jobId },
    });
  } else if (jobId && jobId.startsWith("CA")) {
    this.router.navigate(['/govi-link/action/view-govi-link-jobs-farmer-cluster-audit-response'], {
      queryParams: { jobId },
    });
  } else if (jobId && jobId.startsWith("SR")) {
    this.router.navigate(['/govi-link/action/view-govi-link-jobs-service-request-response'], {
      queryParams: { jobId },
    });
  }
  
}
}