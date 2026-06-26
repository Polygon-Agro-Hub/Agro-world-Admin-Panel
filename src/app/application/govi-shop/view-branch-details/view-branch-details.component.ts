import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location, DatePipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { ActivatedRoute, Router } from '@angular/router';
import { GovishopService, BranchDetailsByIdResponse } from '../../../services/govi-shop/govishop.service';

interface BranchDetails {
  id: number;
  shopName: string;
  email: string;
  joinedDate: string;
  phoneNumber: string;
  landPhoneNumber: string;
  brImage: string;
  address: string;
  latitude: number;
  longitude: number;
  province: string;
  district: string;
  businessType: string;
  ownerName: string;
  ownerNIC: string;
  ownerEmail: string;
  ownerPhoneNumber: string;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
  image: string;
  branchName?: string;
  branchJoinedDate?: string;
}

@Component({
  selector: 'app-view-branch-details',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, DatePipe],
  templateUrl: './view-branch-details.component.html',
  styleUrl: './view-branch-details.component.css'
})

export class ViewBranchDetailsComponent implements OnInit {
  isLoading = false;
  branchData: BranchDetails | null = null;
  defaultImage = 'assets/images/defaultImg.png';

  // Map Modal Properties
  showMapPopup = false;
  mapUrl: SafeResourceUrl = '';
  mapIframeLoaded = false;
  hasCoordinates = false;

  // Branch ID
  branchId!: number;

  constructor(
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private govishopService: GovishopService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      const parsed = Number(id);

      if (!parsed) {
        this.branchData = null;
        return;
      }

      this.branchId = parsed;
      this.fetchBranchDetails(this.branchId);
    });
  }

  private fetchBranchDetails(id: number): void {
    this.isLoading = true;

    this.govishopService.getBranchDetailsById(id).subscribe({
      next: (res: BranchDetailsByIdResponse) => {
        const r = res?.result;
        if (!r) {
          this.branchData = null;
          this.isLoading = false;
          return;
        }

        this.branchData = {
          id,

          // shop info
          shopName: r.shopInfo?.shopName,
          email: r.shopInfo?.email,
          joinedDate: r.shopInfo?.createdAt,
          phoneNumber: r.shopInfo?.phone,
        
          address: r.shopInfo?.address,
          businessType: r.shopInfo?.shopType,
          image: r.shopInfo?.logo,

          // branch info
          branchName: r.branchInfo?.branchName,
          branchJoinedDate: r.branchInfo?.createdAt,
          landPhoneNumber: r.branchInfo?.landPhone,
          brImage: r.shopInfo?.logo,
          latitude: r.branchInfo?.latitude,
          longitude: r.branchInfo?.longitude,
          province: r.branchInfo?.province,
          district: r.branchInfo?.district,

          // owner info
          ownerName: r.ownerInfo?.ownerName,
          ownerNIC: r.ownerInfo?.nic,
          ownerEmail: r.ownerInfo?.email,
          ownerPhoneNumber: r.ownerInfo?.shopPhone,

          // change history (API only has updatedBy + updatedAt)
          lastUpdatedBy: String(r.shopInfo?.updatedBy ?? '—'),
          lastUpdatedAt: r.shopInfo?.updatedAt,
        };

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.branchData = null;
      },
    });
  }

  back(): void {
    this.location.back();
  }

  onImageError(event: any): void {
    event.target.src = this.defaultImage;
  }

  // Map Modal Methods
  openMapModal(): void {
    if (this.branchData?.latitude && this.branchData?.longitude) {
      this.hasCoordinates = true;
      const lat = this.branchData.latitude;
      const lon = this.branchData.longitude;

      // OpenStreetMap embed URL
      const mapUrlString = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.01},${lat - 0.01},${lon + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lon}`;
      this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(mapUrlString);
      this.mapIframeLoaded = false;
    } else {
      this.hasCoordinates = false;
    }

    this.showMapPopup = true;
  }

  closePopup(): void {
    this.showMapPopup = false;
    this.mapIframeLoaded = false;
  }
}


