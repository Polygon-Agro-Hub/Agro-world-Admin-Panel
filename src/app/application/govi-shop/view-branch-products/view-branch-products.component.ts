import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { GovishopService } from '../../../services/govi-shop/govishop.service';

interface Product {
  prodName: string;
  thumbnail: string;
  catName: string;
}

interface Category {
  categoryId: number;
  catName: string;
  thumbnail: string;
}

@Component({
  selector: 'app-view-branch-products',
  standalone: true,
  imports: [LoadingSpinnerComponent, CommonModule, DropdownModule, FormsModule],
  templateUrl: './view-branch-products.component.html',
  styleUrl: './view-branch-products.component.css',
})
export class ViewBranchProductsComponent implements OnInit {
  isLoading = false;
  errorMessage = '';

  shopName = 'Agri Shop';
  branchName = 'Bamblapitiya';
  branchId: number | null = null;

  searchQuery = '';
  selectedCategoryId: string | null = null;

  categoryOptions: { label: string; value: string }[] = [
    { label: 'All Categories', value: 'all' },
  ];

  allProducts: Product[] = [];
  filteredProducts: Product[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private productService: GovishopService,
  ) { }

  ngOnInit(): void {
    // Load branchId and other params
    this.route.params.subscribe((params) => {
      this.branchId = +params['branchId'];
      

      if (this.branchId) {
        this.loadProducts();
      } else if (this.branchId !== null) {
        this.errorMessage = 'Invalid branch ID';
      }
    });

    // Load query params
    this.route.queryParams.subscribe((queryParams) => {
      this.shopName = queryParams['shopName'] || 'Agri Shop';
      this.branchName = queryParams['branchName'] || 'Branch';
      
      
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    

    // Don't make API call if branchId is null
    if (!this.branchId) {
      this.isLoading = false;
      this.errorMessage = 'Branch ID is missing';
      return;
    }

    this.productService
      .getProductsByBranchId(
        this.branchId!,
        this.selectedCategoryId === null ? undefined : this.selectedCategoryId || undefined,
      )
      .subscribe({
        next: (response) => {
          
          this.isLoading = false;

          if (response && response.success) {
            // Set products from response
            this.allProducts = response.products || [];
            this.filteredProducts = [...this.allProducts];
            

            // Load categories from the response
            if (response.categories && response.categories.length > 0) {
              this.loadCategoriesFromResponse(response.categories);
            } else {
              // Ensure we still have the default option if no categories
              this.categoryOptions = [{ label: 'All Categories', value: 'all' }];
            }
          } else {
            this.errorMessage = response?.error || 'Failed to load products';
            console.error('API returned error:', response);
            this.allProducts = [];
            this.filteredProducts = [];
          }
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.isLoading = false;
          this.errorMessage =
            error.error?.error || 'An error occurred while fetching products';
          this.allProducts = [];
          this.filteredProducts = [];
        },
      });
  }

  loadCategoriesFromResponse(categories: Category[]): void {
    this.categoryOptions = [];

    categories.forEach((category) => {
      this.categoryOptions.push({
        label: category.catName,
        value: category.categoryId.toString(),
      });
    });

  }

  back(): void {
    this.location.back();
  }

  onSearch(): void {
    
    this.loadProducts(); // Reload with search filter
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.loadProducts();
  }

  onCategoryChange(): void {
    
    this.loadProducts(); // Reload with category filter
  }
}