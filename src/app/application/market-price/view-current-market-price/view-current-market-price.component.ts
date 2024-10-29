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
  styleUrl: './view-current-market-price.component.css'
})
export class ViewCurrentMarketPriceComponent implements OnInit {
  isLoading = false;
  currentDate: string;
  market: MarketPrice[] = []
  selectedCrop: any = '';
  crops!: Crop[];

  selectedViraity:any = '';
  viraity!:Viraity[]

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;


  constructor(private marketSrv: MarketPriceService) {
    this.currentDate = new Date().toLocaleDateString();
  }

  ngOnInit(): void {
    this.fetchAllMarketPrices(this.page, this.itemsPerPage);
    this.getAllCrop();
    this.viraity=[
      { id: '1', Vgrade: 'A' },
      { id: '2', Vgrade: 'B' },
      { id: '3', Vgrade: 'C' },
      { id: '4', Vgrade: 'D' }
    ]
  }

  formatDateTime(date: Date): string {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }


  fetchAllMarketPrices(page: number = 1, limit: number = this.itemsPerPage) {
    this.page = page;
    this.marketSrv.getAllMarketPrice(page,limit, this.selectedCrop?.cropName, this.selectedViraity?.Vgrade).subscribe(
      (res) => {
        this.market = res.results
        this.totalItems=res.total
        console.log(res);

      },
      (error) => {
        console.error('Error fetching market price:', error);
        Swal.fire(
          'Error!',
          'There was an error fetching market price.',
          'error'
        );
      }
    )
  }

  getAllCrop() {
    this.marketSrv.getAllCropName().subscribe(
      (res) => {
        this.crops = res;
        console.log(res);

      }
    )
  }

  applyFiltersCrop() {
    this.fetchAllMarketPrices(this.page, this.itemsPerPage);
  }

  applyFiltersVerity(){
    this.fetchAllMarketPrices(this.page, this.itemsPerPage)
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllMarketPrices(this.page, this.itemsPerPage);
  }

}

class MarketPrice {
  id!: string
  cropName!: string
  variety!: string
  grade!: string
  price!: string
  date!: string
  startTime!: Date
  endTime!: Date
}

class Crop {
  id!: string
  cropName!: string
}

class Viraity{
  id!:string
  Vgrade!:string
}
