import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { PlantcareUsersService, Farm } from '../../../services/plant-care/plantcare-users.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import Swal from 'sweetalert2';
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
  userFirstName = '';
  userLastName = '';
  farmerName = '';
  farmName = "";
  farmId!: number;
  
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

deleteFarm(farmId: number) {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    // Dark mode styling
    background: '#1f2937', // Dark background
    color: '#f9fafb', // Light text
    customClass: {
      popup: 'dark-popup',
      title: 'dark-title',
      htmlContainer: 'dark-text',
      confirmButton: 'dark-confirm-btn',
      cancelButton: 'dark-cancel-btn'
    }
  }).then((result) => {
    if (result.isConfirmed) {
      this.farmerFarmsService.deleteFarm(farmId).subscribe({
        next: (res: any) => {
          Swal.fire({
            title: 'Deleted!', 
            text: res.message || 'Farm deleted successfully.', 
            icon: 'success',
            // Dark mode styling for success alert
            background: '#1f2937',
            color: '#f9fafb',
            customClass: {
              popup: 'dark-popup',
              title: 'dark-title',
              htmlContainer: 'dark-text',
              confirmButton: 'dark-success-btn'
            }
          });
          this.farms = this.farms.filter((f) => f.id !== farmId); // filter out deleted farm
          this.totalItems = this.farms.length;
          this.hasData = this.farms.length > 0;
        },
        error: (err) => {
          console.error(err);
          Swal.fire({
            title: 'Error!', 
            text: 'Failed to delete the farm.', 
            icon: 'error',
            // Dark mode styling for error alert
            background: '#1f2937',
            color: '#f9fafb',
            customClass: {
              popup: 'dark-popup',
              title: 'dark-title',
              htmlContainer: 'dark-text',
              confirmButton: 'dark-error-btn'
            }
          });
        },
      });
    }
  });
}

  loadFarms(): void {
    this.isLoading = true;
    this.farmerFarmsService.getFarmerFarms(this.userId).subscribe({
      next: (response) => {
        // Ensure response.result is an object containing user and farms
        const result = response.result as { user?: any; farms?: Farm[] };
        // Extract user information
        if (result && result.user) {
          const user = result.user;
          this.userFirstName = user.firstName || '';
          this.userLastName = user.lastName || '';
          this.farmerName = `${this.userFirstName} ${this.userLastName}`.trim();
          this.userId = user.id;
        }
        
        // Extract farms array
        if (result && result.farms) {
          this.farms = result.farms;
        } else {
          this.farms = [];
        }
        
        this.totalItems = this.farms.length;
        this.hasData = this.farms.length > 0;
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
    
    if (farm.street) addressParts.push(farm.street);
    if (farm.city) addressParts.push(farm.city);
    if (farm.district) addressParts.push(farm.district);
    
    return addressParts.length > 0 ? addressParts.join(', ') : 'No Address';
  }
  
  viewFixedAsset(userId: number, firstName: string, lastName: string, farmName: string, farmId: number) {
    this.router.navigate(['/plant-care/action/assets/fixed-asset-category'], {
      queryParams: { userId, firstName, lastName, farmName, farmId },
    });
  }

  onPageChange(page: number): void {
    this.page = page;
  }

  navigatePath(path: string): void {
    this.router.navigate([path]);
  }
}