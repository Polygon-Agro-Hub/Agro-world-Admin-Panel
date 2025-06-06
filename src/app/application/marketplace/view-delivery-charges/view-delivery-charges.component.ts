import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

interface DeliveryCharge {
  id: number;
  city: string;
  charge: number;
}

interface ApiResponse {
  success?: boolean;
  data?: DeliveryCharge[];
  message?: string;
  // Add other possible properties your API might return
  result?: DeliveryCharge[];
  items?: DeliveryCharge[];
}

@Component({
  selector: 'app-view-delivery-charges',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './view-delivery-charges.component.html',
  styleUrl: './view-delivery-charges.component.css',
})
export class ViewDeliveryChargesComponent implements OnInit {
  page: number = 1;
  itemsPerPage: number = 10;
  deliveryCharges: DeliveryCharge[] = [];
  isLoading = false;
  errorMessage = '';
  searchCity = '';
  exactCity = '';

  constructor(
    private router: Router,
    private deliveryChargeService: MarketPlaceService
  ) {}

  ngOnInit(): void {
    this.loadDeliveryCharges();
  }

  loadDeliveryCharges(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.deliveryCharges = []; // Clear previous data

    this.deliveryChargeService
      .getAllDeliveryCharges(this.searchCity, this.exactCity)
      .subscribe({
        next: (response: ApiResponse | DeliveryCharge[]) => {
          console.log('API Response:', response);

          // Handle different response structures
          if (Array.isArray(response)) {
            // Case 1: Response is the array directly
            this.deliveryCharges = response;
          } else if (response?.data && Array.isArray(response.data)) {
            // Case 2: Response has data property
            this.deliveryCharges = response.data;
          } else if (response?.result && Array.isArray(response.result)) {
            // Case 3: Response uses result property
            this.deliveryCharges = response.result;
          } else if (response?.items && Array.isArray(response.items)) {
            // Case 4: Response uses items property
            this.deliveryCharges = response.items;
          } else {
            console.error('Unexpected response structure:', response);
            this.errorMessage = 'Received data in unexpected format';
          }

          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading delivery charges:', err);
          this.errorMessage =
            err.error?.message || 'Failed to load delivery charges';
          this.isLoading = false;
        },
      });
  }

  navigateToBack(): void {
    this.router.navigate(['/market/action']);
  }
}
