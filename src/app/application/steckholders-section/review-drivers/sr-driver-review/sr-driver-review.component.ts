import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { DropdownModule } from 'primeng/dropdown';
import { CollectionOfficerService } from '../../../../services/collection-officer/collection-officer.service';
import {
  DriverPersonalInfoTabComponent,
  IDriverPersonal,
} from '../driver-personal-info-tab/driver-personal-info-tab.component';
import {
  DriverResidentialBankInfoComponent,
  IDriverResidentialBank,
} from '../driver-residential-bank-info/driver-residential-bank-info.component';
import {
  DriverLicenseInsuranceInfoComponent,
  IDriverLicenseInsurance,
} from '../driver-license-insurance-info/driver-license-insurance-info.component';
import {
  DriverVehicaleInfoComponent,
  IDriverVehicle,
} from '../driver-vehicale-info/driver-vehicale-info.component';

@Component({
  selector: 'app-sr-driver-review',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    DriverPersonalInfoTabComponent,
    DriverResidentialBankInfoComponent,
    DriverLicenseInsuranceInfoComponent,
    DriverVehicaleInfoComponent,
  ],
  templateUrl: './sr-driver-review.component.html',
  styleUrl: './sr-driver-review.component.css',
})
export class SrDriverReviewComponent implements OnInit {
  isLoading: boolean = false;
  errorMessage: string | null = null;
  activeTab: string = 'Personal';

  driverId: string | null = null;
  companyId: number | null = null;
  driverName: string = '';
  submittedAt: Date | null = null;

  driverData: {
    Personal: IDriverPersonal;
    ResidentialBank: IDriverResidentialBank;
    LicenseInsurance: IDriverLicenseInsurance;
    Vehicle: IDriverVehicle;
  } | null = null;

  tabs: { key: string; label: string }[] = [
    { key: 'Personal', label: 'Personal Info' },
    { key: 'ResidentialBank', label: 'Residential & Bank Info' },
    { key: 'LicenseInsurance', label: 'License & Insurance Info' },
    { key: 'Vehicle', label: 'Vehicle Info' },
  ];

  // Approve popup state
  isApprovePopupOpen: boolean = false;
  isManagersLoading: boolean = false;
  centerList: { id: number; regCode: string; centerName: string; label: string }[] = [];
  managerList: {
    id: number;
    firstNameEnglish: string;
    lastNameEnglish: string;
    empId: string;
    label: string;
  }[] = [];
  categoryList: { id: number; catName: string }[] = [];
  approveForm: {
    centerId: number | null;
    managerId: number | null;
    empType: 'Permanent' | 'Temporary' | null;
    categoryId: number | null;
  } = { centerId: null, managerId: null, empType: null, categoryId: null };

  // Reject popup state
  isRejectPopupOpen: boolean = false;
  rejectReason: string = '';
  readonly rejectReasonMaxLength = 50;

