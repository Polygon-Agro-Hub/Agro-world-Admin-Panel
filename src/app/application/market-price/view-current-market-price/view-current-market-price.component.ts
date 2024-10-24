import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { NgxPaginationModule } from 'ngx-pagination';

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
export class ViewCurrentMarketPriceComponent {
  isLoading = false;
  currentDate: string;

  constructor() {
    // Format the date as needed (e.g., DD/MM/YYYY)
    this.currentDate = new Date().toLocaleDateString();
  }

}
