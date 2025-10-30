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
  Crop 
} from '../../../services/plant-care/certificate-company.service';

@Component({
  selector: 'app-individual-farmers-audits',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
    FormsModule,
  ],
  templateUrl: './individual-farmers-audits.component.html',
  styleUrls: ['./individual-farmers-audits.component.css']
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

  constructor(
    private router: Router,
    private location: Location,
    public tokenService: TokenService,
    public permissionService: PermissionService,
    private certificateCompanyService: CertificateCompanyService
  ) {}

  ngOnInit() {
    this.fetchAudits();
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
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
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

  // Open crops modal
  openCropsModal(audit: FieldAudit) {
    this.isLoadingCrops = true;
    this.showCropsModal = true;
    this.selectedCertificateName = audit.certificateName;
    this.selectedCertificateApplicable = audit.certificateApplicable;
    this.selectedAuditCrops = [];

    this.certificateCompanyService.getCropsByFieldAuditId(audit.auditNo).subscribe(
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
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
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
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
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

  getFarmerName(audit: FieldAudit): string {
    return `${audit.farmerFirstName || ''} ${audit.farmerLastName || ''}`.trim() || '--';
  }

  getOfficerName(audit: FieldAudit): string {
    return `${audit.officerFirstName || ''} ${audit.officerLastName || ''}`.trim() || '--';
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
    return officerFirstName ? 'bg-[#BBFFC6] text-[#308233]' : 'bg-[#F8FFA6] text-[#A8A100]';
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