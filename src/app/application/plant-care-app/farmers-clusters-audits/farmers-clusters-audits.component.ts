import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';
import {
  CertificateCompanyService,
  FarmerClusterAudit,
  FieldOfficer,
} from '../../../services/plant-care/certificate-company.service';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-farmers-clusters-audits',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
    FormsModule,
    DropdownModule,
  ],
  templateUrl: './farmers-clusters-audits.component.html',
  styleUrls: ['./farmers-clusters-audits.component.css'],
})
export class FarmersClustersAuditsComponent implements OnInit {
  audits: FarmerClusterAudit[] = [];
  isLoading = false;
  hasData: boolean = true;
  searchTerm: string = '';

  // Popup state
  isOfficerPopUp = false;
  isAssignPopup = false;
  isCompletedJobPopup = false;
  assignedOfficerArray: string[] = [];

  // Assign popup state
  selectedOfficerRole: string = '';
  selectedOfficerId: string = '';
  availableOfficers: FieldOfficer[] = [];
  selectedOfficerInfo: FieldOfficer | null = null;
  isLoadingOfficers = false;
  isAssigning = false;
  assignError = '';
  selectedAudit: FarmerClusterAudit | null = null;
  currentAssignedOfficer: any = null;

  // Schedule date properties
  selectedScheduleDate: string = '';
  showDatePicker: boolean = false;
  minDate: string = '';

  // Officer Role Options
  officerRoleOptions = [
    { label: 'Field Officer', value: 'Field Officer' },
    { label: 'Chief Field Officer', value: 'Chief Field Officer' },
  ];

  constructor(
    private router: Router,
    private location: Location,
    public tokenService: TokenService,
    public permissionService: PermissionService,
    private certificateCompanyService: CertificateCompanyService
  ) {}

  ngOnInit() {
    this.fetchAudits();
    this.setMinDate();
  }

  // Set minimum date for date picker
  setMinDate(): void {
    const now = new Date();
    this.minDate = now.toISOString().split('T')[0];
  }

  onSearch() {
    this.fetchAudits();
  }

  offSearch() {
    this.searchTerm = '';
    this.fetchAudits();
  }

