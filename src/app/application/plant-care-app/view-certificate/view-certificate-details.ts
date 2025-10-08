import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';
import { CropCalendarService } from '../../../services/plant-care/crop-calendar.service';
import {
  CertificateCompanyService,
  CertificateCompany,
} from '../../../services/plant-care/certificate-company.service';

@Component({
  selector: 'app-view-certificate-details',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, DatePipe],
  templateUrl: './view-certificate-details.component.html',
  styleUrls: ['./view-certificate-details.component.css'],
})
export class ViewCertificateDetailsComponent implements OnInit {
  isLoading = false;
  certificateId!: number;
  certificateData: any = null;
  showServiceAreasPopup = false;

  companies: CertificateCompany[] = [];
  cropDropdownOptions: { label: string; value: number }[] = [];
  selectedCrops: { id: number; cropNameEnglish: string }[] = [];

  // Properties for conditional logic
  showTargetCropsSection = false;
  isForSelectedCrops = false;

  constructor(
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private cropCalendarService: CropCalendarService,
    private certificateCompanyService: CertificateCompanyService
  ) {}

  ngOnInit(): void {
    // Get certificate ID from route parameters
    this.route.params.subscribe((params) => {
      this.certificateId = +params['certificateId'];
      if (this.certificateId) {
        this.loadCertificateData();
      } else {
        this.showError('Invalid certificate ID');
      }
    });

    // Load companies for display
    this.loadCompanies();

    // Load crop groups for display
    this.loadCropGroups();
  }

  loadCertificateData(): void {
    this.isLoading = true;
    this.certificateCompanyService
      .getCertificateDetailsById(this.certificateId)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.status && response.data) {
            this.certificateData = response.data;
            this.setupViewLogic();
          } else {
            this.showError(response.message || 'Certificate not found');
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error loading certificate:', err);
          this.showError('Failed to load certificate details');
        },
      });
  }

  setupViewLogic(): void {
    // Set up target crops section visibility
    this.showTargetCropsSection = !!this.certificateData?.applicable;
    this.isForSelectedCrops =
      this.certificateData?.applicable === 'For Selected Crops';

    // Load selected crops if applicable
    if (this.isForSelectedCrops && this.certificateData?.cropIds) {
      this.loadSelectedCrops(this.certificateData.cropIds);
    }
  }

  loadSelectedCrops(cropIds: number[]): void {
    if (cropIds && cropIds.length > 0) {
      // Wait for cropDropdownOptions to be loaded
      const checkCropsLoaded = () => {
        if (this.cropDropdownOptions.length > 0) {
          this.selectedCrops = cropIds.map((id) => {
            const crop = this.cropDropdownOptions.find((c) => c.value === id);
            return {
              id: id,
              cropNameEnglish: crop ? crop.label : `Crop ${id}`,
            };
          });
        } else {
          setTimeout(checkCropsLoaded, 100);
        }
      };
      checkCropsLoaded();
    }
  }

  loadCompanies(): void {
    this.certificateCompanyService.getAllCompaniesNamesOnly().subscribe({
      next: (data) => {
        this.companies = data;
      },
      error: (err) => {
        console.error('Error fetching companies:', err);
      },
    });
  }

  loadCropGroups(): void {
    this.cropCalendarService.getAllCropGroupNamesOnly().subscribe({
      next: (data) => {
        this.cropDropdownOptions = data.map((crop) => ({
          label: crop.cropNameEnglish,
          value: crop.id,
        }));

        // If we have certificate data already loaded, refresh crops
        if (this.certificateData && this.certificateData.cropIds) {
          this.loadSelectedCrops(this.certificateData.cropIds);
        }
      },
      error: (err) => {
        console.error('Error fetching crop groups:', err);
      },
    });
  }

  getCompanyName(companyId: number): string {
    const company = this.companies.find((c) => c.id === companyId);
    return company ? company.companyName : '--';
  }

  getServiceAreasArray(): string[] {
    if (!this.certificateData?.serviceAreas) return [];

    // If it's already an array, return it directly
    if (Array.isArray(this.certificateData.serviceAreas)) {
      return this.certificateData.serviceAreas;
    }

    // If it's a string, try to parse it as JSON
    if (typeof this.certificateData.serviceAreas === 'string') {
      try {
        const parsed = JSON.parse(this.certificateData.serviceAreas);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // If parsing fails, treat it as comma-separated values
        return this.certificateData.serviceAreas
          .split(',')
          .map((area: string) => area.trim())
          .filter((area: string) => area !== '');
      }
    }

    return [];
  }

  getServiceAreasPreview(): string {
    const areas = this.getServiceAreasArray();
    if (areas.length === 0) return 'No service areas';
    
    // Show first 2-3 areas with count
    if (areas.length <= 3) {
      return areas.join(', ');
    } else {
      return `${areas.slice(0, 2).join(', ')} and ${areas.length - 2} more`;
    }
  }

  getFileName(url: string): string {
    if (!url) return 'No file';
    const parts = url.split('/');
    return parts[parts.length - 1] || 'terms.pdf';
  }

  showServiceAreasModal(): void {
    this.showServiceAreasPopup = true;
  }

  closeServiceAreasModal(): void {
    this.showServiceAreasPopup = false;
  }

  viewPdf(): void {
    if (this.certificateData?.tearms) {
      // Open PDF in new tab
      window.open(this.certificateData.tearms, '_blank');
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'No PDF Available',
        text: 'No payment terms file is available for this certificate.',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });
    }
  }

  onBack(): void {
    this.location.back();
  }

  private showError(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    }).then(() => {
      this.router.navigate(['/plant-care/action/view-certificate-list']);
    });
  }
}