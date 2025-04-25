import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { CommonModule } from '@angular/common';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { CurrencyPipe } from '@angular/common';
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
            return of(null);
          }),
          finalize(() => {
            this.loading = false;
          })
        )
        .subscribe((response) => {
          console.log('Package details response:', response);

          if (response?.success && response.data) {
            this.package = {
              id: response.data.id,
              displayName: response.data.displayName,
              image: response.data.image,
              description: response.data.description,
              status: response.data.status,
              total: parseFloat(response.data.total),
              discount: response.data.discount
                ? parseFloat(response.data.discount)
                : null,
              subtotal: parseFloat(response.data.subtotal),
              createdAt: response.data.createdAt,
            };

            this.packageDetails =
              response.data.packageDetails?.map(
                (detail: {
                  packageId: any;
                  mpItemId: any;
                  itemDisplayName: any;
                  normalPrice: any;
                  quantity: any;
                  quantityType: any;
                  price: string;
                  createdAt: any;
                }) => ({
                  packageId: detail.packageId,
                  mpItemId: detail.mpItemId,
                  itemDisplayName: detail.itemDisplayName,
                  normalPrice: detail.normalPrice
                    ? parseFloat(detail.normalPrice)
                    : null,
                  quantity: detail.quantity,
                  quantityType: detail.quantityType,
                  price: parseFloat(detail.price),
                  createdAt: detail.createdAt,
                })
              ) || [];
          } else if (response && !response.success) {
            this.error = response.message || 'Package not found';
          } else {
            this.error = 'Invalid package data received';
          }
        });
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
    })
      .format(value)
      .replace('LKR', 'Rs');
  }
}

interface Package {
  id: number;
  displayName: string;
  image: string | null;
  description: string;
  status: string;
  total: number;
  discount: number | null;
  subtotal: number;
  createdAt: string;
}

interface PackageDetails {
  packageId: number;
  mpItemId: number;
  itemDisplayName: string;
  quantity: number;
  quantityType: string;
  price: number;
  createdAt: string;
  normalPrice: number;
}
