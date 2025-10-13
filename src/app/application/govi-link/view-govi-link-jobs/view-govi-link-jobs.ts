import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { GoviLinkService } from '../../../services/govi-link/govi-link.service';

@Component({
  selector: 'app-view-govi-link-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, DropdownModule],
  templateUrl: './view-govi-link-jobs.component.html',
})
export class ViewGoviLinkJobsComponent implements OnInit {
  isLoading = false;
  jobs: any[] = [];
  searchText = '';

  // Filter options
  districtFilter = '';
  statusFilter = '';
  assignStatusFilter = '';
  dateFilter = '';

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
  selectedOfficerRole: string = '';
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
    this.fetchJobs();
    this.loadDistrictOptions();
  }

  fetchJobs(): void {
    this.isLoading = true;

    const filters = {
      searchTerm: this.searchText,
      district: this.districtFilter,
      status: this.statusFilter,
      assignStatus: this.assignStatusFilter,
      date: this.dateFilter,
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
        role: job.assignedOfficerRole, // You might need to add this field to your backend query
      };

      this.selectedOfficerRole = 'Field Officer'; // Default, adjust based on your data
    }

    this.isAssignPopup = true;
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
    this.goviLinkService.getOfficersByJobRole(role).subscribe({
      next: (response) => {
        this.isLoadingOfficers = false;
        if (response.success && response.data) {
          this.availableOfficers = response.data.map((officer: any) => ({
            ...officer,
            displayName: `${officer.firstName} ${officer.lastName} (${officer.empId})`,
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
          // You can show a success toast/message here
          console.log('Officer assigned successfully');
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
    console.log('Add new job');
  }

  clearAllFilters(): void {
    this.searchText = '';
    this.districtFilter = '';
    this.statusFilter = '';
    this.assignStatusFilter = '';
    this.dateFilter = '';
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

  // Helper method to format date
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  }
}
