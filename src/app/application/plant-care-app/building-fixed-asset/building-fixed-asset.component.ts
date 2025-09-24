import { Component } from '@angular/core';
import { PlantcareUsersService } from '../../../services/plant-care/plantcare-users.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetsService } from '../../../services/plant-care/assets.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';

interface FixedBuildingAsset {
  fixedassetId: number;
  fixedassetcategory: string;
  type: string;
  floorArea: string;
  ownership: string;
  generalCondition: string;
  district: string;
  createdAt: any;
  buildingfixedassetId: number;
}

@Component({
  selector: 'app-building-fixed-asset',
  standalone: true,
  imports: [LoadingSpinnerComponent, CommonModule],
  templateUrl: './building-fixed-asset.component.html',
  styleUrl: './building-fixed-asset.component.css',
})
export class BuildingFixedAssetComponent {
  isLoading = false;
  userId!: number;
  category: string | null = null;
  fullName: string | null = null;
  fixedAssetB: FixedBuildingAsset[] = [];
  hasData: boolean = true;
  farmName: string | null = null;
  farmId!: number;

  constructor(
    private assetsService: AssetsService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.userId = +params['userId'];
      this.farmId = +params['farmId'];
      this.category = params['category'] || null;
      this.farmName = params['farmName'] || null;
      this.fullName = params['fullName'] || null;
    });
    this.assetsBuilding(this.userId, this.category, this.farmId);
  }

  assetsBuilding(userId: number, category: any, farmId: number) {
    this.isLoading = true;
    this.assetsService.getAllBuildingFixedAsset(userId, category, farmId).subscribe(
      (response) => {
        this.isLoading = false;
        this.fixedAssetB = response;
        this.hasData = this.fixedAssetB.length > 0;
      },
      (error) => {
        this.isLoading = false;
      }
    );
  }

  viewFixedAssetOwnershipDetails(buildingfixedassetId: number) {
    this.router.navigate(['/plant-care/action/assets/fixed-asset-category/building-fixed-asset/details'], {
      queryParams: {
        buildingfixedassetId: buildingfixedassetId,
        fullName: this.fullName,
        farmName: this.farmName,
        category: this.category
      },
    });
  }
}
