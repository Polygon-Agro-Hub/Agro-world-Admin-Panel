import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-field-inspectors',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './view-field-inspectors.component.html',
  styleUrls: ['./view-field-inspectors.component.css'],
})
export class ViewFieldInspectorsComponent implements OnInit {
  isLoading = false;
  hasData = true;
  searchTerm: string = '';

  // Filters
  filterStatus: string = '';
  filterLanguage: string = '';
  filterDistrict: string = '';
  filterRole: string = '';

  // Dummy Data
  inspectors = [
    {
      empId: 'FIO0143',
      firstName: 'Fname',
      lastName: 'Fname 2',
      role: 'Field Officer',
      district: 'Gampaha',
      languages: 'Eng',
      status: 'Approved',
      phone: '077-2828600',
      nic: '982500078V',
      modifiedBy: 'Pathumi',
    },
    {
      empId: 'FIO0201',
      firstName: 'Test',
      lastName: 'RejectedUser',
      role: 'Supervisor',
      district: 'Colombo',
      languages: 'Sinhala',
      status: 'Rejected',
      phone: '077-1234567',
      nic: '982500111V',
      modifiedBy: 'Admin',
    },
    {
      empId: 'FIO0302',
      firstName: 'Demo',
      lastName: 'NotApprovedUser',
      role: 'Manager',
      district: 'Kandy',
      languages: 'Tamil',
      status: 'Not Approved',
      phone: '077-9876543',
      nic: '972345678V',
      modifiedBy: 'System',
    },
  ];

  filteredInspectors = [...this.inspectors];

  constructor(private router: Router, private location: Location) {}

  ngOnInit() {}

  // Apply filters and search
  applyFilters() {
    this.filteredInspectors = this.inspectors.filter((inspector) => {
      return (
        (!this.searchTerm ||
          inspector.empId
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          inspector.nic
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())) &&
        (!this.filterStatus || inspector.status === this.filterStatus) &&
        (!this.filterLanguage || inspector.languages === this.filterLanguage) &&
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

  viewInspector(empId: string) {
    console.log('View Inspector:', empId);
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
        return 'bg-green-100 text-green-800 px-2 py-1 rounded-xl';
      case 'Rejected':
        return 'bg-red-100 text-red-800 px-2 py-1 rounded-xl';
      case 'Not Approved':
        return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-xl';
      default:
        return '';
    }
  }
}
