import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { CommonModule } from '@angular/common';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-view-package-details',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './view-package-details.component.html',
  styleUrls: ['./view-package-details.component.css'],
})
export class ViewPackageDetailsComponent implements OnInit {
  package: Package | null = null;
  packageDetails: PackageDetails[] = [];
  packageItems: PackageItem[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private marketPlaceService: MarketPlaceService
  ) {}

  back(): void {
    this.router.navigate(['market/action/view-packages-list']);
  }

  ngOnInit(): void {
    this.fetchPackageDetails();
  }

  fetchPackageDetails(): void {
    this.loading = true;
    this.error = null;

    this.route.params.subscribe((params) => {
      const id = +params['id'];

      this.marketPlaceService
        .getPackageWithDetailsById(id)
        .pipe(
          catchError((error) => {
            this.error = error.message || 'Failed to load package details';
            console.error('API Error:', error);
            return of(null);
          }),
          finalize(() => {
            this.loading = false;
          })
        )
        .subscribe((response) => {
          if (response?.success && response.data) {
            const definePackageTotal = parseFloat(response.data.pricingSummary?.definePackageTotal || '0');
            
            this.package = {
              id: response.data.id,
              displayName: response.data.displayName || 'N/A',
              image: response.data.image || null,
              description: response.data.description || '',
              status: response.data.status || '',
              productPrice: parseFloat(response.data.productPrice || '0'),
              packingFee: parseFloat(response.data.packingFee || '0'),
              serviceFee: parseFloat(response.data.serviceFee || '0'),
              date: response.data.definePackage?.createdAt || response.data.createdAt || new Date().toISOString(),
              totalPrice: definePackageTotal
            };

            this.packageDetails = response.data.packageDetails?.map(
              (detail: { productType: { typeName: string }; qty: number }) => ({
                typeName: detail.productType.typeName || 'N/A',
                qty: detail.qty || 0,
              })
            ) || [];

            this.packageItems = response.data.definePackage?.items?.map((item: any) => ({
              productType: item.shortCode || 'N/A',
              productName: item.dN || 'Unknown Product',
              quantity: parseFloat(item.qty) || 0,
              price: parseFloat(item.price) || 0,
            })) || [];
          } else if (response && !response.success) {
            this.error = response.message || 'Package not found';
          } else {
            this.error = 'Invalid package data received';
          }
        });
    });
  }

  formatCurrency(value: number): string {
    return 'Rs.' + (value || 0).toFixed(2);
  }
}

interface Package {
  id: number;
  displayName: string;
  image: string | null;
  description: string;
  status: string;
  productPrice: number;
  packingFee: number;
  serviceFee: number;
  date?: string;
  totalPrice?: number;
}

interface PackageDetails {
  typeName: string;
  qty: number;
}

interface PackageItem {
  productType: string;
  productName: string;
  quantity: number;
  price: number;
}