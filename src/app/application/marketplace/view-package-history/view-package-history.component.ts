

import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { CalendarModule } from 'primeng/calendar';
interface PackageData {
  productType: string;
  product?: string;
  quantity?: number;
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
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent,CalendarModule],
  templateUrl: './view-package-history.component.html',
  styleUrls: ['./view-package-history.component.css'],
})
export class ViewPackageHistoryComponent implements OnInit {
  packageId: number | null = null;
  packageName: string = 'Unknown Package';
  packageData: PackageData[] = [];
  // toDate: string = '';
  isLoading: boolean = false;
  hasData: boolean = false;
toDate: Date | null = null;
maxDate: Date = new Date();

  productTypeMap = new Map<number, string>();
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
      alert('Invalid or missing package ID. Please provide a valid package ID.');
      this.router.navigate(['/market/action']);
      return;
    }

    const today = new Date();
    this.maxDate = new Date(); // This is a Date object

    this.getPackageHistory();
  }

  private mapPackageDetails(details: ApiResponse['data']['packageDetails']): void {
    this.productTypeMap.clear();
    this.shortCodeMap.clear();

    details.forEach((detail: ApiResponse['data']['packageDetails'][number]) => {
      this.productTypeMap.set(detail.productType.id, detail.productType.typeName);
      this.shortCodeMap.set(detail.productType.id, detail.productType.shortCode);
    });
  }

  private mapDefinePackageItems(items: ApiResponse['data']['definePackage']['items']): PackageData[] {
    return items.map((item: ApiResponse['data']['definePackage']['items'][number]) => ({
      productType: this.shortCodeMap.get(item.productType) || item.shortCode || 'Unknown',
      product: item.dN || 'N/A',
      quantity: parseFloat(item.qty) || 0,
    }));
  }

  getPackageHistory(): void {
    if (!this.packageId) {
      alert('Invalid package ID.');
      this.hasData = false;
      this.packageData = [];
      this.isLoading = false;
      return;
    }

    const token = localStorage.getItem('AdminLoginToken');
    if (!token) {
      alert('You are not logged in. Please log in to continue.');
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    this.hasData = false;

   const effectiveDate = (this.toDate || this.maxDate).toISOString().split('T')[0];


    this.marketplaceService.getPackageHistory(this.packageId, effectiveDate).pipe(
      tap((response) => {
        if (!response.data) {
          alert('No package data available.');
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
          this.packageData = data.packageDetails.map((detail: ApiResponse['data']['packageDetails'][number]) => ({
            productType: this.shortCodeMap.get(detail.productType.id) || 'Unknown',
            product: '---',
            quantity: undefined,
          }));
        } else {
          if (!data.definePackage?.items || data.definePackage.items.length === 0) {
            alert('No data available for the selected date.');
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
          alert('Session expired or unauthorized. Please log in again.');
          localStorage.removeItem('AdminLoginToken');
          this.router.navigate(['/login']);
        } else {
          alert('Failed to fetch package history. Please try again later.');
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