  fetchAudits() {
    this.isLoading = true;

    this.certificateCompanyService
      .getFarmerClustersAudits(this.searchTerm)
      .subscribe(
        (response) => {
          this.isLoading = false;
          if (response.status && response.data) {
            this.audits = response.data;
            this.hasData = this.audits.length > 0;
          } else {
            this.audits = [];
            this.hasData = false;
            Swal.fire({
              title: 'Info',
              text: response.message || 'No cluster audits found',
              icon: 'info',
              customClass: {
                popup:
                  'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            });
          }
        },
        (error) => {
          this.isLoading = false;
          console.error('Error fetching cluster audits:', error);
          Swal.fire({
            title: 'Error',
            text: 'Failed to fetch cluster audits. Please try again.',
            icon: 'error',
            customClass: {
              popup:
                'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
          this.audits = [];
          this.hasData = false;
        }
      );
  }

  // Handle assign status click
  onAssignStatusClick(audit: FarmerClusterAudit): void {
    // Special condition: If audit is completed and assigned, show warning popup
    if (audit.status === 'Completed' && audit.officerFirstName) {
      this.selectedAudit = audit;
      this.isCompletedJobPopup = true;
      return;
    }

    // For Pending status, always show assign popup regardless of assignment status
    if (audit.status === 'Pending') {
      this.openAssignPopup(audit);
    } else if (audit.officerFirstName) {
      // For other statuses with assigned officer, show officer details popup
      this.officerPopUpOpen(audit);
    } else {
      // For other statuses without assigned officer, open assign popup
      this.openAssignPopup(audit);
    }
  }

  // Open assign popup
  openAssignPopup(audit: FarmerClusterAudit): void {
    this.selectedAudit = audit;
    this.selectedOfficerRole = '';
    this.selectedOfficerId = '';
    this.availableOfficers = [];
    this.selectedOfficerInfo = null;
    this.currentAssignedOfficer = null;
    this.assignError = '';
    this.showDatePicker = false;

    // Set initial schedule date from audit if available
    if (audit.sheduleDate) {
      const scheduleDate = new Date(audit.sheduleDate);
      this.selectedScheduleDate = scheduleDate.toISOString().split('T')[0];
    } else {
      this.selectedScheduleDate = '';
    }

    // If audit is already assigned, pre-fill the current officer info
    if (audit.officerFirstName && audit.officerEmpId) {
      this.currentAssignedOfficer = {
        name: `${audit.officerFirstName} ${audit.officerLastName}`,
        empId: audit.officerEmpId,
        role: audit.officerJobRole || 'Field Officer'
      };

      // Pre-select the officer role
      this.selectedOfficerRole = audit.officerJobRole || 'Field Officer';
      
      // Load officers for the selected role and district
      this.loadOfficersByDistrictAndRole(
        audit.clusterDistrict,
        this.selectedOfficerRole
      );
    }

    this.isAssignPopup = true;
  }

  // Close assign popup
  assignPopupClose(): void {
    this.isAssignPopup = false;
    this.selectedAudit = null;
    this.selectedOfficerRole = '';
    this.selectedOfficerId = '';
    this.availableOfficers = [];
    this.selectedOfficerInfo = null;
    this.currentAssignedOfficer = null;
    this.assignError = '';
    this.selectedScheduleDate = '';
    this.showDatePicker = false;
  }

  // Close completed job popup
  completedJobPopupClose(): void {
    this.isCompletedJobPopup = false;
    this.selectedAudit = null;
  }

  // When officer role changes
  onOfficerRoleChange(): void {
    this.selectedOfficerId = '';
    this.selectedOfficerInfo = null;
    this.availableOfficers = [];

    if (this.selectedOfficerRole && this.selectedAudit) {
      this.loadOfficersByDistrictAndRole(
        this.selectedAudit.clusterDistrict,
        this.selectedOfficerRole
      );
    }
  }

  // Load officers by district and role
  loadOfficersByDistrictAndRole(district: string, role: string): void {
    this.isLoadingOfficers = true;
    this.assignError = '';

    this.certificateCompanyService
      .getOfficersByDistrictAndRole(district, role)
      .subscribe({
        next: (response) => {
          this.isLoadingOfficers = false;
          if (response.status && response.data) {
            this.availableOfficers = response.data.map(
              (officer: FieldOfficer) => ({
                ...officer,
                displayName: `${officer.firstName} ${officer.lastName} - (${officer.empId})`,
              })
            );

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

            if (this.availableOfficers.length === 0) {
              this.assignError = `No ${role}s available in ${district} district`;
            }
          } else {
            this.availableOfficers = [];
            this.assignError = response.message || 'No officers found';
          }
        },
        error: (error) => {
          this.isLoadingOfficers = false;
          console.error('Error loading officers:', error);
          this.availableOfficers = [];
          this.assignError = 'Failed to load officers. Please try again.';
        },
      });
  }

  // When officer is selected
  onOfficerSelected(): void {
    if (this.selectedOfficerId) {
      const officer = this.availableOfficers.find(
        (officer) => officer.empId === this.selectedOfficerId
      );
      this.selectedOfficerInfo = officer || null;
    } else {
      this.selectedOfficerInfo = null;
    }
  }

  // Assign officer to audit
  assignOfficer(): void {
    if (
      !this.selectedAudit ||
      !this.selectedOfficerId ||
      !this.selectedOfficerInfo
    ) {
      this.assignError = 'Please select an officer';
      return;
    }

    this.isAssigning = true;
    this.assignError = '';

    const officerId = this.selectedOfficerInfo.id;
    const auditId = this.selectedAudit.auditNo;
    const scheduleDate = this.selectedScheduleDate
      ? new Date(this.selectedScheduleDate)
      : undefined;

    // Call the service with all parameters
    this.certificateCompanyService
      .assignOfficerToFieldAudit(auditId, officerId, scheduleDate)
      .subscribe({
        next: (response) => {
          this.isAssigning = false;
          if (response.status) {
            this.assignPopupClose();
            this.fetchAudits(); // Refresh the audit list

            Swal.fire({
              title: 'Success',
              text:
                response.message ||
                (this.currentAssignedOfficer 
                  ? 'Officer assignment updated successfully'
                  : scheduleDate
                  ? 'Officer assigned and schedule date updated successfully'
                  : 'Officer assigned successfully'),
              icon: 'success',
              customClass: {
                popup:
                  'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            });
          } else {
            this.assignError = response.message || 'Failed to assign officer';
          }
        },
        error: (error) => {
          this.isAssigning = false;
          console.error('Error assigning officer:', error);
          this.assignError = 'An error occurred while assigning officer';
        },
      });
  }

  // Format date for display
  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getOfficerName(audit: FarmerClusterAudit): string {
    return (
      `${audit.officerFirstName || ''} ${audit.officerLastName || ''}`.trim() ||
      '--'
    );
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'text-green-500';
      case 'pending':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  }

  getAssignClass(officerFirstName: string | null): string {
    return officerFirstName
      ? 'bg-[#BBFFC6] text-[#308233]'
      : 'bg-[#F8FFA6] text-[#A8A100]';
  }

  getAssignText(officerFirstName: string | null): string {
    return officerFirstName ? 'Assigned' : 'Not Assigned';
  }

  addNew() {
    this.router.navigate(['/plant-care/action/add-new-cluster-audit']);
  }

  onBack(): void {
    this.location.back();
  }

  // Officer popup methods
  officerPopUpOpen(audit: FarmerClusterAudit): void {
    if (audit.officerFirstName) {
      const officerInfo = [
        `${audit.officerFirstName} ${audit.officerLastName}`,
        `Status: ${audit.status}`,
        `Certificate: ${audit.certificateName}`,
        `District: ${audit.clusterDistrict}`,
      ];

      // Add schedule date if available
      if (audit.sheduleDate) {
        officerInfo.push(
          `Schedule Date: ${new Date(audit.sheduleDate).toLocaleString()}`
        );
      }

      this.assignedOfficerArray = officerInfo;
    } else {
      this.assignedOfficerArray = ['No officer assigned'];
    }
    this.isOfficerPopUp = true;
  }

  officerPopUpClose(): void {
    this.isOfficerPopUp = false;
    this.assignedOfficerArray = [];
  }
}