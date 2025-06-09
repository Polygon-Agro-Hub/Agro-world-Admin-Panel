import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

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
        next: (response: DeliveryCharge[]) => {
          console.log('Delivery charges loaded successfully:', response);
          this.deliveryCharges = response;
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

  upload(): void {
    this.router.navigate(['/market/action/upload-delivery-charges']);
  }

  async downloadTemplate(): Promise<void> {
    try {
      this.deliveryChargeService.getAllDeliveryCharges().subscribe({
        next: (dbData: any[]) => {
          const excelData = [
            ['City Name', 'Charge (Rs.)'],
            ...dbData.map((item) => [item.city || item.cityName, item.charge]),
          ];

          const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(excelData);

          const wb: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Delivery Charges Template');

          const fileName = `Delivery_Charges_Template_${
            new Date().toISOString().split('T')[0]
          }.xlsx`;

          XLSX.writeFile(wb, fileName);

          Swal.fire({
            title: 'Success!',
            text: 'Template with database data downloaded successfully',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3980C0',
            timer: 3000,
          });
        },
        error: (error) => {
          console.error('Error generating template:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to download template with database data',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3980C0',
          });
        },
      });
    } catch (error) {
      console.error('Error generating template:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to download template with database data',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3980C0',
      });
    }
  }
}
