// farmers-farms-fixed-assets-land.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetsService } from '../../../services/plant-care/assets.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface LandDetails {
  landAssetId?: number;
  ownership?: string;
  type?: string;
  extent?: string;
  generalCondition?: string;
  district?: string;
  perennialCrop?: string;
  landFenced?: string;
  extentha?: number;
  extentac?: number,
  extentp?: number,
  totalExtentInHectares?: number;
}

interface OwnershipDetails {
  id?: number;
  buildingAssetId?: number | null;
  landAssetId?: number;
  // For Leased Land
  startDate?: string;
  durationYears?: number;
  durationMonths?: number;
  leastAmountAnnually?: string;
  // For Own Land & Permit Land
  issuedDate?: string;
  estimateValue?: string;
  permitFeeAnnually?: string;
  // For Shared / No Ownership
  paymentAnnually?: string;
}

interface ApiResponse {
  landDetails: LandDetails;
  ownershipDetails: OwnershipDetails;
  ownershipType: string;
}

@Component({
  selector: 'app-farmers-farms-fixed-assets-land',
  standalone: true,
  imports: [LoadingSpinnerComponent, CommonModule, FormsModule],
  templateUrl: './farmers-farms-fixed-assets-lands.component.html',
  styleUrl: './farmers-farms-fixed-assets-lands.component.css'
})
export class FarmersFarmsFixedAssetsLandComponent implements OnInit {
  isLoading = false;
  landfixedassetId!: number;
  fullName: string | null = null;
  farmName: string | null = null;
  category: string | null = null;

  // Separate properties matching API response structure
  landDetails: LandDetails | null = null;
  ownershipDetails: OwnershipDetails | null = null;
  ownershipType: string | null = null;

  hasData: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assetsService: AssetsService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.landfixedassetId = +params['landfixedassetId'];
      this.fullName = params['fullName'] || null;
      this.farmName = params['farmName'] || null;
      this.category = params['category'] || null;

      console.log('Query Params:', {
        landfixedassetId: this.landfixedassetId,
        fullName: this.fullName,
        farmName: this.farmName,
        category: this.category
      });

      if (this.landfixedassetId) {
        this.getLandOwnershipDetails();
      }
    });
  }

  getLandOwnershipDetails() {
    this.isLoading = true;
    this.errorMessage = null;

    this.assetsService.getLandOwnershipDetails(this.landfixedassetId).subscribe(
      (response: ApiResponse) => {
        this.isLoading = false;

        // Assign each part of the response to separate properties
        this.landDetails = response.landDetails || null;
        this.ownershipDetails = response.ownershipDetails || null;
        this.ownershipType = response.ownershipType || null;

        this.hasData = !!(response.landDetails && response.ownershipDetails);
        console.log('Land ownership details:', response);
      },
      (error) => {
        this.isLoading = false;
        this.hasData = false;
        console.error('Error fetching land ownership details:', error);

        if (error.status === 404) {
          this.errorMessage = 'Land not found.';
        } else if (error.status === 400) {
          this.errorMessage = 'Invalid land asset ID.';
        } else {
          this.errorMessage = 'An error occurred while fetching land details.';
        }
      }
    );
  }
  
  

  navigatePath(path: string): void {
    this.router.navigate([path]);
  }
}