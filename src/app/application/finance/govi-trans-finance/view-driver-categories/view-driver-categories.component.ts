import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';

interface DriverCategory {
  id: number;
  categoryName: string;
  payoutPerOrder: number;
  lastModifiedBy: string;
  lastEditOn: string;
}

@Component({
  selector: 'app-view-driver-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './view-driver-categories.component.html',
  styleUrl: './view-driver-categories.component.css',
})
export class ViewDriverCategoriesComponent {
  isLoading = false;
  searchCategory = '';

  driverCategoriesAll: DriverCategory[] = [
    {
      id: 1,
      categoryName: 'Random Driver',
      payoutPerOrder: 300.0,
      lastModifiedBy: 'Hashinika',
      lastEditOn: 'July 10, 2026',
    },
    {
      id: 2,
      categoryName: 'Regular Driver',
      payoutPerOrder: 250.0,
      lastModifiedBy: 'Hashinika',
      lastEditOn: 'July 10, 2026',
    },
  ];

  driverCategories: DriverCategory[] = [...this.driverCategoriesAll];

  constructor(private router: Router) {}

  back(): void {
    this.router.navigate(['/finance/action/govi-trans-finance']);
  }

  onSearch(): void {
    const term = this.searchCategory.trim().toLowerCase();
    if (!term) {
      this.driverCategories = [...this.driverCategoriesAll];
      return;
    }
    this.driverCategories = this.driverCategoriesAll.filter((c) =>
      c.categoryName.toLowerCase().includes(term),
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
