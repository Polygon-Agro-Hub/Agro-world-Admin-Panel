import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { MarketPriceService } from '../../../services/market-price/market-price.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-current-market-price',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
  ],
  templateUrl: './view-current-market-price.component.html',
  styleUrl: './view-current-market-price.component.css'
})
export class ViewCurrentMarketPriceComponent implements OnInit{
  isLoading = false;
  currentDate: string;
  market: MarketPrice[] = []

  constructor(private marketSrv:MarketPriceService) {
    this.currentDate = new Date().toLocaleDateString();
  }

  ngOnInit(): void {
    this.fetchAllMarketPrices()
  }

  formatDateTime(date: Date): string {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  

  fetchAllMarketPrices(){
    this.marketSrv.getAllMarketPrice().subscribe(
      (res)=>{
        this.market=res
        console.log(res);
        
      },
      (error)=>{
        console.error('Error fetching market price:', error);
        Swal.fire(
          'Error!',
          'There was an error fetching market price.',
          'error'
        );
      }
    )
  }

}

class MarketPrice {
  id!: string
  cropName!: string
  variety!:string
  grade!: string
  price!: string
  date!: string
  startTime!: Date
  endTime!: Date
}
