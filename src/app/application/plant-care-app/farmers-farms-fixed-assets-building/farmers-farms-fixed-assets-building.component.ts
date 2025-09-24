import { Component, OnInit } from '@angular/core';
import { ActivatedRoute ,Router} from '@angular/router';
import { AssetsService } from '../../../services/plant-care/assets.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


interface BuildingDetails {
  buildingAssetId?: number;
  ownership?: string;
  type?: string;
  floorArea?: string;
  generalCondition?: string;
  district?: string;
}

interface OwnershipDetails {
  id?: number;
  buildingAssetId?: number;
  landAssetId?: number | null;
  // For Leased Building
  startDate?: string;
  durationYears?: number;
  durationMonths?: number;
  leastAmountAnnually?: string;
  // For Own Building & Permit Building
  issuedDate?: string;
  estimateValue?: string;
  permitFeeAnnually?: string;
  // For Shared / No Ownership
  paymentAnnually?: string;
}
interface ApiResponse {
  buildingDetails: BuildingDetails;
  ownershipDetails: OwnershipDetails;
  ownershipType: string;
}

@Component({
  selector: 'app-farmers-farms-fixed-assets-building',
  standalone: true,
  imports: [LoadingSpinnerComponent, CommonModule,FormsModule],
  templateUrl: './farmers-farms-fixed-assets-building.component.html',
  styleUrl: './farmers-farms-fixed-assets-building.component.css'
})
export class FarmersFarmsFixedAssetsBuildingComponent implements OnInit {
  isLoading = false;
  buildingfixedassetId!: number;
  fullName: string | null = null;
  farmName: string | null = null;
  category: string | null = null;
  
  // Separate properties matching API response structure
  buildingDetails: BuildingDetails | null = null;
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
      this.buildingfixedassetId = +params['buildingfixedassetId'];
      this.fullName = params['fullName'] || null;
      this.farmName = params['farmName'] || null;
      this.category = params['category'] || null;

      console.log('Query Params:', {
        buildingfixedassetId: this.buildingfixedassetId,
        fullName: this.fullName,
        farmName: this.farmName,
        category: this.category
      });

      if (this.buildingfixedassetId) {
        this.getBuildingOwnershipDetails();
      }
    });
  }

  getBuildingOwnershipDetails() {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.assetsService.getBuildingOwnershipDetails(this.buildingfixedassetId).subscribe(
      (response: ApiResponse) => {
        this.isLoading = false;
        
        // Assign each part of the response to separate properties
        this.buildingDetails = response.buildingDetails || null;
        this.ownershipDetails = response.ownershipDetails || null;
        this.ownershipType = response.ownershipType || null;
        
        this.hasData = !!(response.buildingDetails || response.ownershipDetails);
        console.log('Building ownership details:', response);
      },
      (error) => {
        this.isLoading = false;
        this.hasData = false;
        console.error('Error fetching building ownership details:', error);
        
        if (error.status === 404) {
          this.errorMessage = 'Building not found.';
        } else if (error.status === 400) {
          this.errorMessage = 'Invalid building asset ID.';
        } else {
          this.errorMessage = 'An error occurred while fetching building details.';
        }
      }
    );
  }
  
    navigatePath(path: string): void {
    this.router.navigate([path]);
  }
}