  isSubmitting: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private collectionOfficerService: CollectionOfficerService
  ) {}

  ngOnInit(): void {
    this.driverId = this.route.snapshot.paramMap.get('id');
    console.log('id', this.driverId);
    if (this.driverId) {
      this.fetchDriverDetails(this.driverId);
    } else {
      this.errorMessage = 'Driver ID is missing.';
    }
  }

  fetchDriverDetails(id: string): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.collectionOfficerService.getDriverRegistrationDetails(id).subscribe({
      next: (res) => {
        if (res?.status && res.data) {
          this.mapDriverData(res.data);
        } else {
          this.errorMessage = res?.error || 'Driver details not found.';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching driver details:', err);
        this.errorMessage = err?.error?.error || 'Failed to load driver details.';
        this.isLoading = false;
      },
    });
  }

  // API returns an array of single-key section objects:
  // [{ personalInfo }, { residentialAndBankInfo }, { licenseAndInsuranceInfo }, { vehicleInfo }]
  private mapDriverData(data: any): void {
    const sections: any = Array.isArray(data) ? Object.assign({}, ...data) : data;

    const p = sections.personalInfo || {};
    const rb = sections.residentialAndBankInfo || {};
    const li = sections.licenseAndInsuranceInfo || {};
    const v = sections.vehicleInfo || {};

    this.companyId = p.companyId != null ? Number(p.companyId) : null;
    this.driverName = [p.firstNameEnglish, p.lastNameEnglish].filter(Boolean).join(' ');
    this.submittedAt = p.createdAt ? new Date(p.createdAt) : null;

    this.driverData = {
      Personal: {
        firstName: p.firstNameEnglish ?? '',
        lastName: p.lastNameEnglish ?? '',
        driverRole: p.jobRole ?? '',
        languages: p.languages ?? '',
        profileImage: p.image ?? null,
        mobile1: this.formatPhone(p.phoneCode01, p.phoneNumber01) ?? '',
        mobile2: this.formatPhone(p.phoneCode02, p.phoneNumber02),
        nic: p.nic ?? '',
        email: p.email ?? '',
      },
      ResidentialBank: {
        houseNumber: rb.houseNumber ?? '',
        streetName: rb.streetName ?? '',
        city: rb.city ?? '',
        district: rb.district ?? '',
        province: rb.province ?? '',
        country: rb.country ?? '',
        accHolderName: rb.accHolderName ?? '',
        accNumber: rb.accNumber ?? '',
        bankName: rb.bankName ?? '',
        branchName: rb.branchName ?? '',
      },
      LicenseInsurance: {
        licenseId: li.licNo ?? '',
        licenseFrontImage: li.licFrontImg ?? null,
        licenseBackImage: li.licBackImg ?? null,
        insuranceNumber: li.insNo ?? '',
        insuranceExpiryDate: li.insExpDate ?? null,
        insuranceFrontImage: li.insFrontImg ?? null,
        insuranceBackImage: li.insBackImg ?? null,
      },
      Vehicle: {
        registrationNumber: v.vRegNo ?? '',
        vehicleType: v.vType ?? '',
        capacity: v.vCapacity != null ? String(v.vCapacity) : '',
        frontImage: v.vehFrontImg ?? null,
        backImage: v.vehBackImg ?? null,
        side1Image: v.vehSideImgA ?? null,
        side2Image: v.vehSideImgB ?? null,
      },
    };

    console.log('Mapped driver data:', this.driverData);
  }

  private formatPhone(code: string | null, number: string | null): string | null {
    if (!number) return null;
    return `${code ?? ''}${number}`;
  }

  back(): void {
    window.history.back();
  }

  selectTab(tabKey: string): void {
    this.activeTab = tabKey;
  }

  getCurrentTabIndex(): number {
    return this.tabs.findIndex((t) => t.key === this.activeTab);
  }

  goToNextTab(): void {
    const i = this.getCurrentTabIndex();
    if (i < this.tabs.length - 1) {
      this.activeTab = this.tabs[i + 1].key;
      this.scrollToTop();
    }
  }

  goToPreviousTab(): void {
    const i = this.getCurrentTabIndex();
    if (i > 0) {
      this.activeTab = this.tabs[i - 1].key;
      this.scrollToTop();
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getOrdinal(date: Date | null): string {
    if (!date) return '';
    const d = new Date(date).getDate();
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  // ---------------- Approve popup ----------------

  openApprovePopUp(): void {
    this.approveForm = {
      centerId: null,
      managerId: null,
      empType: null,
      categoryId: null,
    };
    this.managerList = [];
    this.isApprovePopupOpen = true;

    if (this.centerList.length === 0) this.loadCenters();
    if (this.categoryList.length === 0) this.loadCategories();
  }

  closeApprovePopUp(): void {
    if (this.isSubmitting) return;
    this.isApprovePopupOpen = false;
  }

  loadCenters(): void {
    if (this.companyId == null) {
      this.centerList = [];
      return;
    }

    this.collectionOfficerService
      .getDistributionCenterNamesByCompany(this.companyId)
      .subscribe({
      next: (res) => {
        const list = res?.data ?? [];
        this.centerList = list
          .filter((c: any) => c?.id != null)
          .map((c: any) => ({
            ...c,
            label: c.regCode ? `${c.regCode} - ${c.centerName}` : c.centerName,
          }));
      },
      error: (err) => {
        console.error('Error fetching distribution centres:', err);
        this.centerList = [];
      },
    });
  }

  onCenterChange(): void {
    this.approveForm.managerId = null;
    this.managerList = [];
    if (this.approveForm.centerId == null || this.companyId == null) return;

    this.isManagersLoading = true;
    this.collectionOfficerService
      .getDistributionManagerNamesByCompany(this.companyId, this.approveForm.centerId)
      .subscribe({
        next: (res) => {
          this.managerList = (res?.data ?? []).map((m: any) => ({
            ...m,
            label:
              [m.firstNameEnglish, m.lastNameEnglish].filter(Boolean).join(' ') +
              (m.empId ? ` (${m.empId})` : ''),
          }));
          this.isManagersLoading = false;
        },
        error: (err) => {
          console.error('Error fetching distribution managers:', err);
          this.managerList = [];
          this.isManagersLoading = false;
        },
      });
  }

  loadCategories(): void {
    this.collectionOfficerService.getDriverCategoryNames().subscribe({
      next: (res) => {
        this.categoryList = (res?.data ?? []).map((c: any) => ({
          id: c.id,
          catName: c.catName,
        }));
      },
      error: (err) => {
        console.error('Error fetching driver categories:', err);
        this.categoryList = [];
      },
    });
  }

  setEmpType(type: 'Permanent' | 'Temporary'): void {
    this.approveForm.empType = type;
  }

  get isApproveFormValid(): boolean {
    const f = this.approveForm;
    return (
      f.centerId != null &&
      f.managerId != null &&
      f.empType != null &&
      f.categoryId != null
    );
  }

  confirmApprove(): void {
    if (!this.driverId || !this.isApproveFormValid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.collectionOfficerService
      .approveDriver(this.driverId, {
        distributedCenterId: Number(this.approveForm.centerId),
        irmId: Number(this.approveForm.managerId),
        empType: this.approveForm.empType!,
        driverCategoryId: Number(this.approveForm.categoryId),
      })
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.isApprovePopupOpen = false;
          this.showAlert(
            'success',
            'Approved!',
            res?.message || 'Driver approved successfully.'
          ).then(() => this.back());
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Error approving driver:', err);
          this.showAlert(
            'error',
            'Error!',
            err?.error?.error || 'Failed to approve the driver.'
          );
        },
      });
  }

  // ---------------- Reject popup ----------------

  openRejectPopUp(): void {
    this.rejectReason = '';
    this.isRejectPopupOpen = true;
  }

  closeRejectPopUp(): void {
    if (this.isSubmitting) return;
    this.isRejectPopupOpen = false;
  }

  get isRejectReasonValid(): boolean {
    return this.rejectReason.trim().length > 0;
  }

  confirmReject(): void {
    if (!this.driverId || !this.isRejectReasonValid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.collectionOfficerService
      .rejectDriver(this.driverId, this.rejectReason.trim())
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.isRejectPopupOpen = false;
          this.showAlert(
            'success',
            'Rejected!',
            res?.message || 'Driver application rejected.'
          ).then(() => this.back());
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Error rejecting driver:', err);
          this.showAlert(
            'error',
            'Error!',
            err?.error?.error || 'Failed to reject the driver.'
          );
        },
      });
  }

  private showAlert(icon: 'success' | 'error', title: string, text: string) {
    return Swal.fire({
      icon,
      title,
      text,
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    });
  }
}
