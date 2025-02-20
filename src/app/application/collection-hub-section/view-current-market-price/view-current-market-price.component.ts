import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { MarketPriceService } from '../../../services/market-price/market-price.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { Router } from '@angular/router';

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
  searchNIC: string = '';

  constructor(private marketSrv: MarketPriceService,private router: Router) {
    this.currentDate = new Date().toLocaleDateString();
  }

  ngOnInit(): void {
    this.fetchAllMarketPrices();
    this.getAllCrops();

    this.grades = [
      { id: '1', Vgrade: 'A' },
      { id: '2', Vgrade: 'B' },
      { id: '3', Vgrade: 'C' }
    ];
  }

  fetchAllMarketPrices() {
    this.isLoading = true;

    const cropId = this.selectedCrop?.id || ''; // Pass cropGroupId if selected
    const grade = this.selectedGrade?.Vgrade || ''; // Pass grade if selected

    this.marketSrv.getAllMarketPrice(cropId, grade, this.searchNIC).subscribe(
      (res) => {
        this.isLoading = false;
        this.market = res.results;
        this.totalItems = res.total;
        console.log('Market Prices:', res);
      },
      (error) => {
        console.error('Error fetching market price:', error);
        this.isLoading = false;
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
    this.fetchAllMarketPrices();
  }

  applyFiltersGrade() {
    this.fetchAllMarketPrices();
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllMarketPrices();
  }


  searchPlantCareUsers() {
    this.page = 1;
    this.fetchAllMarketPrices();
  }

  clearSearch(): void {
    this.searchNIC = '';
    this.fetchAllMarketPrices();
  }



  back(): void {
    this.router.navigate(['/collection-hub']);
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
