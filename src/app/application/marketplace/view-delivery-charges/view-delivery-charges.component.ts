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
  showEditModal: boolean = false;
  editData: any = {
    city: '',
    charge: null,
    id: null, // assuming you have an ID field
  };

  constructor(
    private router: Router,
    private deliveryChargeService: MarketPlaceService
  ) {}

  ngOnInit(): void {
    this.loadDeliveryCharges();
  }

  // In your component.ts
  loadDeliveryCharges(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.deliveryCharges = []; // Clear previous data

    // Make sure we're passing the correct values
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

  openEditModal(data: any): void {
    this.editData = {
      city: data.city,
      charge: data.charge,
      id: data.id, // or whatever unique identifier you use
    };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editData = {
      city: '',
      charge: null,
      id: null,
    };
  }

  updateDeliveryCharge(): void {
    if (!this.editData.id || this.editData.charge === null) {
      Swal.fire({
        title: 'Error!',
        text: 'Invalid data for update',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3980C0',
      });
      return;
    }

    this.isLoading = true;

    // Prepare the data to send (only include necessary fields)
    const updateData = {
      city: this.editData.city,
      charge: this.editData.charge,
    };

    this.deliveryChargeService
      .updateDeliveryCharge(updateData, this.editData.id)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          Swal.fire({
            title: 'Success!',
            text: 'Delivery charge updated successfully',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3980C0',
            timer: 2000,
          });

          // Update the local data
          const index = this.deliveryCharges.findIndex(
            (item) => item.id === this.editData.id
          );
          if (index !== -1) {
            this.deliveryCharges[index].charge = this.editData.charge;
            // Update city too if it's editable (currently your input is readonly)
            this.deliveryCharges[index].city = this.editData.city;
          }

          this.closeEditModal();
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error updating delivery charge:', err);
          Swal.fire({
            title: 'Error!',
            text: err.error?.message || 'Failed to update delivery charge',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3980C0',
          });
        },
      });
  }
}
