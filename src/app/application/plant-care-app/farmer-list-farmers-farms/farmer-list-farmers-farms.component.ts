import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { PlantcareUsersService, Farm } from '../../../services/plant-care/plantcare-users.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-farmer-list-farmers-farms',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, LoadingSpinnerComponent],
  templateUrl: './farmer-list-farmers-farms.component.html',
  styleUrl: './farmer-list-farmers-farms.component.css'
})
export class FarmerListFarmersFarmsComponent implements OnInit {
  farms: Farm[] = [];
  isLoading = false;
  hasData = false;
  userId!: number;
  farmerName = '';
  farmName="";
  farmId!:number;
  
  // Pagination
  page = 1;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(
    private farmerFarmsService: PlantcareUsersService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.userId = +params['userId'];
      if (this.userId) {
        this.loadFarms();
      }
    });
  }

  loadFarms(): void {
    this.isLoading = true;
    this.farmerFarmsService.getFarmerFarms(this.userId).subscribe({
      next: (response) => {
        this.farms = response.result;
        
        // Extract farmer's full name from the first record
        if (response.result && response.result.length > 0) {
          const farmer = response.result[0];
          this.farmerName = `${farmer.firstName || ''} ${farmer.lastName || ''}`.trim();
        }
        
        // Filter farms that have valid farmId (not null)
        const validFarms = this.farms.filter(farm => farm.farmId !== null);
        
        this.totalItems = validFarms.length;
        this.hasData = validFarms.length > 0;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading farms:', error);
        this.isLoading = false;
        this.hasData = false;
      }
    });
  }

  getAddress(farm: any): string {
    const addressParts = [];
    
    if (farm.farmStreet) addressParts.push(farm.farmStreet);
    if (farm.farmCity) addressParts.push(farm.farmCity);
    if (farm.farmDistrict) addressParts.push(farm.farmDistrict);
    
    return addressParts.length > 0 ? addressParts.join(', ') : 'No Address';
  }
  
  viewFixedAsset(userId: number, firstName: string, lastName: string,farmName:string,farmId:number) {
    this.router.navigate(['/plant-care/action/assets/fixed-asset-category'], {
      queryParams: { userId, firstName, lastName ,farmName, farmId },
    });
  }

  onPageChange(page: number): void {
    this.page = page;
  }

  navigatePath(path: string): void {
    this.router.navigate([path]);
  }
}