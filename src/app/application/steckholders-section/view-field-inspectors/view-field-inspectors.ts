import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { StakeholderService } from '../../../services/stakeholder/stakeholder.service';
import { DropdownModule } from 'primeng/dropdown';
import Swal from 'sweetalert2';

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
    { label: 'Field Officer', value: 'Field Officer' },
    { label: 'Chief Field Officer', value: 'Chief Field Officer' }
  ];

  statuses = [
    // { label: 'Pending', value: 'Pending' },
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
  ) {}

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
          inspector.empId
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          inspector.nic
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())) &&
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

  openPopup(inspector: FieldInspector) {
  const showApproveButton = inspector.status === 'Rejected' || inspector.status === 'Not Approved';
  const showRejectButton = inspector.status === 'Approved' || inspector.status === 'Not Approved';

  // Dynamic message based on status
  let message = '';
  if (inspector.status === 'Approved') {
    message = 'Are you sure you want to reject this field inspector?';
  } else if (inspector.status === 'Rejected') {
    message = 'Are you sure you want to approve this field inspector?';
  } else if (inspector.status === 'Not Approved') {
    message = 'Are you sure you want to approve or reject this field inspector?';
  }

  const tableHtml = `
    <div class="px-10 py-8 rounded-md bg-white dark:bg-gray-800">
      <h1 class="text-center text-2xl font-bold mb-4 dark:text-white">
        Inspector Name: ${inspector.firstName} ${inspector.lastName}
      </h1>
      <div>
        <p class="text-center dark:text-white">${message}</p>
      </div>
      <div class="flex justify-center mt-4">
        ${showRejectButton ? '<button id="rejectButton" class="bg-red-500 text-white px-6 py-2 rounded-lg mr-2">Reject</button>' : ''}
        ${showApproveButton ? '<button id="approveButton" class="bg-green-500 text-white px-6 py-2 rounded-lg">Approve</button>' : ''}
      </div>
    </div>
  `;

  Swal.fire({
    html: tableHtml,
    showConfirmButton: false,
    width: 'auto',
    background: 'transparent',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    grow: 'row',
    showClass: { popup: 'animate__animated animate__fadeIn' },
    hideClass: { popup: 'animate__animated animate__fadeOut' },
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
    },
    didOpen: () => {
      if (showApproveButton) {
        document.getElementById('approveButton')?.addEventListener('click', () => {
          Swal.close();
          this.isLoading = true;
          this.stakeholderService.changeInspectorStatus(inspector.id, 'Approved').subscribe(
            (res: any) => {
              this.isLoading = false;
              if (res.status) {
                Swal.fire({
                  icon: 'success',
                  title: 'Success!',
                  text: 'The Field Inspector was approved successfully.',
                  showConfirmButton: false,
                  timer: 3000,
                  customClass: {
                    popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                    title: 'font-semibold',
                  },
                });
                this.loadInspectors();
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Error!',
                  text: 'Something went wrong. Please try again.',
                  showConfirmButton: false,
                  timer: 3000,
                  customClass: {
                    popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                    title: 'font-semibold',
                  },
                });
              }
            },
            () => {
              this.isLoading = false;
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'An error occurred. Please try again.',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold',
                },
              });
            }
          );
        });
      }

      if (showRejectButton) {
        document.getElementById('rejectButton')?.addEventListener('click', () => {
          Swal.close();
          this.isLoading = true;
          this.stakeholderService.changeInspectorStatus(inspector.id, 'Rejected').subscribe(
            (res: any) => {
              this.isLoading = false;
              if (res.status) {
                Swal.fire({
                  icon: 'success',
                  title: 'Success!',
                  text: 'The Field Inspector was rejected successfully.',
                  showConfirmButton: false,
                  timer: 3000,
                  customClass: {
                    popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                    title: 'font-semibold',
                  },
                });
                this.loadInspectors();
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Error!',
                  text: 'Something went wrong. Please try again.',
                  showConfirmButton: false,
                  timer: 3000,
                  customClass: {
                    popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                    title: 'font-semibold',
                  },
                });
              }
            },
            () => {
              this.isLoading = false;
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'An error occurred. Please try again.',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold',
                },
              });
            }
          );
        });
      }
    },
  });
}


  viewInspector(id: number) {
    this.router.navigate([`/steckholders/action/field-officer-profile/${id}`]);
  }

  addNew() {
    this.router.navigate(['/steckholders/action/add-fieald-officer']);
  }

  onBack(): void {
    this.router.navigate(['/steckholders/action']);
  }

}
