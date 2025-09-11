import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AssetsService } from '../../../services/plant-care/assets.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";


interface FixedBuildingAsset {
  fixedassetId: number;
  fixedassetcategory: any;
  asset: any;
  assetType: any;
  mentionOther: any;
  numberOfUnits: any;
  unitPrice: any;
  totalPrice: any;
  warranty: any;
  warrantystatus: any;
  createdAt: any;

}


@Component({
  selector: 'app-mach-tools-fixeed-assets',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './mach-tools-fixeed-assets.component.html',
  styleUrl: './mach-tools-fixeed-assets.component.css'
})
export class MachToolsFixeedAssetsComponent {
  isLoading = false;
  userId!:number;
  category: string | null = null;
  fixedAssetB: FixedBuildingAsset[] = [];
  fullName: string | null = null;
  hasData: boolean = true;  
  farmId!: number;

  constructor(private assetsService: AssetsService, private http: HttpClient, private router: Router, private route: ActivatedRoute) { }
  

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.userId = +params['userId'];
      this.farmId = +params['farmId'];
      this.category = params['category'] || null;
      this.fullName = params['fullName'] || null;
      
      console.log('Received item ID:', this.userId);
      console.log('Received category:', this.category);
    });
    this.assetsBuilding(this.userId, this.category ,this.farmId)
  }

  assetsBuilding(userId: number, category: any,farmId:number) {
    this.isLoading = true;
    this.assetsService.getAllBuildingFixedAsset(userId, category,farmId)
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
