import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { GovishopService } from '../../../services/govi-shop/govishop.service';

interface Product {
  id: number;
  categoryId: number;
  prodCode: string;
  prodName: string;
  isMRP: number;
  allertLevel: number;
  baseUom: string;
  discription: string;
  thumbnail: string;
  searchKeyWord: string;
  bgColor: string;
  isActive: number;
  isAvailable: number;
  updateAt: string;
  createdAt: string;
  branchProductId: number;
  branchId: number;
  branchProductCreatedAt: string;
}

interface Category {
  categoryId: number;
  categoryName: string;
  thumbnail: string;
  isActive: number;
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
  selectedCategoryId: string | null = 'all'; // Set default to 'all'

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
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.branchId = +params['branchId']; // or 'id' — match your route definition
      console.log('branchId:', this.branchId);
    });

    // shopName and branchName are query params, not route params
    this.route.queryParams.subscribe((queryParams) => {
      this.shopName = queryParams['shopName'] || 'Shop';
      this.branchName = queryParams['branchName'] || 'Branch';
      console.log('shopName:', this.shopName);
      console.log('branchName:', this.branchName);
    });

    // Load products after both are ready
    this.route.params.subscribe((params) => {
      this.branchId = +params['branchId'];
      if (this.branchId) {
        this.loadProducts();
      } else {
        this.errorMessage = 'Invalid branch ID';
      }
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    console.log('Loading products with params:', {
      branchId: this.branchId,
      categoryId: this.selectedCategoryId,
      searchItem: this.searchQuery,
    }); // Debug log

    this.productService
      .getProductsByBranchId(
        this.branchId!,
        this.selectedCategoryId === 'all'
          ? undefined
          : this.selectedCategoryId || undefined,
        this.searchQuery || undefined,
      )
      .subscribe({
        next: (response) => {
          console.log('API Response:', response); // Debug log

          this.isLoading = false;

          if (response && response.success) {
            // Set products from response
            this.allProducts = response.products || [];
            this.filteredProducts = [...this.allProducts];

            console.log('Products loaded:', this.allProducts.length); // Debug log

            // Load categories from the response
            if (response.categories && response.categories.length > 0) {
              this.loadCategoriesFromResponse(response.categories);
            }
          } else {
            this.errorMessage = response?.error || 'Failed to load products';
            console.error('API returned error:', response);
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
    console.log('Loading categories:', categories); // Debug log

    // Reset category options (keep only All Categories)
    this.categoryOptions = [{ label: 'All Categories', value: 'all' }];

    // Add categories from API response
    categories.forEach((category) => {
      this.categoryOptions.push({
        label: category.categoryName,
        value: category.categoryId.toString(),
      });
    });

    console.log('Category options:', this.categoryOptions); // Debug log
  }

  back(): void {
    this.location.back();
  }

  onSearch(): void {
    console.log('Search triggered with query:', this.searchQuery); // Debug log
    this.loadProducts(); // Reload with search filter
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.loadProducts();
  }

  onCategoryChange(): void {
    console.log('Category changed to:', this.selectedCategoryId); // Debug log
    this.loadProducts(); // Reload with category filter
  }
}
