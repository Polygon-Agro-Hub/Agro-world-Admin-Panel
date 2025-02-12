import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetsService } from '../../../services/plant-care/assets.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-fixed-asset-category',
  standalone: true,
  imports: [LoadingSpinnerComponent, CommonModule],
  templateUrl: './fixed-asset-category.component.html',
  styleUrl: './fixed-asset-category.component.css'
})
export class FixedAssetCategoryComponent {

  constructor(private assetsService: AssetsService, private http: HttpClient, private router: Router, private route: ActivatedRoute) { }


  
  userId: any | null = null;
  firstName: string = '';
  lastName: string = '';
  fullName: string = '';
 

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.userId = params['id'] ? +params['id'] : null;
      this.firstName = params['firstName'] ? params['firstName'] : null;
      this.lastName = params['lastName'] ? params['lastName'] : null;
      
      
      console.log('Received item ID:', this.userId);
      console.log(this.firstName,this.lastName);
      
    });

    this.fullName = `${this.firstName} ${this.lastName}`;
    
  }


  buildingCategory(id: number) {
    this.router.navigate(['plant-care/action/assets/fixed-asset-category/building-fixed-asset'], { 
      queryParams: { id, category: 'Building and Infrastructures' , fullName: this.fullName} 
    });
  }

  landCategory(id: number) {
    this.router.navigate(['plant-care/action/assets/fixed-asset-category/land-fixed-asset'], { 
      queryParams: { id, category: 'Land', fullName: this.fullName } 
    });
  }

  machCategory(id: number) {
    this.router.navigate(['plant-care/action/assets/fixed-asset-category/machinary&tools-fixed-asset'], { 
      queryParams: { id, category: 'Machinery and Vehicles', fullName: this.fullName } 
    });
  }

  toolsCategory(id: number) {
    this.router.navigate(['plant-care/action/assets/fixed-asset-category/machinary&tools-fixed-asset'], { 
      queryParams: { id, category: 'Tools and Equipments', fullName: this.fullName } 
    });
  }

}
