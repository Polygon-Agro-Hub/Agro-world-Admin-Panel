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
  itemId: any | null = null;
  category: string | null = null;
  fullName: string | null = null;
  fixedAssetB: FixedBuildingAsset[] = [];
  hasData: boolean = true;

  constructor(
    private assetsService: AssetsService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.itemId = params['id'] ? +params['id'] : null;
      this.category = params['category'] || null;
      this.fullName = params['fullName'] || null;
    });
    this.assetsBuilding(this.itemId, this.category);
  }

  assetsBuilding(itemId: number, category: any) {
    this.isLoading = true;
    this.assetsService.getAllBuildingFixedAsset(itemId, category).subscribe(
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
}
