import { Component } from '@angular/core';
import { AssetsService } from '../../../services/plant-care/assets.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";
import { CommonModule } from '@angular/common';


interface FixedBuildingAsset {
  fixedassetId: number;
  fixedassetcategory: string;
  extentha: any;
  extentac: any;
  extentp: any;
  ownership: string;
  district: string;
  perennialCrop: string;
  createdAt: any;

}


@Component({
  selector: 'app-land-fixed-asset',
  standalone: true,
  imports: [LoadingSpinnerComponent, CommonModule],
  templateUrl: './land-fixed-asset.component.html',
  styleUrl: './land-fixed-asset.component.css'
})
export class LandFixedAssetComponent {
  isLoading = false;
  itemId: any | null = null;
  category: string | null = null;
  fixedAssetB: FixedBuildingAsset[] = [];
  fullName: string | null = null;
  hasData: boolean = true; 

  constructor(private assetsService: AssetsService, private http: HttpClient, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.itemId = params['id'] ? +params['id'] : null;
      this.category = params['category'] || null;
      this.fullName = params['fullName'] || null;
      
      console.log('Received item ID:', this.itemId);
      console.log('Received category:', this.category);
    });
    this.assetsBuilding(this.itemId, this.category )
  }

  assetsBuilding(itemId: number, category: any) {
    this.isLoading = true;
    this.assetsService.getAllBuildingFixedAsset(itemId, category)
      .subscribe(
        (response) => {
          this.isLoading = false;
          console.log('Received items:', response); // Debug log
         
          this.fixedAssetB = response;
          this.hasData = this.fixedAssetB.length > 0;
          
        },
        (error) => {
          console.error('Error fetching market prices:', error);
          if (error.status === 401) {
            // Handle unauthorized access (e.g., redirect to login)
          }
        }
      );
  }
}
