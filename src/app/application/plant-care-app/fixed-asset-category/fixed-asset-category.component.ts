import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetsService } from '../../../services/plant-care/assets.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-fixed-asset-category',
  standalone: true,
  imports: [ CommonModule],
  templateUrl: './fixed-asset-category.component.html',
  styleUrl: './fixed-asset-category.component.css',
})
export class FixedAssetCategoryComponent {
  constructor(
    private assetsService: AssetsService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  userId: number | null = null;
  farmId: number | null = null;
  firstName: string = '';
  lastName: string = '';
  fullName: string = '';
  farmName: string = '';
  
  hasData: boolean = true; 
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      // Extract userId (note: your URL has 'userId' not 'id')
      this.userId = params['userId'] ? +params['userId'] : null;
      
      // Extract farmId
      this.farmId = params['farmId'] ? +params['farmId'] : null;
      
      // Extract other string parameters
      this.firstName = params['firstName'] || '';
      this.lastName = params['lastName'] || '';
      this.farmName = params['farmName'] || '';
    });

    this.fullName = `${this.firstName} ${this.lastName}`;
    
    // Log the extracted values for debugging
    console.log('Extracted parameters:', {
      userId: this.userId,
      farmId: this.farmId,
      firstName: this.firstName,
      lastName: this.lastName,
      farmName: this.farmName,
      fullName: this.fullName
    });
  }

buildingCategory(userId: number, farmId: number) {
    this.router.navigate(
      ['/plant-care/action/assets/fixed-asset-category/building-fixed-asset'],
      {
        queryParams: {
          userId: userId,
          farmId: farmId,
          category: 'Building and Infrastructures',
          fullName: this.fullName,
          farmName: this.farmName
        },
      }
    );
  }

  landCategory(userId: number, farmId: number) {
    this.router.navigate(
      ['/plant-care/action/assets/fixed-asset-category/land-fixed-asset'],
      {
        queryParams: { 
          userId: userId,
          farmId: farmId,
          category: 'Land', 
          fullName: this.fullName,
          farmName: this.farmName
        },
      }
    );
  }

  machCategory(userId: number, farmId: number) {
    this.router.navigate(
      [
        '/plant-care/action/assets/fixed-asset-category/machinary&tools-fixed-asset',
      ],
      {
        queryParams: {
          userId: userId,
          farmId: farmId,
          category: 'Machinery and Vehicles',
          fullName: this.fullName,
          farmName: this.farmName
        },
      }
    );
  }

  toolsCategory(userId: number, farmId: number) {
    this.router.navigate(
      [
        '/plant-care/action/assets/fixed-asset-category/machinary&tools-fixed-asset',
      ],
      {
        queryParams: {
          userId: userId,
          farmId: farmId,
          category: 'Tools and Equipments',
          fullName: this.fullName,
          farmName: this.farmName
        },
      }
    );
  }

  navigatePath(path: string) {
    // Include all parameters when navigating to preserve context
    this.router.navigate([path], {
      queryParams: {
        userId: this.userId,
        farmId: this.farmId,
        firstName: this.firstName,
        lastName: this.lastName,
        farmName: this.farmName
      }
    });
  }
}