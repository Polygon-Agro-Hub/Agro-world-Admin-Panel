import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';

interface DeliveryCharge {
  id: number;
  city: string;
  district: string;
  province: string;
  charge: number;
  userName: string;
}

interface ApiResponse {
  success?: boolean;
  data?: DeliveryCharge[];
  message?: string;
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
    id: null,
  };

  constructor(
    private router: Router,
    private deliveryChargeService: MarketPlaceService,
    public permissionService: PermissionService,
    public tokenService: TokenService
  ) { }

  ngOnInit(): void {
    this.loadDeliveryCharges();
  }


  loadDeliveryCharges(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.deliveryCharges = [];

    this.deliveryChargeService
      .getAllDeliveryCharges(this.searchCity, this.exactCity)
      .subscribe({
        next: (response: DeliveryCharge[]) => {
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
            ['Province', 'District', 'City', 'Charge'],
            ...dbData.map((item) => [item.province, item.district, item.city, item.charge]),
          ];

          const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(excelData);

          const wb: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Delivery Charges Template');

          const fileName = `Delivery_Charges_Template_${new Date().toISOString().split('T')[0]
            }.xlsx`;

          XLSX.writeFile(wb, fileName);

          Swal.fire({
            title: 'Success!',
            text: 'Template with database data downloaded successfully',
            icon: 'success',
            confirmButtonText: 'OK',
            timer: 3000,
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
              confirmButton: 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700',
            },
          });
        },
        error: (error) => {
          console.error('Error generating template:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to download template with database data',
            icon: 'error',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
              confirmButton: 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
            },
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
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
          confirmButton: 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
        },
      });
    }
  }

  openEditModal(data: any): void {
    this.editData = {
      city: data.city,
      charge: data.charge,
      id: data.id,
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
  onChargeInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    const selectionStart = input.selectionStart ?? 0;
    const selectionEnd = input.selectionEnd ?? 0;


    value = value.replace(/[^0-9.]/g, '');


    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts[1];
    }


    if (parts[1]?.length > 2) {
      parts[1] = parts[1].substring(0, 2);
      value = parts[0] + '.' + parts[1];
    }


    if (input.value !== value) {
      input.value = value;

      let newPos = selectionStart;


      if (value.endsWith('.') && selectionStart === value.length - 1) {
        newPos = value.length;
      } else if (selectionStart > value.length) {
        newPos = value.length;
      }

      input.setSelectionRange(newPos, newPos);
    }

    this.editData.charge = value ? parseFloat(parseFloat(value).toFixed(2)) : null;

  }



  updateDeliveryCharge(): void {
    if (!this.editData.id || this.editData.charge === null) {
      Swal.fire({
        title: 'Error!',
        text: 'Invalid data for update',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
          confirmButton: 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
        },
      });
      return;
    }

    this.isLoading = true;

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
            timer: 2000,
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
              confirmButton: 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700',
            },
          });

          const index = this.deliveryCharges.findIndex(
            (item) => item.id === this.editData.id
          );
          if (index !== -1) {
            this.deliveryCharges[index].charge = this.editData.charge;

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
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
              confirmButton: 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
            },
          });
        },
      });
  }

  preventLeadingSpace(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const currentValue = input.value;


    if (currentValue.length === 0 && event.key === ' ') {
      event.preventDefault();
    }
  }

  trimLeadingSpaces(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value.startsWith(' ')) {
      this.searchCity = value.trimStart();

      input.value = this.searchCity;
    }
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;


    value = value.trimStart();

    this.searchCity = value;
    input.value = value;
  }
}