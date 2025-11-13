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
  FieldAudit,
  Crop,
  FieldOfficer,
} from '../../../services/plant-care/certificate-company.service';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-individual-farmers-audits',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
    FormsModule,
    DropdownModule,
    CalendarModule,
  ],
  templateUrl: './individual-farmers-audits.component.html',
  styleUrls: ['./individual-farmers-audits.component.css'],
})
export class IndividualFarmersAuditsComponent implements OnInit {
  audits: FieldAudit[] = [];
  isLoading = false;
  hasData: boolean = true;
  searchTerm: string = '';

  // Modal properties
  showCropsModal = false;
  selectedAuditCrops: Crop[] = [];
  selectedCertificateName: string = '';
  selectedCertificateApplicable: string = '';
  isLoadingCrops = false;

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
  selectedAudit: FieldAudit | null = null;
  currentAssignedOfficer: any = null;

  // Schedule date properties - Using Date type for PrimeNG Calendar
  selectedScheduleDate: Date | null = null;
  minDate: Date = new Date();

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
    this.minDate = new Date();
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

    this.certificateCompanyService.getFieldAudits(this.searchTerm).subscribe(
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
            text: response.message || 'No audits found',
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
        console.error('Error fetching audits:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to fetch audits. Please try again.',
          icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
        this.audits = [];
        this.hasData = false;
      }
    );
  }

  // Handle assign status click
  onAssignStatusClick(audit: FieldAudit): void {
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
  openAssignPopup(audit: FieldAudit): void {
    this.selectedAudit = audit;
    this.selectedOfficerRole = '';
    this.selectedOfficerId = '';
    this.availableOfficers = [];
    this.selectedOfficerInfo = null;
    this.currentAssignedOfficer = null;
    this.assignError = '';

    // Set initial schedule date from audit if available
    if (audit.sheduleDate) {
      this.selectedScheduleDate = new Date(audit.sheduleDate);
    } else {
      this.selectedScheduleDate = new Date(); // Default to today
    }

    // If audit is already assigned, pre-fill the current officer info
    if (audit.officerFirstName && audit.officerEmpId) {
      this.currentAssignedOfficer = {
        name: `${audit.officerFirstName} ${audit.officerLastName}`,
        empId: audit.officerEmpId,
        role: audit.officerJobRole || 'Field Officer',
      };

      // Pre-select the officer role
      this.selectedOfficerRole = audit.officerJobRole || 'Field Officer';

      // Load officers for the selected role and district
      this.loadOfficersByDistrictAndRole(
        audit.farmerDistrict,
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
    this.selectedScheduleDate = null;
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

    if (this.selectedOfficerRole && this.selectedAudit && this.selectedScheduleDate) {
      this.loadOfficersByDistrictAndRole(
        this.selectedAudit.farmerDistrict,
        this.selectedOfficerRole
      );
    }
  }

  // Load officers by district and role
  loadOfficersByDistrictAndRole(district: string, role: string): void {
    if (!this.selectedScheduleDate) {
      this.assignError = 'Please select a schedule date first';
      return;
    }

    this.isLoadingOfficers = true;
    this.assignError = '';

    // Convert Date to string format for the API using local date (fixes timezone issue)
    const scheduleDateString = this.formatDateToYYYYMMDD(this.selectedScheduleDate);

    this.certificateCompanyService
      .getOfficersByDistrictAndRole(district, role, scheduleDateString)
      .subscribe({
        next: (response) => {
          this.isLoadingOfficers = false;
          if (response.status && response.data) {
            this.availableOfficers = response.data.map(
              (officer: FieldOfficer) => ({
                ...officer,
                displayName: `${officer.firstName} ${officer.lastName} - ${
                  officer.empId
                } (Jobs: ${officer.jobCount || 0})`,
                activeJobCount: officer.jobCount || 0,
              })
            );
            // console.log(this.availableOfficers);
            
            // If there's a currently assigned officer, try to pre-select them
            console.log(this.currentAssignedOfficer);
            
            if (
              this.currentAssignedOfficer &&
              this.availableOfficers.length > 0
            ) {
              const currentOfficer = this.availableOfficers.find(
                (officer) => officer.empId === this.currentAssignedOfficer.empId
              );
              console.log("CURRENToFFICER ",currentOfficer);
              
              if (currentOfficer) {
                this.selectedOfficerId = currentOfficer.empId;
                this.selectedOfficerInfo = currentOfficer;
              }
            }

            if (this.availableOfficers.length === 0) {
              this.assignError = `No ${role}s available in ${district} district for the selected date`;
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

  // Handle schedule date changes
  onScheduleDateChange(): void {
    // Reload officers when schedule date changes
    if (this.selectedOfficerRole && this.selectedAudit && this.selectedScheduleDate) {
      this.loadOfficersByDistrictAndRole(
        this.selectedAudit.farmerDistrict,
        this.selectedOfficerRole
      );
    }
  }

  // Handle schedule date clear
  onScheduleDateClear(): void {
    this.selectedScheduleDate = null;
    this.availableOfficers = [];
    this.selectedOfficerId = '';
    this.selectedOfficerInfo = null;
    this.assignError = 'Please select a schedule date';
  }

  // When officer is selected
  onOfficerSelected(): void {
    if (this.selectedOfficerId) {
      const officer = this.availableOfficers.find(
        (officer) => officer.empId === this.selectedOfficerId
      );
      this.selectedOfficerInfo = officer || null;
      this.currentAssignedOfficer = officer
    } else {
      this.selectedOfficerInfo = null;
    }
  }

  // Assign officer to audit
  assignOfficer(): void {
    if (
      !this.selectedAudit ||
      !this.selectedOfficerId ||
      !this.selectedOfficerInfo ||
      !this.selectedScheduleDate
    ) {
      this.assignError = 'Please select a schedule date and an officer';
      return;
    }

    this.isAssigning = true;
    this.assignError = '';

    const officerId = this.selectedOfficerInfo.id;
    const auditId = this.selectedAudit.auditNo;
    
    // Use the same date formatting method to avoid timezone issues
    const scheduleDateString = this.formatDateToYYYYMMDD(this.selectedScheduleDate);
    const scheduleDate = new Date(scheduleDateString);

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
                  : 'Officer assigned and schedule date updated successfully'),
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

  // Add this method to format date without timezone issues
  formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Open crops modal
  openCropsModal(audit: FieldAudit) {
    this.isLoadingCrops = true;
    this.showCropsModal = true;
    this.selectedCertificateName = audit.certificateName;
    this.selectedCertificateApplicable = audit.certificateApplicable;
    this.selectedAuditCrops = [];

    this.certificateCompanyService
      .getCropsByFieldAuditId(audit.auditNo)
      .subscribe(
        (response) => {
          this.isLoadingCrops = false;
          if (response.status && response.data) {
            this.selectedAuditCrops = response.data.crops;
          } else {
            this.selectedAuditCrops = [];
            Swal.fire({
              title: 'Info',
              text: response.message || 'No crops found for this audit',
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
          this.isLoadingCrops = false;
          console.error('Error fetching crops:', error);
          Swal.fire({
            title: 'Error',
            text: 'Failed to fetch crops. Please try again.',
            icon: 'error',
            customClass: {
              popup:
                'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
          this.selectedAuditCrops = [];
        }
      );
  }

  // Close crops modal
  closeCropsModal() {
    this.showCropsModal = false;
    this.selectedAuditCrops = [];
    this.selectedCertificateName = '';
    this.selectedCertificateApplicable = '';
  }

  // Officer popup methods
  officerPopUpOpen(audit: FieldAudit): void {
    if (audit.officerFirstName) {
      const officerInfo = [
        `${audit.officerFirstName} ${audit.officerLastName}`,
        `Status: ${audit.status}`,
        `Certificate: ${audit.certificateName}`,
        `District: ${audit.farmerDistrict}`,
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

  getFarmerName(audit: FieldAudit): string {
    return (
      `${audit.farmerFirstName || ''} ${audit.farmerLastName || ''}`.trim() ||
      '--'
    );
  }

  getOfficerName(audit: FieldAudit): string {
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
    this.router.navigate(['/plant-care/action/add-new-audit']);
  }

  onBack(): void {
    this.location.back();
  }
}