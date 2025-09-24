import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { CalendarModule } from 'primeng/calendar';

interface PackageData {
  productType: string;
  product: string;
  quantity: string; // Changed to string to allow "-"
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    displayName: string;
    image: string;
    description: string;
    status: string;
    productPrice: string;
    packingFee: string;
    serviceFee: string;
    createdAt: string;
    packageDetails: {
      id: number;
      packageId: number;
      productType: {
        id: number;
        typeName: string;
        shortCode: string;
        createdAt: string;
      };
      qty: number;
      totalPrice: number;
    }[];
    definePackage: {
      createdAt: string;
      items: {
        id: number;
        definePackageId: number;
        productType: number;
        productId: number;
        qty: string;
        price: string;
        shortCode: string;
        productTypePrice: string;
        dN: string;
      }[];
      totalPrice: number;
    };
    pricingSummary: {
      basePrice: string;
      packingFee: string;
      serviceFee: string;
      productsTotal: number;
      definePackageTotal: number;
      grandTotal: string;
    };
  };
}

@Component({
  selector: 'app-view-package-history',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, CalendarModule],
  templateUrl: './view-package-history.component.html',
  styleUrls: ['./view-package-history.component.css'],
})
export class ViewPackageHistoryComponent implements OnInit {
  packageId: number | null = null;
  packageName: string = 'Unknown Package';
  packageData: PackageData[] = [];
  isLoading: boolean = false;
  hasData: boolean = false;
  toDate: Date | null = null;
  maxDate: Date = new Date();

  shortCodeMap = new Map<number, string>();

  @ViewChild('contentToConvert') contentToConvert!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private marketplaceService: MarketPlaceService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.queryParams['id'];
    if (id && !isNaN(+id)) {
      this.packageId = +id;
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Invalid or missing package ID. Please provide a valid package ID.',
        confirmButtonText: 'OK',
      });
      this.router.navigate(['/market/action']);
      return;
    }

    this.maxDate = new Date();
    this.getPackageHistory();
  }

  private mapPackageDetails(details: ApiResponse['data']['packageDetails']): void {
    this.shortCodeMap.clear();
    details.forEach((detail) => {
      this.shortCodeMap.set(detail.productType.id, detail.productType.shortCode);
    });
  }

  private mapDefinePackageItems(items: ApiResponse['data']['definePackage']['items']): PackageData[] {
    return items.map((item) => ({
      productType: this.shortCodeMap.get(item.productType) || item.shortCode || 'Unknown',
      product: item.dN || '-',
      quantity: item.qty || '-',
    }));
  }

  private mapPackageDetailsToPackageData(details: ApiResponse['data']['packageDetails']): PackageData[] {
    return details.map((detail) => ({
      productType: this.shortCodeMap.get(detail.productType.id) || 'Unknown',
      product: '-',
      quantity: '-',
    }));
  }

  getPackageHistory(): void {
    if (!this.packageId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Invalid package ID.',
        confirmButtonText: 'OK',
      });
      this.hasData = false;
      this.packageData = [];
      this.isLoading = false;
      return;
    }

    const token = localStorage.getItem('AdminLoginToken');
    if (!token) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'You are not logged in. Please log in to continue.',
        confirmButtonText: 'OK',
      });
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    this.hasData = false;

    const effectiveDate = this.toDate
      ? this.toDate.toLocaleDateString('en-CA') // Formats as YYYY-MM-DD
      : this.maxDate.toLocaleDateString('en-CA');

    this.marketplaceService.getPackageHistory(this.packageId, effectiveDate).pipe(
      tap((response: ApiResponse) => {
        if (!response.data) {
          Swal.fire({
            icon: 'info',
            title: 'Info',
            text: 'No package data available.',
            confirmButtonText: 'OK',
          });
          this.packageData = [];
          this.hasData = false;
          this.isLoading = false;
          return;
        }

        const data = response.data;
        this.packageName = data.displayName || 'Unknown Package';

        if (this.shortCodeMap.size === 0 && data.packageDetails) {
          this.mapPackageDetails(data.packageDetails);
        }

        if (!this.toDate) {
          this.packageData = this.mapPackageDetailsToPackageData(data.packageDetails);
        } else {
          if (!data.definePackage?.items || data.definePackage.items.length === 0) {
            Swal.fire({
              icon: 'info',
              title: 'Info',
              text: 'No data available for the selected date.',
              confirmButtonText: 'OK',
            });
            this.packageData = [];
            this.hasData = false;
            this.isLoading = false;
            return;
          }
          this.packageData = this.mapDefinePackageItems(data.definePackage.items);
        }

        this.hasData = this.packageData.length > 0;
        this.isLoading = false;
      }),
      catchError((error) => {
        console.error('Error fetching package history:', error);
        this.isLoading = false;
        this.hasData = false;
        this.packageData = [];

        if (error.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Unauthorized',
            text: 'Session expired or unauthorized. Please log in again.',
            confirmButtonText: 'OK',
          });
          localStorage.removeItem('AdminLoginToken');
          this.router.navigate(['/login']);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `Failed to fetch package history: ${error.statusText || 'Unknown error'}. Please try again later.`,
            confirmButtonText: 'OK',
          });
        }

        return throwError(() => new Error('Failed to fetch package history'));
      })
    ).subscribe();
  }

  onDateChange(): void {
    this.getPackageHistory();
  }

  back(): void {
    this.router.navigate(['/market/action/view-packages-list']);
  }
}