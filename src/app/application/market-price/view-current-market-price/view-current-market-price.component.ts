import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { MarketPriceService } from '../../../services/market-price/market-price.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-view-current-market-price',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
    DropdownModule,
    FormsModule,
  ],
  templateUrl: './view-current-market-price.component.html',
  styleUrl: './view-current-market-price.component.css',
})
export class ViewCurrentMarketPriceComponent implements OnInit {
  isLoading = false;
  currentDate: string;
  market: MarketPrice[] = [];
  selectedCrop: Crop | null = null; // Updated for type safety
  crops!: Crop[];

  selectedGrade: Viraity | null = null; // Updated for type safety
  grades!: Viraity[];

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;

  constructor(private marketSrv: MarketPriceService) {
    this.currentDate = new Date().toLocaleDateString();
  }

  ngOnInit(): void {
    this.fetchAllMarketPrices(this.page, this.itemsPerPage);
    this.getAllCrops();

    this.grades = [
      { id: '1', Vgrade: 'A' },
      { id: '2', Vgrade: 'B' },
      { id: '3', Vgrade: 'C' }
    ];
  }

  fetchAllMarketPrices(page: number = 1, limit: number = this.itemsPerPage) {
    this.page = page;

    const cropId = this.selectedCrop?.id || ''; // Pass cropGroupId if selected
    const grade = this.selectedGrade?.Vgrade || ''; // Pass grade if selected

    this.marketSrv.getAllMarketPrice(page, limit, cropId, grade).subscribe(
      (res) => {
        this.market = res.results;
        this.totalItems = res.total;
        console.log('Market Prices:', res);
      },
      (error) => {
        console.error('Error fetching market price:', error);
        Swal.fire(
          'Error!',
          'There was an error fetching market prices.',
          'error'
        );
      }
    );
  }

  getAllCrops() {
    this.marketSrv.getAllCropName().subscribe(
      (res) => {
        this.crops = res;
        console.log('Crops:', res);
      },
      (error) => {
        console.error('Error fetching crops:', error);
        Swal.fire(
          'Error!',
          'There was an error fetching crops.',
          'error'
        );
      }
    );
  }

  applyFiltersCrop() {
    this.fetchAllMarketPrices(this.page, this.itemsPerPage);
  }

  applyFiltersGrade() {
    this.fetchAllMarketPrices(this.page, this.itemsPerPage);
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllMarketPrices(this.page, this.itemsPerPage);
  }
}

class MarketPrice {
  id!: string;
  cropName!: string;
  varietyName!: string;
  grade!: string;
  price!: string;
  date!: string;
  startTime!: Date;
  endTime!: Date;
}

class Crop {
  id!: string; // Updated to match `cropGroupId`
  cropNameEnglish!: string;
}

class Viraity {
  id!: string;
  Vgrade!: string;
}
