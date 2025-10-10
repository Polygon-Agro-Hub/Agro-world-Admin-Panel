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

  // Popup state
  isOfficerPopUp = false;
  assignedOfficerArray: string[] = [];

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

  // Clear all filters
  clearAllFilters(): void {
    this.searchText = '';
    this.districtFilter = '';
    this.statusFilter = '';
    this.assignStatusFilter = '';
    this.dateFilter = '';
    this.fetchJobs();
  }

  // Check if any filters are active
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

  // Action methods
  viewJob(job: any): void {
    console.log('View job:', job);
  }

  get hasData(): boolean {
    return this.jobs.length > 0;
  }
}
