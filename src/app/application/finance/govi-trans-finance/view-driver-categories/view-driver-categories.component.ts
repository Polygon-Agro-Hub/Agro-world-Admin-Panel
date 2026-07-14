import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CollectionOfficerService } from '../../../../services/collection-officer/collection-officer.service';

interface DriverCategory {
  id: number;
  catName: string;  // Changed from categoryName to match backend
  payout: number;   // Changed from payoutPerOrder to match backend
  updatedBy: string;
  updatedAt: string;
}

@Component({
  selector: 'app-view-driver-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './view-driver-categories.component.html',
  styleUrl: './view-driver-categories.component.css',
})
export class ViewDriverCategoriesComponent implements OnInit {
  isLoading = false;
  searchCategory = '';

  driverCategoriesAll: DriverCategory[] = [];
  driverCategories: DriverCategory[] = [];

  constructor(
    private router: Router,
    private collectionOfficerService: CollectionOfficerService
  ) {}

  ngOnInit(): void {
    this.loadDriverCategories();
  }

  loadDriverCategories(): void {
    this.isLoading = true;
    this.collectionOfficerService.getAllDriveCategories().subscribe(
      (response) => {
        if (response.status && response.result) {
          this.driverCategoriesAll = response.result;
          this.driverCategories = [...this.driverCategoriesAll];
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading driver categories:', error);
        this.isLoading = false;
        // Optional: Show error message to user
      }
    );
  }

  back(): void {
    this.router.navigate(['/finance/action/govi-trans-finance']);
  }

  onSearch(): void {
    const term = this.searchCategory.trim().toLowerCase();
    if (!term) {
      this.driverCategories = [...this.driverCategoriesAll];
      return;
    }
    
    this.isLoading = true;
    this.collectionOfficerService.getAllDriveCategories(term).subscribe(
      (response) => {
        if (response.status && response.result) {
          this.driverCategories = response.result;
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error searching driver categories:', error);
        this.isLoading = false;
      }
    );
  }

  addNewCategory(): void {
    this.router.navigate([
      '/finance/action/govi-trans-finance/add-driver-category',
    ]);
  }

  editDriverCategory(id: number): void {
    this.router.navigate([
      '/finance/action/govi-trans-finance/edit-driver-category',
      id,
    ]);
  }
}