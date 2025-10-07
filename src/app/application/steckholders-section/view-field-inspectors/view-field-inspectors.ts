import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { StakeholderService } from '../../../services/stakeholder/stakeholder.service';
import { DropdownModule } from 'primeng/dropdown';

// Define FieldInspector interface
interface FieldInspector {
  id: number;
  empId: string;
  firstName: string;
  lastName: string;
  role: string;
  district: string;
  language: string;
  status: string;
  phone: string;
  nic: string;
  modifiedBy: string;
}

@Component({
  selector: 'app-view-field-inspectors',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, DropdownModule],
  templateUrl: './view-field-inspectors.component.html',
  styleUrls: ['./view-field-inspectors.component.css'],
})
export class ViewFieldInspectorsComponent implements OnInit {
  isLoading = false;
  hasData = true;
  inspectors: FieldInspector[] = [];
  filteredInspectors: FieldInspector[] = [];

  // Filters
  searchTerm = '';
  filterStatus = '';
  filterLanguage = '';
  filterDistrict = '';
  filterRole = '';

  // Dropdown options
  roles = [
    { label: 'Admin', value: 'Admin' },
    { label: 'Inspector', value: 'Inspector' },
    { label: 'Staff', value: 'Staff' },
  ];

  statuses = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Not Approved', value: 'Not Approved' },
  ];

  districts = [
    { label: 'Colombo', value: 'Colombo' },
    { label: 'Kandy', value: 'Kandy' },
    { label: 'Galle', value: 'Galle' },
  ];

  languages = [
    { label: 'English', value: 'English' },
    { label: 'Sinhala', value: 'Sinhala' },
    { label: 'Tamil', value: 'Tamil' },
  ];

  constructor(
    private router: Router,
    private location: Location,
    private stakeholderService: StakeholderService
  ) { }

  ngOnInit() {
    this.loadInspectors();
  }

  loadInspectors() {
    this.isLoading = true;
    this.stakeholderService.getAllFieldInspectors().subscribe({
      next: (data) => {
        this.inspectors = data;
        this.filteredInspectors = [...this.inspectors];
        this.hasData = this.filteredInspectors.length > 0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching inspectors:', err);
        this.isLoading = false;
        this.hasData = false;
      },
    });
  }

  applyFilters() {
    this.filteredInspectors = this.inspectors.filter((inspector) => {
      return (
        (!this.searchTerm ||
          inspector.empId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          inspector.nic.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
        (!this.filterStatus || inspector.status === this.filterStatus) &&
        (!this.filterLanguage || inspector.language === this.filterLanguage) &&
        (!this.filterDistrict || inspector.district === this.filterDistrict) &&
        (!this.filterRole || inspector.role === this.filterRole)
      );
    });
    this.hasData = this.filteredInspectors.length > 0;
  }

  onSearch() {
    this.applyFilters();
  }

  offSearch() {
    this.searchTerm = '';
    this.applyFilters();
  }

  clearFilters() {
    this.filterStatus = '';
    this.filterLanguage = '';
    this.filterDistrict = '';
    this.filterRole = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  viewInspector(id: number) {
    this.router.navigate([`/steckholders/action/field-officer-profile/${id}`]);
  }

  addNew() {
    this.router.navigate(['/steckholders/action/add-fieald-officer']);
  }

  onBack(): void {
    this.location.back();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Approved':
        return 'status-approved';
      case 'Rejected':
        return 'status-rejected';
      case 'Not Approved':
        return 'status-not-approved';
      default:
        return 'status-pending';
    }
  }
}
