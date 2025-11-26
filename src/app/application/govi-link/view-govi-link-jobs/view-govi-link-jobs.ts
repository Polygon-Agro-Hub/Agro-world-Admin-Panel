import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { GoviLinkService } from '../../../services/govi-link/govi-link.service';
import { CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-view-govi-link-jobs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    DropdownModule,
    CalendarModule,
  ],
  templateUrl: './view-govi-link-jobs.component.html',
  styleUrls: ['./view-govi-link-jobs.component.css'],
})
export class ViewGoviLinkJobsComponent implements OnInit {
  isLoading = false;
  jobs: any[] = [];
  searchText = '';

  // Filter options
  districtFilter = '';
  statusFilter = '';
  assignStatusFilter = '';
  dateFilter: Date | null = null;

  // Dropdown options
  districtOptions: any[] = [];
  statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Completed', value: 'completed' },
  ];

  assignStatusOptions = [
    { label: 'Assigned', value: 'Assigned' },
    { label: 'Not Assigned', value: 'Not Assigned' },
  ];

  // Officer Role Options
  officerRoleOptions = [
    { label: 'Field Officer', value: 'Field Officer' },
    { label: 'Chief Field Officer', value: 'Chief Field Officer' },
  ];

  // Popup state
  isOfficerPopUp = false;
  isAssignPopup = false;
  isCompletedJobPopup = false;
  isViewJobPopup = false;
  assignedOfficerArray: string[] = [];

  // Assign popup state
  selectedOfficerRole: string | null = null;
  selectedOfficerId: string = '';
  availableOfficers: any[] = [];
  selectedOfficerInfo: any = null;
  isLoadingOfficers = false;
  isAssigning = false;
  assignError = '';
  selectedJob: any = null;
  currentAssignedOfficer: any = null;

  // View job popup state
  jobDetails: any = null;
  isLoadingJobDetails = false;

  constructor(private goviLinkService: GoviLinkService) {}

  ngOnInit(): void {
    this.dateFilter = new Date();
    this.fetchJobs();
    this.loadDistrictOptions();
  }

  fetchJobs(): void {
    this.isLoading = true;

    // Format date to YYYY-MM-DD if exists
    const formattedDate = this.dateFilter
      ? this.formatDateForBackend(this.dateFilter)
      : '';

    const filters = {
      searchTerm: this.searchText,
      district: this.districtFilter,
      status: this.statusFilter,
      assignStatus: this.assignStatusFilter,
      date: formattedDate, // Send formatted date
    };

    this.goviLinkService.getAllGoviLinkJobs(filters).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.jobs = response.results || [];
      },
      error: (err) => {
        console.error('Error fetching jobs:', err);
        this.isLoading = false;
        this.jobs = [];
      },
    });
  }

  // Format date to YYYY-MM-DD for backend
  formatDateForBackend(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  // Handle date selection
  onDateSelect(): void {
    this.fetchJobs();
  }

  loadDistrictOptions(): void {
    this.districtOptions = [
      { name: 'Ampara', value: 'Ampara' },
      { name: 'Anuradhapura', value: 'Anuradhapura' },
      { name: 'Badulla', value: 'Badulla' },
      { name: 'Batticaloa', value: 'Batticaloa' },
      { name: 'Colombo', value: 'Colombo' },
      { name: 'Galle', value: 'Galle' },
      { name: 'Gampaha', value: 'Gampaha' },
      { name: 'Hambantota', value: 'Hambantota' },
      { name: 'Jaffna', value: 'Jaffna' },
      { name: 'Kalutara', value: 'Kalutara' },
      { name: 'Kandy', value: 'Kandy' },
      { name: 'Kegalle', value: 'Kegalle' },
      { name: 'Kilinochchi', value: 'Kilinochchi' },
      { name: 'Kurunegala', value: 'Kurunegala' },
      { name: 'Mannar', value: 'Mannar' },
      { name: 'Matale', value: 'Matale' },
      { name: 'Matara', value: 'Matara' },
      { name: 'Monaragala', value: 'Monaragala' },
      { name: 'Mullaitivu', value: 'Mullaitivu' },
      { name: 'Nuwara Eliya', value: 'Nuwara Eliya' },
      { name: 'Polonnaruwa', value: 'Polonnaruwa' },
      { name: 'Puttalam', value: 'Puttalam' },
      { name: 'Rathnapura', value: 'Rathnapura' },
      { name: 'Trincomalee', value: 'Trincomalee' },
      { name: 'Vavuniya', value: 'Vavuniya' },
    ];
  }

  // Handle assign status click
  onAssignStatusClick(job: any): void {
    // Special condition: If job is completed and assigned, show warning popup
    if (job.status === 'Completed' && job.assignStatus === 'Assigned') {
      this.selectedJob = job;
      this.isCompletedJobPopup = true;
      return;
    }

    if (job.assignStatus === 'Assigned') {
      // If already assigned, open assign popup in edit mode
      this.openAssignPopup(job);
    } else {
      // If not assigned, open the assign popup in create mode
      this.openAssignPopup(job);
    }
  }

  // Open assign popup
  openAssignPopup(job: any): void {
    this.selectedJob = job;
    this.selectedOfficerRole = '';
    this.selectedOfficerId = '';
    this.availableOfficers = [];
    this.selectedOfficerInfo = null;
    this.currentAssignedOfficer = null;
    this.assignError = '';

    // If job is already assigned, pre-fill the current officer info
    if (job.assignStatus === 'Assigned' && job.assignedOfficerName) {
      this.currentAssignedOfficer = {
        name: job.assignedOfficerName,
        empId: job.officerEmpId,
        role: job.assignedOfficerRole,
      };
    }

    this.isAssignPopup = true;
  }

  // Clear date filter
  clearDateFilter(): void {
    this.dateFilter = null;
    this.fetchJobs();
  }

  // Close assign popup
  assignPopupClose(): void {
    this.isAssignPopup = false;
    this.selectedJob = null;
    this.selectedOfficerRole = '';
    this.selectedOfficerId = '';
    this.availableOfficers = [];
    this.selectedOfficerInfo = null;
    this.currentAssignedOfficer = null;
    this.assignError = '';
  }

  // Close completed job popup
  completedJobPopupClose(): void {
    this.isCompletedJobPopup = false;
    this.selectedJob = null;
  }

  // When officer role changes
  onOfficerRoleChange(): void {
    this.selectedOfficerId = '';
    this.selectedOfficerInfo = null;
    this.availableOfficers = [];

    if (this.selectedOfficerRole) {
      this.loadOfficersByRole(this.selectedOfficerRole);
    }
  }

  // Load officers by role
  loadOfficersByRole(role: string): void {
    this.isLoadingOfficers = true;

    // Use the job's scheduled date when fetching available officers
    const scheduleDate = this.selectedJob?.scheduledDate;

    this.goviLinkService.getOfficersByJobRole(role, scheduleDate).subscribe({
      next: (response) => {
        this.isLoadingOfficers = false;
        if (response.success && response.data) {
          this.availableOfficers = response.data.map((officer: any) => ({
            ...officer,
            displayName: `${officer.firstName} ${officer.lastName} (${officer.empId}) - Jobs: ${officer.activeJobCount}`,
          }));

          // If there's a currently assigned officer, try to pre-select them
          if (
            this.currentAssignedOfficer &&
            this.availableOfficers.length > 0
          ) {
            const currentOfficer = this.availableOfficers.find(
              (officer) => officer.empId === this.currentAssignedOfficer.empId
            );
            if (currentOfficer) {
              this.selectedOfficerId = currentOfficer.empId;
              this.selectedOfficerInfo = currentOfficer;
            }
          }
        } else {
          this.availableOfficers = [];
        }
      },
      error: (err) => {
        console.error('Error loading officers:', err);
        this.isLoadingOfficers = false;
        this.availableOfficers = [];
        this.assignError = 'Failed to load officers';
      },
    });
  }

  // When officer is selected
  onOfficerSelected(): void {
    if (this.selectedOfficerId) {
      this.selectedOfficerInfo = this.availableOfficers.find(
        (officer) => officer.empId === this.selectedOfficerId
      );
    } else {
      this.selectedOfficerInfo = null;
    }
  }

  // Assign officer to job
  assignOfficer(): void {
    if (!this.selectedJob || !this.selectedOfficerId) {
      this.assignError = 'Please select an officer';
      return;
    }

    this.isAssigning = true;
    this.assignError = '';

    // First, get the officer ID from empId
    const selectedOfficer = this.availableOfficers.find(
      (officer) => officer.empId === this.selectedOfficerId
    );

    if (!selectedOfficer) {
      this.assignError = 'Selected officer not found';
      this.isAssigning = false;
      return;
    }

    const assignmentData = {
      jobId: this.selectedJob.jobId,
      officerId: selectedOfficer.id,
    };

    this.goviLinkService.assignOfficerToJob(assignmentData).subscribe({
      next: (response) => {
        this.isAssigning = false;
        if (response.success) {
          this.assignPopupClose();
          this.fetchJobs(); // Refresh the job list
        } else {
          this.assignError = response.message || 'Failed to assign officer';
        }
      },
      error: (err) => {
        console.error('Error assigning officer:', err);
        this.isAssigning = false;
        this.assignError = 'An error occurred while assigning officer';
      },
    });
  }

  // View job details using existing service
  viewJob(job: any): void {
    this.isLoadingJobDetails = true;
    this.jobDetails = null;
    this.selectedJob = job;

    this.goviLinkService.getJobBasicDetailsById(job.jobId).subscribe({
      next: (response) => {
        this.isLoadingJobDetails = false;
        if (response.success) {
          this.jobDetails = response.data;
          this.isViewJobPopup = true;
        } else {
          console.error('Error fetching job details:', response.error);
        }
      },
      error: (err) => {
        this.isLoadingJobDetails = false;
        console.error('Error fetching job details:', err);
      },
    });
  }

  // Close view job popup
  closeViewJobPopup(): void {
    this.isViewJobPopup = false;
    this.jobDetails = null;
    this.selectedJob = null;
  }

  onSearch(): void {
    this.fetchJobs();
  }

  offSearch(): void {
    this.searchText = '';
    this.fetchJobs();
  }

  onBack(): void {
    window.history.back();
  }

  addNew(): void {
    // Navigate to add new job page
  }

  clearAllFilters(): void {
    this.searchText = '';
    this.districtFilter = '';
    this.statusFilter = '';
    this.assignStatusFilter = '';
    this.dateFilter = null;
    this.fetchJobs();
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.searchText ||
      this.districtFilter ||
      this.statusFilter ||
      this.assignStatusFilter ||
      this.dateFilter
    );
  }

  // Officer popup methods
  officerPopUpOpen(officerInfo: any): void {
    if (officerInfo && officerInfo.assignedOfficerName) {
      this.assignedOfficerArray = [officerInfo.assignedOfficerName];
      if (officerInfo.officerEmpId) {
        this.assignedOfficerArray.push(
          `Employee ID: ${officerInfo.officerEmpId}`
        );
      }
    } else {
      this.assignedOfficerArray = ['No officer assigned'];
    }
    this.isOfficerPopUp = true;
  }

  officerPopUpClose(): void {
    this.isOfficerPopUp = false;
    this.assignedOfficerArray = [];
  }

  get hasData(): boolean {
    return this.jobs.length > 0;
  }

  // Helper method to format date for display
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  }
}
