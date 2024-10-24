import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-market-price-bulk-delete',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule
  ],
  templateUrl: './market-price-bulk-delete.component.html',
  styleUrl: './market-price-bulk-delete.component.css'
})
export class MarketPriceBulkDeleteComponent {
  isLoading = false;

}
