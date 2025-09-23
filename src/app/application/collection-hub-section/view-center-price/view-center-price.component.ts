import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import Swal from 'sweetalert2';
import { MarketPriceService } from '../../../services/market-price/market-price.service';
import { Location } from '@angular/common';
@Component({
  selector: 'app-view-center-price',
  standalone: true,
  imports: [  
      CommonModule,
      LoadingSpinnerComponent,
      NgxPaginationModule,
      DropdownModule,
      FormsModule,],
  templateUrl: './view-center-price.component.html',
  styleUrl: './view-center-price.component.css'
})
export class ViewCenterPriceComponent {
  centerId!: any;
  companyId!: any
  centerName!: any;
  isLoading = false;
  currentDate: string;
  market: MarketPrice[] = [];
  selectedCrop: Crop | null = null; // Updated for type safety
  crops!: Crop[];

  selectedGrade: Viraity | null = null; // Updated for type safety
  grades!: Viraity[];

  page: number = 1;
  totalItems: number = 0;
  searchNIC: string = '';
  search: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private marketSrv: MarketPriceService,
    private location: Location 
  ) { this.currentDate = new Date().toLocaleDateString();}

  ngOnInit(): void {
    this.centerId = this.route.snapshot.params['centerId'];
    this.companyId = this.route.snapshot.params['companyId'];
    this.centerName = this.route.snapshot.params['centerName'];

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
  
      this.marketSrv.getAllMarketPriceAgro(cropId, grade, this.searchNIC, this.centerId, this.companyId).subscribe(
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


      searchPlantCareUsers() {
        this.page = 1;
        this.fetchAllMarketPrices();
      }
    
      clearSearch(): void {
        this.searchNIC = '';
        this.fetchAllMarketPrices();
      }
    
    
    back(): void {
  this.location.back();
}


get hasData(): boolean {
  return this.market && this.market.length > 0;
}

preventLeadingSpace(event: KeyboardEvent): void {
  const input = event.target as HTMLInputElement;
  if (event.key === ' ' && input.selectionStart === 0) {
    event.preventDefault();
  }
}


}



class MarketPrice {
  id!: string;
  cropName!: string;
  varietyName!: string;
  grade!: string;
  price!: string;
  updatedPrice!: string;
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