import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CollectionOfficerService } from '../../../../services/collection-officer/collection-officer.service';

interface DriverCategory {
  id: number;
  catName: string;
  payout: number;
  userName: string;
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

  // Computed property to check if data exists
  get hasData(): boolean {
    return this.driverCategories.length > 0;
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
      }
    );
  }

  back(): void {
    this.router.navigate(['/finance/action/govi-trans-finance']);
  }

  onSearch(): void {
    const term = this.searchCategory.trim();
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

  // Clear search method
  clearSearch(): void {
    this.searchCategory = '';
    this.driverCategories = [...this.driverCategoriesAll];
    // Optional: Focus the input after clearing
    const input = document.querySelector('input[placeholder="Search by Category Name"]') as HTMLInputElement;
    if (input) {
      input.focus();
    }
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